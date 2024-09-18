import axios, { AxiosResponse } from "axios";

/**
 * Fetches operator data from the "/restake/operator-data" endpoint.
 *
 * @param params - The parameters for the fetch request.
 * @return A Promise that resolves to the fetched data as an object. If an error occurs, an empty object is returned.
 */
const fetchOperatorData = async (params: any): Promise<any> => {
    try {
        const response: AxiosResponse<any> = await axios.get<any>("/restake/operator-data", {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = response.data;

        return data;
    } catch (err) {
        console.error(err.response ? err.response.data : err.message);
        return {};
    }
};

/**
 * Fetches staker data from the "/restake/staker-data" endpoint.
 *
 * @param params - The parameters for the fetch request.
 * @return  A Promise that resolves to the fetched data as an object. If an error occurs, an empty object is returned.
 */
const fetchStakerData = async (params: any) => {
    try {
        const response: AxiosResponse<any> = await axios.get<any>("/restake/staker-data", {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = response.data;

        return data;
    } catch (err) {
        console.error(err.response ? err.response.data : err.message);
        return {};
    }
};

export { fetchOperatorData, fetchStakerData };