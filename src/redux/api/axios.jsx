import axios from 'axios';
import toast from 'react-hot-toast';
import { getLocalStorage } from '../../utils/storage';

// Function to create Axios instance
export const createAxiosInstance = (baseURL) => {
  const axiosInstance = axios.create({
    baseURL: baseURL,  // Use the passed baseURL
  });

  // Request interceptor to add token and other headers before the request is sent
  axiosInstance.interceptors.request.use(
    (config) => {
      // Static or dynamically get your token as needed
     
      const token = getLocalStorage("id_token")
      
      const userLanguage = 'es'; // Or dynamically determine language preference

      // Add Accept-Language header
      if (userLanguage) {
        config.headers["Accept-Language"] = userLanguage;
      }

      // Add Authorization header if token exists
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Set Content-Type based on request data type
      if (config.data && config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      } else {
        config.headers['Content-Type'] = 'application/json';
      }

      return config; // Proceed with the request
    },
    (error) => {
      // Handle request error
      console.log(error)
      toast.error('Error: Request setup failed');
      return Promise.reject(error); // Reject the promise
    }
  );

  // Response interceptor to handle error messages and response
  axiosInstance.interceptors.response.use(
    (response) => {
      return response; // Just return the response
    },
    (error) => {
      if (error.response) {
        const statusCode = error.response.status;
        switch (Math.floor(statusCode / 100)) {
          case 4:
            toast.error(`${error?.response?.data?.errorDescription ?? error?.response?.data?.message}`);
            break;
          case 5:
            toast.error(`Server error ${statusCode}: ${error.response.statusText}`);
            break;
          default:
            toast.error(`Error ${statusCode}: ${error.response.statusText}`);
        }
      } else if (error.request) {
        toast.error('Error: No response received');
      } else {
        toast.error('Error: Request setup failed');
      }
      return Promise.reject(error); // Reject the promise with the error
    }
  );

  return axiosInstance;
};

// Usage example: creating an Axios instance for user API
export const userApi = createAxiosInstance(`${process.env.REACT_APP_USER_API_URL}`);
export const authApi = createAxiosInstance(`${process.env.REACT_APP_AUTH_API_URL}`);
export const ticketsApi = createAxiosInstance(`${process.env.REACT_APP_TICKET_API_URL}`);
