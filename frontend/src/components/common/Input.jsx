import React from 'react';

export default function Input({
  label, name, type = 'text', placeholder, value, onChange, error,
  required, icon: Icon, suffix, helper, className = '', disabled = false, rows,
}) {
  const inputClass = `w-full bg-slate-50 dark:bg-slate-800 border ${error ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'} rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${Icon ? 'pl-10' : ''} ${suffix ? 'pr-10' : ''}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon size={16} /></div>}
        {rows ? (
          <textarea id={name} name={name} rows={rows} placeholder={placeholder} value={value} onChange={onChange}
            disabled={disabled} className={`${inputClass} resize-none`} required={required} />
        ) : (
          <input id={name} name={name} type={type} placeholder={placeholder} value={value} onChange={onChange}
            disabled={disabled} className={inputClass} required={required} />
        )}
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{suffix}</div>}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helper && !error && <p className="mt-1 text-xs text-slate-400">{helper}</p>}
    </div>
  );
}

export function Select({ label, name, value, onChange, options = [], error, required, className = '', disabled = false, placeholder }) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={name} name={name} value={value} onChange={onChange} disabled={disabled} required={required}
        className={`w-full bg-slate-50 dark:bg-slate-800 border ${error ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'} rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
