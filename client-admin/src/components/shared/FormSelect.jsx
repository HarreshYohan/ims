import React from 'react';

/**
 * Reusable Select Dropdown unified with the dark glassmorphic design system.
 */
export const FormSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options, 
  required = false,
  error,
  disabled = false
}) => {
  return (
    <div className="flex flex-col space-y-1.5 mb-4">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-slate-500">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`input-field bg-slate-800 ${error ? 'border-danger focus:ring-danger/50' : ''} ${disabled ? 'opacity-50 cursor-not-allowed border-slate-800' : ''}`}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt, i) => {
          const optValue = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          return <option key={i} value={optValue}>{optLabel}</option>
        })}
      </select>
      {error && <span className="text-xs text-danger mt-1">{error}</span>}
    </div>
  );
};
