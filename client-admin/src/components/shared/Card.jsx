import React from 'react';

/**
 * Premium Glassmorphic Card Container
 * Used for wrapping dashboard sections, forms, and tables.
 */
export const Card = ({ children, className = '', padding = 'p-6', title, action, ...rest }) => {
  return (
    <div className={`glass-card ${padding} ${className}`} {...rest}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-6 border-b border-slate-700/50 pb-4">
          {title && <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
