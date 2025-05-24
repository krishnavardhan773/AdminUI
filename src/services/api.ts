import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { getSession } from './auth';
import { ApiError } from '../types';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'https://stocai-blog-backend.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
  // Remove withCredentials since this is a public API
  withCredentials: false,
});

// Request interceptor to add authorization header
api.interceptors.request.use(
  async (config) => {
    const session = getSession();
    if (session) {
      config.headers['Authorization'] = `Bearer ${session}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // If error is 403 or 401 and we haven't retried yet
    if ((error.response?.status === 403 || error.response?.status === 401) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Redirect to login
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Format error message
    let errorMessage = 'An error occurred';
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
    } as ApiError);
  }
);

export default api;