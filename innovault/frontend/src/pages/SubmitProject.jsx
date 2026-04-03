import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Upload, FolderPlus, Link2, Code2, FileText, Type, AlignLeft, CheckCircle2 } from 'lucide-react';
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

const SubmitProject = () => {
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fileError, setFileError] = useState('');

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                setFileError('File size must be less than 5 MB');
                setLogo(null);
                e.target.value = ''; // Reset input
            } else {
                setFileError('');
                setLogo(file);
            }
        }
    };

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

            await api.post('/api/projects', payload);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

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
                        <FolderPlus className="w-7 h-7" />
                    </div>
                    <h1 className="text-4xl font-bold font-outfit text-foreground tracking-tight mb-2">Submit a Project</h1>
                    <p className="text-muted-foreground text-base">Share your work with the NITW innovation community.</p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6"
                >
                    {error && (
                        <div className="flex items-start gap-3 text-sm text-destructive bg-destructive/8 border border-destructive/20 p-4 rounded-xl">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
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
                            placeholder="One-line summary of your project"
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
                            placeholder="Describe what your project does, the problem it solves, and how it works..."
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
                    <FormField label="Project Logo" hint="PNG, JPG — max 5MB">
                        <label
                            htmlFor="logo-upload"
                            className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed ${fileError ? 'border-destructive' : 'border-border'} rounded-xl p-8 cursor-pointer hover:border-foreground hover:bg-muted/40 transition-all duration-200 group`}
                        >
                            <input
                                type="file"
                                id="logo-upload"
                                onChange={handleFileChange}
                                className="sr-only"
                                accept="image/*"
                            />
                            <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors ${fileError ? 'bg-destructive/10' : ''}`}>
                                <Upload className={`w-5 h-5 group-hover:text-background ${fileError ? 'text-destructive' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="text-center">
                                <p className={`text-sm font-medium ${fileError ? 'text-destructive' : 'text-foreground'}`}>
                                    {logo ? logo.name : 'Click to upload'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">or drag and drop</p>
                            </div>
                        </label>
                        {fileError && <p className="text-sm font-medium text-destructive mt-2 text-center">{fileError}</p>}
                    </FormField>

                    {/* Divider */}
                    <div className="border-t border-border pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-foreground text-background font-bold py-3.5 px-4 rounded-xl transition-all hover:bg-foreground/85 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide shadow-sm"
                        >
                            {loading ? 'Submitting...' : 'Launch Project'}
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
};

export default SubmitProject;
