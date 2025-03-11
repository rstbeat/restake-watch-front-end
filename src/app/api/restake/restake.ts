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

export { fetchOperatorData, fetchStakerData, fetchETHPrice };
