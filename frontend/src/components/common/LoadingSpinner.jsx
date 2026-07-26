import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = { sm: 16, md: 24, lg: 40 };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className="animate-spin text-blue-500" size={sizes[size]} />
      {text && <p className="text-sm text-slate-400">{text}</p>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        {Icon && <Icon className="w-8 h-8 text-slate-400" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-xs mb-6">{description}</p>}
      {action}
    </div>
  );
}

export function AlertBanner({ type = 'info', title, message, onDismiss }) {
  const config = {
    info: { icon: Info, bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-400', icon_color: 'text-blue-500' },
    success: { icon: CheckCircle, bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-400', icon_color: 'text-emerald-500' },
    warning: { icon: AlertTriangle, bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-400', icon_color: 'text-yellow-500' },
    error: { icon: XCircle, bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-400', icon_color: 'text-red-500' },
  };
  const c = config[type];
  const IconComp = c.icon;
  return (
    <div className={`${c.bg} ${c.border} border rounded-xl p-4 flex items-start gap-3`}>
      <IconComp className={`${c.icon_color} flex-shrink-0 mt-0.5`} size={18} />
      <div className="flex-1">
        {title && <p className={`text-sm font-semibold ${c.text}`}>{title}</p>}
        {message && <p className={`text-sm ${c.text} ${title ? 'mt-0.5 opacity-80' : ''}`}>{message}</p>}
      </div>
      {onDismiss && <button onClick={onDismiss} className={`${c.text} opacity-60 hover:opacity-100`}><XCircle size={16} /></button>}
    </div>
  );
}

export function Skeleton({ className = '', lines = 1 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`shimmer rounded-lg ${i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'} h-4 ${className}`} />
      ))}
    </div>
  );
}
