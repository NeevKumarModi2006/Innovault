import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProjectCard from '../components/ProjectCard';
import { ArrowRight, Zap, Folder, LogIn, Star } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Home = () => {
    const { user } = React.useContext(AuthContext);
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1,
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
    };

    return (
        <div className="pt-20 min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-background pb-32 pt-28 border-b border-border">
                {/* Background Details */}
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-0"></div>

                {/* Premium Gradient Blobs */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                    className="absolute top-[30%] -left-[15%] w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[100px] pointer-events-none z-0"
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="inline-flex items-center px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-8 shadow-[0_0_20px_rgba(var(--primary),0.15)]"
                    >
                        <Zap className="w-3.5 h-3.5 mr-2" /> The NITW Innovation Repository
                    </motion.div>

                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
                        {user ? (
                            <>
                                <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-extrabold font-outfit text-foreground tracking-tight mb-6">
                                    Welcome to InnoVault, <br className="hidden md:block" />
                                    <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                                        {user.username}
                                    </span>
                                </motion.h1>
                                <motion.p variants={itemVariants} className="mt-6 text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto mb-12">
                                    Ready to continue? Access your saved vault or discover the latest verified projects today.
                                </motion.p>
                            </>
                        ) : (
                            <>
                                <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-extrabold font-outfit text-foreground tracking-tight mb-6 leading-tight">
                                    Discover the future with <br className="hidden md:block" />
                                    <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                                        InnoVault.
                                        <Star className="absolute -top-4 -right-8 w-8 h-8 text-secondary animate-pulse" />
                                    </span>
                                </motion.h1>
                                <motion.p variants={itemVariants} className="mt-8 text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto mb-12 leading-relaxed">
                                    A centralized vault for student projects, research tools, and deployed applications. Verified, reviewed, and accessible.
                                </motion.p>
                            </>
                        )}

                        <motion.div variants={itemVariants} className="flex justify-center flex-wrap gap-5">
                            {user ? (
                                <>
                                    <Link to="/dashboard" className="px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-semibold transition-all shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:shadow-[0_0_35px_rgba(var(--primary),0.6)] flex items-center hover:-translate-y-1">
                                        <Folder className="w-5 h-5 mr-2" /> {user.role === 'EXTERNAL' ? 'My Bookmarks' : 'My Dashboard'}
                                    </Link>
                                    <Link to="/explore" className="px-8 py-3.5 bg-card border border-border hover:border-primary/50 text-foreground rounded-2xl font-semibold transition-all flex items-center hover:bg-muted hover:-translate-y-1 group">
                                        Explore Vault <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="px-8 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-semibold transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_35px_rgba(var(--primary),0.5)] flex items-center hover:-translate-y-1">
                                        <LogIn className="w-5 h-5 mr-2" /> Login / Sign Up
                                    </Link>
                                    <Link to="/explore" className="px-8 py-3.5 bg-card border border-border hover:border-primary/50 text-foreground rounded-2xl font-semibold transition-all flex items-center hover:bg-muted hover:-translate-y-1 group">
                                        Browse Projects <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Trending Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-extrabold font-outfit text-foreground tracking-tight">Trending Projects</h2>
                        <p className="text-muted-foreground mt-3 text-lg font-light">Top rated this week</p>
                    </div>
                    <Link to="/explore" className="text-primary hover:text-primary/80 font-medium flex items-center group mb-2 bg-primary/10 px-4 py-2 rounded-full transition-colors border border-primary/20">
                        View all <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
                        <p className="mt-4 text-muted-foreground">Loading trending projects...</p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                    >
                        {projects.map((project, idx) => (
                            <ProjectCard key={project._id} project={project} delay={idx * 0.1} />
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Global style animation override */}
            <style jsx>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    animation: gradient 8s ease infinite;
                }
            `}</style>
        </div>
    );
};

export default Home;
