import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
    ExternalLink, Github, Star, ShieldCheck, User as UserIcon,
    Bookmark, PlusCircle, MinusCircle, Edit2, AlertOctagon,
    MoreVertical, Trash2, Eye, CalendarDays, ArrowLeft
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Error Boundary ───────────────────────────────────────────── */
class MarkdownErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    render() {
        if (this.state.hasError) {
            return (
                <div className="text-destructive bg-destructive/8 border border-destructive/20 p-4 rounded-xl font-mono text-sm overflow-auto">
                    <p><b>Markdown Render Error:</b> {this.state.error?.message}</p>
                </div>
            );
        }
        return this.props.children;
    }
}

/* ─── Star Row ─────────────────────────────────────────────────── */
const StarRow = ({ value, max = 5, size = 'sm', interactive = false, onChange }) => (
    <div className="flex items-center gap-0.5">
        {Array.from({ length: max }, (_, i) => (
            <Star
                key={i}
                className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-3 h-3'}
                    ${i < value ? 'fill-foreground text-foreground' : 'text-border'}
                    ${interactive ? 'cursor-pointer hover:text-foreground transition-colors' : ''}`}
                onClick={interactive ? () => onChange(i + 1) : undefined}
            />
        ))}
    </div>
);

/* ─── Progress Bar ─────────────────────────────────────────────── */
const RatingBar = ({ label, count, max }) => {
    const pct = max > 0 ? (count / max) * 100 : 0;
    return (
        <div className="flex items-center gap-3 text-sm">
            <span className="w-3 text-muted-foreground font-medium">{label}</span>
            <Star className="w-3 h-3 fill-muted-foreground text-muted-foreground flex-shrink-0" />
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-foreground rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-5 text-right text-muted-foreground">{count}</span>
        </div>
    );
};

/* ─── Component ────────────────────────────────────────────────── */
const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useContext(AuthContext);
    const [project, setProject] = useState(null);

    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({
        totalReviews: 0, totalVerified: 0, avgRating: 0, avgVerified: 0,
        star5: 0, star4: 0, star3: 0, star2: 0, star1: 0
    });
    const [pagination, setPagination] = useState({ page: 1, limit: 5, totalPages: 1 });
    const [userReview, setUserReview] = useState(null);

    const [loading, setLoading] = useState(true);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [pros, setPros] = useState('');
    const [cons, setCons] = useState('');
    const [reviewError, setReviewError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const [showProjectMenu, setShowProjectMenu] = useState(false);
    const [showReviewMenu, setShowReviewMenu] = useState(false);
    const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
    const [sort, setSort] = useState('highest');
    const [filter, setFilter] = useState('');

    const viewIncremented = useRef(false);
    const menuRef = useRef(null);
    const reviewMenuRef = useRef(null);

    const isOwner = user && project && user._id === (project.owner?._id || project.owner);
    const isDirty = isEditing || (!userReview && (comment.trim() || pros.trim() || cons.trim()));

    /* close menus on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowProjectMenu(false);
            if (reviewMenuRef.current && !reviewMenuRef.current.contains(e.target)) setShowReviewMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (e) => { if (isDirty) { e.preventDefault(); e.returnValue = ''; } };
        const handleLinkClick = (e) => {
            const target = e.target.closest('a');
            if (target && isDirty && target.href && !target.href.includes(window.location.hash)) {
                if (!window.confirm("You have unsaved changes. Discard them?")) e.preventDefault();
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('click', handleLinkClick, { capture: true });
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('click', handleLinkClick, { capture: true });
        };
    }, [isDirty]);

    useEffect(() => { viewIncremented.current = false; fetchProjectData(); }, [id]);

    useEffect(() => {
        if (!authLoading && project && !viewIncremented.current) {
            const isProjectOwner = user && project && String(user._id) === String(project.owner?._id || project.owner);
            viewIncremented.current = true;
            if (!isProjectOwner) api.put(`/api/projects/${id}/view`, { viewerId: user?._id }).catch(() => {});
        }
    }, [authLoading, project, user, id]);

    useEffect(() => { if (id) fetchReviews(1, true, sort, filter); }, [id, sort, filter]);

    useEffect(() => {
        if (user && user.bookmarks && project) setIsBookmarked(user.bookmarks.includes(project._id));
    }, [user, project]);

    useEffect(() => {
        if (user && id) {
            const fetchMyReview = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (token) {
                        const myRevRes = await api.get(`/api/projects/${id}/my-review`, { headers: { 'auth-token': token } });
                        if (myRevRes.data) setUserReview(myRevRes.data);
                    }
                } catch (e) { console.log('Could not fetch user review', e); }
            };
            fetchMyReview();
        }
    }, [user, id]);

    const fetchProjectData = async () => {
        try {
            const projRes = await api.get(`/api/projects/${id}`);
            setProject(projRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchReviews = async (pageToLoad = 1, reset = false, currentSort = sort, currentFilter = filter) => {
        try {
            const revRes = await api.get(`/api/projects/${id}/reviews`, {
                params: { page: pageToLoad, limit: 5, sort: currentSort, filter: currentFilter }
            });
            const { reviews: newReviews, stats: newStats, pagination: newPag } = revRes.data;
            setReviews(reset ? newReviews : prev => [...prev, ...newReviews]);
            setStats(newStats);
            setPagination(newPag);
            setProject(prev => prev ? { ...prev, averageRating: newStats.avgRating || 0, verifiedRating: newStats.avgVerified || 0 } : prev);
        } catch (e) { console.log('Reviews fetch failed', e); }
    };

    const handleBookmark = async () => {
        if (!user) return alert("Please login to bookmark");
        try {
            const token = localStorage.getItem('token');
            const res = await api.put(`/api/projects/${id}/bookmark`, {}, { headers: { 'auth-token': token } });
            setIsBookmarked(res.data.includes(id));
        } catch (err) { console.error(err); }
    };

    const handleEditForm = () => {
        if (userReview) {
            setRating(userReview.rating || 5);
            setComment(userReview.comment || '');
            setPros(userReview.pros || '');
            setCons(userReview.cons || '');
            setIsEditing(true);
        }
    };

    const handleDeleteReview = async () => {
        if (!window.confirm("Delete your review? This cannot be undone.")) return;
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/api/projects/${id}/reviews`, { headers: { 'auth-token': token } });
            setUserReview(null); setComment(''); setPros(''); setCons(''); setRating(5); setIsEditing(false);
            fetchReviews(1, true, sort, filter);
        } catch (err) { alert("Failed to delete review"); }
    };

    const handleDeleteProject = async () => {
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/api/projects/${id}`, { headers: { 'auth-token': token } });
            setShowDeleteProjectModal(false);
            navigate('/');
        } catch (err) {
            alert("Failed to delete project");
            setShowDeleteProjectModal(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) return alert('Please login to review');
            const res = await api.post(`/api/projects/${id}/reviews`, { rating, comment, pros, cons }, { headers: { 'auth-token': token } });
            setUserReview(res.data); setIsEditing(false); setReviewError('');
            fetchReviews(1, true, sort, filter);
        } catch (err) { setReviewError(err.response?.data?.message || 'Failed to submit review'); }
    };

    const handleReportReview = async (reviewId) => {
        if (!user) return alert("Please login to report reviews.");
        if (!window.confirm("Report this review for violating community guidelines?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await api.put(`/api/projects/${id}/reviews/${reviewId}/report`, {}, { headers: { 'auth-token': token } });
            if (res.data.newlyDeleted) { fetchReviews(1, true, sort, filter); }
            else setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, reportedBy: [...(r.reportedBy || []), user._id] } : r));
        } catch (err) { alert(err.response?.data?.message || "Failed to report review"); }
    };

    const handleCancelEditing = () => {
        if (isEditing || (!userReview && (comment.trim() || pros.trim() || cons.trim()))) {
            if (!window.confirm("Discard unsaved changes?")) return;
        }
        setIsEditing(false);
        if (!userReview) { setComment(''); setPros(''); setCons(''); }
    };

    /* ── Loading / Error ─────────────────────────────────────── */
    if (loading) return (
        <div className="pt-28 min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 border-2 border-border border-t-foreground rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">Loading project...</p>
            </div>
        </div>
    );
    if (!project) return (
        <div className="pt-28 min-h-screen flex items-center justify-center">
            <div className="text-center">
                <p className="text-2xl font-bold text-foreground mb-2">Project not found</p>
                <Link to="/explore" className="text-muted-foreground text-sm underline">Back to Explore</Link>
            </div>
        </div>
    );

    const selectCls = "bg-background border border-border text-foreground text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-foreground transition-colors";

    return (
        <div className="pt-20 pb-24 min-h-screen bg-background">

            {/* ── Delete Project Modal ──────────────────────── */}
            <AnimatePresence>
                {showDeleteProjectModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full shadow-xl"
                        >
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-foreground/8 border border-border mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-destructive" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground text-center mb-2 font-outfit">Delete Project?</h3>
                            <p className="text-muted-foreground text-sm text-center mb-6">
                                This is <span className="font-semibold text-foreground">permanent</span> and cannot be undone. All reviews, ratings, and data will be lost.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteProjectModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteProject}
                                    className="flex-1 py-3 rounded-xl bg-foreground text-background font-semibold text-sm hover:bg-foreground/80 transition-colors"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Hero Banner ───────────────────────────────── */}
            <div className="relative">

                {/* Image strip */}
                <div className="relative h-56 md:h-72 overflow-hidden bg-muted">
                    <img
                        src={
                            project.logoUrl && project.logoUrl !== 'default-logo.png'
                                ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${project.logoUrl}`
                                : 'https://via.placeholder.com/1400x500/f0f0f0/aaaaaa?text=InnoVault'
                        }
                        alt="Project banner"
                        className="w-full h-full object-cover"
                    />
                    {/* Scrim: light fade only at the very bottom edge to blend into the info bar */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />

                    {/* ── Top-left: Back ── */}
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-1.5 text-xs font-semibold
                            bg-foreground text-background border border-background/30
                            px-3 py-1.5 rounded-full shadow-sm
                            hover:opacity-80 active:scale-95
                            transition-all duration-200"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>

                    {/* ── Top-right: Owner 3-dot ── */}
                    {isOwner && (
                        <div className="absolute top-4 right-4 sm:top-6 sm:right-6" ref={menuRef}>
                            <button
                                onClick={() => setShowProjectMenu(!showProjectMenu)}
                                className="w-8 h-8 flex items-center justify-center
                                    bg-foreground text-background border border-background/30
                                    rounded-full shadow-sm
                                    hover:opacity-80 active:scale-95
                                    transition-all duration-200"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                                {showProjectMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-44 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-20"
                                    >
                                        <Link
                                            to={`/edit/${project._id}`}
                                            className="flex items-center gap-2 px-4 py-3 text-sm text-foreground hover:bg-muted transition"
                                        >
                                            <Edit2 className="w-4 h-4" /> Edit Project
                                        </Link>
                                        <button
                                            onClick={() => { setShowProjectMenu(false); setShowDeleteProjectModal(true); }}
                                            className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-destructive hover:bg-destructive/8 transition"
                                        >
                                            <Trash2 className="w-4 h-4" /> Delete Project
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* ── Info bar below image ── */}
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 border-b border-border">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">

                        {/* Left: title + meta */}
                        <div className="min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground tracking-tight mb-2 truncate">
                                {project.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <UserIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="font-medium text-foreground">{project.owner?.username}</span>
                                </span>
                                <span className="text-border">·</span>
                                <span className="flex items-center gap-1.5">
                                    <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                                    {new Date(project.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                                <span className="text-border">·</span>
                                <span className="flex items-center gap-1.5">
                                    <Eye className="w-3.5 h-3.5 flex-shrink-0" />
                                    {project.views} views
                                </span>
                            </div>
                        </div>

                        {/* Right: CTAs */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Bookmark */}
                            <button
                                onClick={handleBookmark}
                                title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                                className={`p-2.5 rounded-xl border transition-all ${
                                    isBookmarked
                                        ? 'bg-foreground text-background border-foreground'
                                        : 'bg-background text-foreground border-border hover:bg-muted'
                                }`}
                            >
                                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                            </button>

                            {/* Source */}
                            {project.sourceLink && (
                                <a
                                    href={project.sourceLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 bg-background text-foreground border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-all"
                                >
                                    <Github className="w-4 h-4" /> Source
                                </a>
                            )}

                            {/* Visit */}
                            {project.deploymentLink && (
                                <a
                                    href={project.deploymentLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-xl text-sm font-bold hover:bg-foreground/85 transition-all shadow-sm"
                                >
                                    Visit <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Body ──────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── Left: Main Content ──────────────────── */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* About */}
                        <section className="bg-card border border-border rounded-2xl p-7">
                            <h2 className="text-xl font-bold font-outfit text-foreground mb-5">About</h2>
                            <MarkdownErrorBoundary>
                                <div className="prose prose-sm max-w-none
                                    prose-headings:text-foreground prose-headings:font-outfit
                                    prose-p:text-muted-foreground prose-p:leading-relaxed
                                    prose-a:text-foreground prose-a:underline
                                    prose-code:bg-muted prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                                    prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-xl
                                    prose-blockquote:border-l-border prose-blockquote:text-muted-foreground
                                    prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                                    prose-li:marker:text-muted-foreground">
                                    <ReactMarkdown>
                                        {typeof project.detailedDescription === 'string'
                                            ? project.detailedDescription
                                            : '*No detailed description provided.*'}
                                    </ReactMarkdown>
                                </div>
                            </MarkdownErrorBoundary>
                        </section>

                        {/* Community Reviews */}
                        <section className="bg-card border border-border rounded-2xl p-7" id="reviewsContainer">
                            <h2 className="text-xl font-bold font-outfit text-foreground mb-6">Community Reviews</h2>

                            {/* Rating summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-6 bg-muted/40 border border-border rounded-xl">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Overall Rating</p>
                                    <div className="flex items-end gap-3 mb-4">
                                        <span className="text-5xl font-extrabold text-foreground tabular-nums">
                                            {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '—'}
                                        </span>
                                        <div className="pb-1">
                                            <StarRow value={Math.round(stats.avgRating)} />
                                            <p className="text-xs text-muted-foreground mt-1">{stats.totalReviews} reviews</p>
                                        </div>
                                    </div>
                                    {stats.totalVerified > 0 && (
                                        <div className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-card border border-border rounded-full text-foreground">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            Verified avg: <b>{stats.avgVerified.toFixed(1)}</b> ({stats.totalVerified})
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {[5, 4, 3, 2, 1].map(n => (
                                        <RatingBar key={n} label={n} count={stats[`star${n}`]} max={stats.totalReviews} />
                                    ))}
                                </div>
                            </div>

                            {/* Write / display user review */}
                            {user && !isOwner && (
                                <div className="mb-8 border border-border rounded-xl overflow-hidden">
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
                                        <h3 className="text-sm font-semibold text-foreground">
                                            {userReview && !isEditing ? 'Your Review' : userReview && isEditing ? 'Edit Review' : 'Leave a Review'}
                                        </h3>
                                        {userReview && !isEditing && (
                                            <div className="relative" ref={reviewMenuRef}>
                                                <button
                                                    onClick={() => setShowReviewMenu(v => !v)}
                                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                                <AnimatePresence>
                                                    {showReviewMenu && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute right-0 mt-1 w-36 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-20"
                                                        >
                                                            <button
                                                                onClick={() => { setShowReviewMenu(false); handleEditForm(); }}
                                                                className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => { setShowReviewMenu(false); handleDeleteReview(); }}
                                                                className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/8 transition"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" /> Delete
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5">
                                        {userReview && !isEditing ? (
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <StarRow value={userReview.rating} />
                                                    {userReview.isEdited && <span className="text-xs text-muted-foreground">Edited</span>}
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{userReview.comment || <i>No comment.</i>}</p>
                                                {(userReview.pros || userReview.cons) && (
                                                    <div className="grid grid-cols-2 gap-4 pt-3 mt-3 border-t border-border text-xs">
                                                        {userReview.pros && <div><p className="flex items-center gap-1 font-semibold text-foreground mb-1"><PlusCircle className="w-3 h-3" /> Pros</p><p className="text-muted-foreground">{userReview.pros}</p></div>}
                                                        {userReview.cons && <div><p className="flex items-center gap-1 font-semibold text-foreground mb-1"><MinusCircle className="w-3 h-3" /> Cons</p><p className="text-muted-foreground">{userReview.cons}</p></div>}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                                {reviewError && <p className="text-destructive text-xs">{reviewError}</p>}

                                                {/* Star picker */}
                                                <div className="flex items-center gap-3">
                                                    <StarRow value={rating} size="lg" interactive onChange={setRating} />
                                                    <span className="text-sm text-muted-foreground">{rating}/5</span>
                                                </div>

                                                <textarea
                                                    className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors resize-none"
                                                    rows={3}
                                                    placeholder="Share your overall feedback (optional)..."
                                                    value={comment}
                                                    onChange={(e) => setComment(e.target.value)}
                                                />

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1.5"><PlusCircle className="w-3 h-3" /> Pros (optional)</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors"
                                                            placeholder="What worked well?"
                                                            value={pros}
                                                            onChange={e => setPros(e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1.5"><MinusCircle className="w-3 h-3" /> Cons (optional)</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors"
                                                            placeholder="What could improve?"
                                                            value={cons}
                                                            onChange={e => setCons(e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <button type="submit" className="px-5 py-2 bg-foreground text-background text-sm font-semibold rounded-xl hover:bg-foreground/85 transition-all">
                                                        {userReview ? 'Save Changes' : 'Submit Review'}
                                                    </button>
                                                    {(isEditing || comment || pros || cons) && (
                                                        <button type="button" onClick={handleCancelEditing} className="px-5 py-2 border border-border text-muted-foreground text-sm font-medium rounded-xl hover:bg-muted transition-all">
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>

                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <AlertOctagon className="w-3 h-3" /> Don't forget to submit to save your review.
                                                </p>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Filter / Sort bar */}
                            <div className="flex flex-wrap gap-3 justify-between items-center mb-5 p-3 bg-muted/30 border border-border rounded-xl">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground font-medium">Filter:</span>
                                    <select value={filter} onChange={e => setFilter(e.target.value)} className={selectCls}>
                                        <option value="">All Reviews</option>
                                        <option value="verifiedOnly">Verified NITW Only</option>
                                        <option value="rating-5">5 Stars</option>
                                        <option value="rating-4">4 Stars</option>
                                        <option value="rating-3">3 Stars</option>
                                        <option value="rating-2">2 Stars</option>
                                        <option value="rating-1">1 Star</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground font-medium">Sort:</span>
                                    <select value={sort} onChange={e => setSort(e.target.value)} className={selectCls}>
                                        <option value="highest">Highest First</option>
                                        <option value="lowest">Lowest First</option>
                                        <option value="recent">Most Recent</option>
                                    </select>
                                </div>
                            </div>

                            {/* Reviews list */}
                            <div className="space-y-4">
                                {reviews
                                    .filter(r => !userReview || r._id !== userReview._id)
                                    .map(review => (
                                        <div key={review._id} className="p-5 border border-border rounded-xl hover:border-foreground/20 transition-colors">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-bold text-foreground">
                                                        {review.user?.username?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold text-foreground">{review.user?.username}</span>
                                                            {review.isVerifiedRating && (
                                                                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-foreground text-background">
                                                                    <ShieldCheck className="w-3 h-3" /> NITW
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(review.updatedAt || review.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            {review.isEdited && ' · Edited'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* Rating pill */}
                                                <div className="flex items-center gap-1 px-2.5 py-1 bg-muted border border-border rounded-full text-xs font-bold text-foreground">
                                                    <Star className="w-3 h-3 fill-foreground" /> {review.rating}
                                                </div>
                                            </div>

                                            {review.comment && <p className="text-sm text-muted-foreground leading-relaxed mb-3">{review.comment}</p>}

                                            {(review.pros || review.cons) && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 mt-3 border-t border-border text-xs">
                                                    {review.pros && <div><p className="flex items-center gap-1 font-semibold text-foreground mb-1"><PlusCircle className="w-3 h-3" /> Pros</p><p className="text-muted-foreground">{review.pros}</p></div>}
                                                    {review.cons && <div><p className="flex items-center gap-1 font-semibold text-foreground mb-1"><MinusCircle className="w-3 h-3" /> Cons</p><p className="text-muted-foreground">{review.cons}</p></div>}
                                                </div>
                                            )}

                                            <div className="mt-3 flex justify-end">
                                                {review.reportedBy?.includes(user?._id) ? (
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <AlertOctagon className="w-3 h-3" /> Reported
                                                    </span>
                                                ) : (
                                                    <button onClick={() => handleReportReview(review._id)} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
                                                        <AlertOctagon className="w-3 h-3" /> Report
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                {reviews.filter(r => !userReview || r._id !== userReview._id).length === 0 && (
                                    <div className="text-center py-12 border border-dashed border-border rounded-xl">
                                        <Star className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                                        <p className="text-muted-foreground text-sm">No reviews match the selected filters.</p>
                                    </div>
                                )}

                                {pagination.page < pagination.totalPages && (
                                    <div className="flex justify-center pt-4">
                                        <button
                                            onClick={() => fetchReviews(pagination.page + 1, false, sort, filter)}
                                            className="px-6 py-2 border border-border text-foreground text-sm font-medium rounded-full hover:bg-muted transition-all"
                                        >
                                            Load More Reviews
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* ── Right: Sidebar ───────────────────────── */}
                    <div className="space-y-6">

                        {/* Stats */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Project Stats</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Verified Rating', icon: <ShieldCheck className="w-4 h-4" />, value: project.verifiedRating ? `${project.verifiedRating.toFixed(1)} / 5` : '—' },
                                    { label: 'Community Rating', icon: <Star className="w-4 h-4 fill-foreground" />, value: project.averageRating ? `${project.averageRating.toFixed(1)} / 5` : '—' },
                                    { label: 'Total Views', icon: <Eye className="w-4 h-4" />, value: project.views },
                                ].map(({ label, icon, value }) => (
                                    <div key={label} className="flex items-center justify-between py-2.5 px-3 bg-muted/40 rounded-xl border border-border">
                                        <span className="flex items-center gap-2 text-sm text-muted-foreground">{icon} {label}</span>
                                        <span className="text-sm font-bold text-foreground">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tech Stack */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Tech Stack</h3>
                            {project.techStack && project.techStack.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {project.techStack.map((tech, i) => (
                                        <span key={i} className="px-3 py-1 bg-muted border border-border rounded-lg text-xs font-medium text-foreground">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-muted-foreground text-sm">No tags provided.</span>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Links</h3>
                            {project.deploymentLink && (
                                <a href={project.deploymentLink} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 w-full px-4 py-2.5 bg-foreground text-background rounded-xl text-sm font-semibold hover:bg-foreground/85 transition-all">
                                    <ExternalLink className="w-4 h-4" /> Visit Deployment
                                </a>
                            )}
                            {project.sourceLink && (
                                <a href={project.sourceLink} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 w-full px-4 py-2.5 border border-border text-foreground rounded-xl text-sm font-semibold hover:bg-muted transition-all">
                                    <Github className="w-4 h-4" /> View Source Code
                                </a>
                            )}
                            {!project.deploymentLink && !project.sourceLink && (
                                <p className="text-muted-foreground text-sm">No links provided.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;
