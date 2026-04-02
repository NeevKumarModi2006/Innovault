const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function fetchWrapper(endpoint, options = {}) {
    let url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    
    if (options.params) {
        const cleanParams = Object.fromEntries(
            Object.entries(options.params).filter(([_, v]) => v != null && v !== '')
        );
        const queryString = new URLSearchParams(cleanParams).toString();
        if (queryString) {
            url += (url.includes('?') ? '&' : '?') + queryString;
        }
        delete options.params;
    }
    
    const headers = new Headers(options.headers || {});
    
    // Auto-attach auth-token if present
    const token = localStorage.getItem('token');
    if (token) {
        headers.set('auth-token', token);
    }
    
    // Auto-set Content-Type to application/json if data is an object and we aren't sending FormData
    if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
    }
    
    const config = {
        ...options,
        headers
    };
    
    const response = await fetch(url, config);
    let data;
    let text = '';
    
    // Safely parse JSON
    try {
        text = await response.text();
        data = text ? JSON.parse(text) : null;
    } catch (err) {
        data = text;
    }
    
    if (!response.ok) {
        const error = new Error(data?.message || response.statusText);
        error.response = { data, status: response.status };
        throw error;
    }
    
    return { data, status: response.status, headers: response.headers };
}

const api = {
    get: (url, options = {}) => fetchWrapper(url, { ...options, method: 'GET' }),
    post: (url, body, options = {}) => fetchWrapper(url, { ...options, method: 'POST', body }),
    put: (url, body, options = {}) => fetchWrapper(url, { ...options, method: 'PUT', body }),
    delete: (url, options = {}) => fetchWrapper(url, { ...options, method: 'DELETE' })
};

export default api;
