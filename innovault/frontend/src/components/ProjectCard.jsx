import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Eye, Bookmark } from 'lucide-react';

const ProjectCard = ({ project }) => {
    return (
        <Link to={`/projects/${project._id}`} className="block group">
            <div className="bg-dark-card rounded-xl overflow-hidden border border-gray-800 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 h-full flex flex-col">
                <div className="relative h-48 overflow-hidden bg-gray-900">
                    <img
                        src={project.logoUrl && project.logoUrl !== 'default-logo.png' ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${project.logoUrl}` : 'https://via.placeholder.com/400x300/1e293b/475569?text=InnoVault'}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-xs text-secondary font-medium border border-secondary/20">
                        {project.status === 'active' ? 'Active' : 'Archived'}
                    </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{project.title}</h3>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.shortDescription}</p>

                    {/* Tech Stack Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {project.techStack.slice(0, 3).map((tech, index) => (
                            <span key={index} className="px-2 py-1 rounded bg-slate-800 text-xs text-gray-300 border border-slate-700">
                                {tech}
                            </span>
                        ))}
                        {project.techStack.length > 3 && (
                            <span className="px-2 py-1 rounded bg-slate-800 text-xs text-gray-300 border border-slate-700">
                                +{project.techStack.length - 3}
                            </span>
                        )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Verified Rating */}
                            <div className="flex items-center gap-1 text-primary" title="Verified NITW Rating">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-sm font-semibold">{project.verifiedRating?.toFixed(1) || '-'}</span>
                            </div>
                            {/* Community Rating */}
                            <div className="flex items-center gap-1 text-yellow-400" title="Community Rating">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-sm font-semibold">{project.averageRating?.toFixed(1) || '-'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-gray-500 text-xs">
                            <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" /> {project.views}
                            </div>
                            {/* 
                           <div className="flex items-center gap-1">
                                <Bookmark className="w-3 h-3" /> {project.bookmarksCount}
                           </div>
                           */}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProjectCard;
