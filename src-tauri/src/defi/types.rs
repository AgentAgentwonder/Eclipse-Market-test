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

// Yield position structure
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct YieldPosition {
    pub id: String,
    pub protocol: Protocol,
    pub pool_id: String,
    pub asset: String,
    pub amount: f64,
    pub value_usd: f64,
    pub apy: f64,
    pub earned: f64,
    pub pending_rewards: Vec<Reward>,
    pub created_at: i64,
    pub last_updated: i64,
}

// Impermanent loss data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImpermanentLossData {
    pub position_id: String,
    pub current_loss_percent: f64,
    pub current_loss_usd: f64,
    pub initial_value_usd: f64,
    pub current_value_usd: f64,
    pub hold_value_usd: f64,
    pub token_a_amount: f64,
    pub token_b_amount: f64,
    pub token_a_price: f64,
    pub token_b_price: f64,
}

// LP analytics structure
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LpAnalytics {
    pub position_id: String,
    pub pool_id: String,
    pub total_value_usd: f64,
    pub token_a_amount: f64,
    pub token_b_amount: f64,
    pub share_of_pool: f64,
    pub apy_7d: f64,
    pub apy_30d: f64,
    pub fees_earned_24h: f64,
    pub fees_earned_total: f64,
    pub volume_24h: f64,
    pub impermanent_loss: ImpermanentLossData,
}

// Price range structure for concentrated liquidity
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PriceRange {
    pub min_price: f64,
    pub max_price: f64,
    pub current_price: f64,
    pub in_range: bool,
    pub utilization: f64,
}

// Lending pool structure
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LendingPool {
    pub id: String,
    pub protocol: Protocol,
    pub asset: String,
    pub total_supply: f64,
    pub total_borrow: f64,
    pub supply_apy: f64,
    pub borrow_apy: f64,
    pub utilization_rate: f64,
    pub available_liquidity: f64,
    pub total_value_locked: f64,
}

// Yield farm structure
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct YieldFarm {
    pub id: String,
    pub protocol: Protocol,
    pub name: String,
    pub pool_address: String,
    pub token_a: String,
    pub token_b: String,
    pub tvl: f64,
    pub apy: f64,
    pub reward_tokens: Vec<String>,
    pub daily_rewards: f64,
    pub is_active: bool,
}

// Staking pool structure
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StakingPool {
    pub id: String,
    pub protocol: String,
    pub name: String,
    pub token: String,
    pub total_staked: f64,
    pub apy: f64,
    pub lock_period: Option<u64>,
    pub min_stake: f64,
    pub max_stake: Option<f64>,
    pub reward_token: String,
    pub is_active: bool,
}
