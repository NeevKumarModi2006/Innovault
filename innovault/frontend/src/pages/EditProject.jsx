import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, Pencil, Link2, Code2, FileText, Type, AlignLeft, Trash2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const FormField = ({ label, hint, icon: Icon, children }) => (
    <div className="group">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2 tracking-wide">
            {Icon && <Icon className="w-4 h-4 text-primary" />}
            {label}
            {hint && <span className="ml-auto text-xs font-normal text-muted-foreground">{hint}</span>}
        </label>
        {children}
    </div>
);

const inputCls =
    'w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all duration-200';

const EditProject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        detailedDescription: '',
        deploymentLink: '',
        sourceLink: '',
        techStack: '',
    });
    const [logo, setLogo] = useState(null);
    const [existingLogo, setExistingLogo] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await api.get(`/api/projects/${id}`);
                const data = res.data;
                setFormData({
                    title: data.title,
                    shortDescription: data.shortDescription,
                    detailedDescription: data.detailedDescription,
                    deploymentLink: data.deploymentLink || '',
                    sourceLink: data.sourceLink || '',
                    techStack: data.techStack.join(', '),
                });
                setExistingLogo(data.logoUrl);
            } catch (err) {
                setError('Failed to load project details.');
            } finally {
                setFetching(false);
            }
        };
        fetchProject();
    }, [id]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setLogo(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.deploymentLink && !formData.sourceLink) {
            setLoading(false);
            return setError('You must provide at least one link: either a Deployment Link or a Source Code Link.');
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('You must be logged in.');

            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('shortDescription', formData.shortDescription);
            payload.append('detailedDescription', formData.detailedDescription);
            payload.append('deploymentLink', formData.deploymentLink);
            payload.append('sourceLink', formData.sourceLink);
            payload.append('techStack', formData.techStack);
            if (logo) payload.append('logo', logo);

            await api.put(`/api/projects/${id}`, payload);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            await api.delete(`/api/projects/${id}`);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    if (fetching) return (
        <div className="pt-28 min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 border-2 border-border border-t-foreground rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">Loading project data...</p>
            </div>
        </div>
    );

    return (
        <div className="pt-28 pb-24 min-h-screen px-4 bg-background">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10 text-center"
                >
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-foreground text-background mb-4">
                        <Pencil className="w-7 h-7" />
                    </div>
                    <h1 className="text-4xl font-bold font-outfit text-foreground tracking-tight mb-2">Edit Project</h1>
                    <p className="text-muted-foreground text-base">Update your project details below.</p>
                </motion.div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full shadow-xl"
                        >
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-destructive/10 mx-auto mb-4">
                                <AlertTriangle className="w-6 h-6 text-destructive" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground text-center mb-2 font-outfit">Delete Project?</h3>
                            <p className="text-muted-foreground text-sm text-center mb-6">
                                This action is <span className="font-semibold text-foreground">permanent</span> and cannot be undone. All data associated with this project will be removed.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="flex-1 py-3 rounded-xl bg-foreground text-background font-semibold text-sm hover:bg-foreground/80 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6"
                >
                    {error && (
                        <div className="flex items-start gap-3 text-sm text-destructive bg-destructive/8 border border-destructive/20 p-4 rounded-xl">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <FormField label="Project Title" icon={Type}>
                        <input
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="My Awesome Project"
                            className={inputCls}
                        />
                    </FormField>

                    {/* Short Description */}
                    <FormField label="Short Description" hint="Max 200 chars" icon={AlignLeft}>
                        <input
                            name="shortDescription"
                            required
                            maxLength={200}
                            value={formData.shortDescription}
                            onChange={handleChange}
                            className={inputCls}
                        />
                        <p className="mt-1.5 text-xs text-muted-foreground text-right">{formData.shortDescription.length}/200</p>
                    </FormField>

                    {/* Detailed Description */}
                    <FormField label="Detailed Description" hint="Markdown supported" icon={FileText}>
                        <textarea
                            name="detailedDescription"
                            required
                            rows={7}
                            value={formData.detailedDescription}
                            onChange={handleChange}
                            className={`${inputCls} resize-y`}
                        />
                    </FormField>

                    {/* Tech Stack */}
                    <FormField label="Tech Stack" hint="Comma separated" icon={Code2}>
                        <input
                            name="techStack"
                            placeholder="React, Node.js, Python, MongoDB..."
                            value={formData.techStack}
                            onChange={handleChange}
                            className={inputCls}
                        />
                    </FormField>

                    {/* Links */}
                    <div>
                        <p className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3 tracking-wide">
                            <Link2 className="w-4 h-4 text-primary" />
                            Project Links
                            <span className="ml-auto text-xs font-normal text-muted-foreground">At least one required</span>
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">Deployment URL</label>
                                <input
                                    name="deploymentLink"
                                    type="url"
                                    placeholder="https://myapp.com"
                                    value={formData.deploymentLink}
                                    onChange={handleChange}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">Source Code URL</label>
                                <input
                                    name="sourceLink"
                                    type="url"
                                    placeholder="https://github.com/user/repo"
                                    value={formData.sourceLink}
                                    onChange={handleChange}
                                    className={inputCls}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Logo Upload */}
                    <FormField label="Update Project Logo" hint="PNG, JPG — max 5MB">
                        <label
                            htmlFor="logo-upload"
                            className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-foreground hover:bg-muted/40 transition-all duration-200 group"
                        >
                            <input
                                type="file"
                                id="logo-upload"
                                onChange={handleFileChange}
                                className="sr-only"
                                accept="image/*"
                            />
                            {existingLogo && !logo ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${existingLogo}`}
                                    alt="Current Logo"
                                    className="w-16 h-16 rounded-xl border border-border object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                                    <Upload className="w-5 h-5 text-muted-foreground group-hover:text-background" />
                                </div>
                            )}
                            <div className="text-center">
                                <p className="text-sm font-medium text-foreground">
                                    {logo ? logo.name : existingLogo ? 'Click to replace logo' : 'Click to upload'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">or drag and drop</p>
                            </div>
                        </label>
                    </FormField>

                    {/* Actions */}
                    <div className="border-t border-border pt-4 space-y-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-foreground text-background font-bold py-3.5 px-4 rounded-xl transition-all hover:bg-foreground/85 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide shadow-sm"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-3.5 px-4 rounded-xl border border-border text-muted-foreground font-semibold text-sm hover:bg-muted hover:text-foreground transition-all"
                        >
                            Cancel
                        </button>
                        <div className="pt-2 border-t border-border">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-destructive border border-destructive/20 text-sm font-semibold hover:bg-destructive/8 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Project
                            </button>
                        </div>
                    </div>
                </motion.form>
            </div>
        </div>
    );
};

export default EditProject;
