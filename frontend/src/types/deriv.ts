export interface DerivAccount {
  account_id: string;
  account_type: 'demo' | 'real';
  currency: string;
  balance?: number;
  is_active?: boolean;
}
export interface DerivSymbol {
  symbol: string;
  display_name: string;
  market: string;
  market_display_name: string;
  is_trading_suspended: boolean;
  pip: number;
}
export interface TickData {
  symbol: string;
  epoch: number;
  quote: number;
  pip_size?: number;
}
export interface TickHistoryItem {
  epoch: number;
  quote: number;
}
export interface ProposalRequest {
  proposal: 1;
  amount: number;
  basis: 'stake' | 'payout';
  contract_type: 'CALL' | 'PUT';
  currency: string;
  duration: number;
  duration_unit: 't' | 's' | 'm' | 'h' | 'd';
  underlying_symbol: string;
  req_id?: number;
}
export interface ProposalResponse {
  id: string;
  ask_price: number;
  payout: number;
  spot: number;
  spot_time: number;
  longcode: string;
  display_value?: string;
}
export interface BuyResponse {
  buy_price: number;
  balance_after: number;
  contract_id: number;
  start_time: number;
  longcode: string;
  transaction_id: number;
  purchase_time: number;
}
export interface OpenContract {
  contract_id: number;
  contract_type: string;
  underlying: string;
  buy_price: number;
  sell_price?: number;
  profit?: number;
  profit_percentage?: number;
  date_start: number;
  date_expiry?: number;
  current_spot?: number;
  entry_spot?: number;
  status: 'open' | 'sold' | 'won' | 'lost';
  is_expired?: boolean;
  is_valid_to_sell?: boolean;
}
export interface PortfolioContract {
  contract_id: number;
  contract_type: string;
  underlying: string;
  buy_price: number;
  payout: number;
  longcode: string;
  date_start: number;
  expiry_time?: number;
  transaction_id: number;
}
export interface BalanceData {
  balance: number;
  currency: string;
  account_id: string;
}
export interface WSMessage {
  msg_type: string;
  req_id?: number;
  error?: { code: string; message: string };
  [key: string]: unknown;
}
