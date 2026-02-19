import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, User } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:3000/api/auth/register', { username, email, password });

            // Auto Login after register? Or redirect to login
            // For smoother UX, let's just redirect to Login or auto-login if backend returns token (it currently doesn't, just user ID)

            // Let's manually login now
            const loginRes = await axios.post('http://localhost:3000/api/auth/login', { email, password });
            const token = loginRes.data;
            const userRes = await axios.get('http://localhost:3000/api/auth/me', {
                headers: { 'auth-token': token }
            });

            login(token, userRes.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Registration failed.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-dark-card p-8 rounded-xl border border-gray-800 shadow-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Join the NITW Innovation Community
                    </p>
                </div>

                <div className="bg-blue-900/20 border border-blue-800 rounded p-3 text-xs text-blue-200">
                    Use your <b>@nitw.ac.in</b> email to get VERIFIED status and post projects. Other emails will be read-only.
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="text-red-500 text-sm text-center bg-red-900/20 p-2 rounded">{error}</div>}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="relative">
                            <User className="absolute top-3 left-3 text-gray-500 w-5 h-5" />
                            <input
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-700 placeholder-gray-500 text-white bg-dark-input rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute top-3 left-3 text-gray-500 w-5 h-5" />
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-700 placeholder-gray-500 text-white bg-dark-input focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute top-3 left-3 text-gray-500 w-5 h-5" />
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-700 placeholder-gray-500 text-white bg-dark-input rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Password (Min 6 chars)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
