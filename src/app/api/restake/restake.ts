// import axios, { AxiosResponse } from "axios";
import axios from 'axios';

/**
 * Fetches operator data from the "/restake/operator-data" endpoint.
 *
 * @param params - The parameters for the fetch request.
 * @return A Promise that resolves to the fetched data as an object. If an error occurs, an empty object is returned.
 */
const fetchOperatorData = async () => {
  try {
    const response = await axios.get('/restake/operator-data', {
      headers: {
        'Content-Type': 'application/json',
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
    console.error('Error operator data');
    return {};
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

export { fetchOperatorData, fetchStakerData };