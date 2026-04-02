import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Cpu, LogOut, Search, Plus } from 'lucide-react';

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

                            {user && (
                                <>
                                    <Link to="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        {user.role === 'EXTERNAL' ? 'Bookmarks' : 'Dashboard'}
                                    </Link>
                                    {user.role === 'VERIFIED' && (
                                        <Link to="/submit" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                                            <Plus className="w-4 h-4 mr-1" /> Submit Project
                                        </Link>
                                    )}
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
                                    onClick={() => setShowLogoutModal(true)}
                                    className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                                    title="Logout"
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
            
            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-dark-card border border-gray-800 rounded-xl p-6 shadow-2xl max-w-sm w-full animate-fade-in-up">
                        <h3 className="text-xl font-bold text-white mb-2">Log out</h3>
                        <p className="text-gray-400 mb-6 text-sm">Are you sure you want to log out of your session?</p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setShowLogoutModal(false)}
                                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmLogout}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-red-600/30"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

