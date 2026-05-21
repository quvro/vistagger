use serde::{Deserialize, Serialize};
use tauri::State;
use crate::db::DbState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Dimension {
    pub id: String,
    pub name: String,
    pub color: String,
    pub sort_order: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Attribute {
    pub id: String,
    pub dimension_id: String,
    pub name: String,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ImageAttribute {
    pub image_id: String,
    pub attribute_id: String,
    pub confidence: Option<f64>,
    pub is_auto: bool,
    pub is_primary: bool,
}

// ==================== Dimensions ====================

#[tauri::command]
pub fn get_dimensions(db: State<DbState>) -> Result<Vec<Dimension>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, color, sort_order FROM dimensions ORDER BY sort_order")
        .map_err(|e| e.to_string())?;

    stmt.query_map([], |row| {
        Ok(Dimension {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
            sort_order: row.get(3)?,
        })
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_dimension(
    db: State<DbState>,
    name: String,
    color: Option<String>,
) -> Result<Dimension, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let id = uuid::Uuid::new_v4().to_string();
    let color = color.unwrap_or_else(|| "#6366f1".to_string());
    let max_order: i32 = conn
        .query_row("SELECT COALESCE(MAX(sort_order), 0) FROM dimensions", [], |row| row.get(0))
        .unwrap_or(0);

    conn.execute(
        "INSERT INTO dimensions (id, name, color, sort_order) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![id, name, color, max_order + 1],
    )
    .map_err(|e| e.to_string())?;

    Ok(Dimension { id, name, color, sort_order: max_order + 1 })
}

#[tauri::command]
pub fn update_dimension(
    db: State<DbState>,
    dimension_id: String,
    name: Option<String>,
    color: Option<String>,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    if let Some(name) = name {
        conn.execute("UPDATE dimensions SET name = ?1 WHERE id = ?2", rusqlite::params![name, dimension_id])
            .map_err(|e| e.to_string())?;
    }
    if let Some(color) = color {
        conn.execute("UPDATE dimensions SET color = ?1 WHERE id = ?2", rusqlite::params![color, dimension_id])
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn delete_dimension(db: State<DbState>, dimension_id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM dimensions", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    if count <= 1 {
        return Err("至少保留一个维度".to_string());
    }
    conn.execute("DELETE FROM dimensions WHERE id = ?1", rusqlite::params![dimension_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ==================== Attributes ====================

#[tauri::command]
pub fn get_attributes(db: State<DbState>) -> Result<Vec<Attribute>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, dimension_id, name, created_at FROM attributes ORDER BY dimension_id, name")
        .map_err(|e| e.to_string())?;

    stmt.query_map([], |row| {
        Ok(Attribute {
            id: row.get(0)?,
            dimension_id: row.get(1)?,
            name: row.get(2)?,
            created_at: row.get(3)?,
        })
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_attribute(
    db: State<DbState>,
    dimension_id: String,
    name: String,
) -> Result<Attribute, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    let affected = conn.execute(
        "INSERT OR IGNORE INTO attributes (id, dimension_id, name, created_at) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![id, dimension_id, name, now],
    )
    .map_err(|e| e.to_string())?;

    // If duplicate, query existing row instead of returning fake UUID
    if affected == 0 {
        return conn.query_row(
            "SELECT id, dimension_id, name, created_at FROM attributes WHERE dimension_id = ?1 AND name = ?2",
            rusqlite::params![dimension_id, name],
            |row| Ok(Attribute {
                id: row.get(0)?,
                dimension_id: row.get(1)?,
                name: row.get(2)?,
                created_at: row.get(3)?,
            }),
        ).map_err(|e| e.to_string());
    }

    Ok(Attribute { id, dimension_id, name, created_at: Some(now) })
}

#[tauri::command]
pub fn delete_attribute(db: State<DbState>, attribute_id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM attributes WHERE id = ?1", rusqlite::params![attribute_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ==================== Image-Attributes ====================

#[tauri::command]
pub fn set_image_attributes(
    db: State<DbState>,
    image_id: String,
    attribute_ids: Vec<String>,
) -> Result<Vec<ImageAttribute>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Remove existing manual attributes (keep auto ones)
    conn.execute(
        "DELETE FROM image_attributes WHERE image_id = ?1 AND is_auto = 0",
        rusqlite::params![image_id],
    )
    .map_err(|e| e.to_string())?;

    for attr_id in &attribute_ids {
        conn.execute(
            "INSERT OR IGNORE INTO image_attributes (image_id, attribute_id, is_auto, is_primary) VALUES (?1, ?2, 0, 0)",
            rusqlite::params![image_id, attr_id],
        )
        .map_err(|e| e.to_string())?;
    }

    get_image_attributes_internal(&conn, &image_id)
}

#[tauri::command]
pub fn get_image_attributes(
    db: State<DbState>,
    image_id: String,
) -> Result<Vec<ImageAttribute>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    get_image_attributes_internal(&conn, &image_id)
}

fn get_image_attributes_internal(
    conn: &rusqlite::Connection,
    image_id: &str,
) -> Result<Vec<ImageAttribute>, String> {
    let mut stmt = conn
        .prepare("SELECT image_id, attribute_id, confidence, is_auto, is_primary FROM image_attributes WHERE image_id = ?1")
        .map_err(|e| e.to_string())?;

    stmt.query_map(rusqlite::params![image_id], |row| {
        Ok(ImageAttribute {
            image_id: row.get(0)?,
            attribute_id: row.get(1)?,
            confidence: row.get(2)?,
            is_auto: row.get::<_, i32>(3)? != 0,
            is_primary: row.get::<_, i32>(4)? != 0,
        })
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_primary_attributes(
    db: State<DbState>,
    image_id: String,
    attribute_ids: Vec<String>,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Clear existing primary markers
    conn.execute(
        "UPDATE image_attributes SET is_primary = 0 WHERE image_id = ?1",
        rusqlite::params![image_id],
    )
    .map_err(|e| e.to_string())?;

    // Set new primary markers (max 4)
    for attr_id in attribute_ids.iter().take(4) {
        conn.execute(
            "UPDATE image_attributes SET is_primary = 1 WHERE image_id = ?1 AND attribute_id = ?2",
            rusqlite::params![image_id, attr_id],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}
