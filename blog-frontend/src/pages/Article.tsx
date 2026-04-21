import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useBlogStore from '../store/blogStore';
import useAuthStore from '../store/authStore';
import CommentSection from '../components/CommentSection';
import api from '../api/axios';
import { ArrowLeft, Heart, Sparkles } from 'lucide-react';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const Article: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentPost, loading, fetchPostById } = useBlogStore();
  const { isAuthenticated } = useAuthStore();
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
    if (!isAuthenticated) return;
    
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
      <div className="h-full overflow-y-auto bg-bg p-6">
        <div className="max-w-[800px] mx-auto bg-surface rounded-3xl p-8 border border-border shadow-sm animate-pulse">
          <div className="h-10 w-3/4 bg-surface-hover rounded-xl mb-6" />
          <div className="flex gap-4 mb-10">
             <div className="h-10 w-10 bg-surface-hover rounded-full" />
             <div className="space-y-2 flex-1">
                <div className="h-4 w-1/4 bg-surface-hover rounded" />
                <div className="h-3 w-1/3 bg-surface-hover rounded" />
             </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 w-full bg-surface-hover rounded" />
            <div className="h-4 w-full bg-surface-hover rounded" />
            <div className="h-4 w-5/6 bg-surface-hover rounded" />
            <div className="h-4 w-4/6 bg-surface-hover rounded" />
          </div>
        </div>
      </div>
    );
  }

  const tagsArray = currentPost.tags
    ? currentPost.tags.split(',').filter(Boolean)
    : [];

  const sentimentColor =
    currentPost.sentiment === 'POSITIVE' ? 'text-positive bg-positive-bg border-positive/20' :
    currentPost.sentiment === 'NEGATIVE' ? 'text-negative bg-negative-bg border-negative/20' :
    'text-neutral-tag bg-neutral-tag-bg border-neutral-tag/20';

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-bg">
      <div className="max-w-[840px] mx-auto px-4 md:px-6 py-10">
        
        {/* Navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-text-tertiary hover:text-text-primary transition-all mb-6 ml-2 bg-white px-4 py-2 rounded-full border border-border shadow-sm hover:shadow-md"
        >
          <ArrowLeft size={16} />
          Back to feed
        </Link>

        {/* Main Article Card */}
        <div className="bg-surface rounded-[32px] border border-border shadow-sm p-6 md:p-12 mb-8 overflow-hidden w-full relative">
          
          <header className="mb-10 w-full">
            <h1 className="text-[32px] md:text-[42px] font-extrabold tracking-tight leading-tight mb-6 break-words text-text-primary">
              {currentPost.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-[13px] text-text-tertiary font-medium">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-[16px] font-bold shadow-md">
                  {currentPost.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <Link to={`/u/${currentPost.username}`} className="text-text-primary font-bold block hover:underline">{currentPost.username}</Link>
                  <span className="text-[12px]">{formatDate(currentPost.createdAt)}</span>
                </div>
              </div>
              
              {currentPost.sentiment && (
                <div className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${sentimentColor} font-bold text-[12px]`}>
                  <Sparkles size={14} />
                  {currentPost.sentiment}
                </div>
              )}
            </div>
          </header>

          {/* AI Summary Card (nested) */}
          {currentPost.summary && (
            <div className="bg-accent-soft/40 rounded-[20px] p-6 mb-10 border border-accent/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-accent/60 rounded-l-full"></div>
              <p className="text-[12px] font-extrabold tracking-widest uppercase text-accent mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 animate-pulse" />
                AI Summary
              </p>
              <p className="text-[15px] text-text-primary font-medium leading-relaxed">
                {currentPost.summary}
              </p>
            </div>
          )}

          {/* Keywords as Pills */}
          {tagsArray.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10 border-b border-border pb-8">
              {tagsArray.map((tag, i) => (
                <span
                  key={i}
                  className="text-[13px] font-semibold px-4 py-1.5 bg-surface-hover text-text-secondary rounded-full border border-border hover:border-accent/40 transition-colors shadow-sm cursor-default"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Article Content */}
          <article className="w-full overflow-hidden break-words mb-12">
            <div
              dangerouslySetInnerHTML={{ __html: currentPost.content }}
              className="prose max-w-none w-full break-words"
            />
          </article>

          {/* Like Button */}
          <div className="flex items-center gap-4 pt-6 border-t border-border">
            {isAuthenticated ? (
              <button
                onClick={handleLike}
                disabled={liked}
                className={`flex items-center gap-2 text-[14px] font-bold px-6 py-3 rounded-xl transition-all shadow-sm ${
                  liked
                    ? 'text-white bg-negative border border-negative'
                    : 'text-text-secondary bg-surface-hover border border-border hover:text-negative hover:bg-negative-bg hover:border-negative/30'
                } disabled:cursor-default`}
              >
                <Heart size={18} fill={liked ? 'currentColor' : 'none'} className={liked ? 'animate-bounce' : ''} />
                {liked ? 'Liked' : 'Like'}
              </button>
            ) : (
              <div className="px-6 py-3 rounded-xl bg-surface-hover border border-border text-[14px] text-text-secondary font-medium">
                Log in to like
              </div>
            )}
            <span className="text-[14px] font-bold text-text-tertiary bg-surface-hover px-4 py-3 rounded-xl border border-border">
              {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
            </span>
          </div>
        </div>

        {/* Comments wrapped in a Card */}
        <div className="bg-surface rounded-[32px] border border-border shadow-sm p-6 md:p-10 mb-10">
          <CommentSection postId={Number(id)} />
        </div>
        
      </div>
    </div>
  );
};

export default Article;
