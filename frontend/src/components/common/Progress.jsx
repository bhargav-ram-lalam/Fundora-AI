import React from 'react';

export function ProgressBar({ value, max = 100, color = 'blue', size = 'md', showLabel = false, label }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-emerald-500 to-emerald-600',
    gradient: 'from-blue-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
  };
  const heights = { xs: 'h-1', sm: 'h-2', md: 'h-2.5', lg: 'h-3', xl: 'h-4' };

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>}
          {showLabel && <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`${heights[size]} rounded-full bg-gradient-to-r ${colors[color]} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ScoreRing({ score, size = 80, strokeWidth = 6, label }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#3b82f6' : score >= 25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-slate-800 dark:text-slate-100" style={{ color }}>{score}</span>
        </div>
      </div>
      {label && <span className="text-xs text-slate-500 dark:text-slate-400 text-center">{label}</span>}
    </div>
  );
}
