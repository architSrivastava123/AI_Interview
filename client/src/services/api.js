/**
 * api.js
 * Centralized Axios instance with Clerk session token authorization interceptor.
 */

import axios from 'axios';

const isProductionVercel = typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app');
const defaultApiUrl = isProductionVercel && !window.location.hostname.includes('server')
  ? 'https://server-livid-one-58.vercel.app/api'
  : '/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
});

let getTokenFunction = null;

export function setAuthTokenGetter(getter) {
  getTokenFunction = getter;
}

api.interceptors.request.use(
  async (config) => {
    try {
      let token = null;

      if (getTokenFunction) {
        token = await getTokenFunction();
      } else if (window.Clerk?.session) {
        token = await window.Clerk.session.getToken();
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        const devToken = localStorage.getItem('mockmate_dev_token') || 'dev_user_123';
        config.headers.Authorization = `Bearer ${devToken}`;
      }

      // If sending FormData, do not force application/json
      if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      } else if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    } catch (err) {
      console.warn('Could not attach Clerk token to request:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorPayload = error.response?.data?.error || {
      message: error.response?.data?.message || error.message || 'An error occurred connecting to server.',
    };
    return Promise.reject(errorPayload);
  }
);

export default api;
