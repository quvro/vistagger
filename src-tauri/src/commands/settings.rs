use serde::{Deserialize, Serialize};
use tauri::State;
use crate::db::DbState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Settings {
    pub library_path: String,
    pub cloud_api_key: Option<String>,
    pub cloud_api_type: Option<String>,
    pub local_model_enabled: bool,
}

#[tauri::command]
pub fn get_settings(db: State<DbState>) -> Result<Settings, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let get_setting = |key: &str| -> Option<String> {
        conn.query_row(
            "SELECT value FROM settings WHERE key = ?1",
            rusqlite::params![key],
            |row| row.get(0),
        )
        .ok()
    };

    let home = std::env::var("HOME")
        .or_else(|_| std::env::var("USERPROFILE"))
        .unwrap_or_else(|_| ".".to_string());
    let data_dir = std::path::Path::new(&home)
        .join("EasePic")
        .to_string_lossy()
        .to_string();

    Ok(Settings {
        library_path: get_setting("library_path").unwrap_or(data_dir),
        cloud_api_key: get_setting("cloud_api_key"),
        cloud_api_type: get_setting("cloud_api_type"),
        local_model_enabled: get_setting("local_model_enabled")
            .map(|v| v == "true")
            .unwrap_or(true),
    })
}

#[tauri::command]
pub fn save_settings(
    db: State<DbState>,
    settings: Settings,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let upsert = |key: &str, value: &str| -> Result<(), rusqlite::Error> {
        conn.execute(
            "INSERT INTO settings (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = ?2",
            rusqlite::params![key, value],
        )?;
        Ok(())
    };

    upsert("library_path", &settings.library_path).map_err(|e| e.to_string())?;
    if let Some(key) = &settings.cloud_api_key {
        upsert("cloud_api_key", key).map_err(|e| e.to_string())?;
    }
    if let Some(api_type) = &settings.cloud_api_type {
        upsert("cloud_api_type", api_type).map_err(|e| e.to_string())?;
    }
    upsert("local_model_enabled", &settings.local_model_enabled.to_string())
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn open_folder_dialog(
    app: tauri::AppHandle,
) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    let folder = app.dialog().file().blocking_pick_folder();
    Ok(folder.map(|p| p.to_string()))
}
