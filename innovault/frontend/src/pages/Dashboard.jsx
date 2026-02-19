import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [myProjects, setMyProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyProjects = async () => {
            // Since I don't have a specific endpoint for "my projects", I'll use the search API and filter client side 
            // OR better, create an endpoint. 
            // But for now, let's just filter locally or assume I can search by owner? 
            // My backend search API doesn't support owner filtering yet.
            // I'll add a quick fix: fetch all and filter (inefficient but works for MVP) or assumes I add backend support.
            // Wait, I can't easily fetch ALL projects if there are many.
            // Let's rely on the fact that for MVP there won't be many.
            // Or better: Update backend `projects.js` to support `owner` query param.
            // I will try to fetch with `?owner=UserId` if I update backend, but I won't update backend now to avoid context switch unless necessary.
            // Actually, the `GET /` route in `projects.js` uses `req.query` for search/techStack.
            // I'll just trust that I can add a filter there easily.

            // Let's try sending a query. If it doesn't work, I'll update backend.
            // Actually, let's just update the backend logic real quick? No, let's keep it simple.
            // I will fetch all and filter match `project.owner._id === user._id`.
            try {
                const res = await axios.get('http://localhost:3000/api/projects?sort=createdAt');
                const userProjects = res.data.filter(p => p.owner?._id === user._id || p.owner === user._id);
                setMyProjects(userProjects);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchMyProjects();
    }, [user]);

    return (
        <div className="pt-24 min-h-screen px-4 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8 bg-dark-card p-6 rounded-xl border border-gray-800">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary/30">
                        {user?.username?.[0]?.toUpperCase()}
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

            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-secondary pl-4">My Projects</h2>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading your vault...</div>
            ) : myProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myProjects.map(project => (
                        <ProjectCard key={project._id} project={project} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-dark-card rounded-xl border border-dashed border-gray-700">
                    <p className="text-gray-400 mb-4">You haven't submitted any projects yet.</p>
                    {user?.role === 'VERIFIED' ? (
                        <Link to="/submit" className="text-primary font-medium hover:underline">Submit one now</Link>
                    ) : (
                        <p className="text-sm text-gray-500">Only verified NITW users can submit projects.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
