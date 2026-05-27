use serde::{Deserialize, Serialize};
use tauri::{State, Manager};
use crate::db::DbState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ImageItem {
    pub id: String,
    pub filename: String,
    pub original_path: Option<String>,
    pub stored_path: String,
    pub thumbnail_path: Option<String>,
    pub width: Option<i32>,
    pub height: Option<i32>,
    pub file_size: Option<i64>,
    pub format: Option<String>,
    pub source_url: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[tauri::command]
pub fn get_images(db: State<DbState>) -> Result<Vec<ImageItem>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, filename, original_path, stored_path, thumbnail_path, width, height, file_size, format, source_url, created_at, updated_at FROM images ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let images = stmt
        .query_map([], |row| {
            Ok(ImageItem {
                id: row.get(0)?,
                filename: row.get(1)?,
                original_path: row.get(2)?,
                stored_path: row.get(3)?,
                thumbnail_path: row.get(4)?,
                width: row.get(5)?,
                height: row.get(6)?,
                file_size: row.get(7)?,
                format: row.get(8)?,
                source_url: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(images)
}

#[tauri::command]
pub async fn import_images(
    app: tauri::AppHandle,
    db: State<'_, DbState>,
) -> Result<Vec<ImageItem>, String> {
    use tauri_plugin_dialog::DialogExt;
    let files = app
        .dialog()
        .file()
        .add_filter("Images", &["png", "jpg", "jpeg", "gif", "webp", "bmp", "tiff"])
        .blocking_pick_files();

    match files {
        Some(paths) => {
            let mut imported = Vec::new();
            let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
            let images_dir = data_dir.join("images");
            let thumbs_dir = data_dir.join("thumbnails");
            std::fs::create_dir_all(&images_dir).map_err(|e| e.to_string())?;
            std::fs::create_dir_all(&thumbs_dir).map_err(|e| e.to_string())?;

            for path in paths {
                let path_str = path.to_string();
                let filename = std::path::Path::new(&path_str)
                    .file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("unknown")
                    .to_string();

                let id = uuid::Uuid::new_v4().to_string();
                let ext = std::path::Path::new(&filename)
                    .extension()
                    .and_then(|e| e.to_str())
                    .unwrap_or("png")
                    .to_lowercase();

                let stored_name = format!("{}.{}", id, ext);
                let stored_path = images_dir.join(&stored_name);
                let thumb_path = thumbs_dir.join(&stored_name);

                // Copy file to storage
                std::fs::copy(&path_str, &stored_path).map_err(|e| e.to_string())?;

                // Read image dimensions and generate thumbnail
                let (width, height) = match image::open(&stored_path) {
                    Ok(img) => {
                        let (w, h) = (img.width() as i32, img.height() as i32);
                        // Generate thumbnail
                        let thumb = img.thumbnail(400, 300);
                        thumb.save(&thumb_path).ok();
                        (Some(w), Some(h))
                    }
                    Err(_) => (None, None),
                };

                let file_size = std::fs::metadata(&stored_path)
                    .ok()
                    .map(|m| m.len() as i64);

                let image_item = ImageItem {
                    id: id.clone(),
                    filename,
                    original_path: Some(path_str),
                    stored_path: stored_path.to_string_lossy().to_string(),
                    thumbnail_path: Some(thumb_path.to_string_lossy().to_string()),
                    width,
                    height,
                    file_size,
                    format: Some(ext),
                    source_url: None,
                    created_at: chrono::Utc::now().to_rfc3339(),
                    updated_at: chrono::Utc::now().to_rfc3339(),
                };

                // Insert into database
                {
                    let conn = db.conn.lock().map_err(|e| e.to_string())?;
                    conn.execute(
                        "INSERT INTO images (id, filename, original_path, stored_path, thumbnail_path, width, height, file_size, format, source_url, created_at, updated_at)
                         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
                        rusqlite::params![
                            image_item.id,
                            image_item.filename,
                            image_item.original_path,
                            image_item.stored_path,
                            image_item.thumbnail_path,
                            image_item.width,
                            image_item.height,
                            image_item.file_size,
                            image_item.format,
                            image_item.source_url,
                            image_item.created_at,
                            image_item.updated_at,
                        ],
                    )
                    .map_err(|e| e.to_string())?;
                }

                imported.push(image_item);
            }

            Ok(imported)
        }
        None => Ok(vec![]),
    }
}

#[tauri::command]
pub fn delete_image(
    db: State<DbState>,
    image_id: String,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Get file paths before deleting from DB
    let (stored_path, thumb_path): (String, Option<String>) = conn
        .query_row(
            "SELECT stored_path, thumbnail_path FROM images WHERE id = ?1",
            rusqlite::params![image_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .map_err(|e| e.to_string())?;

    // Delete files from disk
    std::fs::remove_file(&stored_path).ok();
    if let Some(tp) = thumb_path {
        std::fs::remove_file(&tp).ok();
    }

    // Delete from database (cascades to image_attributes)
    conn.execute("DELETE FROM images WHERE id = ?1", rusqlite::params![image_id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
