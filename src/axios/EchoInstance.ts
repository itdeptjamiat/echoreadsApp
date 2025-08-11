import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { store } from '../redux/store';
import { logoutUser } from '../redux/slices/authSlice';

// Create axios instance
const APIIns: AxiosInstance = axios.create({
  baseURL: 'https://api.echoreads.online/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token management
let authToken: string | null = null;

export const attachAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    APIIns.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete APIIns.defaults.headers.common['Authorization'];
  }
};

// Request interceptor
APIIns.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
APIIns.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear auth state and redirect to login
      store.dispatch(logoutUser());
      
      // Clear token from axios
      attachAuthToken(null);
      
      // TODO: Navigate to login screen
      // This will be handled by the app navigation
    }

    return Promise.reject(error);
  }
);

// Export the configured instance
export default APIIns; 