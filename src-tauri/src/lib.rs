mod commands;
mod db;

use tauri::Manager;
use commands::{images, attributes, import_cmd, floating, ai, settings};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let data_dir = app.path().app_data_dir().expect("failed to resolve app data dir");
            std::fs::create_dir_all(&data_dir).ok();
            let db_path = data_dir.join("vistagger.db");
            let db = db::init_database(db_path.to_str().unwrap_or("vistagger.db"))
                .expect("failed to initialize database");
            app.manage(db);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            images::get_images,
            images::import_images,
            images::delete_image,
            attributes::get_dimensions,
            attributes::create_dimension,
            attributes::update_dimension,
            attributes::delete_dimension,
            attributes::get_attributes,
            attributes::create_attribute,
            attributes::delete_attribute,
            attributes::set_image_attributes,
            attributes::get_image_attributes,
            attributes::set_primary_attributes,
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
