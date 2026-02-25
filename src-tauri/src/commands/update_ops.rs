use tauri::Emitter;

const APP_VERSION: &str = "0.2.0";

#[derive(serde::Serialize)]
pub struct UpdateInfo {
    pub current_version: String,
    pub latest_version: String,
    pub update_available: bool,
    pub download_url: String,
}

fn github_client() -> Result<reqwest::blocking::Client, String> {
    reqwest::blocking::Client::builder()
        .user_agent("md-reader-updater")
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| format!("HTTP client error: {}", e))
}

#[tauri::command]
pub fn check_for_update() -> Result<UpdateInfo, String> {
    let client = github_client()?;

    let resp = client
        .get("https://api.github.com/repos/shehuiyao/mdreader/releases/latest")
        .send()
        .map_err(|e| format!("Failed to check for updates: {}", e))?;

    if !resp.status().is_success() {
        return Ok(UpdateInfo {
            current_version: APP_VERSION.to_string(),
            latest_version: APP_VERSION.to_string(),
            update_available: false,
            download_url: String::new(),
        });
    }

    let json: serde_json::Value = resp
        .json()
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    let tag = json
        .get("tag_name")
        .and_then(|v| v.as_str())
        .unwrap_or("");

    let latest_version = tag.strip_prefix('v').unwrap_or(tag).to_string();

    // Find the .dmg asset download URL
    let download_url = json
        .get("assets")
        .and_then(|a| a.as_array())
        .and_then(|assets| {
            assets.iter().find_map(|asset| {
                let name = asset.get("name")?.as_str()?;
                if name.ends_with(".dmg") {
                    asset
                        .get("browser_download_url")
                        .and_then(|u| u.as_str())
                        .map(|s| s.to_string())
                } else {
                    None
                }
            })
        })
        .unwrap_or_default();

    let update_available = version_is_newer(&latest_version, APP_VERSION);

    Ok(UpdateInfo {
        current_version: APP_VERSION.to_string(),
        latest_version,
        update_available,
        download_url,
    })
}

#[tauri::command]
pub fn download_and_install_update(app: tauri::AppHandle, url: String) -> Result<(), String> {
    use std::io::Write;

    let client = github_client()?;

    let app_clone = app.clone();
    let emit_progress = move |msg: &str| {
        let _ = app_clone.emit("update-progress", msg);
    };

    emit_progress("Downloading...");

    let resp = client
        .get(&url)
        .send()
        .map_err(|e| format!("Download failed: {}", e))?;

    if !resp.status().is_success() {
        return Err(format!("Download failed with status: {}", resp.status()));
    }

    let bytes = resp
        .bytes()
        .map_err(|e| format!("Failed to read download: {}", e))?;

    let tmp_dir = std::env::temp_dir();
    let dmg_path = tmp_dir.join("MD Reader_update.dmg");

    let mut file = std::fs::File::create(&dmg_path)
        .map_err(|e| format!("Failed to create temp file: {}", e))?;

    file.write_all(&bytes)
        .map_err(|e| format!("Failed to write DMG: {}", e))?;

    emit_progress("Opening installer...");

    std::process::Command::new("open")
        .arg(&dmg_path)
        .spawn()
        .map_err(|e| format!("Failed to open DMG: {}", e))?;

    let _ = app.emit("update-progress", "done");

    Ok(())
}

/// Compare semver strings: returns true if `latest` is newer than `current`
fn version_is_newer(latest: &str, current: &str) -> bool {
    let parse = |v: &str| -> Vec<u32> {
        v.split('.')
            .filter_map(|s| s.parse::<u32>().ok())
            .collect()
    };
    let l = parse(latest);
    let c = parse(current);
    for i in 0..l.len().max(c.len()) {
        let lv = l.get(i).copied().unwrap_or(0);
        let cv = c.get(i).copied().unwrap_or(0);
        if lv > cv {
            return true;
        }
        if lv < cv {
            return false;
        }
    }
    false
}
