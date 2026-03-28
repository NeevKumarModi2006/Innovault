import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import ProjectCard from '../components/ProjectCard';
import { Search, Filter } from 'lucide-react';

const LIMIT = 20;

const Explore = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [search, setSearch] = useState('');
    const [filterStack, setFilterStack] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const debounceRef = useRef(null);

    const fetchProjects = useCallback(async (searchVal, stackVal, pageNum, replace = false) => {
        if (replace) setLoading(true);
        else setLoadingMore(true);

        try {
            let query = `?limit=${LIMIT}&page=${pageNum}`;
            if (searchVal) query += `&search=${encodeURIComponent(searchVal)}`;
            if (stackVal)  query += `&techStack=${encodeURIComponent(stackVal)}`;

            const res = await api.get(`/api/projects${query}`);
            const { projects: newProjects, pagination } = res.data;

            setProjects(prev => replace ? newProjects : [...prev, ...newProjects]);
            setTotalPages(pagination.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchProjects('', '', 1, true);
    }, [fetchProjects]);

    // Debounced search — fires 400ms after user stops typing
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setPage(1);
            fetchProjects(val, filterStack, 1, true);
        }, 400);
    };

    const handleApplyFilters = () => {
        setPage(1);
        fetchProjects(search, filterStack, 1, true);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProjects(search, filterStack, nextPage, false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchProjects(search, filterStack, 1, true);
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
                            onClick={handleApplyFilters}
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
                            onChange={handleSearchChange}
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
                            {page < totalPages && (
                                <div className="flex justify-center mt-10">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="px-8 py-3 bg-primary hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                                    >
                                        {loadingMore ? 'Loading...' : 'Load More'}
                                    </button>
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

