pub mod birdeye;
pub mod helius;
pub mod reconnect;
pub mod types;

pub use birdeye::*;
pub use helius::*;
pub use reconnect::*;
pub use types::*;

// WebSocket Manager for managing WebSocket connections
pub struct WebSocketManager {
    handle: tauri::AppHandle,
}

impl WebSocketManager {
    pub fn new(handle: tauri::AppHandle) -> Self {
        Self { handle }
    }
}

pub type SharedWebSocketManager = Arc<tokio::sync::RwLock<WebSocketManager>>;
