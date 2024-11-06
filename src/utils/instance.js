import axios from 'axios';
import { getLocalStorage } from './storage';

const BASE_URL = process.env.REACT_APP_API_URL;

const instance = axios.create({
     baseURL: `${BASE_URL}/`,
    //baseURL: BASE_URL,
    timeout: 600000, // 10 Mint
});

instance.interceptors.request.use(
    (config) => {
        const token = getLocalStorage('access_token');
        // AS OF NOW SET TOKEN STATICALLY BECAUSE LOGIN IS BY PASSSED
        // const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzZXBzLmFkbWluQHlvcG1haWwuY29tIiwiZXhwIjoxNzMwODgxMTcyLCJhdXRoIjoiUk9MRV9BRE1JTiBST0xFX1VTRVIiLCJpYXQiOjE3MzA3OTQ3NzJ9.wiZwMttP6V-cOPwtu2-7ERAY7Bmg3xaCvYVmGwifm9lVJRq70bHttXBLF9Jw6-Hay8eMYFVu5rttWDbPvk1tow"
    
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
