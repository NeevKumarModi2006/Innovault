import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProjectCard from '../components/ProjectCard';
import { ArrowRight, Zap } from 'lucide-react';

const Home = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                // Fetch projects sorted by views or rating
                const res = await api.get('/api/projects?sort=rating');
                setProjects(res.data.projects ? res.data.projects.slice(0, 6) : res.data.slice(0, 6)); // Safely handle pagination structure
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrending();
    }, []);

    return (
        <div className="pt-16 min-h-screen">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-dark pb-20 pt-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0"></div>
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl z-0"></div>
                <div className="absolute top-40 -left-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl z-0"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-6">
                        <Zap className="w-3 h-3 mr-2" /> The NITW Innovation Repository
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
                        Discover what <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">NITW builds.</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                        A centralized vault for student projects, research tools, and deployed applications. Verified, reviewed, and accessible.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/explore" className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-primary/50 flex items-center">
                            Explore Vault <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                        <Link to="/submit" className="px-8 py-3 bg-dark-card border border-gray-700 hover:border-gray-500 text-white rounded-lg font-semibold transition-all">
                            Submit Project
                        </Link>
                    </div>
                </div>
            </div>

            {/* Trending Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Trending Projects</h2>
                        <p className="text-gray-400 mt-2">Top rated and most viewed this week</p>
                    </div>
                    <Link to="/explore" className="text-primary hover:text-primary-light font-medium flex items-center">
                        View all <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 py-20">Loading trending projects...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map(project => (
                            <ProjectCard key={project._id} project={project} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
