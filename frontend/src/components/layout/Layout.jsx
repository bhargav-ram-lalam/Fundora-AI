import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AIChatbot from '../common/AIChatbot';

export default function Layout() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('fundai_theme') === 'dark');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fundai_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fundai_theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen gradient-bg dark:bg-slate-950 transition-colors duration-300">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <Navbar
        collapsed={collapsed}
        setMobileOpen={setMobileOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <main className={`transition-all duration-300 pt-16 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </div>
      </main>
      <AIChatbot />
    </div>
  );
}
