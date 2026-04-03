import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, Mail, ShieldCheck, Eye, EyeOff, Loader2, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

        const errors = [];
        if (newPassword.length < 8) errors.push('be at least 8 characters long');
        if (!/[A-Z]/.test(newPassword)) errors.push('contain an uppercase letter');
        if (!/[a-z]/.test(newPassword)) errors.push('contain a lowercase letter');
        if (!/\d/.test(newPassword)) errors.push('contain a number');
        if (!/[@$!%*?&]/.test(newPassword)) errors.push('contain a special character (@$!%*?&)');

        if (errors.length > 0) {
            return setError(`Password must ${errors.join(' and ')}.`);
        }
        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match.');
        }

        setResetting(true);
        try {
            await api.post('/api/auth/reset-password', { email, otp, newPassword });
            setSuccessMsg("Password updated successfully. Redirecting to login...");
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
        <div className="min-h-screen flex items-center justify-center bg-background py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[100px] pointer-events-none z-0"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="max-w-md w-full space-y-8 bg-card/60 backdrop-blur-2xl p-10 rounded-3xl border border-border shadow-[0_8px_40px_rgb(0,0,0,0.12)] relative z-10"
            >
                <div className="flex flex-col items-center">
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 mb-6 shadow-inner"
                    >
                        <Key className="w-8 h-8 text-primary" />
                    </motion.div>
                    <h2 className="text-center text-3xl font-extrabold text-foreground font-outfit tracking-tight">
                        Reset Password
                    </h2>
                    <p className="mt-3 text-center text-sm text-muted-foreground">
                        Remembered it?{' '}
                        <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                            Log in here
                        </Link>
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-destructive text-sm text-center bg-destructive/10 border border-destructive/20 p-3 rounded-xl font-medium"
                            >
                                {error}
                            </motion.div>
                        )}
                        {successMsg && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-green-500 text-sm text-center bg-green-500/10 border border-green-500/20 p-3 rounded-xl font-medium"
                            >
                                {successMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {step === 1 ? (
                        <motion.form 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6" 
                            onSubmit={handleSendOtp}
                        >
                            <div className="space-y-4">
                                <div className="relative group">
                                    <Mail className="absolute top-3.5 left-4 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        className="appearance-none block w-full px-12 py-3.5 border border-border bg-background/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                                        placeholder="Enter your registered email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={sendingOtp}
                                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all shadow-[0_4px_15px_rgba(var(--primary),0.3)] hover:shadow-[0_6px_20px_rgba(var(--primary),0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {sendingOtp ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...</>
                                ) : 'Send Reset Code'}
                            </motion.button>
                        </motion.form>
                    ) : (
                        <motion.form 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6" 
                            onSubmit={handleResetPassword}
                        >
                            <div className="space-y-4">
                                <div className="relative group">
                                    <ShieldCheck className="absolute top-3.5 left-4 text-primary w-5 h-5" />
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none block w-full px-12 pr-[100px] py-3.5 border border-primary/50 bg-primary/5 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                    <div className="absolute top-2 right-2">
                                        <button 
                                            type="button" 
                                            onClick={handleSendOtp}
                                            disabled={timer > 0 || sendingOtp}
                                            className="px-3 py-1.5 bg-muted text-xs font-semibold text-foreground rounded-lg border border-border hover:bg-background disabled:opacity-50 transition-colors shadow-sm"
                                        >
                                            {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                                        </button>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute top-3.5 left-4 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="appearance-none block w-full px-12 pr-12 py-3.5 border border-border bg-background/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-3.5 right-4 text-muted-foreground hover:text-foreground transition-colors z-20"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute top-3.5 left-4 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        className="appearance-none block w-full px-12 pr-12 py-3.5 border border-border bg-background/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                                        placeholder="Confirm New Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-3.5 right-4 text-muted-foreground hover:text-foreground transition-colors z-20"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={resetting}
                                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all shadow-[0_4px_15px_rgba(var(--primary),0.3)] hover:shadow-[0_6px_20px_rgba(var(--primary),0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {resetting ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Updating...</>
                                ) : 'Update Password'}
                            </motion.button>
                        </motion.form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
