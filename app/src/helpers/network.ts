import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const { REACT_APP_API_URL } = process.env;

console.log(REACT_APP_API_URL);

// Add base URL to network requests
// @ts-ignore
const axiosInstance = axios.create({
    baseURL: REACT_APP_API_URL,
});

// Automatically refresh access token
axiosInstance.interceptors.response.use(undefined, (err: AxiosError) => {
    const response = err.response;
    // @ts-ignore
    if (response && response.status === 401 && response.config && !response.config.__isRetryRequest) {
        return Network.post('/users/refresh-token', { refresh_token: Network.getRefreshToken() })
            .then((res: AxiosResponse) => {
                // @ts-ignore
                response.config.__isRetryRequest = true;
                response.config.headers['Authorization'] = `Bearer ${res.data.access_token}`;
                Network.setTokens(res.data.access_token, res.data.refresh_token);
                return axiosInstance(response.config);
            })
            .catch((err: AxiosError) => Promise.reject(err));
    }
    throw err;
});

// Set auth token
axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;

export default class Network {

    static axios = axiosInstance;

    static get(url: string, config: AxiosRequestConfig | undefined = undefined) {
        return this.axios.get(url, config);
    }

    static post(url: string, data: any | undefined = undefined, config: AxiosRequestConfig | undefined = undefined) {
        return this.axios.post(url, data, config);
    }

    static patch(url: string, data: any | undefined = undefined, config: AxiosRequestConfig | undefined = undefined) {
        return this.axios.patch(url, data, config);
    }

    static put(url: string, data: any | undefined = undefined, config: AxiosRequestConfig | undefined = undefined) {
        return this.axios.put(url, data, config);
    }

    static delete(url: string, config: AxiosRequestConfig | undefined = undefined) {
        return this.axios.delete(url, config);
    }

    static setTokens(accessToken: string, refreshToken: string) {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
    }

    static clearTokens() {
        delete this.axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    static getRefreshToken() {
        return localStorage.getItem('refresh_token');
    }

}
