import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Eye, ExternalLink, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ProjectCard = ({ project }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            whileHover={{ y: -6 }}
            className="group h-full"
        >
            <Link to={`/projects/${project._id}`} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
                <div className="relative bg-card border border-border rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-foreground/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]">

                    {/* Thumbnail */}
                    <div className="relative h-48 overflow-hidden bg-muted flex-shrink-0">
                        <img
                            src={
                                project.logoUrl && project.logoUrl !== 'default-logo.png'
                                    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${project.logoUrl}`
                                    : 'https://via.placeholder.com/800x400/f8f8f8/888888?text=InnoVault'
                            }
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Bottom fade */}
                        <div className="absolute inset-0 bg-gradient-to-t from-card/40 via-transparent to-transparent" />

                        {/* Arrow icon top right */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                            <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center shadow-md">
                                <ArrowUpRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    {/* Card body */}
                    <div className="flex flex-col flex-1 p-5">
                        {/* Title + description */}
                        <div className="mb-4">
                            <h3 className="text-base font-bold font-outfit text-foreground mb-1.5 line-clamp-1 group-hover:text-foreground/80 transition-colors">
                                {project.title}
                            </h3>
                            <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                                {project.shortDescription}
                            </p>
                        </div>

                        {/* Tech Stack badges */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {project.techStack.slice(0, 3).map((tech, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-0.5 rounded-md bg-muted text-xs font-medium text-foreground border border-border"
                                >
                                    {tech}
                                </span>
                            ))}
                            {project.techStack.length > 3 && (
                                <span className="px-2 py-0.5 rounded-md bg-muted/50 text-xs font-medium text-muted-foreground border border-dashed border-border">
                                    +{project.techStack.length - 3}
                                </span>
                            )}
                        </div>

                        {/* Footer stats */}
                        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                            <div className="flex items-center gap-3 text-sm font-semibold">
                                {/* Verified Rating */}
                                <div className="flex items-center gap-1 text-foreground" title="Verified NITW Rating">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>{project.verifiedRating?.toFixed(1) || '—'}</span>
                                </div>
                                {/* Community Rating */}
                                <div className="flex items-center gap-1 text-muted-foreground" title="Community Rating">
                                    <Star className="w-4 h-4 fill-muted-foreground" />
                                    <span>{project.averageRating?.toFixed(1) || '—'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                                <Eye className="w-3.5 h-3.5" />
                                <span>{project.views}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProjectCard;
