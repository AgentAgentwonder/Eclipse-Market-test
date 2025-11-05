// DeFi Integration Types - Placeholder
// Full implementation in progress

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SwapQuote {
    pub input_mint: String,
    pub output_mint: String,
    pub input_amount: u64,
    pub output_amount: u64,
}

#[derive(Debug, thiserror::Error)]
pub enum DefiError {
    #[error("defi error: {0}")]
    General(String),
}

pub type DefiResult<T> = Result<T, DefiError>;
