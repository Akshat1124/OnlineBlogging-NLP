import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import useBlogStore, { Post } from '../store/blogStore';
import { formatDistanceToNow } from 'date-fns';
import { ChevronLeft, ChevronRight, BookOpen, TrendingUp, PenSquare } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { SkeletonCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { cn, getSentimentConfig } from '../lib/utils';

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
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-10">

        {/* 2-column Main Layout */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">

          {/* Left Column: Articles */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 id="feed-heading" className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Latest Articles
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Discover AI-analyzed stories from our community.</p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-5">
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : posts.length === 0 ? (
              <Card>
                <EmptyState
                  title="No posts yet"
                  description="Be the first to write something amazing."
                  action={
                    <Link to="/write">
                      <Button icon={<PenSquare size={15} />}>Start Writing</Button>
                    </Link>
                  }
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {posts.map((post) => (
                  <FeedCard key={post.id} post={post} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  icon={<ChevronLeft size={15} />}
                >
                  Previous
                </Button>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Next
                  <ChevronRight size={15} />
                </Button>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar recommendations */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-8">
            {/* CTA Card */}
            <Card className="text-center bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-none">
              <div className="w-12 h-12 mx-auto mb-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl flex items-center justify-center shadow-xs">
                <BookOpen size={22} className="text-slate-700 dark:text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Get AI-Powered Insights</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                Analyze grammar, sentiment, and spam detection as you write.
              </p>
              <Link to="/write">
                <Button size="md" className="w-full">Start Writing</Button>
              </Link>
            </Card>

            {/* Trending Stories */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <TrendingUp size={16} className="text-indigo-600 dark:text-indigo-400" />
                 Trending Stories
              </h3>
              <div className="space-y-4">
                {trending.length > 0 ? trending.map((post, idx) => (
                  <Link
                    key={post.id}
                    to={`/post/${post.id}`}
                    className="flex items-start gap-3 group"
                  >
                    <span className="text-2xl font-extrabold text-slate-200 dark:text-slate-700 leading-none w-7 shrink-0 group-hover:text-indigo-300 dark:group-hover:text-indigo-500 transition-colors">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug mb-1">
                         {post.title}
                      </p>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">by {post.username}</span>
                    </div>
                  </Link>
                )) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">Finding trending stories...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Feed Post Card ──────────────────────────────────────────── */
function FeedCard({ post }: { post: Post }) {
  const sentimentConfig = getSentimentConfig(post.sentiment);
  const tagsArray = post.tags ? post.tags.split(',').filter(Boolean).slice(0, 3) : [];

  return (
    <Link
      to={`/post/${post.id}`}
      className="block group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-4">
        <Avatar name={post.username || 'U'} size="sm" />
        <div className="leading-tight min-w-0">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/u/${post.username}`; }}
            className="text-sm font-semibold text-slate-800 dark:text-slate-200 block hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition-colors truncate"
          >
            {post.username}
          </button>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      <h2 className="text-lg font-bold tracking-tight leading-snug text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2 line-clamp-2">
        {post.title}
      </h2>

      {post.summary && (
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">
          {post.summary}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {tagsArray.map((tag, i) => (
          <Badge key={i} variant="outline">
            #{tag.trim()}
          </Badge>
        ))}
        {post.sentiment && (
          <Badge variant={post.sentiment === 'POSITIVE' ? 'positive' : post.sentiment === 'NEGATIVE' ? 'negative' : 'neutral'}>
            {sentimentConfig.label}
          </Badge>
        )}
      </div>
    </Link>
  );
}

export default Feed;
