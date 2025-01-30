import axios from 'axios';
import { getLocalStorage } from './storage';
import toast from "react-hot-toast";




const createAxiosInstance = (baseURL) => {

    const instance = axios.create({
        baseURL: `${baseURL}/`,
        timeout: 600000, // 10 Mint
    });

    instance.interceptors.request.use(
        (config) => {
            const token = getLocalStorage('access_token');
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
            if (error.response?.status === 401) {
                toast.error(error.response?.message ?? 'No autorizado');
             
            }
            return Promise.reject(error);
        }
    );

      // Make sure to return the instance
      return instance;

}

export const adminApi = createAxiosInstance(`${process.env.REACT_APP_ADMIN_API_URL}`);
export const authApi = createAxiosInstance(`${process.env.REACT_APP_AUTH_API_URL}`);
export const ticketApi = createAxiosInstance(`${process.env.REACT_APP_TICKETS_API_URL}`);
export const userApi = createAxiosInstance(`${process.env.REACT_APP_USER_API_URL}`);