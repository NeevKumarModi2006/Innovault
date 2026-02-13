import React from 'react';

const Input = ({ label, id, error, className = '', ...props }) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-slate-300">
                    {label}
                </label>
            )}
            <input
                id={id}
                className={`bg-slate-800/50 border border-slate-700 rounded-md px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
                {...props}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
};

export default Input;
