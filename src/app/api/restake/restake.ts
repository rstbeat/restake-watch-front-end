// import axios, { AxiosResponse } from "axios";
import axios from 'axios';
import { OperatorDataResponse } from '../../interface/operatorData.interface';

type PlatformType = 'eigenlayer' | 'symbiotic' | 'karak';

let currentPlatform: PlatformType = 'eigenlayer';

export const setPlatform = (platform: PlatformType) => {
  currentPlatform = platform;
};

const getBasePath = (platform: PlatformType = currentPlatform) =>
  platform === 'symbiotic' ? '/smetrics' : '/restake';

/**
 * Fetches operator data from the "/restake/operator-data" endpoint.
 *
 * @param params - The parameters for the fetch request.
 * @return A Promise that resolves to the fetched data as an object. If an error occurs, an empty object is returned.
 */
const fetchOperatorData = async (platform: PlatformType = currentPlatform): Promise<OperatorDataResponse | null> => {
  try {
    const response = await axios.get(`${getBasePath(platform)}/operator-data`, {
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
const fetchStakerData = async (platform: PlatformType = currentPlatform) => {
  try {
    const response = await axios.get(`${getBasePath(platform)}/staker-data`, {
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

export async function fetchDailyMetrics(platform: PlatformType = currentPlatform) {
  try {
    const response = await axios.get(`${getBasePath(platform)}/daily-metrics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching daily metrics');
    return null;
  }
}

export async function fetchStrategyData(platform: PlatformType = currentPlatform) {
  try {
    const response = await axios.get(`${getBasePath(platform)}/vault-data`);
    return response.data;
  } catch (error) {
    console.error('Error fetching strategy data');
    return null;
  }
}

export { fetchOperatorData, fetchStakerData, fetchETHPrice, fetchDailyMetrics, fetchStrategyData };
