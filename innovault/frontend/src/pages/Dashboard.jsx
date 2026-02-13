import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { Plus, FileText, Folder, Settings, Search, Trash2 } from 'lucide-react';
import Input from '../components/Input';
import api from '../services/api';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newProjectTitle, setNewProjectTitle] = useState('');
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newProjectTitle.trim()) return;

        try {
            const response = await api.post('/projects', {
                title: newProjectTitle,
                type: 'folder' // Default to folder for now
            });
            setProjects([response.data, ...projects]);
            setNewProjectTitle('');
            setShowCreate(false);
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            await api.delete(`/projects/${id}`);
            setProjects(projects.filter(p => p._id !== id));
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400">Manage your secure projects</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="flex items-center gap-2" onClick={() => setShowCreate(!showCreate)}>
                        <Plus size={18} />
                        New Project
                    </Button>
                </div>
            </div>

            {/* Quick Create Form */}
            {showCreate && (
                <Card className="mb-8 p-4 border border-primary/50 bg-primary/5">
                    <form onSubmit={handleCreateProject} className="flex gap-4 items-end">
                        <div className="flex-grow">
                            <Input
                                id="new-project"
                                label="Project Name"
                                placeholder="Enter project name..."
                                value={newProjectTitle}
                                onChange={(e) => setNewProjectTitle(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <Button type="submit">Create</Button>
                        <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                    </form>
                </Card>
            )}

            {/* Projects Grid */}
            {loading ? (
                <div className="text-center text-slate-400 py-12">Loading projects...</div>
            ) : projects.length === 0 ? (
                <div className="text-center text-slate-400 py-12 border-2 border-dashed border-slate-800 rounded-xl">
                    <p className="mb-4">No projects found.</p>
                    <Button variant="outline" onClick={() => setShowCreate(true)}>Create your first project</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {projects.map((project) => (
                        <Card key={project._id} className="p-4 hover:bg-slate-800/80 transition-colors cursor-pointer group relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-lg ${project.type === 'folder' ? 'bg-blue-500/10 text-blue-500' : 'bg-violet-500/10 text-violet-500'}`}>
                                    {project.type === 'folder' ? <Folder size={20} /> : <FileText size={20} />}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(project._id); }}
                                    className="text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <h3 className="font-semibold text-white mb-1 truncate">{project.title}</h3>
                            <p className="text-xs text-slate-500">Updated {new Date(project.updatedAt).toLocaleDateString()}</p>
                        </Card>
                    ))}

                    {/* New Item Placeholder */}
                    <Card onClick={() => setShowCreate(true)} className="p-4 border-dashed border-2 border-slate-700 bg-transparent hover:bg-slate-900/50 hover:border-slate-500 transition-all cursor-pointer flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 h-full min-h-[140px]">
                        <Plus size={24} className="mb-2" />
                        <span className="text-sm font-medium">Create New</span>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
