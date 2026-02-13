import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { register } = useAuth(); // We need to add register to context if not there, or just use api directly

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Assuming AuthContext has a register function, or we use api directly
            // For now let's assume we need to implement it in AuthContext or here
            // We defined register in AuthContext effectively wrapping api call
            await register(formData.username, formData.email, formData.password);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data || 'Failed to register');
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
                        Create an account
                    </h2>
                    <p className="text-slate-400 text-sm mt-2">
                        Start your secure innovation journey today
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-md mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        id="username"
                        label="Username"
                        type="text"
                        placeholder="johndoe"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        id="email"
                        label="Email"
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <Button type="submit" className="w-full mt-6" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-slate-400">
                        Already have an account?
                    </span>
                    <Link
                        to="/login"
                        className="text-primary hover:underline font-medium ml-1"
                    >
                        Sign in
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default Register;
