import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import useBlogStore from '../store/blogStore';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { posts, loading, fetchPosts, searchPosts } = useBlogStore();
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    fetchPosts(0, 30);
  }, []);

  // Debounced search — waits 300ms after last keystroke
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        searchPosts(value, 0);
      } else {
        fetchPosts(0, 30);
      }
    }, 300);
  };

  if (collapsed) {
    return (
      <div className="w-12 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col items-center py-3">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          title="Expand sidebar"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">
          All Posts
        </span>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          title="Collapse sidebar"
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2.5">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            id="sidebar-search"
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-200 transition-all"
          />
        </div>
      </div>

      {/* Blog list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {loading ? (
          <div className="px-3 py-10 flex justify-center">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin-slow" />
          </div>
        ) : posts.length === 0 ? (
          <p className="px-3 py-10 text-xs text-slate-400 dark:text-slate-500 text-center font-medium">
            No posts found.
          </p>
        ) : (
          posts.map((post) => {
            const isActive = location.pathname === `/post/${post.id}`;
            return (
              <Link
                key={post.id}
                to={`/post/${post.id}`}
                className={cn(
                  'block px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-200 group',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                <div className="flex items-start gap-2.5">
                  <FileText
                    size={14}
                    className={cn(
                      'mt-0.5 flex-shrink-0 transition-colors',
                      isActive ? 'text-white/70' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      'text-sm font-semibold leading-tight truncate',
                      isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'
                    )}>
                      {post.title}
                    </p>
                    <p className={cn(
                      'text-[11px] mt-0.5',
                      isActive ? 'text-white/60' : 'text-slate-400 dark:text-slate-500'
                    )}>
                      {post.username} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
