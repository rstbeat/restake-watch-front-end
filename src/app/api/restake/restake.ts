// import axios, { AxiosResponse } from "axios";
import axios from 'axios';
import { trackEvent } from '@/lib/analytics';
import { OperatorDataResponse } from '../../interface/operatorData.interface';

/**
 * Fetches the current ETH price in USD from CoinGecko API
 * 
 * @return A Promise that resolves to the current ETH price in USD
 */
const fetchETHPrice = async (): Promise<number> => {
  try {
    const startTime = Date.now();
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'ethereum',
        vs_currencies: 'usd',
      },
    });
    const price = response.data.ethereum.usd;

    trackEvent('data_loaded', {
      data_type: 'eth_price',
      load_time_ms: Date.now() - startTime,
      record_count: 1,
      success: true,
    });

    return price;
  } catch (err: unknown) {
    console.error('Error fetching ETH price data');
    trackEvent('data_error', {
      data_type: 'eth_price',
      error_message: err instanceof Error ? err.message : 'unknown_error',
      timestamp: Date.now(),
    });
    return 0;
  }
};

/**
 * Fetches operator data from the "/restake/operator-data" endpoint.
 *
 * @param params - The parameters for the fetch request.
 * @return A Promise that resolves to the fetched data as an object. If an error occurs, an empty object is returned.
 */
const fetchOperatorData = async (): Promise<OperatorDataResponse | null> => {
  try {
    const startTime = Date.now();
    const response = await axios.get('/restake/operator-data', {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        limit: 10000, // Using a very high number to fetch all operators
      },
    });
    const data = response.data;

    const recordCount = Array.isArray((data as any)?.operatorData)
      ? (data as any).operatorData.length
      : 0;
    trackEvent('data_loaded', {
      data_type: 'operators',
      load_time_ms: Date.now() - startTime,
      record_count: recordCount,
      success: true,
    });

    return data;
  } catch (err: unknown) {
    console.error('Error fetching operator data');
    trackEvent('data_error', {
      data_type: 'operators',
      error_message: err instanceof Error ? err.message : 'unknown_error',
      timestamp: Date.now(),
    });
    return null;
  }
};

/**
 * Fetches staker data from the "/restake/staker-data" endpoint.
 *
 * @param params - The parameters for the fetch request.
 * @return  A Promise that resolves to the fetched data as an object. If an error occurs, an empty object is returned.
 */
const fetchStakerData = async () => {
  try {
    const startTime = Date.now();
    const response = await axios.get('/restake/staker-data', {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        limit: 100, // Using a very high number to fetch all operators
      },
    });
    const data = response.data;

    const recordCount = Array.isArray((data as any)?.stakerData)
      ? (data as any).stakerData.length
      : 0;
    trackEvent('data_loaded', {
      data_type: 'restakers',
      load_time_ms: Date.now() - startTime,
      record_count: recordCount,
      success: true,
    });

    return data;
  } catch (err: unknown) {
    // if (err instanceof Error) {
    //     const errorResponse = (err as { response?: { data?: any } }).response?.data;
    //     console.error(errorResponse || err.message);
    // } else {
    //     console.error(err);
    // }
    console.error('Error staker data');
    trackEvent('data_error', {
      data_type: 'restakers',
      error_message: err instanceof Error ? err.message : 'unknown_error',
      timestamp: Date.now(),
    });
    return {};
  }
};

export async function fetchEthereumStats(): Promise<{
  totalEthSupply: number;
  totalStEthSupply: number;
}> {
  try {
    // In a real implementation, this would call an actual API
    // For now, we'll return mock data
    return {
      totalEthSupply: 120000000, // 120 million ETH in circulation
      totalStEthSupply: 25000000, // 25 million stETH in circulation 
    };
  } catch (error) {
    console.error('Error fetching Ethereum stats:', error);
    throw error;
  }
}

export { fetchOperatorData, fetchStakerData, fetchETHPrice };
