import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, Mail, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & Password
    const [sendingOtp, setSendingOtp] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [timer, setTimer] = useState(0);
    
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const navigate = useNavigate();

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        if (!email) {
            return setError('Please enter your registered email address.');
        }
        setSendingOtp(true);
        setError('');
        setSuccessMsg('');
        try {
            await api.post('/api/auth/send-otp', { email, type: 'reset' });
            setStep(2);
            setTimer(60); // Start 60s countdown
            setSuccessMsg('OTP sent to your email. It expires in 5 minutes.');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to send OTP.');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (newPassword.length < 8) {
            return setError('Password must be at least 8 characters long.');
        }
        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match.');
        }

        setResetting(true);
        try {
            await api.post('/api/auth/reset-password', { email, otp, newPassword });
            setSuccessMsg("Password updated successfully. Please login again.");
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to reset password.');
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-dark-card p-8 rounded-xl border border-gray-800 shadow-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Remembered it?{' '}
                        <Link to="/login" className="font-medium text-primary hover:text-primary-light">
                            Log in here
                        </Link>
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    {error && <div className="text-red-500 text-sm text-center bg-red-900/20 p-2 rounded">{error}</div>}
                    {successMsg && <div className="text-green-400 text-sm text-center bg-green-900/20 p-2 rounded">{successMsg}</div>}
                    
                    {step === 1 ? (
                        <form className="space-y-6" onSubmit={handleSendOtp}>
                            <div className="rounded-md shadow-sm">
                                <div className="relative">
                                    <Mail className="absolute top-3 left-3 text-gray-500 w-5 h-5" />
                                    <input
                                        type="email"
                                        required
                                        className="appearance-none rounded relative block w-full px-10 py-3 border border-gray-700 placeholder-gray-500 text-white bg-dark-input focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                        placeholder="Enter your registered email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={sendingOtp}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
                            >
                                {sendingOtp ? 'Sending...' : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-6" onSubmit={handleResetPassword}>
                            <div className="rounded-md shadow-sm space-y-3">
                                
                                <div className="relative">
                                    <ShieldCheck className="absolute top-3 left-3 text-primary w-5 h-5" />
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none rounded relative block w-full px-10 py-3 border border-primary placeholder-gray-500 text-white bg-dark-input focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                    <div className="absolute top-2 right-2">
                                        <button 
                                            type="button" 
                                            onClick={handleSendOtp}
                                            disabled={timer > 0 || sendingOtp}
                                            className="px-3 py-1 bg-gray-800 text-xs text-white rounded hover:bg-gray-700 disabled:opacity-50 transition"
                                        >
                                            {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                                        </button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <Lock className="absolute top-3 left-3 text-gray-500 w-5 h-5" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="appearance-none rounded relative block w-full px-10 pr-12 py-3 border border-gray-700 placeholder-gray-500 text-white bg-dark-input focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 z-20"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute top-3 left-3 text-gray-500 w-5 h-5" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        className="appearance-none rounded relative block w-full px-10 pr-12 py-3 border border-gray-700 placeholder-gray-500 text-white bg-dark-input focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                        placeholder="Confirm New Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 z-20"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={resetting}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
                            >
                                {resetting ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
