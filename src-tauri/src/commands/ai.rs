use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};
use serde::{Deserialize, Serialize};
use serde_json::Value;
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

const SYSTEM_PROMPT: &str = r#"You are an art reference image analyzer. Analyze the given image and output structured attributes for the following 7 dimensions:

1. 主体 (subject): what is depicted — 人物, 单人, 双人, 多人, 动物, 机械, 建筑, 植物, 物体, etc.
2. 构图 (composition): framing/angle — 头像, 半身, 全身, 特写, 近景, 中景, 远景, 正面, 侧面, 四分之三侧脸, 背面, 仰视, 俯视, 鸟瞰, 对称构图, 三分法, 对角线, 中心构图, etc.
3. 光线 (lighting): light direction/quality — 自然光, 顶光, 侧光, 逆光, 底光, 柔光, 硬光, 环境光, 黄昏光, 夜景, 人工光, etc.
4. 色调 (color): palette — 暖色, 冷色, 黑白, 高饱和, 低饱和, 单色调, 柔和, 补色, etc.
5. 元素 (elements): notable visual elements — 手部动作, 波浪发, 长发, 短发, 眼睛特写, 服饰细节, 武器, 翅膀, 花纹, 水面, 火焰, 烟雾, etc.
6. 风格 (style): art style — 写实, 二次元, 水墨, 油画, 素描, 赛博朋克, 厚涂, 平涂, 像素, 水彩, 浮世绘, 极简, 电影感, 复古, etc.
7. 情绪 (mood): emotional tone — 沉静, 内敛, 忧郁, 欢快, 激昂, 温暖, 冷峻, 孤独, 神秘, 恐怖, 浪漫, etc.

For each dimension, provide 0-3 values with a confidence score between 0 and 1. Only include values that are clearly visible in the image.
Label dimensions in Chinese as shown above.

Output ONLY valid JSON in this exact format, no other text:
{
  "attributes": [
    {"dimension": "主体", "value": "人物", "confidence": 0.95},
    {"dimension": "构图", "value": "近景", "confidence": 0.8}
  ]
}"#;

fn find_or_create_attribute(
    conn: &rusqlite::Connection,
    dim_id: &str,
    value_name: &str,
) -> Result<String, String> {
    // Try to find existing attribute
    let existing: Option<String> = conn
        .query_row(
            "SELECT id FROM attributes WHERE dimension_id = ?1 AND name = ?2",
            rusqlite::params![dim_id, value_name],
            |row| row.get(0),
        )
        .ok();

    if let Some(id) = existing {
        return Ok(id);
    }

    // Create new attribute
    let id = uuid::Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO attributes (id, dimension_id, name) VALUES (?1, ?2, ?3)",
        rusqlite::params![id, dim_id, value_name],
    )
    .map_err(|e| e.to_string())?;

    Ok(id)
}

