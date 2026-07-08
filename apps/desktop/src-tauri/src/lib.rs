use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use url::Url;

fn configured_app_url() -> Option<String> {
    std::env::var("MULTILOT_DESKTOP_URL")
        .ok()
        .filter(|value| !value.trim().is_empty())
        .or_else(|| {
            option_env!("MULTILOT_DESKTOP_URL")
                .map(str::to_owned)
                .filter(|value| !value.trim().is_empty())
        })
}

fn parse_remote_url(value: &str) -> Option<Url> {
    let url = Url::parse(value).ok()?;
    match url.scheme() {
        "https" | "http" => Some(url),
        _ => None,
    }
}

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let window_url = configured_app_url()
                .as_deref()
                .and_then(parse_remote_url)
                .map(WebviewUrl::External)
                .unwrap_or_else(|| WebviewUrl::App("index.html".into()));

            WebviewWindowBuilder::new(app.handle(), "main", window_url)
                .title("MultiLot 360")
                .inner_size(1280.0, 820.0)
                .min_inner_size(390.0, 720.0)
                .resizable(true)
                .focused(true)
                .build()?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running MultiLot 360 desktop");
}
