import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Cpu, LogOut, Search, Plus } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const isExplorePage = location.pathname === '/explore';

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-dark/80 backdrop-blur-md border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <Cpu className="h-8 w-8 text-primary" />
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            InnoVault
                        </span>
                    </Link>

                    {/* Links */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-6">
                            {!isExplorePage && (
                                <Link 
                                    to="/explore" 
                                    className="group flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 hover:border-primary/50 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all shadow-[0_0_10px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                >
                                    <Search className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                                    <span>Explore</span>
                                </Link>
                            )}

                            {user && user.role === 'VERIFIED' && (
                                <>
                                    <Link to="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Dashboard
                                    </Link>
                                    <Link to="/submit" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                                        <Plus className="w-4 h-4 mr-1" /> Submit Project
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-400">Hello, {user.username}</span>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors title='Logout'"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-lg hover:shadow-primary/50">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

