import React from 'react';
import { Shield, Zap, Lock, Database } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col items-center">
            {/* Hero Section */}
            <section className="w-full py-24 md:py-32 lg:py-40 bg-squares flex flex-col items-center text-center px-4">
                <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-6 animate-fade-in-up">
                    v1.0 is now live
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-6 max-w-4xl bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    The Secure Vault for Your <br className="hidden md:block" /> Next Big Innovation
                </h1>
                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10">
                    Innovault provides an encrypted, high-performance environment to store, manage, and collaborate on your most sensitive projects.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Link to="/login">
                        <Button size="lg" className="w-full sm:w-auto h-12 text-base px-8">Start for Free</Button>
                    </Link>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 text-base px-8">View Demo</Button>
                </div>
            </section>

            {/* Features Grid */}
            <section className="w-full py-24 px-4 bg-slate-900/50">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="hover:border-primary/50 transition-colors">
                        <div className="p-3 bg-primary/10 w-fit rounded-lg mb-4 text-primary">
                            <Lock size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">End-to-End Encryption</h3>
                        <p className="text-slate-400">Your data is encrypted at rest and in transit. Only you hold the keys to your innovation.</p>
                    </Card>
                    <Card className="hover:border-secondary/50 transition-colors">
                        <div className="p-3 bg-secondary/10 w-fit rounded-lg mb-4 text-secondary">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
                        <p className="text-slate-400">Optimized for speed. Access your large project files and documents in milliseconds.</p>
                    </Card>
                    <Card className="hover:border-accent/50 transition-colors">
                        <div className="p-3 bg-accent/10 w-fit rounded-lg mb-4 text-accent">
                            <Database size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Scalable Storage</h3>
                        <p className="text-slate-400">Start small and grow to enterprise scale without changing your workflow.</p>
                    </Card>
                </div>
            </section>
        </div>
    );
};

export default Home;
