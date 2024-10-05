export interface ConcentrationMetrics {
  top33PercentCount: number;
  bottom33PercentCount: number;
  herfindahlIndex: number;
}

export interface BehaviorAnalysis {
  top_10_percent_operators_behavior: string;
  bottom_50_percent_operators_behavior: string;
  top_10_percent_operators_change: number;
  bottom_50_percent_operators_change: number;
  top_10_percent_operators_change_ratio: number;
  bottom_50_percent_operators_change_ratio: number;
  total_operators_change: number;
}

export interface RecentTransaction {
  timestamp: string;
  type: string;
  amount: string;
  strategy: string;
}

export interface OperatorData {
  'Operator Address': string;
  'ETH Restaked': number;
  'Number of Strategies': number;
  'Most Used Strategy': string;
  'Recent Transactions': RecentTransaction[];
  'Recent Transaction_Sum': number;
  'Market Share': number;
  'Largest Strategy': string;
  'Largest Strategy ETH': number;
  'ETH in Binance': number;
  'ETH in Coinbase': number;
  'ETH in Lido': number;
  'ETH in Mantle': number;
  'ETH in Rocket_Pool': number;
  'ETH in Stader': number;
  'ETH in Swell': number;
  'ETH in UNKNOWN': number;
}

export interface StakerData {
    'Staker Address': string;
    'ETH Restaked': number;
    'Number of Strategies': number;
    'Most Used Strategy': string;
    'Recent Transactions': RecentTransaction[];
    'Recent Transaction_Sum': number;
    'Market Share': number;
    'Largest Strategy': string;
    'Largest Strategy ETH': number;
    'ETH in Binance': number;
    'ETH in Coinbase': number;
    'ETH in Lido': number;
    'ETH in Mantle': number;
    'ETH in Rocket_Pool': number;
    'ETH in Stader': number;
    'ETH in Swell': number;
    'ETH in UNKNOWN': number;
  }

export interface OperatorDataResponse {
  concentrationMetrics: ConcentrationMetrics;
  behaviorAnalysis: BehaviorAnalysis;
  totalCount: number;
  lastUpdated: string;
  operatorData: OperatorData[];
}

export interface StakerDataResponse {
    concentrationMetrics: ConcentrationMetrics;
    behaviorAnalysis: BehaviorAnalysis;
    totalCount: number;
    lastUpdated: string;
    stakerData: StakerData[];
  }

  export interface OperatorDataFormated {
    operatorAddress: string;
    // operatorName: string;
    marketShared: string;
    ethRestaked: string;
    numberOfStrategies: number;
    mostUsedStrategies: string;
  }
  