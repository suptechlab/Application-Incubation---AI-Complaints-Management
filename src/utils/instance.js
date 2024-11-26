import axios from 'axios';
import { getLocalStorage, removeLocalStorage } from './storage';
import { useNavigate } from 'react-router-dom';

// const BASE_URL = process.env.REACT_APP_API_URL;
// console.log('BASE_URL',BASE_URL)


const createAxiosInstance = (baseURL) => {


    const instance = axios.create({
        baseURL: `${baseURL}/`,
        //baseURL: BASE_URL,
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
                // Clear local storage and navigate to the dashboard
                removeLocalStorage("access_token")
                removeLocalStorage("refresh_token")
                removeLocalStorage("imageUrl")
                removeLocalStorage("firstName")
                removeLocalStorage("lastName")
                removeLocalStorage("companyTitle")
                removeLocalStorage("user_type")
                removeLocalStorage("email")
                removeLocalStorage("password")
                removeLocalStorage("langKey")
                removeLocalStorage("user_roles")
                // const navigate = useNavigate();
                // navigate('/dashboard');
                // Force redirect to the login page
                const loginURL = `${process.env.REACT_APP_BASE_URL}/login`;
                console.log('loginURL',loginURL)
                window.location.href = loginURL;
            }

            return Promise.reject(error);
        }
    );

      // Make sure to return the instance
      return instance;

}

export const adminApi = createAxiosInstance(`${process.env.REACT_APP_ADMIN_API_URL}`);
export const authApi = createAxiosInstance(`${process.env.REACT_APP_AUTH_API_URL}`);