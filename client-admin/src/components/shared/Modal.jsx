import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Premium glassmorphic Modal component with focus trapping and backdrop blur.
 */
export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  // Prevent scrolling on body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Modal Card */}
      <div className={`glass-card relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 sticky top-0 bg-surface/80 backdrop-blur-md z-20">
          <h2 className="text-xl font-semibold text-white tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-textMuted hover:text-white hover:bg-danger/20 hover:text-danger rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
