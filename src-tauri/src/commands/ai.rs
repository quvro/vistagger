use serde::{Deserialize, Serialize};
use tauri::State;
use crate::db::DbState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AttributeSuggestion {
    pub dimension: String,
    pub value: String,
    pub confidence: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AIStructuredResult {
    pub attributes: Vec<AttributeSuggestion>,
}

#[tauri::command]
pub async fn analyze_image(
    _db: State<'_, DbState>,
    _image_id: String,
) -> Result<AIStructuredResult, String> {
    // Local model analysis will be fully implemented in Step 4
    Err("Local AI analysis will be implemented in Step 4".to_string())
}

#[tauri::command]
pub async fn analyze_image_cloud(
    _db: State<'_, DbState>,
    _image_id: String,
) -> Result<AIStructuredResult, String> {
    // Cloud API analysis will be fully implemented in Step 4
    Err("Cloud AI analysis will be implemented in Step 4".to_string())
}
