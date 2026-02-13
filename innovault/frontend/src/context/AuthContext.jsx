import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('auth-token');
            if (token) {
                try {
                    // Verify token and get user data (assuming an endpoint exists, or just decode if client-side only for now)
                    // For now, we'll just assume valid if token exists and maybe decode it later or hit a /me endpoint
                    // Let's implement a verify endpoint or just set a flag
                    setUser({ token }); // In a real app, fetch user details here
                } catch (error) {
                    localStorage.removeItem('auth-token');
                }
            }
            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const token = response.data;
        localStorage.setItem('auth-token', token);
        setUser({ token });
        return token;
    };

    const register = async (username, email, password) => {
        await api.post('/auth/register', { username, email, password });
    };

    const logout = () => {
        localStorage.removeItem('auth-token');
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
