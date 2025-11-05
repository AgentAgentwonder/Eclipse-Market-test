// DeFi Integrations Module
// Jupiter swaps, yield farming, and LP analytics

pub mod types;
pub mod jupiter;
pub mod yield_tracker;
pub mod lp_analyzer;

// Export existing DeFi modules
pub mod solend;
pub mod marginfi;
pub mod kamino;
pub mod staking;
pub mod yield_farming;
pub mod position_manager;
pub mod governance;
pub mod auto_compound;

pub use types::*;
pub use jupiter::JupiterClient;
pub use yield_tracker::YieldTracker;
pub use lp_analyzer::LpAnalyzer;
