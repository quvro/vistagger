mod commands;
mod db;

use commands::{images, tags, import_cmd, floating, ai, settings};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Initialize database and create tables
            if let Ok(data_dir) = app.path().app_data_dir() {
                std::fs::create_dir_all(&data_dir).ok();
                let db_path = data_dir.join("easepic.db");
                if let Ok(db) = db::init_database(db_path.to_str().unwrap_or("easepic.db")) {
                    app.manage(db);
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            images::get_images,
            images::import_images,
            images::delete_image,
            tags::get_categories,
            tags::create_category,
            tags::update_category,
            tags::delete_category,
            tags::get_tags,
            tags::create_tag,
            tags::delete_tag,
            tags::set_image_tags,
            tags::get_tag_similarities,
            tags::merge_similar_tags,
            ai::analyze_image,
            ai::analyze_image_cloud,
            import_cmd::capture_screenshot,
            floating::create_floating_window,
            floating::close_floating_window,
            settings::get_settings,
            settings::save_settings,
            settings::open_folder_dialog,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
