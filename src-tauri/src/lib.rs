mod commands;

use std::sync::Mutex;
use tauri::{Emitter, Manager};

/// Stores the file path received before the frontend is ready.
pub struct PendingFile(pub Mutex<Option<String>>);

#[tauri::command]
fn get_pending_file(state: tauri::State<'_, PendingFile>) -> Option<String> {
    state.0.lock().unwrap().take()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_http::init())
        .manage(PendingFile(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![
            commands::file_ops::read_file,
            commands::file_ops::write_file,
            commands::directory_ops::list_directory,
            get_pending_file,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            if let tauri::RunEvent::Opened { urls } = event {
                for url in urls {
                    if let Ok(path) = url.to_file_path() {
                        if let Some(path_str) = path.to_str() {
                            let path_string = path_str.to_string();
                            // Try to emit to frontend; if it's not ready, store for later
                            if app.emit("open-file", path_string.clone()).is_err() {
                                if let Some(state) = app.try_state::<PendingFile>() {
                                    *state.0.lock().unwrap() = Some(path_string);
                                }
                            } else {
                                // Event emitted, but frontend listener may not be registered yet.
                                // Store it as well so the frontend can pick it up on mount.
                                if let Some(state) = app.try_state::<PendingFile>() {
                                    *state.0.lock().unwrap() = Some(path_string);
                                }
                            }
                        }
                    }
                }
            }
        });
}
