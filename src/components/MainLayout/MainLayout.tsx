import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';

interface MainLayoutProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen bg-background-subtle">
      {/* Sidebar */}
      <Header variant="sidebar" />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col ml-sidebar transition-all duration-300 group-hover:ml-sidebar-expanded">
        {/* TopBar */}
        <Header variant="topbar" title={title} subtitle={subtitle} />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto pl-16 pt-3">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
