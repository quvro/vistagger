use serde::{Deserialize, Serialize};
use tauri::State;
use crate::db::DbState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Category {
    pub id: String,
    pub name: String,
    pub color: String,
    pub sort_order: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub category_id: String,
    pub color: Option<String>,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ImageTag {
    pub image_id: String,
    pub tag_id: String,
    pub confidence: Option<f64>,
    pub is_auto: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SimilarTagGroup {
    pub tags: Vec<Tag>,
    pub suggested_name: String,
    pub reason: String,
}

// ==================== Categories ====================

#[tauri::command]
pub fn get_categories(db: State<DbState>) -> Result<Vec<Category>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, color, sort_order FROM categories ORDER BY sort_order, name")
        .map_err(|e| e.to_string())?;

    let categories = stmt
        .query_map([], |row| {
            Ok(Category {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                sort_order: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(categories)
}

#[tauri::command]
pub fn create_category(
    db: State<DbState>,
    name: String,
    color: Option<String>,
) -> Result<Category, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let id = uuid::Uuid::new_v4().to_string();
    let color = color.unwrap_or_else(|| "#6366f1".to_string());

    // Get next sort order
    let max_order: i32 = conn
        .query_row("SELECT COALESCE(MAX(sort_order), 0) FROM categories", [], |row| row.get(0))
        .unwrap_or(0);

    conn.execute(
        "INSERT INTO categories (id, name, color, sort_order) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![id, name, color, max_order + 1],
    )
    .map_err(|e| e.to_string())?;

    Ok(Category {
        id,
        name,
        color,
        sort_order: max_order + 1,
    })
}

#[tauri::command]
pub fn update_category(
    db: State<DbState>,
    category_id: String,
    name: Option<String>,
    color: Option<String>,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    if let Some(name) = name {
        conn.execute(
            "UPDATE categories SET name = ?1 WHERE id = ?2",
            rusqlite::params![name, category_id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(color) = color {
        conn.execute(
            "UPDATE categories SET color = ?1 WHERE id = ?2",
            rusqlite::params![color, category_id],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn delete_category(db: State<DbState>, category_id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Don't allow deleting the last category
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM categories", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    if count <= 1 {
        return Err("至少保留一个分类".to_string());
    }

    // Move tags to default category before deleting
    let default_id: String = conn
        .query_row(
            "SELECT id FROM categories ORDER BY sort_order LIMIT 1",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE tags SET category_id = ?1 WHERE category_id = ?2",
        rusqlite::params![default_id, category_id],
    )
    .map_err(|e| e.to_string())?;

    conn.execute(
        "DELETE FROM categories WHERE id = ?1",
        rusqlite::params![category_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

// ==================== Tags ====================

#[tauri::command]
pub fn get_tags(db: State<DbState>) -> Result<Vec<Tag>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, category_id, color, created_at FROM tags ORDER BY name")
        .map_err(|e| e.to_string())?;

    let tags = stmt
        .query_map([], |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
                category_id: row.get(2)?,
                color: row.get(3)?,
                created_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(tags)
}

#[tauri::command]
pub fn create_tag(
    db: State<DbState>,
    name: String,
    category_id: String,
    color: Option<String>,
) -> Result<Tag, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO tags (id, name, category_id, color, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![id, name, category_id, color, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(Tag {
        id,
        name,
        category_id,
        color,
        created_at: Some(now),
    })
}

#[tauri::command]
pub fn delete_tag(db: State<DbState>, tag_id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tags WHERE id = ?1", rusqlite::params![tag_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn set_image_tags(
    db: State<DbState>,
    image_id: String,
    tag_ids: Vec<String>,
) -> Result<Vec<ImageTag>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Remove existing manual tags (keep auto tags)
    conn.execute(
        "DELETE FROM image_tags WHERE image_id = ?1 AND is_auto = 0",
        rusqlite::params![image_id],
    )
    .map_err(|e| e.to_string())?;

    // Insert new tags
    for tag_id in &tag_ids {
        conn.execute(
            "INSERT OR IGNORE INTO image_tags (image_id, tag_id, is_auto) VALUES (?1, ?2, 0)",
            rusqlite::params![image_id, tag_id],
        )
        .map_err(|e| e.to_string())?;
    }

    // Return all tags for this image
    let mut stmt = conn
        .prepare("SELECT image_id, tag_id, confidence, is_auto FROM image_tags WHERE image_id = ?1")
        .map_err(|e| e.to_string())?;

    let tags = stmt
        .query_map(rusqlite::params![image_id], |row| {
            Ok(ImageTag {
                image_id: row.get(0)?,
                tag_id: row.get(1)?,
                confidence: row.get(2)?,
                is_auto: row.get::<_, i32>(3)? != 0,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(tags)
}

// ==================== Tag Similarities ====================

#[tauri::command]
pub fn get_tag_similarities(db: State<DbState>) -> Result<Vec<SimilarTagGroup>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT ts.tag_a_id, ts.tag_b_id, ts.similarity_score,
                    t1.name, t1.category_id, t1.color, t1.created_at,
                    t2.name, t2.category_id, t2.color, t2.created_at
             FROM tag_similarities ts
             JOIN tags t1 ON ts.tag_a_id = t1.id
             JOIN tags t2 ON ts.tag_b_id = t2.id
             ORDER BY ts.similarity_score DESC",
        )
        .map_err(|e| e.to_string())?;

    let groups = stmt
        .query_map([], |row| {
            let tag_a = Tag {
                id: row.get(0)?,
                name: row.get(3)?,
                category_id: row.get(4)?,
                color: row.get(5)?,
                created_at: row.get(6)?,
            };
            let tag_b = Tag {
                id: row.get(1)?,
                name: row.get(7)?,
                category_id: row.get(8)?,
                color: row.get(9)?,
                created_at: row.get(10)?,
            };
            let score: f64 = row.get(2)?;
            Ok(SimilarTagGroup {
                tags: vec![tag_a, tag_b],
                suggested_name: String::new(), // Will be set by AI
                reason: format!("语义相似度: {:.0}%", score * 100.0),
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(groups)
}

#[tauri::command]
pub fn merge_similar_tags(
    db: State<DbState>,
    tag_a_id: String,
    tag_b_id: String,
    target_name: String,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Update tag_a to have the merged name
    conn.execute(
        "UPDATE tags SET name = ?1 WHERE id = ?2",
        rusqlite::params![target_name, tag_a_id],
    )
    .map_err(|e| e.to_string())?;

    // Move all image_tags from tag_b to tag_a
    conn.execute(
        "INSERT OR IGNORE INTO image_tags (image_id, tag_id, confidence, is_auto)
         SELECT image_id, ?1, confidence, is_auto FROM image_tags WHERE tag_id = ?2",
        rusqlite::params![tag_a_id, tag_b_id],
    )
    .map_err(|e| e.to_string())?;

    // Delete tag_b and its similarity records
    conn.execute(
        "DELETE FROM tag_similarities WHERE tag_a_id = ?1 OR tag_b_id = ?1",
        rusqlite::params![tag_b_id],
    )
    .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tags WHERE id = ?1", rusqlite::params![tag_b_id])
        .map_err(|e| e.to_string())?;

    // Remove the similarity record between tag_a and tag_b
    conn.execute(
        "DELETE FROM tag_similarities WHERE (tag_a_id = ?1 AND tag_b_id = ?2) OR (tag_a_id = ?2 AND tag_b_id = ?1)",
        rusqlite::params![tag_a_id, tag_b_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
