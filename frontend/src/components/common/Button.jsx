import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children, onClick, type = 'button', variant = 'primary',
  size = 'md', loading = false, disabled = false, icon: Icon, className = '', fullWidth = false,
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'gradient-primary text-white shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30 hover:opacity-90 hover:shadow-xl focus:ring-blue-500',
    secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 focus:ring-slate-400',
    outline: 'border-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:ring-blue-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200/50 focus:ring-red-500',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200/50 focus:ring-emerald-500',
    ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400',
    gradient: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 shadow-lg focus:ring-purple-500',
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? <Loader2 className="animate-spin" size={size === 'xs' ? 12 : 16} /> : Icon && <Icon size={size === 'xs' ? 12 : 16} />}
      {children}
    </button>
  );
}
