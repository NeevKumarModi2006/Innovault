import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ExternalLink, Github, Star, ShieldCheck, User as UserIcon, Bookmark, PlusCircle, MinusCircle, Edit2, AlertOctagon, MoreVertical, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

class MarkdownErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="text-red-500 bg-red-900/20 p-4 rounded-xl font-mono text-sm overflow-auto">
                    <p><b>Markdown Render Error:</b> {this.state.error && this.state.error.message}</p>
                    <pre>{this.state.error && this.state.error.stack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useContext(AuthContext);
    const [project, setProject] = useState(null);

    // Review States
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({
        totalReviews: 0, totalVerified: 0, avgRating: 0, avgVerified: 0,
        star5: 0, star4: 0, star3: 0, star2: 0, star1: 0
    });
    const [pagination, setPagination] = useState({ page: 1, limit: 5, totalPages: 1 });
    const [userReview, setUserReview] = useState(null);

    const [loading, setLoading] = useState(true);
    const [isBookmarked, setIsBookmarked] = useState(false);

    // Form States
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [pros, setPros] = useState('');
    const [cons, setCons] = useState('');
    const [reviewError, setReviewError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Context Menus
    const [showProjectMenu, setShowProjectMenu] = useState(false);
    const [showReviewMenu, setShowReviewMenu] = useState(false);

    // Filter/Sort States
    const [sort, setSort] = useState('highest');
    const [filter, setFilter] = useState('');

    const viewIncremented = useRef(false);

    // Derived states
    const isOwner = user && project && user._id === (project.owner?._id || project.owner);
    const isDirty = isEditing || (!userReview && (comment.trim() || pros.trim() || cons.trim()));

    // Unsaved Changes Guard for External navigation & simple internal link clicks
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = ''; // Required for beforeunload
            }
        };

        const handleLinkClick = (e) => {
            const target = e.target.closest('a');
            if (target && isDirty && target.href && !target.href.includes(window.location.hash)) {
                if (!window.confirm("You have unsaved changes. Discard them?")) {
                    e.preventDefault();
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('click', handleLinkClick, { capture: true });

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('click', handleLinkClick, { capture: true });
        };
    }, [isDirty]);

    useEffect(() => {
        viewIncremented.current = false; // Purge block when navigating between internal projects
        fetchProjectData();
    }, [id]);

    // Independent View Incrementer guarded by Auth resolution
    useEffect(() => {
        if (!authLoading && project && !viewIncremented.current) {
            const isProjectOwner = user && project && String(user._id) === String(project.owner?._id || project.owner);

            if (!isProjectOwner) {
                viewIncremented.current = true;
                api.put(`/api/projects/${id}/view`, { viewerId: user?._id }).catch(e => console.log('View API Error', e));
            } else {
                // Owner visited, gracefully mark incremented without calling API to save bandwidth
                viewIncremented.current = true;
            }
        }
    }, [authLoading, project, user, id]);

    useEffect(() => {
        if (id) {
            fetchReviews(1, true, sort, filter); // Fetch reviews separated from project fetch to avoid race condition
        }
    }, [id, sort, filter]);

    useEffect(() => {
        if (user && user.bookmarks && project) {
            setIsBookmarked(user.bookmarks.includes(project._id));
        }
    }, [user, project]);

    useEffect(() => {
        if (user && id) {
            const fetchMyReview = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (token) {
                        const myRevRes = await api.get(`/api/projects/${id}/my-review`, {
                            headers: { 'auth-token': token }
                        });
                        if (myRevRes.data) {
                            setUserReview(myRevRes.data);
                        }
                    }
                } catch (e) {
                    console.log('Could not fetch user review', e);
                }
            };
            fetchMyReview();
        }
    }, [user, id]);

    const fetchProjectData = async () => {
        try {
            const projRes = await api.get(`/api/projects/${id}`);
            setProject(projRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async (pageToLoad = 1, reset = false, currentSort = sort, currentFilter = filter) => {
        try {
            const revRes = await api.get(`/api/projects/${id}/reviews`, {
                params: { page: pageToLoad, limit: 5, sort: currentSort, filter: currentFilter }
            });
            const { reviews: newReviews, stats: newStats, pagination: newPag } = revRes.data;

            if (reset) {
                setReviews(newReviews);
            } else {
                setReviews(prev => [...prev, ...newReviews]);
            }

            setStats(newStats);
            setPagination(newPag);

            // Dynamically update UI without reloading
            setProject(prev => prev ? {
                ...prev,
                averageRating: newStats.avgRating || 0,
                verifiedRating: newStats.avgVerified || 0
            } : prev);
        } catch (e) {
            console.log('Reviews fetch failed', e);
        }
    };

    const handleBookmark = async () => {
        if (!user) return alert("Please login to bookmark");
        try {
            const token = localStorage.getItem('token');
            const res = await api.put(`/api/projects/${id}/bookmark`, {}, {
                headers: { 'auth-token': token }
            });
            setIsBookmarked(res.data.includes(id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditForm = () => {
        if (userReview) {
            setRating(userReview.rating || 5);
            setComment(userReview.comment || '');
            setPros(userReview.pros || '');
            setCons(userReview.cons || '');
            setIsEditing(true);
            setShowReviewMenu(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!window.confirm("Are you sure you want to delete your review? This cannot be undone.")) return;
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/api/projects/${id}/reviews`, {
                headers: { 'auth-token': token }
            });
            setUserReview(null);
            setComment('');
            setPros('');
            setCons('');
            setRating(5);
            setIsEditing(false);
            fetchReviews(1, true, sort, filter); // reload reviews and stats
        } catch (err) {
            console.error(err);
            alert("Failed to delete review");
        }
    };

    const handleDeleteProject = async () => {
        if (!window.confirm("CRITICAL WARNING: Are you sure you want to delete this ENTIRE project? This cannot be undone!")) return;
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/api/projects/${id}`, {
                headers: { 'auth-token': token }
            });
            alert("Project deleted successfully");
            navigate('/');
        } catch (err) {
            console.error(err);
            alert("Failed to delete project");
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) return alert('Please login to review');

            const payload = { rating, comment, pros, cons };
            const res = await api.post(`/api/projects/${id}/reviews`, payload, {
                headers: { 'auth-token': token }
            });

            setUserReview(res.data);
            setIsEditing(false);
            setReviewError('');
            fetchReviews(1, true, sort, filter); // reload reviews and stats
        } catch (err) {
            setReviewError(err.response?.data?.message || 'Failed to submit review');
        }
    };

    const handleReportReview = async (reviewId) => {
        if (!user) return alert("Please login to report reviews.");
        if (!window.confirm("Are you sure you want to report this review for violating community guidelines?")) return;

        try {
            const token = localStorage.getItem('token');
            const res = await api.put(`/api/projects/${id}/reviews/${reviewId}/report`, {}, {
                headers: { 'auth-token': token }
            });

            if (res.data.newlyDeleted) {
                alert("This review has been removed due to multiple reports.");
                fetchReviews(1, true, sort, filter);
            } else {
                alert("Report submitted successfully.");
                setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, reportedBy: [...(r.reportedBy || []), user._id] } : r));
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to report review");
        }
    };

    const checkDiscardChanges = () => {
        if (isEditing || (!userReview && (comment.trim() || pros.trim() || cons.trim()))) {
            return window.confirm("You have unsaved changes. Discard them?");
        }
        return true;
    };

    const handleCancelEditing = () => {
        if (checkDiscardChanges()) {
            setIsEditing(false);
            if (!userReview) {
                setComment('');
                setPros('');
                setCons('');
            }
        }
    };

    if (loading) return <div className="text-center py-20 text-white">Loading...</div>;
    if (!project) return <div className="text-center py-20 text-red-500">Project not found</div>;

    const renderProgressBar = (count, max, label) => {
        const percentage = max > 0 ? (count / max) * 100 : 0;
        return (
            <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-400 w-6">{label}★</span>
                <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="text-sm text-gray-400 w-8 text-right">{count}</span>
            </div>
        );
    };

    return (
        <div className="pt-24 min-h-screen px-4 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="bg-dark-card rounded-2xl overflow-hidden border border-gray-800 shadow-2xl mb-8">
                <div className="relative h-64 bg-gray-900">
                    <img
                        src={project.logoUrl && project.logoUrl !== 'default-logo.png' ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${project.logoUrl}` : 'https://via.placeholder.com/1200x400/1e293b/475569?text=InnoVault+Project+Banner'}
                        alt="Banner"
                        className="w-full h-full object-cover opacity-50 block"
                    />
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                        {isOwner && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowProjectMenu(!showProjectMenu)}
                                    className="p-2 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-sm transition"
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                                {showProjectMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-gray-700 rounded-lg shadow-xl overflow-hidden z-20">
                                        <Link
                                            to={`/edit/${project._id}`}
                                            className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-gray-800 flex items-center gap-2 transition"
                                        >
                                            <Edit2 className="w-4 h-4 text-blue-400" /> Edit Project
                                        </Link>
                                        <button
                                            onClick={handleDeleteProject}
                                            className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/30 flex items-center gap-2 transition"
                                        >
                                            <Trash2 className="w-4 h-4" /> Delete Project
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-gray-900 to-transparent pointer-events-none">
                        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pointer-events-auto">
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-2">{project.title}</h1>
                                <div className="flex items-center gap-4 text-gray-300">
                                    <span className="flex items-center gap-1"><UserIcon className="w-4 h-4" /> {project.owner?.username}</span>
                                    <span>•</span>
                                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleBookmark}
                                    className={`p-3 rounded-full transition-colors ${isBookmarked
                                        ? 'bg-primary text-white shadow-lg shadow-primary/50'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                        }`}
                                    title={isBookmarked ? "Remove Bookmark" : "Bookmark Project"}
                                >
                                    <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-current' : ''}`} />
                                </button>
                                {project.sourceLink && (
                                    <a href={project.sourceLink} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors">
                                        <Github className="w-6 h-6" />
                                    </a>
                                )}
                                <a href={project.deploymentLink} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg flex items-center transition-all shadow-lg hover:shadow-primary/50">
                                    Visit Project <ExternalLink className="ml-2 w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Description */}
                    <div className="bg-dark-card p-8 rounded-xl border border-gray-800">
                        <h2 className="text-2xl font-bold text-white mb-4">About</h2>
                        <MarkdownErrorBoundary>
                            <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none prose-a:text-primary hover:prose-a:text-primary-light">
                                <ReactMarkdown>
                                    {typeof project.detailedDescription === 'string' ? project.detailedDescription : '*No detailed description provided.*'}
                                </ReactMarkdown>
                            </div>
                        </MarkdownErrorBoundary>
                    </div>

                    {/* Community Reviews Section */}
                    <div className="bg-dark-card p-8 rounded-xl border border-gray-800" id="reviewsContainer">
                        <h2 className="text-2xl font-bold text-white mb-6">Community Reviews</h2>

                        {/* Summary Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 p-6 bg-dark-input rounded-lg border border-gray-700">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">Rating Summary</h3>
                                <div className="flex items-end gap-3 mb-6">
                                    <span className="text-5xl font-extrabold text-white">{stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '0.0'}</span>
                                    <div className="flex flex-col pb-1">
                                        <div className="flex text-yellow-400 mb-1">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-4 h-4 ${i <= Math.round(stats.avgRating) ? 'fill-current' : 'text-gray-600'}`} />)}
                                        </div>
                                        <span className="text-sm text-gray-400">{stats.totalReviews} total reviews</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300 bg-green-900/20 border border-green-800/50 p-2 rounded w-max">
                                    <ShieldCheck className="w-4 h-4 text-green-400" />
                                    <span>Verified Average: <b className="text-white">{stats.avgVerified > 0 ? stats.avgVerified.toFixed(1) : '-'}</b> ({stats.totalVerified} reviews)</span>
                                </div>
                            </div>
                            <div>
                                {renderProgressBar(stats.star5, stats.totalReviews, '5')}
                                {renderProgressBar(stats.star4, stats.totalReviews, '4')}
                                {renderProgressBar(stats.star3, stats.totalReviews, '3')}
                                {renderProgressBar(stats.star2, stats.totalReviews, '2')}
                                {renderProgressBar(stats.star1, stats.totalReviews, '1')}
                            </div>
                        </div>

                        {/* Input Section */}
                        {user && !isOwner && (
                            <div className="mb-8 p-6 bg-gray-900/50 rounded-lg border border-gray-700 relative overflow-hidden">
                                <h3 className="text-lg font-medium text-white mb-4 flex justify-between items-center relative">
                                    <span>{userReview && !isEditing ? 'Your Review' : (userReview && isEditing ? 'Edit Your Review' : 'Leave a Review')}</span>
                                    {userReview && !isEditing && (
                                        <div className="flex gap-2">
                                            <button onClick={handleEditForm} className="px-3 py-1 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 hover:text-white flex items-center gap-1 text-sm border border-gray-700">
                                                <Edit2 className="w-3 h-3" /> Edit
                                            </button>
                                            <button onClick={handleDeleteReview} className="px-3 py-1 bg-red-900/20 text-red-400 rounded hover:bg-red-900/40 hover:text-red-300 flex items-center gap-1 text-sm border border-red-900/50">
                                                <Trash2 className="w-3 h-3" /> Delete
                                            </button>
                                        </div>
                                    )}
                                </h3>

                                {userReview && !isEditing ? (
                                    <div className="bg-dark-input p-4 rounded border border-primary/30">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center text-yellow-400">
                                                {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-4 h-4 ${star <= userReview.rating ? 'fill-current' : 'text-gray-600'}`} />)}
                                            </div>
                                            <span className="text-xs text-gray-500">{userReview.isEdited ? 'Edited' : ''}</span>
                                        </div>
                                        <p className="text-gray-300 text-sm mb-3">{userReview.comment || <i>No comment provided.</i>}</p>
                                        {(userReview.pros || userReview.cons) && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-gray-700">
                                                {userReview.pros && <div><b className="text-green-400 flex items-center gap-1 mb-1"><PlusCircle className="w-3 h-3" /> Pros</b><p className="text-gray-400">{userReview.pros}</p></div>}
                                                {userReview.cons && <div><b className="text-red-400 flex items-center gap-1 mb-1"><MinusCircle className="w-3 h-3" /> Cons</b><p className="text-gray-400">{userReview.cons}</p></div>}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <form onSubmit={handleReviewSubmit}>
                                        {reviewError && <p className="text-red-400 text-sm mb-2">{reviewError}</p>}
                                        <div className="flex items-center gap-2 mb-4">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star
                                                    key={star}
                                                    className={`w-6 h-6 cursor-pointer ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-500'}`}
                                                    onClick={() => setRating(star)}
                                                />
                                            ))}
                                            <span className="text-gray-400 text-sm ml-2">{rating} out of 5 stars</span>
                                        </div>

                                        <textarea
                                            className="w-full bg-dark border border-gray-600 rounded p-3 text-white mb-4 focus:ring-primary focus:border-primary text-sm transition-colors"
                                            rows={3}
                                            placeholder="Share your overall feedback (optional)..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="text-xs text-gray-400 flex mb-1 items-center gap-1"><PlusCircle className="w-3 h-3" /> Pros (optional)</label>
                                                <input type="text" className="w-full bg-dark border border-gray-600 rounded p-2 text-white focus:ring-primary text-sm transition-colors" placeholder="What went well?" value={pros} onChange={e => setPros(e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 flex mb-1 items-center gap-1"><MinusCircle className="w-3 h-3" /> Cons (optional)</label>
                                                <input type="text" className="w-full bg-dark border border-gray-600 rounded p-2 text-white focus:ring-primary text-sm transition-colors" placeholder="What could be improved?" value={cons} onChange={e => setCons(e.target.value)} />
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button type="submit" className="px-4 py-2 bg-secondary hover:bg-pink-600 text-white rounded font-medium transition-colors text-sm">
                                                {userReview ? 'Save Changes' : 'Submit Review'}
                                            </button>
                                            {isEditing && (
                                                <button type="button" onClick={handleCancelEditing} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition-colors text-sm">
                                                    Cancel
                                                </button>
                                            )}
                                        </div>

                                        {/* Subtle reminder */}
                                        <p className="mt-4 text-xs text-yellow-500/80 italic flex items-center gap-1">
                                            <AlertOctagon className="w-3 h-3" /> Don't forget to submit to save your review.
                                        </p>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* Filters & Sorting */}
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-dark-input p-3 rounded-lg border border-gray-800 mb-6 gap-4">
                            <div className="flex items-center gap-3">
                                <label className="text-sm text-gray-400">Filter By:</label>
                                <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-dark border border-gray-700 text-white text-sm rounded px-2 py-1 outline-none">
                                    <option value="">All Reviews</option>
                                    <option value="verifiedOnly">Verified NITW Only</option>
                                    <option value="rating-5">5 Stars</option>
                                    <option value="rating-4">4 Stars</option>
                                    <option value="rating-3">3 Stars</option>
                                    <option value="rating-2">2 Stars</option>
                                    <option value="rating-1">1 Stars</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-sm text-gray-400">Sort By:</label>
                                <select value={sort} onChange={e => setSort(e.target.value)} className="bg-dark border border-gray-700 text-white text-sm rounded px-2 py-1 outline-none">
                                    <option value="highest">Highest Rating</option>
                                    <option value="lowest">Lowest Rating</option>
                                    <option value="recent">Most Recent</option>
                                </select>
                            </div>
                        </div>

                        {/* Reviews List */}
                        <div className="space-y-6">
                            {reviews
                                .filter(r => !userReview || r._id !== userReview._id) // Filter out the user's own review so it's not duped
                                .map(review => (
                                    <div key={review._id} className="bg-dark-input p-5 rounded-lg border border-gray-800 hover:border-gray-700 transition">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
                                                    {review.user?.username?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-white text-sm">{review.user?.username}</span>
                                                        {review.isVerifiedRating && (
                                                            <span className="px-1.5 py-0.5 bg-green-900/30 text-green-400 text-[10px] uppercase tracking-wider font-bold rounded border border-green-800 flex items-center gap-1">
                                                                <ShieldCheck className="w-3 h-3" /> NITW
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(review.updatedAt || review.createdAt).toLocaleDateString()}
                                                        {review.isEdited && ' (Edited)'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center bg-black/30 px-2 py-1 rounded text-yellow-400 border border-gray-800">
                                                <Star className="w-3 h-3 fill-current mr-1" />
                                                <span className="text-sm font-bold">{review.rating}</span>
                                            </div>
                                        </div>

                                        {review.comment && <p className="text-gray-300 text-sm mt-3 leading-relaxed">{review.comment}</p>}

                                        {(review.pros || review.cons) && (
                                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm mt-4 pt-4 border-t border-gray-700/50">
                                                {review.pros && (
                                                    <div className="flex-1">
                                                        <b className="text-green-400/90 flex items-center gap-1 mb-1 text-xs"><PlusCircle className="w-3 h-3" /> Pros</b>
                                                        <p className="text-gray-400 text-xs leading-relaxed">{review.pros}</p>
                                                    </div>
                                                )}
                                                {review.cons && (
                                                    <div className="flex-1">
                                                        <b className="text-red-400/90 flex items-center gap-1 mb-1 text-xs"><MinusCircle className="w-3 h-3" /> Cons</b>
                                                        <p className="text-gray-400 text-xs leading-relaxed">{review.cons}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-4 flex justify-end">
                                            {review.reportedBy?.includes(user?._id) ? (
                                                <span className="text-xs text-red-500/70 flex items-center gap-1 cursor-default">
                                                    <AlertOctagon className="w-3 h-3" /> Reported
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleReportReview(review._id)}
                                                    className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                                                >
                                                    <AlertOctagon className="w-3 h-3" /> Report
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                            {reviews.filter(r => !userReview || r._id !== userReview._id).length === 0 && (
                                <div className="text-center py-10 bg-dark-input rounded-lg border border-dashed border-gray-700 text-gray-500">
                                    No community reviews match the selected criteria.
                                </div>
                            )}

                            {/* Load More Button */}
                            {pagination.page < pagination.totalPages && (
                                <div className="flex justify-center mt-6 pt-4 border-t border-gray-800">
                                    <button
                                        onClick={() => fetchReviews(pagination.page + 1, false, sort, filter)}
                                        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-full transition-all border border-gray-700 hover:border-gray-600"
                                    >
                                        Load More Reviews
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Stats */}
                    <div className="bg-dark-card p-6 rounded-xl border border-gray-800 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-4">Project Highlights</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-dark-input rounded-lg border border-gray-800">
                                <span className="text-gray-400 text-sm">Verified Rating</span>
                                <div className="flex items-center text-primary font-bold">
                                    <ShieldCheck className="w-4 h-4 mr-1" />
                                    {project.verifiedRating ? project.verifiedRating.toFixed(1) : '-'} / 5
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-dark-input rounded-lg border border-gray-800">
                                <span className="text-gray-400 text-sm">Community Rating</span>
                                <div className="flex items-center text-yellow-400 font-bold">
                                    <Star className="w-4 h-4 mr-1 fill-current" />
                                    {project.averageRating ? project.averageRating.toFixed(1) : '-'} / 5
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-dark-input rounded-lg border border-gray-800">
                                <span className="text-gray-400 text-sm">Total Views</span>
                                <span className="text-white font-bold">{project.views}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="bg-dark-card p-6 rounded-xl border border-gray-800 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-4">Tech Stack</h3>
                        <div className="flex flex-wrap gap-2">
                            {project.techStack && project.techStack.length > 0 ? (
                                project.techStack.map((tech, i) => (
                                    <span key={i} className="px-3 py-1 bg-slate-800 text-gray-300 rounded-lg text-xs font-medium border border-slate-700 shadow-sm">
                                        {tech}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-500 text-sm">No tags provided</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;
