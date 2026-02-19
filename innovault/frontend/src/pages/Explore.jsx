import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';
import { Search, Filter } from 'lucide-react';

const Explore = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStack, setFilterStack] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async (offerSearch = '', offerStack = '') => {
        setLoading(true);
        try {
            let query = `?sort=createdAt`;
            if (offerSearch) query += `&search=${offerSearch}`;
            if (offerStack) query += `&techStack=${offerStack}`;

            const res = await axios.get(`http://localhost:3000/api/projects${query}`);
            setProjects(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchProjects(search, filterStack);
    };

    return (
        <div className="pt-24 min-h-screen px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filter */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-dark-card p-6 rounded-xl border border-gray-800 sticky top-24">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                            <Filter className="w-5 h-5 mr-2" /> Filters
                        </h3>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Tech Stack</label>
                            <input
                                type="text"
                                placeholder="e.g. React, Python"
                                className="w-full bg-dark-input border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                                value={filterStack}
                                onChange={(e) => setFilterStack(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => fetchProjects(search, filterStack)}
                            className="w-full bg-secondary hover:bg-pink-600 text-white py-2 rounded font-medium text-sm transition-colors"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mb-8 relative">
                        <Search className="absolute top-4 left-4 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search projects by title, description, or tech..."
                            className="w-full bg-dark-card border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-lg"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>

                    {/* Grid */}
                    {loading ? (
                        <div className="text-center py-20 text-gray-500">Loading projects...</div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-gray-300 mb-6">
                                {projects.length} Projects Found
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {projects.map(project => (
                                    <ProjectCard key={project._id} project={project} />
                                ))}
                            </div>
                            {projects.length === 0 && (
                                <div className="text-center py-20 bg-dark-card rounded-xl border border-gray-800">
                                    <p className="text-gray-400">No projects found matching your criteria.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Explore;
