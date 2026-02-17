import axios from 'axios';

// Live view / production: uses Vercel backend by default. For local backend, set VITE_API_URL in .env.local
const API_BASE_URL =
 //import.meta.env.VITE_API_URL || 'http://192.168.18.111:5000/api';
  import.meta.env.VITE_API_URL || 'https://kufi-backend-new1.vercel.app/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Support both common auth header styles used by different backends
            config.headers.Authorization = `Bearer ${token}`;
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
