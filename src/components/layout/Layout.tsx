import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isMobileOpen={isMobileOpen} toggleMobile={toggleMobile} />
      
      <main className="flex-1 overflow-auto p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;