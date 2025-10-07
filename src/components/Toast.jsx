import React from 'react';

const Toast = ({ message }) => {
    if (!message) return null;
    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-100 text-slate-900 font-semibold px-6 py-3 rounded-full shadow-lg animate-fade-in-up">
            {message}
        </div>
    );
};

export default Toast;