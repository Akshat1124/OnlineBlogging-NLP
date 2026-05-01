import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenSquare, LogOut, Search, BookOpen, Menu, X, Moon, Sun } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import { useAuthGuard } from '../lib/useAuthGuard';
import AuthGuardModal from './AuthGuardModal';
import Avatar from './ui/Avatar';
import Button from './ui/Button';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { requireAuth, guardModalProps } = useAuthGuard();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/u/${searchValue.trim()}`);
      setSearchValue('');
    }
  };

  const handleWriteClick = () => {
    if (!requireAuth('write a post')) return;
    navigate('/write');
  };

  return (
    <>
      <nav id="main-navbar" className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-700/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: Logo + Search */}
          <div className="flex items-center gap-4 lg:gap-8">
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/20 group-hover:shadow-lg group-hover:shadow-indigo-600/30 group-hover:scale-105 transition-all duration-300">
                <BookOpen size={18} />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white hidden sm:block">
                Online Blogging via NLP
              </span>
            </Link>

            {/* Desktop Search */}
            <form onSubmit={handleSearchSubmit} className="hidden md:block relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                id="navbar-search"
                type="text"
                placeholder="Search users..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 w-52 focus:w-64 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800"
              />
            </form>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              id="theme-toggle"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Desktop actions */}
                <div className="hidden sm:flex items-center gap-3">
                  <Link to="/write">
                    <Button variant="secondary" size="sm" icon={<PenSquare size={15} />}>
                      Write
                    </Button>
                  </Link>
                  <Link to="/profile" className="flex items-center gap-2.5 group">
                    <Avatar name={user?.username || 'User'} size="sm" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors hidden lg:block">
                      {user?.username}
                    </span>
                  </Link>
                  <button
                    id="logout-button"
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>

                {/* Mobile hamburger */}
                <button
                  className="sm:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* Guest Write button — triggers auth modal */}
                <button
                  onClick={handleWriteClick}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <PenSquare size={15} />
                  Write
                </button>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="sm:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 animate-fade-in">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </form>

            <Link
              to="/write"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <PenSquare size={18} />
              Write a Post
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Avatar name={user?.username || 'User'} size="sm" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{user?.username}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-semibold text-red-600 w-full transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Auth Guard Modal for guest users */}
      <AuthGuardModal {...guardModalProps} />
    </>
  );
};

export default Navbar;
