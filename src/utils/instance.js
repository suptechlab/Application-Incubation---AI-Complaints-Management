import axios from 'axios';
import { getLocalStorage } from './storage';

const BASE_URL = process.env.REACT_APP_API_URL;

const instance = axios.create({
    baseURL: `${BASE_URL}/`,
    timeout: 600000, // 10 Mint
});

instance.interceptors.request.use(
    (config) => {
        const token = getLocalStorage('access_token');
        const userLanguage = getLocalStorage('langKey')  ? getLocalStorage('langKey') : 'en';
        //console.log('userLanguage',userLanguage)
        config.headers["Accept-Language"] = userLanguage ?? "en";
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;
