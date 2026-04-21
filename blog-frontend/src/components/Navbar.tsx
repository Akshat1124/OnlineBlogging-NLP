import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenSquare, LogOut, User, Sparkles, Search } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles size={20} />
            </div>
            <span className="text-[18px] font-bold tracking-tight text-text-primary">
              InsightBlog
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex items-center relative">
            <Search size={14} className="absolute left-3 text-text-quaternary" />
            <input 
              type="text" 
              placeholder="Search..."
              className="pl-9 pr-4 py-1.5 bg-surface border border-border rounded-full text-[13px] focus:outline-none focus:ring-1 focus:ring-accent-soft w-48 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          {isAuthenticated ? (
            <>
              <Link
                to="/write"
                className="flex items-center gap-2 text-[13px] font-bold text-text-secondary hover:text-accent transition-colors"
              >
                <PenSquare size={18} />
                <span className="hidden sm:inline">Write</span>
              </Link>
              
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-full bg-surface-active text-text-primary flex items-center justify-center font-bold text-[12px] border border-border group-hover:border-accent/30 transition-all overflow-hidden">
                    {user?.username ? (
                      user.username.charAt(0).toUpperCase()
                    ) : (
                      <User size={14} />
                    )}
                  </div>
                  <span className="hidden sm:inline text-[13px] font-bold text-text-primary group-hover:text-accent transition-colors">
                    {user?.username}
                  </span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-text-quaternary hover:text-negative transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-[14px] font-bold text-text-secondary hover:text-text-primary">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-accent text-white px-5 py-2 rounded-full text-[13px] font-bold hover:bg-accent-hover transition-all shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
