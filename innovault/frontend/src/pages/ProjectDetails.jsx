import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ExternalLink, Github, Star, ShieldCheck, User as UserIcon, Bookmark } from 'lucide-react';
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
    const { user } = useContext(AuthContext);
    const [project, setProject] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reviewError, setReviewError] = useState('');
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        if (user && user.bookmarks && project) {
            setIsBookmarked(user.bookmarks.includes(project._id));
        }
    }, [user, project]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const projRes = await api.get(`/api/projects/${id}`);
                setProject(projRes.data);

                // Check bookmark status if user is logged in
                // Note: user object in context might be stale or not contain bookmarks if not refreshed.
                // ideally fetch /auth/me to get latest bookmarks, but for now rely on context or updated logic.
                // We'll update the check in the other useEffect or here if we fetch user data again.
                // For MVP, let's assume valid user context.

                try {
                    const revRes = await api.get(`/api/projects/${id}/reviews`);
                    setReviews(revRes.data);
                } catch (e) { console.log('Reviews fetch failed', e); }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleBookmark = async () => {
        if (!user) return alert("Please login to bookmark");
        try {
            const token = localStorage.getItem('token');
            const res = await api.put(`/api/projects/${id}/bookmark`);
            // Update local state
            // API returns updated bookmarks array
            setIsBookmarked(res.data.includes(id));

            // Optionally update context user
            // setUser({...user, bookmarks: res.data}); // if setUser is available
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const projRes = await api.get(`/api/projects/${id}`);
                setProject(projRes.data);

                try {
                    const revRes = await api.get(`/api/projects/${id}/reviews`);
                    setReviews(revRes.data);
                } catch (e) { console.log('Reviews fetch failed', e); }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) return alert('Please login to review');

            await api.post(`/api/projects/${id}/reviews`, { rating, comment });

            // Refresh reviews
            const revRes = await api.get(`/api/projects/${id}/reviews`);
            setReviews(revRes.data);
            setComment('');
            setRating(5);
        } catch (err) {
            setReviewError(err.response?.data?.message || 'Failed to submit review');
        }
    };

    if (loading) return <div className="text-center py-20 text-white">Loading...</div>;
    if (!project) return <div className="text-center py-20 text-red-500">Project not found</div>;

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
                    <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-gray-900 to-transparent">
                        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
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

                    {/* Reviews */}
                    <div className="bg-dark-card p-8 rounded-xl border border-gray-800">
                        <h2 className="text-2xl font-bold text-white mb-6">Community Reviews</h2>

                        {user && (
                            <div className="mb-8 p-6 bg-dark-input rounded-lg border border-gray-700">
                                <h3 className="text-lg font-medium text-white mb-4">Leave a Review</h3>
                                {reviewError && <p className="text-red-400 text-sm mb-2">{reviewError}</p>}
                                <form onSubmit={handleReviewSubmit}>
                                    <div className="flex items-center gap-2 mb-4">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star
                                                key={star}
                                                className={`w-6 h-6 cursor-pointer ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-500'}`}
                                                onClick={() => setRating(star)}
                                            />
                                        ))}
                                    </div>
                                    <textarea
                                        className="w-full bg-dark border border-gray-600 rounded p-3 text-white mb-4 focus:ring-primary focus:border-primary"
                                        rows={3}
                                        placeholder="Share your feedback..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                    <button type="submit" className="px-4 py-2 bg-secondary hover:bg-pink-600 text-white rounded font-medium transition-colors">
                                        Submit Review
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="space-y-6">
                            {reviews.map(review => (
                                <div key={review._id} className="border-b border-gray-800 pb-6 last:border-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                {review.user?.username?.[0]?.toUpperCase()}
                                            </div>
                                            <span className="font-bold text-white">{review.user?.username}</span>
                                            {review.isVerifiedRating && (
                                                <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded border border-green-800 flex items-center gap-1">
                                                    <ShieldCheck className="w-3 h-3" /> Verified
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center text-yellow-400">
                                            <Star className="w-4 h-4 fill-current mr-1" />
                                            <span>{review.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-400">{review.comment}</p>
                                </div>
                            ))}
                            {reviews.length === 0 && <p className="text-gray-500">No reviews yet.</p>}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Stats */}
                    <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
                        <h3 className="text-lg font-bold text-white mb-4">Project Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-dark-input rounded-lg">
                                <span className="text-gray-400">Verified Rating</span>
                                <div className="flex items-center text-primary font-bold">
                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                    {project.verifiedRating ? project.verifiedRating.toFixed(1) : '-'} / 5
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-dark-input rounded-lg">
                                <span className="text-gray-400">Community Rating</span>
                                <div className="flex items-center text-yellow-400 font-bold">
                                    <Star className="w-4 h-4 mr-2 fill-current" />
                                    {project.averageRating ? project.averageRating.toFixed(1) : '-'} / 5
                                </div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-dark-input rounded-lg">
                                <span className="text-gray-400">Total Views</span>
                                <span className="text-white font-bold">{project.views}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="bg-dark-card p-6 rounded-xl border border-gray-800">
                        <h3 className="text-lg font-bold text-white mb-4">Tech Stack</h3>
                        <div className="flex flex-wrap gap-2">
                            {project.techStack && project.techStack.length > 0 ? (
                                project.techStack.map((tech, i) => (
                                    <span key={i} className="px-3 py-1 bg-slate-800 text-gray-300 rounded-full text-sm border border-slate-700">
                                        {tech}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-500">No tags</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;
