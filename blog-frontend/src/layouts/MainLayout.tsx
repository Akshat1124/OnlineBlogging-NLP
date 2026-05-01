import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import GeminiAssistant from '../components/GeminiAssistant';

const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Hide sidebar on auth pages and write page (write has its own panel)
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isWritePage = location.pathname === '/write';
  const showSidebar = !isAuthPage && !isWritePage;

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-900">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && (
          <div className="hidden md:flex flex-shrink-0">
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>
        )}
        <main className="flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>
      {/* Gemini AI Assistant — always available */}
      <GeminiAssistant />
    </div>
  );
};

export default MainLayout;
