import axios from 'axios';
import store from '../store/store';

const api = axios.create({
    // baseURL: 'https://openlearnhub.onrender.com/api', // Production API URL
    baseURL: 'http://localhost:3000/api', // Development API URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include token
api.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.token;
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
