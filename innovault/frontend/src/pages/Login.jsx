import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Loader2, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            const res = await api.post('/api/auth/login', { email, password });

            // Immediately use the token to fetch full user info 
            localStorage.setItem('token', res.data);
            const userRes = await api.get('/api/auth/me');

            login(res.data, userRes.data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check credentials.');
            setIsSubmitting(false);
            console.error(err);
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
                        <Cpu className="w-8 h-8 text-primary" />
                    </motion.div>
                    <h2 className="text-center text-3xl font-extrabold text-foreground font-outfit tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="mt-3 text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                            Sign up now
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-destructive text-sm text-center bg-destructive/10 border border-destructive/20 p-3 rounded-xl font-medium"
                        >
                            {error}
                        </motion.div>
                    )}
                    
                    <div className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute top-3.5 left-4 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                            <input
                                type="email"
                                required
                                className="appearance-none block w-full px-12 py-3.5 border border-border bg-background/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute top-3.5 left-4 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="appearance-none block w-full px-12 pr-12 py-3.5 border border-border bg-background/50 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute top-3.5 right-4 text-muted-foreground hover:text-foreground transition-colors z-20"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm"></div>
                        <div className="text-sm">
                            <Link to="/forgot-password" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 transition-all shadow-[0_4px_15px_rgba(var(--primary),0.3)] hover:shadow-[0_6px_20px_rgba(var(--primary),0.4)] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            'Sign in securely'
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
