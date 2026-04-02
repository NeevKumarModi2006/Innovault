import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import { Link } from 'react-router-dom';
import { Plus, LayoutDashboard, Bookmark, Loader2, Compass, FolderOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [myProjects, setMyProjects] = useState([]);
    const [bookmarkedProjects, setBookmarkedProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch All for myProjects
                const res = await api.get('/api/projects?sort=createdAt');
                const userProjects = res.data.projects ? res.data.projects.filter(p => p.owner?._id === user._id || p.owner === user._id) :
                    res.data.filter(p => p.owner?._id === user._id || p.owner === user._id);
                setMyProjects(userProjects || []);

                // Fetch Bookmarks
                if (token) {
                    const bmRes = await api.get('/api/projects/bookmarked/me');
                    setBookmarkedProjects(bmRes.data);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchDashboardData();
    }, [user]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <div className="pt-28 pb-20 min-h-screen px-4 sm:px-6 lg:px-8 max-w-[90rem] mx-auto bg-background relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none z-0" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="relative z-10 w-full">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 bg-card/60 backdrop-blur-xl p-8 rounded-3xl border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-extrabold text-primary shadow-inner border border-primary/20">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-1 font-outfit">Welcome back, {user?.username}</h1>
                            <p className="text-muted-foreground font-medium flex items-center gap-2">
                                <span className="bg-background px-2 py-0.5 rounded-md border border-border text-xs">{user?.role}</span>
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    {user?.role === 'VERIFIED' && (
                        <Link to="/submit">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold flex items-center gap-2 transition-shadow shadow-[0_4px_15px_rgba(var(--primary),0.3)] hover:shadow-[0_6px_20px_rgba(var(--primary),0.4)]"
                            >
                                <Plus className="w-5 h-5 stroke-[2.5]" /> Launch New Project
                            </motion.button>
                        </Link>
                    )}
                </motion.div>

                {/* My Projects Section - Hidden for External roles */}
                {user?.role !== 'EXTERNAL' && (
                    <div className="mb-16">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3 font-outfit"
                        >
                            <LayoutDashboard className="w-6 h-6 text-primary" />
                            My Architectures
                        </motion.h2>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-card/30 rounded-3xl border border-border border-dashed">
                                <Loader2 className="w-10 h-10 text-secondary animate-spin mb-4" />
                                <div className="text-muted-foreground font-medium">Loading your vault...</div>
                            </div>
                        ) : myProjects.length > 0 ? (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            >
                                {myProjects.map((project, idx) => (
                                    <ProjectCard key={project._id} project={project} delay={idx * 0.1} />
                                ))}
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-card border border-dashed border-border rounded-2xl">
                                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-5">
                                    <FolderOpen className="w-7 h-7 text-foreground" />
                                </div>
                                <p className="text-base font-semibold text-foreground mb-1">No projects yet</p>
                                <p className="text-sm text-muted-foreground mb-6 max-w-xs text-center">Submit your first project and it'll appear here.</p>
                                <Link
                                    to="/submit"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-semibold rounded-xl hover:bg-foreground/85 transition-all"
                                >
                                    <Plus className="w-4 h-4" /> Submit Project
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Bookmarked Projects Section */}
                <div>
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3 font-outfit"
                    >
                        <Bookmark className="w-6 h-6 text-primary" />
                        Saved Bookmarks
                    </motion.h2>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-card/30 rounded-3xl border border-border border-dashed">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                            <div className="text-muted-foreground font-medium">Retrieving saved matrix...</div>
                        </div>
                    ) : bookmarkedProjects.length > 0 ? (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {bookmarkedProjects.map((project, idx) => (
                                <ProjectCard key={project._id} project={project} delay={idx * 0.1} />
                            ))}
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-card border border-dashed border-border rounded-2xl">
                            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-5">
                                <Bookmark className="w-7 h-7 text-foreground" />
                            </div>
                            <p className="text-base font-semibold text-foreground mb-1">No bookmarks yet</p>
                            <p className="text-sm text-muted-foreground mb-6 max-w-xs text-center">Save projects you like and they'll show up here.</p>
                            <Link
                                to="/explore"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-sm font-semibold rounded-xl hover:bg-foreground/85 transition-all"
                            >
                                Explore Projects <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
