import axios from 'axios';

// Centralised axios instance — replaces all hardcoded localhost URLs.
// Switch between local and deployed backend by changing VITE_API_URL in .env
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:3000') ,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['auth-token'] = token;
    }
    return config;
});

export default api;
