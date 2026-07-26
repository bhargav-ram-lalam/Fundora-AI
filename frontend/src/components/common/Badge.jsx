import React from 'react';

const colors = {
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  gray: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

const statusColors = {
  submitted: 'blue', under_review: 'yellow', shortlisted: 'purple',
  interview: 'orange', approved: 'green', rejected: 'red',
  active: 'green', draft: 'gray', funded: 'purple', closed: 'red',
  completed: 'green', processing: 'blue', failed: 'red', pending: 'yellow',
};

export function Badge({ children, color = 'blue', size = 'sm', dot = false }) {
  const sizes = { xs: 'px-1.5 py-0.5 text-[10px]', sm: 'px-2.5 py-1 text-xs', md: 'px-3 py-1.5 text-sm' };
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${colors[color]} ${sizes[size]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full bg-current`} />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const label = status?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  const color = statusColors[status] || 'gray';
  return <Badge color={color} dot>{label}</Badge>;
}

export function ScoreBadge({ score }) {
  const color = score >= 75 ? 'green' : score >= 50 ? 'blue' : score >= 25 ? 'yellow' : 'red';
  return <Badge color={color}>{score}/100</Badge>;
}
