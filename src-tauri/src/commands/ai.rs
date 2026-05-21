use serde::{Deserialize, Serialize};
use tauri::State;
use crate::db::DbState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AITagSuggestion {
    pub tag_name: String,
    pub category: String,
    pub confidence: f64,
}

#[tauri::command]
pub async fn analyze_image(
    db: State<'_, DbState>,
    image_id: String,
) -> Result<Vec<AITagSuggestion>, String> {
    // Local model analysis will be fully implemented in Step 4
    // For now, returns a placeholder error
    Err("Local AI analysis will be implemented in Step 4".to_string())
}

#[tauri::command]
pub async fn analyze_image_cloud(
    db: State<'_, DbState>,
    image_id: String,
) -> Result<Vec<AITagSuggestion>, String> {
    // Cloud API analysis will be fully implemented in Step 4
    Err("Cloud AI analysis will be implemented in Step 4".to_string())
}
