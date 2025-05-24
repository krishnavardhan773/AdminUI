import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BookOpen, 
  Star, 
  BookText, 
  LayoutDashboard, 
  Menu, 
  X
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  toggleMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, toggleMobile }) => {
  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, to: '/dashboard' },
    { label: 'Blogs', icon: <BookOpen size={20} />, to: '/blogs' },
    { label: 'Feedback', icon: <Star size={20} />, to: '/feedback' },
    { label: 'Stories', icon: <BookText size={20} />, to: '/stories' },
  ];

  const mobileClasses = isMobileOpen
    ? 'translate-x-0 opacity-100'
    : '-translate-x-full opacity-0 lg:opacity-100 lg:translate-x-0';

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-200
          transform transition-all duration-300 ease-in-out
          ${mobileClasses} lg:static
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Mobile Close */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary-700">Blog Admin</h1>
            <button
              className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
              onClick={toggleMobile}
            >
              <X size={24} />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center px-3 py-2 rounded-md text-sm font-medium
                  transition-colors duration-150 ease-in-out
                  ${isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                onClick={() => {
                  if (isMobileOpen) toggleMobile();
                }}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Menu Toggle */}
      <div className="fixed top-0 left-0 z-20 p-4 lg:hidden">
        <button
          className="p-2 rounded-md bg-white text-gray-700 shadow-md hover:bg-gray-100"
          onClick={toggleMobile}
        >
          <Menu size={24} />
        </button>
      </div>
    </>
  );
};

export default Sidebar;