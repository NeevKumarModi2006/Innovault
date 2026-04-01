import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, User, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSendOtp = async () => {
        if (!email) {
            return setError('Please enter an email address first.');
        }
        setSendingOtp(true);
        setError('');
        setSuccessMsg('');
        try {
            await api.post('/api/auth/send-otp', { email });
            setOtpSent(true);
            setSuccessMsg('OTP sent to your email. It expires in 10 minutes.');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to send OTP.');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/api/auth/register', { username, email, password, otp });

            // Auto-login
            const loginRes = await api.post('/api/auth/login', { email, password });
            const token = loginRes.data;
            const userRes = await api.get('/api/auth/me', {
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
                        Join the Innovation Community
                    </p>
                </div>

                <div className="bg-blue-900/20 border border-blue-800 rounded p-3 text-xs text-blue-200">
                    Use your <b>nitw.ac.in</b> email to get VERIFIED status and post projects. Other emails will be read-only.
                </div>

                <div className="mt-8 space-y-6">
                    {error && <div className="text-red-500 text-sm text-center bg-red-900/20 p-2 rounded">{error}</div>}
                    {successMsg && <div className="text-green-400 text-sm text-center bg-green-900/20 p-2 rounded">{successMsg}</div>}
                    
                    <form className="space-y-6" onSubmit={handleSubmit}>
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
                                    disabled={otpSent}
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
                                    disabled={otpSent}
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute top-3 left-3 text-gray-500 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="appearance-none rounded-none relative block w-full px-10 pr-12 py-3 border border-gray-700 placeholder-gray-500 text-white bg-dark-input focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Password (Min 6 chars)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={otpSent}
                                />
                                <button
                                    type="button"
                                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-300"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            
                            {otpSent && (
                                <div className="relative">
                                    <ShieldCheck className="absolute top-3 left-3 text-primary w-5 h-5" />
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none rounded-none relative block w-full px-10 py-3 border border-primary placeholder-gray-500 text-white bg-dark-input rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        {!otpSent ? (
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={sendingOtp}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-secondary hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors"
                            >
                                {sendingOtp ? 'Sending...' : 'Send OTP to Email'}
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                            >
                                Verify & Sign Up
                            </button>
                        )}
                    </form>
                    
                    <div className="text-center">
                        <p className="text-sm text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

