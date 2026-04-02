import React from 'react';
import { Github, Twitter, Linkedin, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-foreground text-background mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                    {/* Brand */}
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <Link to="/" className="flex items-center gap-2 group">
                            <Cpu className="w-5 h-5 text-background/60 group-hover:text-background group-hover:rotate-180 transition-all duration-500" />
                            <span className="text-xl font-bold font-outfit text-background tracking-tight group-hover:opacity-80 transition-opacity duration-200">
                                InnoVault
                            </span>
                        </Link>
                        <p className="text-background/40 text-sm mt-1">
                            © 2026 NITW Student Initiative. All rights reserved.
                        </p>
                    </div>

                    {/* Nav Links */}
                    <div className="flex items-center gap-1 text-sm">
                        {['Explore', 'Login', 'Register'].map((label) => (
                            <Link
                                key={label}
                                to={`/${label.toLowerCase()}`}
                                className="relative px-3 py-1.5 rounded-lg text-background/60 font-medium
                                    hover:text-background
                                    after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-px
                                    after:bg-background after:scale-x-0 hover:after:scale-x-100
                                    after:transition-transform after:duration-200 after:origin-left
                                    transition-colors duration-200"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Social Icons */}
                    <div className="flex items-center gap-2">
                        {[
                            { icon: Github, label: 'GitHub' },
                            { icon: Linkedin, label: 'LinkedIn' },
                            { icon: Twitter, label: 'Twitter' },
                        ].map(({ icon: Icon, label }) => (
                            <a
                                key={label}
                                href="#"
                                aria-label={label}
                                className="w-9 h-9 flex items-center justify-center rounded-lg
                                    text-background/50 border border-background/10
                                    hover:text-foreground hover:bg-background hover:border-background hover:scale-110 hover:-translate-y-0.5
                                    active:scale-95 transition-all duration-200"
                            >
                                <Icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>

                </div>
            </div>
        </footer>
    );
};

export default Footer;
