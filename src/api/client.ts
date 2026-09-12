import axios, { AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach JWT token from localStorage if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lifeshelf_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error message formatting & 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: { message?: string; code?: string; details?: unknown }; message?: string }>) => {
    if (error.response?.status === 401) {
      // Clear token if unauthorized and redirect if not already on auth page
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        localStorage.removeItem('lifeshelf_token');
        localStorage.removeItem('lifeshelf_user');
      }
    }
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    const appError = new Error(message) as Error & { status?: number; code?: string };
    appError.status = error.response?.status;
    appError.code = error.response?.data?.error?.code;
    return Promise.reject(appError);
  }
);
