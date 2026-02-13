import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-card border border-slate-700/50 rounded-xl p-6 shadow-xl backdrop-blur-sm ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
