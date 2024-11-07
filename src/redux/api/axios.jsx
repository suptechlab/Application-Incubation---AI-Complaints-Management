
import axios from "axios";
import toast from 'react-hot-toast';

export const axiosRequest = axios.create({
  baseURL: '/'
});

axiosRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Error handling
    if (error.response) {
      const statusCode = error.response.status;
      switch (Math.floor(statusCode / 100)) {
        case 4:
          // 400-499: Client errors
          toast.error(`Client error ${statusCode}: ${error.response.statusText}, ${error.response.data.message}`)
          break;
        case 5:
          // 500-599: Server errors
          toast.error(`Server error ${statusCode}: ${error.response.statusText}`)
          break;
        default:
          // Other status codes
          toast.error(`Error ${statusCode}: ${error.response.statusText}`)
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('Error: No response received')
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error('Error: Request setup failed')
    }
    throw error;
  }
);