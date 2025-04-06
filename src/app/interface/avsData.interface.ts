export interface AVSDataItem {
  avs: string;
  operator: string;
  strategy: string;
  shares: number;
  timestamp: number;
  status_date: string;
  eth: number;
  usd: number;
}

export interface AVSDataResponse {
  metadata: {
    total_results: number;
    results_returned: number;
    limited: boolean;
    latest_timestamp?: number;
    latest_date?: string;
  };
  data: AVSDataItem[];
}

export interface AVSFilters {
  avs?: string | string[];
  operator?: string | string[];
  strategy?: string | string[];
  token?: 'eth' | 'usd';
  date_start?: string;
  date_end?: string;
  full?: boolean;
}

export interface AVSDataFormatted {
  avsAddress: string;
  avsName?: string;
  operatorAddress: string;
  operatorName?: string;
  strategyAddress: string;
  strategyName?: string;
  shares: number;
  ethValue: number;
  usdValue: number;
  statusDate: string;
}

export interface AVSMetrics {
  totalAVS: number;
  totalOperators: number;
  totalStrategies: number;
  totalEthValue: number;
  totalUsdValue: number;
  topAVSByValue: {
    address: string;
    name?: string;
    ethValue: number;
    usdValue: number;
    operatorCount: number;
  }[];
} 