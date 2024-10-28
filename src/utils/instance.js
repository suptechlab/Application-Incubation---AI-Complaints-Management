import axios from 'axios';
import { getLocalStorage } from './storage';

const BASE_URL = process.env.REACT_APP_API_URL;

const instance = axios.create({
    baseURL: `${BASE_URL}/`,
    timeout: 600000, // 10 Mint
});

instance.interceptors.request.use(
    (config) => {
        // const token = getLocalStorage('access_token');
        // AS OF NOW SET TOKEN STATICALLY BECAUSE LOGIN IS BY PASSSED
        const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzZXBzLWFkbWluQHlvcG1haWwuY29tIiwiZXhwIjoxNzMyNDQ4NTc4LCJhdXRoIjoiUk9MRV9VU0VSIFJPTEVfQURNSU4iLCJpYXQiOjE3Mjk4NTY1Nzh9.ESeLsBFl-fv_KI2Gs0q6eTd0eiVaCIgylTay_MC4qN0rqCrvW6zA1zu8FL-lQ1nhXOuFxUfw26RkCqkW55F9sQ"
    
        const userLanguage = 'es';

        // Set Accept-Language header
        config.headers["Accept-Language"] = userLanguage ?? "en";

        // Set Authorization header if token exists
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Automatically set Content-Type based on request data
        if (config.data && config.data instanceof FormData) {
            // If data is FormData, set Content-Type to multipart/form-data
            config.headers['Content-Type'] = 'multipart/form-data';
        } else {
            // Otherwise, set Content-Type to application/json
            config.headers['Content-Type'] = 'application/json';
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
