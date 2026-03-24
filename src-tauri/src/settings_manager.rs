use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::AppHandle;
use tauri::Manager;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AppSettings {
    pub language: String,         // "zh-CN" | "en-US"
    pub theme: String,            // "dark" | "light" | "system"
    pub author_name: String,
    pub copyright_suffix: String,
    pub source_dir: Option<PathBuf>,
    pub output_dir: Option<PathBuf>,
    pub format_preference: String, // "original" | "png" | "jpg"
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            language: "zh-CN".to_string(),
            theme: "dark".to_string(),
            author_name: "Anonymous Creator".to_string(),
            copyright_suffix: "All Rights Reserved".to_string(),
            source_dir: None,
            output_dir: None,
            format_preference: "original".to_string(),
        }
    }
}

pub fn get_settings_path(app: &AppHandle) -> PathBuf {
    let mut path = app.path().app_config_dir().unwrap_or_else(|_| PathBuf::from("config"));
    if !path.exists() {
        let _ = fs::create_dir_all(&path);
    }
    path.push("settings.json");
    path
}

#[tauri::command]
pub fn load_settings(app: AppHandle) -> AppSettings {
    let path = get_settings_path(&app);
    if path.exists() {
        if let Ok(content) = fs::read_to_string(path) {
            if let Ok(settings) = serde_json::from_str(&content) {
                return settings;
            }
        }
    }
    AppSettings::default()
}

#[tauri::command]
pub fn save_settings(app: AppHandle, settings: AppSettings) -> Result<(), String> {
    let path = get_settings_path(&app);
    let content = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_unprotected_files(source_dir: String, output_dir: String) -> Result<Vec<String>, String> {
    let source_path = Path::new(&source_dir);
    let output_path = Path::new(&output_dir);

    if !source_path.exists() || !output_path.exists() {
        return Err("Directory does not exist".to_string());
    }

    let mut new_files = Vec::new();
    let extensions = ["png", "jpg", "jpeg", "webp"];

    if let Ok(entries) = fs::read_dir(source_path) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() {
                if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
                    if extensions.contains(&ext.to_lowercase().as_str()) {
                        let file_name = path.file_name().unwrap().to_str().unwrap();
                        // Check if file exists in output dir
                        // Note: In real production, we might want to check the hash or a suffix like _protected
                        let target_path = output_path.join(file_name);
                        if !target_path.exists() {
                            new_files.push(path.to_string_lossy().to_string());
                        }
                    }
                }
            }
        }
    }

    Ok(new_files)
}
