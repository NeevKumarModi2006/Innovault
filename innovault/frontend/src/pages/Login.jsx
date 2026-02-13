import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary mb-4">
                        <Shield size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        Welcome back
                    </h2>
                    <p className="text-slate-400 text-sm mt-2">
                        Enter your credentials to access your vault
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-md mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        id="email"
                        label="Email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Button type="submit" className="w-full mt-6" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-slate-400">
                        Don't have an account?
                    </span>
                    <Link
                        to="/register"
                        className="text-primary hover:underline font-medium ml-1"
                    >
                        Sign up
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default Login;
