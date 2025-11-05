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

// Re-export command functions
pub use yield_farming::{get_farming_opportunities, get_farming_positions, get_yield_farms};
pub use position_manager::{
    get_auto_compound_recommendations, get_defi_portfolio_summary, get_defi_risk_metrics,
    get_defi_snapshot,
};
pub use auto_compound::{
    configure_auto_compound, estimate_compound_apy_boost, get_auto_compound_config,
    get_compound_history,
};
pub use solend::{get_solend_pools, get_solend_positions, get_solend_reserves};
pub use marginfi::{get_marginfi_banks, get_marginfi_positions};
pub use kamino::{get_kamino_farms, get_kamino_positions, get_kamino_vaults};
pub use staking::{get_staking_pools, get_staking_positions, get_staking_schedule};
pub use governance::{get_governance_participation, get_governance_proposals, vote_on_proposal};
