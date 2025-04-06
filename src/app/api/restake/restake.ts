// import axios, { AxiosResponse } from "axios";
import axios from 'axios';
import { OperatorDataResponse } from '../../interface/operatorData.interface';

/**
 * Fetches the current ETH price in USD from CoinGecko API
 * 
 * @return A Promise that resolves to the current ETH price in USD
 */
const fetchETHPrice = async (): Promise<number> => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'ethereum',
        vs_currencies: 'usd',
      },
    });
    return response.data.ethereum.usd;
  } catch (err: unknown) {
    console.error('Error fetching ETH price data');
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
    const response = await axios.get('/restake/operator-data', {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        limit: 10000, // Using a very high number to fetch all operators
      },
    });
    const data = response.data;

    return data;
  } catch (err: unknown) {
    console.error('Error fetching operator data');
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
    const response = await axios.get('/restake/staker-data', {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        limit: 100, // Using a very high number to fetch all operators
      },
    });
    const data = response.data;

    return data;
  } catch (err: unknown) {
    // if (err instanceof Error) {
    //     const errorResponse = (err as { response?: { data?: any } }).response?.data;
    //     console.error(errorResponse || err.message);
    // } else {
    //     console.error(err);
    // }
    console.error('Error staker data');
    return {};
  }
};

async function fetchEthereumStats(): Promise<{
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

/**
 * Fetches AVS relationship data from the "/aoss" endpoint.
 * 
 * @param filters - Optional filters for avs, operator, strategy, token, date_start, date_end
 * @returns A Promise that resolves to the fetched data. If an error occurs, null is returned.
 */
const fetchAVSData = async (filters?: {
  avs?: string | string[];
  operator?: string | string[];
  strategy?: string | string[];
  token?: 'eth' | 'usd';
  date_start?: string;
  date_end?: string;
  full?: boolean;
}) => {
  try {
    // Use the cached endpoint by default
    const response = await axios.get('https://eigenlayer.restakeapi.com/aoss', {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        ...filters,
        // If no filters are provided, use full=true to get all data
        full: filters && Object.keys(filters).length === 0 ? true : filters?.full,
      },
    });
    
    return response.data;
  } catch (err: unknown) {
    console.error('Error fetching AVS data:', err);
    return null;
  }
};

export { fetchOperatorData, fetchStakerData, fetchETHPrice, fetchEthereumStats, fetchAVSData };
