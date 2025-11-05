// DeFi Integration Types

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

// Protocol enum for DeFi platforms
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Protocol {
    Solend,
    MarginFi,
    Kamino,
    Other(String),
}

// Position type enum
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PositionType {
    Lending,
    Borrowing,
    LiquidityPool,
    Staking,
    Farming,
}

// Risk level enum for DeFi positions
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

// Reward structure
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Reward {
    pub token: String,
    pub amount: f64,
    pub value_usd: f64,
}

// DeFi position structure
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeFiPosition {
    pub id: String,
    pub protocol: Protocol,
    pub position_type: PositionType,
    pub asset: String,
    pub amount: f64,
    pub value_usd: f64,
    pub apy: f64,
    pub rewards: Vec<Reward>,
    pub health_factor: Option<f64>,
    pub created_at: i64,
    pub last_updated: i64,
}

// Portfolio summary structure
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PortfolioSummary {
    pub total_value_usd: f64,
    pub lending_value: f64,
    pub borrowing_value: f64,
    pub lp_value: f64,
    pub staking_value: f64,
    pub farming_value: f64,
    pub total_earnings_24h: f64,
    pub average_apy: f64,
    pub positions: Vec<DeFiPosition>,
}

// Risk metrics structure
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RiskMetrics {
    pub position_id: String,
    pub risk_level: RiskLevel,
    pub liquidation_price: Option<f64>,
    pub health_factor: Option<f64>,
    pub collateral_ratio: Option<f64>,
    pub warnings: Vec<String>,
}

// Auto-compound settings structure
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AutoCompoundSettings {
    pub position_id: String,
    pub enabled: bool,
    pub threshold: f64,
    pub frequency: u64,
    pub slippage_tolerance: f64,
    pub gas_limit: u64,
}

// Governance proposal status
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ProposalStatus {
    Active,
    Passed,
    Rejected,
    Executed,
    Cancelled,
}

// Governance proposal structure
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GovernanceProposal {
    pub id: String,
    pub protocol: Protocol,
    pub title: String,
    pub description: String,
    pub proposer: String,
    pub start_time: i64,
    pub end_time: i64,
    pub votes_for: f64,
    pub votes_against: f64,
    pub votes_abstain: f64,
    pub status: ProposalStatus,
    pub quorum: f64,
    pub execution_eta: Option<i64>,
}
