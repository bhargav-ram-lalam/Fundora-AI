import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import {
  LayoutDashboard, Rocket, FileText, Brain, TrendingUp, Users,
  Building2, BookOpen, GitBranch, BarChart3, Bell, Settings,
  ChevronLeft, ChevronRight, LogOut, Shield, Search, Star,
  Bookmark, ClipboardList, Zap, PieChart, UserCog, Database,
  Activity, FileBarChart, X, Menu,
} from 'lucide-react';

const founderLinks = [
  { to: '/founder', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/founder/profile', icon: Rocket, label: 'Startup Profile' },
  { to: '/founder/documents', icon: FileText, label: 'Documents' },
  { to: '/founder/ai-analysis', icon: Brain, label: 'AI Analysis' },
  { to: '/founder/funding-readiness', icon: TrendingUp, label: 'Funding Readiness' },
  { to: '/founder/investors', icon: Users, label: 'Investors' },
  { to: '/founder/schemes', icon: Building2, label: 'Govt. Schemes' },
  { to: '/founder/applications', icon: GitBranch, label: 'Applications' },
  { to: '/founder/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/founder/notifications', icon: Bell, label: 'Notifications' },
];

const investorLinks = [
  { to: '/investor', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/investor/profile', icon: UserCog, label: 'Investor Profile' },
  { to: '/investor/discover', icon: Search, label: 'Discover Startups' },
  { to: '/investor/saved', icon: Bookmark, label: 'Saved Startups' },
  { to: '/investor/applications', icon: ClipboardList, label: 'Applications' },
  { to: '/investor/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/investor/notifications', icon: Bell, label: 'Notifications' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: UserCog, label: 'Manage Users' },
  { to: '/admin/startups', icon: Rocket, label: 'Startups' },
  { to: '/admin/schemes', icon: BookOpen, label: 'Gov. Schemes' },
  { to: '/admin/ai-stats', icon: Activity, label: 'AI Statistics' },
  { to: '/admin/reports', icon: FileBarChart, label: 'Reports' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user } = useSelector(state => state.auth);
  const { unreadCount } = useSelector(state => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'investor' ? investorLinks : founderLinks;
  const roleLabel = user?.role === 'admin' ? 'Admin' : user?.role === 'investor' ? 'Investor' : 'Founder';
  const roleColor = user?.role === 'admin' ? 'bg-red-100 text-red-700' : user?.role === 'investor' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-slate-200/50 dark:border-slate-700/50 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-lg font-bold gradient-text">Fundora AI</span>
            <p className="text-[10px] text-slate-400 -mt-0.5">AI Funding Platform</p>
          </div>
        )}
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${roleColor}`}>{roleLabel}</span>
            </div>
          </div>
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen?.(false)}
            className={({ isActive }) =>
              `sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'gradient-primary text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : ''}
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
            {!collapsed && <span className="truncate">{label}</span>}
            {!collapsed && label === 'Notifications' && unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-slate-200/50 dark:border-slate-700/50 space-y-1">
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/70 dark:border-slate-700/50 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} fixed top-0 left-0 h-full z-40`}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-white dark:bg-slate-900 h-full shadow-2xl">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100">
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
