import React from 'react';

export function Card({ children, className = '', hover = false, glass = false }) {
  return (
    <div className={`rounded-2xl border border-slate-200/70 dark:border-slate-700/50 bg-white dark:bg-slate-900 shadow-sm ${hover ? 'hover-card cursor-pointer' : ''} ${glass ? 'glass-card' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function StatsCard({ title, value, subtitle, icon: Icon, gradient, trend, trendLabel }) {
  return (
    <Card className="relative overflow-hidden">
      <CardBody className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              <span>{trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
              {trendLabel && <span className="text-slate-400 font-normal">{trendLabel}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${gradient || 'gradient-primary'} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </CardBody>
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 ${gradient || 'gradient-primary'}`} />
    </Card>
  );
}
