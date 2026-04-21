import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import useBlogStore, { Post } from '../store/blogStore';
import { formatDistanceToNow } from 'date-fns';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { posts, loading, fetchPosts, searchPosts } = useBlogStore();
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  useEffect(() => {
    fetchPosts(0, 30);
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      searchPosts(value, 0);
    } else {
      fetchPosts(0, 30);
    }
  };

  if (collapsed) {
    return (
      <div className="w-[48px] flex-shrink-0 border-r border-border bg-surface flex flex-col items-center py-3">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-text-tertiary hover:text-text-primary"
          title="Expand sidebar"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-[260px] flex-shrink-0 border-r border-border bg-surface flex flex-col transition-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-[11px] font-bold tracking-widest uppercase text-text-tertiary">
          All Blogs
        </span>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors text-text-tertiary hover:text-text-primary"
          title="Collapse sidebar"
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-quaternary" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-[13px] bg-surface-hover rounded-full focus:outline-none focus:ring-1 focus:ring-border-strong placeholder:text-text-quaternary transition-all"
          />
        </div>
      </div>

      {/* Blog list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {loading ? (
          <div className="px-3 py-8 text-center">
            <div className="w-4 h-4 border-2 border-border-strong border-t-transparent rounded-full animate-spin-slow mx-auto" />
          </div>
        ) : posts.length === 0 ? (
          <p className="px-3 py-8 text-[12px] text-text-quaternary text-center">
            No posts found.
          </p>
        ) : (
          posts.map((post) => {
            const isActive = location.pathname === `/post/${post.id}`;
            return (
              <Link
                key={post.id}
                to={`/post/${post.id}`}
                className={`block px-4 py-2.5 rounded-2xl mb-1 transition-all group ${
                  isActive
                    ? 'bg-accent text-white shadow-sm'
                    : 'hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <FileText
                    size={14}
                    className={`mt-0.5 flex-shrink-0 ${
                      isActive ? 'text-white/80' : 'text-text-quaternary group-hover:text-text-tertiary'
                    } transition-colors`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-[13px] font-semibold leading-tight truncate ${
                      isActive ? 'text-white' : 'text-text-primary'
                    }`}>
                      {post.title}
                    </p>
                    <p className="text-[11px] text-text-quaternary mt-0.5">
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
