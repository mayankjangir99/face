import axios from 'axios';

export const AUTH_TOKEN_KEY = 'attendance-token';
export const USER_STORAGE_KEY = 'attendance-user';

const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000');

export const publicClient = axios.create({
  baseURL
});

export const apiClient = axios.create({
  baseURL
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getApiBaseUrl = () => baseURL;
