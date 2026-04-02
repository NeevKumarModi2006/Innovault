import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import ProjectCard from '../components/ProjectCard';
import { Search, Filter, Loader2, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

    useEffect(() => { fetchProjects('', '', 1, true); }, [fetchProjects]);

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

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchProjects(search, filterStack, 1, true);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProjects(search, filterStack, nextPage, false);
    };

    return (
        <div className="pt-28 pb-20 min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-8">

                {/* ── Page Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold font-outfit text-foreground tracking-tight mb-1">Explore</h1>
                    <p className="text-sm text-muted-foreground">Browse projects submitted by verified NITW students</p>
                </motion.div>

                {/* ── Search Bar ── */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
                    className="mb-8"
                >
                    <form onSubmit={handleSearch} className="relative group">
                        <Search className="absolute top-1/2 -translate-y-1/2 left-4 text-muted-foreground w-5 h-5 group-focus-within:text-foreground transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by title, description, or tech stack..."
                            className="w-full bg-card border border-border rounded-xl py-3.5 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors"
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </form>
                </motion.div>

                {/* ── Main Layout ── */}
                <div className="flex flex-col xl:flex-row gap-8 items-start">

                    {/* Sidebar Filter */}
                    <motion.aside
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.12 }}
                        className="w-full xl:w-60 flex-shrink-0 xl:sticky xl:top-28"
                    >
                        <div className="bg-card border border-border rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2 font-outfit">
                                <SlidersHorizontal className="w-4 h-4" /> Filters
                            </h3>

                            <div className="mb-4">
                                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Tech Stack</label>
                                <input
                                    type="text"
                                    placeholder="e.g. React, Python"
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors"
                                    value={filterStack}
                                    onChange={(e) => setFilterStack(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                                />
                            </div>

                            <button
                                onClick={handleApplyFilters}
                                className="w-full bg-foreground text-background py-2.5 rounded-lg font-semibold text-sm hover:bg-foreground/85 active:scale-95 transition-all"
                            >
                                Apply Filter
                            </button>

                            {filterStack && (
                                <button
                                    onClick={() => { setFilterStack(''); setPage(1); fetchProjects(search, '', 1, true); }}
                                    className="w-full mt-2 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors"
                                >
                                    Clear Filter
                                </button>
                            )}
                        </div>
                    </motion.aside>

                    {/* Projects Area */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        className="flex-1 min-w-0"
                    >
                        {/* Result count */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-sm text-muted-foreground">
                                <span className="font-semibold text-foreground">{projects.length}</span> projects found
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32">
                                <Loader2 className="w-8 h-8 text-foreground animate-spin mb-3" />
                                <p className="text-sm text-muted-foreground">Loading projects...</p>
                            </div>
                        ) : projects.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                                    <AnimatePresence>
                                        {projects.map((project) => (
                                            <ProjectCard key={project._id} project={project} />
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {page < totalPages && (
                                    <div className="flex justify-center mt-12">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            className="px-8 py-3 bg-foreground text-background rounded-xl font-semibold text-sm hover:bg-foreground/85 disabled:opacity-50 active:scale-95 transition-all flex items-center gap-2"
                                        >
                                            {loadingMore ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                                            ) : 'Load More'}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-32 bg-card border border-dashed border-border rounded-2xl">
                                <Search className="w-10 h-10 text-muted-foreground/30 mb-4" />
                                <h3 className="text-lg font-bold text-foreground mb-1 font-outfit">No results found</h3>
                                <p className="text-sm text-muted-foreground text-center max-w-xs">
                                    Try adjusting your search or filter to find what you're looking for.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>

            </div>
        </div>
    );
};

export default Explore;
