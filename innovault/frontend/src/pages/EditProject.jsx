import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload } from 'lucide-react';

const EditProject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        shortDescription: '',
        detailedDescription: '',
        deploymentLink: '',
        sourceLink: '',
        techStack: '' 
    });
    const [logo, setLogo] = useState(null);
    const [existingLogo, setExistingLogo] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/projects/${id}`);
                const data = res.data;
                setFormData({
                    title: data.title,
                    shortDescription: data.shortDescription,
                    detailedDescription: data.detailedDescription,
                    deploymentLink: data.deploymentLink || '',
                    sourceLink: data.sourceLink || '',
                    techStack: data.techStack.join(', ')
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

            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('shortDescription', formData.shortDescription);
            payload.append('detailedDescription', formData.detailedDescription);
            payload.append('deploymentLink', formData.deploymentLink);
            payload.append('sourceLink', formData.sourceLink);
            payload.append('techStack', formData.techStack);
            
            if (logo) {
                payload.append('logo', logo);
            }

            await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/projects/${id}`, payload, {
                headers: { 'auth-token': token }
            });

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you absolutely sure you want to permanently delete this project?")) {
            try {
                const token = localStorage.getItem('token');
                setLoading(true);
                await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/projects/${id}`, {
                    headers: { 'auth-token': token }
                });
                navigate('/dashboard');
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        }
    };

    if (fetching) return <div className="pt-24 min-h-screen text-center text-white">Loading project data...</div>;

    return (
        <div className="pt-24 min-h-screen px-4 max-w-3xl mx-auto pb-20">
            <h1 className="text-3xl font-bold text-white mb-2">Edit Project</h1>
            <p className="text-gray-400 mb-8">Update your project details below.</p>

            <form onSubmit={handleSubmit} className="space-y-6 bg-dark-card p-8 rounded-xl border border-gray-800 relative">
                <button type="button" onClick={handleDelete} className="absolute top-8 right-8 text-red-500 hover:text-red-400 text-sm font-medium underline">
                    Delete Project
                </button>

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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Update Project Logo (Optional)</label>
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer relative">
                        <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" id="logo-upload" accept="image/*" />
                        <div className="pointer-events-none flex flex-col items-center">
                            {existingLogo && !logo ? (
                                <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${existingLogo}`} alt="Current Logo" className="w-16 h-16 rounded mb-2 border border-gray-600 object-cover" />
                            ) : (
                                <Upload className="mx-auto h-12 w-12 text-gray-500" />
                            )}
                            <p className="mt-2 text-sm text-gray-400">{logo ? logo.name : "Click to upload a new logo"}</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button type="submit" disabled={loading} className="w-full bg-secondary hover:bg-secondary/80 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-secondary/50 disabled:opacity-50">
                        {loading ? 'Updating...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => navigate('/dashboard')} className="w-full mt-3 bg-transparent border border-gray-600 hover:bg-gray-800 text-gray-300 font-bold py-3 px-4 rounded-lg transition-all">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProject;
