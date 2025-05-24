import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { getSession } from './auth';
import { ApiError } from '../types';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'https://stocai-blog-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending cookies
});

// Request interceptor to add CSRF token
api.interceptors.request.use(
  async (config) => {
    // Get CSRF token if needed
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '')) {
      const response = await fetch('https://stocai-blog-backend.onrender.com/admin/login/', {
        method: 'GET',
        credentials: 'include',
      });
      const html = await response.text();
      const csrfMatch = html.match(/name="csrfmiddlewaretoken" value="([^"]+)"/);
      const csrfToken = csrfMatch ? csrfMatch[1] : '';
      
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
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