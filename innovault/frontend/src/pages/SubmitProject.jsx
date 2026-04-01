import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';

const SubmitProject = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        detailedDescription: '',
        deploymentLink: '',
        sourceLink: '',
        techStack: '' // Comma separated string for input
    });
    const [logo, setLogo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setLogo(e.target.files[0]);
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

            // Build FormData payload to support file upload
            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('shortDescription', formData.shortDescription);
            payload.append('detailedDescription', formData.detailedDescription);
            payload.append('deploymentLink', formData.deploymentLink);
            payload.append('sourceLink', formData.sourceLink);
            payload.append('techStack', formData.techStack); // Send as comma-separated string
            
            if (logo) {
                payload.append('logo', logo);
            }

            // Use the fetch wrapper, which auto-attaches tokens and correctly handles FormData
            await api.post('/api/projects', payload);

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-24 min-h-screen px-4 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Submit a Project</h1>
            <p className="text-gray-400 mb-8">Share your specialized tool with the NITW community.</p>

            <form onSubmit={handleSubmit} className="space-y-6 bg-dark-card p-8 rounded-xl border border-gray-800">
                {error && <div className="text-red-500 bg-red-900/20 p-3 rounded">{error}</div>}

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Project Title</label>
                    <input name="title" required value={formData.title} onChange={handleChange} className="w-full bg-dark-input border border-gray-700 rounded px-4 py-2 text-white focus:ring-primary focus:border-primary" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Short Description (Max 200 chars)</label>
                    <input name="shortDescription" required maxLength={200} value={formData.shortDescription} onChange={handleChange} className="w-full bg-dark-input border border-gray-700 rounded px-4 py-2 text-white focus:ring-primary focus:border-primary" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Detailed Description (Markdown Supported)</label>
                    <textarea name="detailedDescription" required rows={6} value={formData.detailedDescription} onChange={handleChange} className="w-full bg-dark-input border border-gray-700 rounded px-4 py-2 text-white focus:ring-primary focus:border-primary" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tech Stack (Comma separated)</label>
                        <input name="techStack" placeholder="React, Node.js, Python" value={formData.techStack} onChange={handleChange} className="w-full bg-dark-input border border-gray-700 rounded px-4 py-2 text-white focus:ring-primary focus:border-primary" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Deployment Link</label>
                        <input name="deploymentLink" type="url" placeholder="https://..." value={formData.deploymentLink} onChange={handleChange} className="w-full bg-dark-input border border-gray-700 rounded px-4 py-2 text-white focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Source Code Link</label>
                        <input name="sourceLink" type="url" placeholder="https://github.com/..." value={formData.sourceLink} onChange={handleChange} className="w-full bg-dark-input border border-gray-700 rounded px-4 py-2 text-white focus:ring-primary focus:border-primary" />
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">* At least one link (Deployment or Source Code) is required.</p>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Project Logo</label>
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer relative">
                        <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" id="logo-upload" accept="image/*" />
                        <div className="pointer-events-none">
                            <Upload className="mx-auto h-12 w-12 text-gray-500" />
                            <p className="mt-2 text-sm text-gray-400">{logo ? logo.name : "Click to upload or drag and drop"}</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-primary/50 disabled:opacity-50">
                        {loading ? 'Submitting...' : 'Launch Project'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubmitProject;
