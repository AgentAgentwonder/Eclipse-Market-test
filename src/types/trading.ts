export type OrderType = 'market' | 'limit' | 'stoploss' | 'takeprofit' | 'trailingstop';
export type OrderSide = 'buy' | 'sell';
export type OrderStatus =
  | 'pending'
  | 'partiallyfilled'
  | 'filled'
  | 'cancelled'
  | 'expired'
  | 'failed';

export interface Order {
  id: string;
  orderType: OrderType;
  side: OrderSide;
  status: OrderStatus;
  inputMint: string;
  outputMint: string;
  inputSymbol: string;
  outputSymbol: string;
  amount: number;
  filledAmount: number;
  limitPrice?: number;
  stopPrice?: number;
  trailingPercent?: number;
  highestPrice?: number;
  lowestPrice?: number;
  linkedOrderId?: string;
  slippageBps: number;
  priorityFeeMicroLamports: number;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
  triggeredAt?: string;
  txSignature?: string;
  errorMessage?: string;
}

export interface CreateOrderRequest {
  orderType: OrderType;
  side: OrderSide;
  inputMint: string;
  outputMint: string;
  inputSymbol: string;
  outputSymbol: string;
  amount: number;
  limitPrice?: number;
  stopPrice?: number;
  trailingPercent?: number;
  linkedOrderId?: string;
  slippageBps: number;
  priorityFeeMicroLamports: number;
  walletAddress: string;
}

export interface OrderFill {
  orderId: string;
  filledAmount: number;
  fillPrice: number;
  txSignature: string;
  timestamp: string;
}

export interface OrderUpdate {
  orderId: string;
  status: OrderStatus;
  filledAmount?: number;
  txSignature?: string;
  errorMessage?: string;
}

export interface QuickTradeRequest {
  inputMint: string;
  outputMint: string;
  inputSymbol: string;
  outputSymbol: string;
  amount: number;
  side: OrderSide;
  walletAddress: string;
  useMax: boolean;
}

export interface OrderTriggeredEvent {
  orderId: string;
  orderType: OrderType;
  symbol: string;
  side: OrderSide;
  triggerPrice: number;
  amount: number;
}

export interface TransactionUpdate {
  signature: string;
  slot: number;
  timestamp: number;
  typ?: string;
  amount?: number;
  symbol?: string;
  from?: string;
  to?: string;
}

export interface CopyTradeExecutionEvent {
  configId: string;
  name: string;
  sourceWallet: string;
  amount: number;
  symbol: string;
  status: string;
  txSignature?: string;
}
