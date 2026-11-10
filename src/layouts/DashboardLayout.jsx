import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { FloatingPetChatWidget } from '../components/chat/FloatingPetChatWidget';

export const DashboardLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex flex-col antialiased">
      {/* 1. Global Fixed Header */}
      <Header
        onToggleSidebar={() => {
          if (window.innerWidth < 1024) {
            setIsMobileSidebarOpen((prev) => !prev);
          } else {
            setIsDesktopCollapsed((prev) => !prev);
          }
        }}
        isSidebarCollapsed={isDesktopCollapsed}
      />

      {/* 2. Body Area (Fixed Sidebar + Independent Scrollable Main) */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isDesktopCollapsed}
          onToggleCollapse={() => setIsDesktopCollapsed((prev) => !prev)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Pet Chat & AI Widget */}
      <FloatingPetChatWidget />
    </div>
  );
};
