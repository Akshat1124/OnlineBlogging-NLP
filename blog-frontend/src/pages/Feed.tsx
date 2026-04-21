import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useBlogStore from '../store/blogStore';
import { formatDistanceToNow } from 'date-fns';
import { Search, ChevronDown, Sparkles } from 'lucide-react';

const TOPICS = ['Design', 'Development', 'UX', 'Marketing', 'AI'];

const Feed: React.FC = () => {
  const { posts, loading, totalPages, fetchPosts } = useBlogStore();
  const [page, setPage] = useState(0);
  const [trending, setTrending] = useState<any[]>([]);

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  useEffect(() => {
    const fetchTrending = async () => {
       try {
          const response = await api.get('/posts/trending?limit=3');
          setTrending(response.data);
       } catch (err) {
          console.error("Failed to fetch trending posts");
       }
    };
    fetchTrending();
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-bg">
      <div className="max-w-[1080px] mx-auto px-6 py-10">
        
        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search Users (press enter)..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  window.location.href = `/u/${(e.target as HTMLInputElement).value}`;
                }
              }}
              className="w-full pl-10 pr-4 py-2 text-[14px] bg-white border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-accent-soft focus:border-accent transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            <span className="text-[13px] font-medium text-text-secondary whitespace-nowrap">My topics:</span>
            {TOPICS.map(topic => (
              <button key={topic} className="px-4 py-1.5 text-[12px] font-semibold text-text-primary bg-white border border-border rounded-full hover:bg-surface-hover shadow-sm transition-all whitespace-nowrap">
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* 2-column Main Layout */}
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Column: Articles */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-[22px] font-bold tracking-tight">Articles</h1>
              <button className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold border border-border rounded-full bg-white shadow-sm hover:bg-surface-hover transition-all">
                Following <ChevronDown size={14} />
              </button>
            </div>

            {loading ? (
              <div className="py-16 flex justify-center">
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin-slow" />
              </div>
            ) : posts.length === 0 ? (
              <p className="py-16 text-center text-text-quaternary text-sm">
                No posts yet. Be the first to write something.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/post/${post.id}`}
                    className="block group bg-surface rounded-[28px] border border-border p-6 shadow-sm hover:shadow-md hover:border-accent/40 transition-all relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-[12px] font-bold shadow-sm">
                        {post.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="leading-tight">
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/u/${post.username}`; }}
                          className="text-[14px] font-bold text-text-primary block hover:underline text-left"
                        >
                          {post.username}
                        </button>
                        <span className="text-[11px] text-text-tertiary font-medium">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-[20px] font-bold tracking-tight leading-snug text-text-primary group-hover:text-accent transition-colors mb-2 truncate whitespace-normal line-clamp-2">
                          {post.title}
                        </h2>
                        {post.summary && (
                          <p className="text-[14px] text-text-secondary leading-relaxed line-clamp-2 mb-4">
                            {post.summary}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-auto pt-2 flex-wrap">
                          {post.tags && post.tags.split(',').filter(Boolean).slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-bold px-3 py-1 bg-surface-hover hover:bg-surface-active text-text-secondary rounded-lg border border-border transition-colors cursor-default"
                            >
                              #{tag.trim()}
                            </span>
                          ))}
                          {post.sentiment && (
                            <span className={`text-[11px] font-bold px-3 py-1 rounded-lg border ${
                               post.sentiment === 'POSITIVE' ? 'bg-positive-bg text-positive border-positive/20' :
                               post.sentiment === 'NEGATIVE' ? 'bg-negative-bg text-negative border-negative/20' :
                               'bg-neutral-tag-bg text-neutral-tag border-neutral-tag/20'
                            }`}>
                              {post.sentiment}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Optional right-side graphic placeholder replacing with abstract preview container */}
                      <div className="hidden sm:flex w-[160px] h-[120px] rounded-2xl bg-surface-hover bg-opacity-50 overflow-hidden shadow-inner border border-border flex-shrink-0 relative group-hover:shadow-sm transition-all items-center justify-center">
                         <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent z-0"></div>
                         <span className="text-text-tertiary font-bold tracking-widest text-[10px] uppercase z-10 group-hover:text-accent/50 transition-colors">Preview</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-12 pt-6 border-t border-border">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="text-[13px] font-semibold text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors px-4 py-2 border border-border rounded-full hover:bg-surface shadow-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="text-[13px] font-semibold text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors px-4 py-2 border border-border rounded-full hover:bg-surface shadow-sm"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar recommendations */}
          <div className="w-full lg:w-[320px] flex-shrink-0 space-y-10">
            {/* Promo Card */}
            <div className="bg-surface rounded-[24px] p-6 shadow-sm border border-border text-center">
              <h3 className="text-[16px] font-bold leading-tight mb-2">Get accurate insights instantly</h3>
              <p className="text-[13px] text-text-secondary mb-5">Analyze your grammar and sentiment effortlessly.</p>
              <Link to="/write" className="inline-block text-[13px] font-bold text-white bg-accent hover:bg-accent-hover px-5 py-2.5 rounded-full shadow-sm transition-all">
                Start Writing
              </Link>
            </div>

            {/* Trending Stories */}
            <div>
              <h3 className="text-[15px] font-bold mb-5 flex items-center gap-2">
                 <Sparkles size={16} className="text-accent" />
                 Trending Stories
              </h3>
              <div className="space-y-5">
                {trending.length > 0 ? trending.map((post) => (
                  <Link 
                    key={post.id} 
                    to={`/post/${post.id}`} 
                    className="block group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent text-white flex-shrink-0 flex items-center justify-center font-bold text-[11px] shadow-sm">
                        {post.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug mb-1">
                           {post.title}
                        </p>
                        <div className="flex items-center gap-2">
                           <span className="text-[11px] font-medium text-text-tertiary">by {post.username}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <p className="text-[12px] text-text-quaternary text-center py-4">Finding trending stories...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
