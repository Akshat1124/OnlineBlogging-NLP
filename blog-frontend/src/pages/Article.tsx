import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useBlogStore from '../store/blogStore';
import useAuthStore from '../store/authStore';
import CommentSection from '../components/CommentSection';
import AuthGuardModal from '../components/AuthGuardModal';
import { useAuthGuard } from '../lib/useAuthGuard';
import api from '../api/axios';
import { ArrowLeft, Heart, TrendingUp } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { SkeletonArticle } from '../components/ui/Skeleton';
import { formatDateLong, getSentimentConfig } from '../lib/utils';

const Article: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentPost, loading, fetchPostById } = useBlogStore();
  const { isAuthenticated } = useAuthStore();
  const { requireAuth, guardModalProps } = useAuthGuard();
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPostById(Number(id));
      fetchLikeCount();
    }
  }, [id]);

  const fetchLikeCount = async () => {
    try {
      const response = await api.get(`/posts/${id}/likeStatus`);
      setLikeCount(response.data.likesCount);
      if (isAuthenticated) {
         setLiked(response.data.liked);
      }
    } catch {
      // Likes are supplementary
    }
  };

  const handleLike = async () => {
    if (!requireAuth('like this post')) return;

    // Optimistic UI update
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const response = await api.post(`/posts/${id}/like`);
      // Update with server source of truth
      setLikeCount(response.data.likesCount);
      setLiked(response.data.liked);
    } catch {
      // Revert if error
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  if (loading || !currentPost) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <SkeletonArticle />
        </div>
      </div>
    );
  }

  const tagsArray = currentPost.tags
    ? currentPost.tags.split(',').filter(Boolean)
    : [];

  const sentimentConfig = getSentimentConfig(currentPost.sentiment);

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 lg:py-10">

        {/* Navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to feed
        </Link>

        {/* Main Article Card */}
        <Card padding="none" className="mb-8 overflow-hidden">
          <div className="p-6 sm:p-8 lg:p-10">
            <header className="mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight mb-6 text-slate-900 dark:text-white break-words">
                {currentPost.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4">
                <Link to={`/u/${currentPost.username}`} className="flex items-center gap-3 group/author">
                  <Avatar name={currentPost.username || 'U'} size="md" />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block group-hover/author:text-indigo-600 dark:group-hover/author:text-indigo-400 transition-colors">
                      {currentPost.username}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{formatDateLong(currentPost.createdAt)}</span>
                  </div>
                </Link>

                {currentPost.sentiment && (
                  <Badge
                    variant={currentPost.sentiment === 'POSITIVE' ? 'positive' : currentPost.sentiment === 'NEGATIVE' ? 'negative' : 'neutral'}
                    className="ml-auto"
                  >
                    <TrendingUp size={12} className="mr-1" />
                    {sentimentConfig.label}
                  </Badge>
                )}
              </div>
            </header>

            {/* AI Summary */}
            {currentPost.summary && (
              <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-5 mb-8 border border-indigo-100 dark:border-indigo-800/40 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-xl" />
                <p className="text-xs font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse-soft" />
                  AI Summary
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {currentPost.summary}
                </p>
              </div>
            )}

            {/* Tags */}
            {tagsArray.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-slate-100 dark:border-slate-700/50">
                {tagsArray.map((tag, i) => (
                  <Badge key={i} variant="indigo">
                    #{tag.trim()}
                  </Badge>
                ))}
              </div>
            )}

            {/* Article Content */}
            <article className="w-full overflow-hidden break-words mb-8">
              <div
                dangerouslySetInnerHTML={{ __html: currentPost.content }}
                className="prose max-w-none w-full break-words"
              />
            </article>

            {/* Like Section — uses auth guard for guests */}
            <div className="flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-700/50">
              <button
                id="like-button"
                onClick={handleLike}
                disabled={liked}
                className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 ${
                  liked
                    ? 'text-white bg-red-500 border border-red-500 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800'
                } disabled:cursor-default`}
              >
                <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                {liked ? 'Liked' : 'Like'}
              </button>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
              </span>
            </div>
          </div>
        </Card>

        {/* Comments */}
        <Card padding="lg" className="mb-10">
          <CommentSection postId={Number(id)} />
        </Card>

      </div>

      {/* Auth Guard Modal */}
      <AuthGuardModal {...guardModalProps} />
    </div>
  );
};

export default Article;
