import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import SubmitProject from './pages/SubmitProject';
import EditProject from './pages/EditProject';
import ProjectDetails from './pages/ProjectDetails';
import ForgotPassword from './pages/ForgotPassword';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen bg-dark flex items-center justify-center text-white">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

const AppRoutes = () => {
    const location = useLocation();

    return (
        <div key={location.key} className="flex-grow flex flex-col w-full h-full animate-fade-in-up">
            <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/projects/:id" element={<ProjectDetails />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/submit"
                    element={
                        <ProtectedRoute>
                            <SubmitProject />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/edit/:id"
                    element={
                        <ProtectedRoute>
                            <EditProject />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="flex flex-col min-h-screen bg-dark text-white">
                    <Navbar />
                    <main className="flex-grow flex flex-col">
                        <AppRoutes />
                    </main>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
