import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [myProjects, setMyProjects] = useState([]);
    const [bookmarkedProjects, setBookmarkedProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                
                // Fetch All for myProjects (temporary MVP logic)
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

    return (
        <div className="pt-24 min-h-screen px-4 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8 bg-dark-card p-6 rounded-xl border border-gray-800">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary/30">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">Welcome back, {user?.username}</h1>
                        <p className="text-gray-400 text-sm">{user?.email} • {user?.role}</p>
                    </div>
                </div>
                {user?.role === 'VERIFIED' && (
                    <Link to="/submit" className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-primary/50">
                        <Plus className="w-5 h-5" /> New Project
                    </Link>
                )}
            </div>

            {/* My Projects Section */}
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-secondary pl-4">My Projects</h2>
            
            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading your vault...</div>
            ) : myProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {myProjects.map(project => (
                        <div key={project._id} className="flex flex-col">
                            <ProjectCard project={project} />
                            <Link to={`/edit/${project._id}`} className="mt-3 text-center w-full py-2 bg-dark-input border border-gray-700 hover:border-gray-500 rounded text-sm font-medium text-gray-300 transition-colors">
                                Edit Project
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 mb-12 bg-dark-card rounded-xl border border-dashed border-gray-700">
                    <p className="text-gray-400 mb-4">You haven't submitted any projects yet.</p>
                    {user?.role === 'VERIFIED' ? (
                        <Link to="/submit" className="text-primary font-medium hover:underline">Submit one now</Link>
                    ) : (
                        <p className="text-sm text-gray-500">Only verified NITW users can submit projects.</p>
                    )}
                </div>
            )}

            {/* Bookmarked Projects Section */}
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-primary pl-4">Saved Bookmarks</h2>
            
            {loading ? (
                <div className="text-center py-20 text-gray-500">Retrieving bookmarks...</div>
            ) : bookmarkedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {bookmarkedProjects.map(project => (
                        <ProjectCard key={project._id} project={project} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 pb-20 bg-dark-card rounded-xl border border-dashed border-gray-800">
                    <p className="text-gray-500 mb-4">You haven't bookmarked any projects.</p>
                    <Link to="/explore" className="text-primary font-medium hover:underline flex items-center justify-center gap-1">
                        Start Exploring
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
