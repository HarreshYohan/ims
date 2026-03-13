import React from 'react';

/**
 * Reusable Form Input unified with the dark glassmorphic design system.
 */
export const FormInput = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  error,
  disabled = false
}) => {
  return (
    <div className="flex flex-col space-y-1.5 mb-4">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-300">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`input-field ${error ? 'border-danger focus:ring-danger/50' : ''} ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-900 border-slate-800' : ''}`}
      />
      {error && <span className="text-xs text-danger mt-1">{error}</span>}
    </div>
  );
};
