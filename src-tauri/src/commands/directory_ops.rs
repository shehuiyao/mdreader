use serde::Serialize;
use std::fs;
use std::path::Path;

#[derive(Serialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
}

fn is_markdown_file(name: &str) -> bool {
    let lower_name = name.to_lowercase();
    lower_name.ends_with(".md") || lower_name.ends_with(".markdown")
}

fn directory_contains_markdown(path: &Path) -> Result<bool, String> {
    let entries =
        fs::read_dir(path).map_err(|e| format!("Failed to read directory: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let name = entry.file_name().to_string_lossy().to_string();

        // Skip hidden files and directories
        if name.starts_with('.') {
            continue;
        }

        let metadata = entry
            .metadata()
            .map_err(|e| format!("Failed to read metadata: {}", e))?;

        if metadata.is_dir() {
            if directory_contains_markdown(&entry.path())? {
                return Ok(true);
            }
            continue;
        }

        if is_markdown_file(&name) {
            return Ok(true);
        }
    }

    Ok(false)
}

#[tauri::command]
pub async fn list_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let dir_path = Path::new(&path);

    if !dir_path.exists() {
        return Err(format!("Directory not found: {}", path));
    }

    if !dir_path.is_dir() {
        return Err(format!("Path is not a directory: {}", path));
    }

    let entries =
        fs::read_dir(dir_path).map_err(|e| format!("Failed to read directory: {}", e))?;

    let mut file_entries: Vec<FileEntry> = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let name = entry.file_name().to_string_lossy().to_string();

        // Skip hidden files
        if name.starts_with('.') {
            continue;
        }

        let metadata = entry
            .metadata()
            .map_err(|e| format!("Failed to read metadata: {}", e))?;
        let is_directory = metadata.is_dir();

        // Only include markdown files and directories that contain markdown files recursively.
        if is_directory {
            if !directory_contains_markdown(&entry.path())? {
                continue;
            }
        } else if !is_markdown_file(&name) {
            continue;
        }

        file_entries.push(FileEntry {
            name,
            path: entry.path().to_string_lossy().to_string(),
            is_directory,
        });
    }

    // Sort: directories first, then files, alphabetically within each group
    file_entries.sort_by(|a, b| {
        b.is_directory
            .cmp(&a.is_directory)
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });

    Ok(file_entries)
}
