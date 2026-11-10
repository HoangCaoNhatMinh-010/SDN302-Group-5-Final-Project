import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';

export const DashboardLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* 1. Global Header */}
      <Header
        onToggleSidebar={() => {
          // On mobile, toggle mobile drawer. On desktop, toggle collapse.
          if (window.innerWidth < 1024) {
            setIsMobileSidebarOpen((prev) => !prev);
          } else {
            setIsDesktopCollapsed((prev) => !prev);
          }
        }}
        isSidebarCollapsed={isDesktopCollapsed}
      />

      {/* 2. Body Area (Sidebar + Main) */}
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isDesktopCollapsed}
          onToggleCollapse={() => setIsDesktopCollapsed((prev) => !prev)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
