import axios from 'axios';
import toast from 'react-hot-toast';

// Function to create Axios instance
export const createAxiosInstance = (baseURL) => {
  const axiosInstance = axios.create({
    baseURL: baseURL,  // Use the passed baseURL
  });

  // Request interceptor to add token and other headers before the request is sent
  axiosInstance.interceptors.request.use(
    (config) => {
      // Static or dynamically get your token as needed
      const token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzZXBzLXVzZXJAeW9wbWFpbC5jb20iLCJleHAiOjE3MzQwOTA3MzksImF1dGgiOiJST0xFX1VTRVIiLCJpYXQiOjE3MzE0OTg3Mzl9.EEIaYdyKI3lKwLDnpgBp4yK_d1NifU4vJUp0xbMYQMf-rTXAEuaiH8IGlKoAc1GI_YFfgDoVyjpvaYzHdzPMXg"; // Replace this with your token logic
      const userLanguage = 'en'; // Or dynamically determine language preference

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
            toast.error(`Client error ${statusCode}: ${error.response.statusText}, ${error.response.data.message}`);
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
