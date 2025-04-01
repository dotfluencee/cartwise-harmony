
import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';

const DashboardLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-chawal-background">
      {/* Sidebar for mobile (overlay) */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-gray-600 bg-opacity-75"
          onClick={toggleSidebar}
        ></div>
        
        {/* Sidebar */}
        <div className="relative flex h-full w-64 flex-col bg-white">
          <Sidebar />
        </div>
      </div>
      
      {/* Sidebar for desktop (fixed) */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col">
          <Sidebar />
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
