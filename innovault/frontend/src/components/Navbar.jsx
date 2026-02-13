import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, User, LogIn, LogOut } from 'lucide-react';
import Button from './Button';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex h-16 items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                            <Shield size={24} />
                        </div>
                        <span>Innovault</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {!user ? (
                            <>
                                <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                    Features
                                </Link>
                                <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                    Pricing
                                </Link>
                                <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                    About
                                </Link>
                                <div className="h-4 w-px bg-slate-800 mx-2"></div>
                                <Link to="/login">
                                    <Button variant="ghost" size="sm" className="gap-2">
                                        <LogIn size={16} />
                                        Sign In
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="primary" size="sm">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/dashboard">
                                    <Button variant={location.pathname === '/dashboard' ? 'secondary' : 'ghost'} size="sm">
                                        Dashboard
                                    </Button>
                                </Link>
                                <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 border border-slate-600" title="User Profile">
                                    <User size={16} />
                                </div>
                                <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                    <LogOut size={16} />
                                    Logout
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-400 hover:text-white"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden border-t border-slate-800 bg-background p-4 space-y-4">
                    {!user ? (
                        <>
                            <Link to="/" className="block text-sm font-medium text-slate-300 hover:text-white" onClick={() => setIsOpen(false)}>
                                Features
                            </Link>
                            <Link to="/login" className="block" onClick={() => setIsOpen(false)}>
                                <Button className="w-full">Sign In</Button>
                            </Link>
                            <Link to="/register" className="block" onClick={() => setIsOpen(false)}>
                                <Button variant="outline" className="w-full">Register</Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/dashboard" className="block" onClick={() => setIsOpen(false)}>
                                <Button className="w-full">Dashboard</Button>
                            </Link>
                            <Button variant="ghost" className="w-full justify-start text-red-400" onClick={() => { logout(); setIsOpen(false); }}>
                                Logout
                            </Button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