#[tauri::command]
pub async fn analyze_image_cloud(
    db: State<'_, DbState>,
    image_id: String,
) -> Result<AIStructuredResult, String> {
    // 1. Get API key from settings
    let (api_key, stored_path) = {
        let conn = db.conn.lock().map_err(|e| e.to_string())?;
        let key: String = conn
            .query_row(
                "SELECT value FROM settings WHERE key = 'cloud_api_key'",
                [],
                |row| row.get(0),
            )
            .map_err(|_| "请先在设置中配置 API Key".to_string())?;

        let path: String = conn
            .query_row(
                "SELECT stored_path FROM images WHERE id = ?1",
                rusqlite::params![image_id],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;

        (key, path)
    };

    // 2. Read and encode image
    let image_data = std::fs::read(&stored_path).map_err(|e| format!("读取图片失败: {}", e))?;
    let mime_type = {
        let lower = stored_path.to_lowercase();
        if lower.ends_with(".png") {
            "image/png"
        } else if lower.ends_with(".webp") {
            "image/webp"
        } else if lower.ends_with(".gif") {
            "image/gif"
        } else {
            "image/jpeg"
        }
    };
    let base64_image = BASE64.encode(&image_data);

    // 3. Call Claude Vision API
    let client = reqwest::Client::new();
    let request_body = serde_json::json!({
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 1024,
        "system": SYSTEM_PROMPT,
        "messages": [{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": mime_type,
                        "data": base64_image
                    }
                },
                {
                    "type": "text",
                    "text": "请分析这张图片，返回结构化的属性JSON。"
                }
            ]
        }]
    });

    let response = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", &api_key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("API 请求失败: {}", e))?;

    let status = response.status();
    let response_json: Value = response
        .json()
        .await
        .map_err(|e| format!("解析响应失败: {}", e))?;

    if !status.is_success() {
        let err_msg = response_json["error"]["message"]
            .as_str()
            .unwrap_or("未知错误");
        return Err(format!("API 错误 ({}): {}", status.as_u16(), err_msg));
    }

    // 4. Extract text from Claude response
    let text = response_json["content"][0]["text"]
        .as_str()
        .ok_or("API 返回格式异常")?;

    // Parse the JSON from Claude's response (may be wrapped in ```json blocks)
    let text = text.trim();
    let json_text = if text.starts_with("```") {
        text.lines()
            .skip(1)
            .take_while(|l| !l.starts_with("```"))
            .collect::<Vec<_>>()
            .join("\n")
    } else {
        text.to_string()
    };

    let parsed: AIStructuredResult =
        serde_json::from_str(&json_text).map_err(|e| format!("AI 返回的 JSON 解析失败: {}", e))?;

    // 5. Match dimensions and attributes, write to DB
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Build dimension name → id map
    let mut dim_map: std::collections::HashMap<String, String> = std::collections::HashMap::new();
    let mut dim_stmt = conn
        .prepare("SELECT id, name FROM dimensions")
        .map_err(|e| e.to_string())?;
    let dim_rows = dim_stmt
        .query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(|e| e.to_string())?;
    for row in dim_rows {
        let (id, name) = row.map_err(|e| e.to_string())?;
        dim_map.insert(name, id);
    }

    // Wrap all DB writes in a transaction so auto-attribute update is atomic
    let write_result = (|| -> Result<Vec<(String, f64)>, String> {
        conn.execute("BEGIN IMMEDIATE", []).map_err(|e| e.to_string())?;

        conn.execute(
            "DELETE FROM image_attributes WHERE image_id = ?1 AND is_auto = 1",
            rusqlite::params![image_id],
        ).map_err(|e| e.to_string())?;

        let mut pairs: Vec<(String, f64)> = Vec::new();
        for suggestion in &parsed.attributes {
            let dim_id = match dim_map.get(&suggestion.dimension) {
                Some(id) => id.clone(),
                None => continue,
            };
            let attr_id = find_or_create_attribute(&conn, &dim_id, &suggestion.value)?;
            conn.execute(
                "INSERT OR IGNORE INTO image_attributes (image_id, attribute_id, confidence, is_auto, is_primary) VALUES (?1, ?2, ?3, 1, 0)",
                rusqlite::params![image_id, attr_id, suggestion.confidence],
            ).map_err(|e| e.to_string())?;
            pairs.push((attr_id, suggestion.confidence));
        }

        pairs.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        for (attr_id, _) in pairs.iter().take(4) {
            conn.execute(
                "UPDATE image_attributes SET is_primary = 1 WHERE image_id = ?1 AND attribute_id = ?2",
                rusqlite::params![image_id, attr_id],
            ).map_err(|e| e.to_string())?;
        }

        conn.execute("COMMIT", []).map_err(|e| e.to_string())?;
        Ok(pairs)
    })();

    if let Err(e) = write_result {
        conn.execute("ROLLBACK", []).ok();
        return Err(e);
    }

    Ok(parsed)
}

#[tauri::command]
pub async fn analyze_image(
    _db: State<'_, DbState>,
    _image_id: String,
) -> Result<AIStructuredResult, String> {
    Err("本地模型分析尚未实现，请使用云端 API".to_string())
}
