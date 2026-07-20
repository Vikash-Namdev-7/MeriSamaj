import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for refresh tokens stored in HTTP-only cookies
});

// ─── Default token interceptor ────────────────────────────────────────────────
// Automatically attach the stored token from localStorage on every request.
// This ensures service files that import axiosPrivate directly (outside of React
// components, so they can't use the useAxiosPrivate hook) always send the correct
// Authorization header — especially important on page refresh before the React
// auth context fully re-initializes.
axiosPrivate.interceptors.request.use(
  (config) => {
    if (!config.headers['Authorization']) {
      const isHeadPanel = typeof window !== 'undefined' && window.location.pathname.startsWith('/head');
      const headToken = localStorage.getItem('head_auth_token');
      const memberToken = localStorage.getItem('merisamaj_token');

      if (isHeadPanel && headToken) {
        config.headers['Authorization'] = `Bearer ${headToken}`;
      } else if (memberToken) {
        config.headers['Authorization'] = `Bearer ${memberToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

