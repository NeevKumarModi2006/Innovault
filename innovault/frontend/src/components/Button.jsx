import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary text-white hover:bg-blue-600 focus:ring-primary shadow-lg shadow-blue-500/20",
        secondary: "bg-secondary text-white hover:bg-violet-600 focus:ring-secondary shadow-lg shadow-violet-500/20",
        accent: "bg-accent text-white hover:bg-cyan-600 focus:ring-accent shadow-lg shadow-cyan-500/20",
        outline: "border-2 border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white focus:ring-slate-500",
        ghost: "text-slate-400 hover:text-white hover:bg-slate-800",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
