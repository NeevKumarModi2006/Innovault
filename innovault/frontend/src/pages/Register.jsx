import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, User, ShieldCheck, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [timer, setTimer] = useState(0);

    React.useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

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
            setTimer(60);
            setSuccessMsg('OTP sent to your email. It expires in 10 minutes.');
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to send OTP.');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
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
            setIsSubmitting(false);
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
                        <UserPlus className="w-8 h-8 text-primary" />
                    </motion.div>
                    <h2 className="text-center text-3xl font-extrabold text-foreground font-outfit tracking-tight">
                        Create your account
                    </h2>
                    <p className="mt-3 text-center text-sm text-muted-foreground">
                        Join the Innovation Community
                    </p>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-foreground font-medium shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    Use your <b className="text-primary font-bold">nitw.ac.in</b> email to get VERIFIED status and post projects. Other emails will be read-only.
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

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="relative group">
                                <User className="absolute top-3.5 left-4 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-12 py-3.5 border border-border bg-background/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm disabled:opacity-50"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={otpSent}
                                />
                            </div>
                            <div className="relative group">
                                <Mail className="absolute top-3.5 left-4 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="appearance-none block w-full px-12 py-3.5 border border-border bg-background/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm disabled:opacity-50"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={otpSent}
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute top-3.5 left-4 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="appearance-none block w-full px-12 pr-12 py-3.5 border border-border bg-background/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm disabled:opacity-50"
                                    placeholder="Password (Min 6 chars)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={otpSent}
                                />
                                <button
                                    type="button"
                                    className="absolute top-3.5 right-4 text-muted-foreground hover:text-foreground transition-colors z-20"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                </button>
                            </div>

                            <AnimatePresence>
                                {otpSent && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0, y: -10 }}
                                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                                        className="relative group"
                                    >
                                        <ShieldCheck className="absolute top-3.5 left-4 text-primary w-5 h-5" />
                                        <input
                                            type="text"
                                            required
                                            className="appearance-none block w-full px-12 pr-[100px] py-3.5 border border-primary/50 bg-primary/5 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                                            placeholder="Enter 6-digit OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                        />
                                        <div className="absolute top-2 right-2 z-20">
                                            <button
                                                type="button"
                                                onClick={handleSendOtp}
                                                disabled={timer > 0 || sendingOtp}
                                                className="px-3 py-1.5 bg-muted text-xs font-semibold text-foreground rounded-lg border border-border hover:bg-background disabled:opacity-50 transition-colors shadow-sm"
                                            >
                                                {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {!otpSent ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={handleSendOtp}
                                disabled={sendingOtp}
                                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-secondary-foreground bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary/50 transition-all shadow-[0_4px_15px_rgba(var(--secondary),0.3)] hover:shadow-[0_6px_20px_rgba(var(--secondary),0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {sendingOtp ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...</>
                                ) : 'Send OTP to Email'}
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSubmitting}
                                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all shadow-[0_4px_15px_rgba(var(--primary),0.3)] hover:shadow-[0_6px_20px_rgba(var(--primary),0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : 'Verify & Sign Up'}
                            </motion.button>
                        )}
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;

