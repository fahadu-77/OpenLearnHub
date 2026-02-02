import axios from 'axios';
import store from '../store/store';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include token
// api.interceptors.request.use(
//     (config) => {
//         const token = store.getState().auth.token;
//         if (token) {
//             config.headers['x-auth-token'] = token;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export default api;
