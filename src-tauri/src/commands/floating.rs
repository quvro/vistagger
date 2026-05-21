use tauri::State;
use crate::db::DbState;

#[tauri::command]
pub async fn create_floating_window(
    app: tauri::AppHandle,
    image_id: String,
    opacity: Option<f64>,
    scale: Option<f64>,
    x: Option<f64>,
    y: Option<f64>,
) -> Result<String, String> {
    // Floating window functionality will be fully implemented in Step 6
    // For now, returns a placeholder error
    Err("Floating windows will be implemented in Step 6".to_string())
}

#[tauri::command]
pub async fn close_floating_window(
    window_id: String,
) -> Result<(), String> {
    Err("Floating windows will be implemented in Step 6".to_string())
}
