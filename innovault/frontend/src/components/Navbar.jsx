import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Cpu, LogOut, Search, Plus, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const isExplorePage = location.pathname === '/explore';
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleConfirmLogout = () => {
        setShowLogoutModal(false);
        logout();
        navigate('/');
    };

    return (
        <>
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-sm"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-3 group">
                            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }}>
                                <Cpu className="h-8 w-8 text-primary group-hover:text-primary-light transition-colors" />
                            </motion.div>
                            <span className="text-2xl font-bold font-outfit tracking-tight text-foreground">
                                InnoVault
                            </span>
                        </Link>

                        {/* Links */}
                        <div className="hidden md:flex ml-10 items-center space-x-8">
                            {!isExplorePage && (
                                <Link 
                                    to="/explore" 
                                    className="group flex items-center space-x-2 bg-primary/10 border border-primary/20 hover:border-primary/50 hover:bg-primary/20 text-foreground px-5 py-2 rounded-full text-sm font-medium transition-all"
                                >
                                    <Search className="w-4 h-4 text-primary group-hover:text-primary-light transition-colors" />
                                    <span>Explore</span>
                                </Link>
                            )}

                            {user && (
                                <>
                                    <Link to="/dashboard" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors relative group">
                                        {user.role === 'EXTERNAL' ? 'Bookmarks' : 'Dashboard'}
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                                    </Link>
                                    {user.role === 'VERIFIED' && (
                                        <Link to="/submit" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors flex items-center group relative">
                                            <Plus className="w-4 h-4 mr-1 text-primary" /> Submit Project
                                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <div className="flex items-center gap-5">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
                                        <User className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-medium text-foreground">{user.username}</span>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowLogoutModal(true)}
                                        className="p-2.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors border border-transparent hover:border-destructive/20"
                                        title="Logout"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </motion.button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link to="/login" className="text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                        Login
                                    </Link>
                                    <Link to="/register" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)]">
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.nav>
            
            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                            onClick={() => setShowLogoutModal(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-card border border-border rounded-2xl p-7 shadow-2xl max-w-sm w-full relative z-10"
                        >
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-4">
                                    <LogOut className="w-6 h-6 text-destructive" />
                                </div>
                                <h3 className="text-xl font-bold font-outfit text-foreground mb-1">Log out?</h3>
                                <p className="text-muted-foreground text-sm">Are you sure you want to end your current session?</p>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 px-5 py-2.5 text-foreground bg-muted hover:bg-muted/80 border border-border rounded-xl transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfirmLogout}
                                    className="flex-1 px-5 py-2.5 bg-destructive hover:bg-destructive/90 text-white rounded-xl transition-all text-sm font-semibold shadow-lg shadow-destructive/20"
                                >
                                    Log Out
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;

