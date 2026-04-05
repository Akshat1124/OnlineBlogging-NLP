import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/axios';
import { Post } from '../components/BlogCard';
import { formatDate } from '../lib/utils';
import Badge from '../components/Badge';
import { Heart, MessageSquare, User, Calendar, Quote, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface Comment {
  id: string;
  content: string;
  user?: {
    username: string;
  };
  author?: {
    username: string;
  };
  createdAt: string;
  sentimentLabel?: string;
  sentiment?: any;
}

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchPost = async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        api.get(`/posts/${id}`),
        api.get(`/comments/${id}`)
      ]);
      setPost(postRes.data);
      setComments(commentsRes.data || []);
    } catch (error) {
      toast.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!isAuthenticated) return toast.error('Please login to like');
    try {
      await api.post(`/likes/${id}`);
      setPost(prev => prev ? { ...prev, likesCount: (prev.likesCount || 0) + 1 } : null);
      toast.success('Liked!');
    } catch (error) {
      toast.error('Already liked or failed');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const response = await api.post(`/comments/${id}`, { content: newComment });
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="h-12 w-3/4 bg-slate-800 animate-pulse rounded mb-8" />
      <div className="h-64 w-full bg-slate-800 animate-pulse rounded-2xl mb-8" />
      <div className="space-y-4">
        <div className="h-4 w-full bg-slate-800 animate-pulse rounded" />
        <div className="h-4 w-full bg-slate-800 animate-pulse rounded" />
        <div className="h-4 w-2/3 bg-slate-800 animate-pulse rounded" />
      </div>
    </div>
  );

  if (!post) return <div className="text-center py-20">Post not found</div>;

  // Safe Extraction Logic
  const authorName = post.username || post.author?.username || 'Unknown Author';
  
  const sentimentScore = typeof post.sentiment === 'string' ? post.sentiment : post.sentiment?.label;
  const sentimentVariant = sentimentScore === 'POSITIVE' ? 'positive' : sentimentScore === 'NEGATIVE' ? 'negative' : 'neutral';
  const emoji = typeof post.sentiment === 'object' && post.sentiment?.emoji ? post.sentiment.emoji :
    (sentimentScore === 'POSITIVE' ? '😊' : sentimentScore === 'NEGATIVE' ? '😟' : '😐');

  const tagsArray = typeof post.tags === 'string' ? post.tags.split(',').filter(Boolean) : (post.tags || []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-12">
        <div className="flex flex-wrap gap-2 mb-6">
          {tagsArray.map((tag, i) => <Badge key={i} variant="indigo">#{tag.trim()}</Badge>)}
          <Badge variant={sentimentVariant}>
            {emoji} {sentimentScore}
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-8 font-display leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center justify-between border-y border-slate-800 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold">
              {authorName[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-bold text-lg">{authorName}</p>
              <div className="flex items-center text-slate-400 text-sm space-x-2">
                <Calendar size={14} />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              onClick={handleLike}
              className="flex items-center space-x-2 group"
            >
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-all">
                <Heart size={20} className="text-rose-500" />
              </div>
              <span className="font-bold text-lg">{post.likesCount || 0}</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <MessageSquare size={20} className="text-indigo-400" />
              </div>
              <span className="font-bold text-lg">{comments.length}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="glass p-6 rounded-2xl mb-12 border-l-4 border-indigo-500">
        <div className="flex items-center space-x-2 mb-3 text-indigo-400 font-bold">
          <Sparkles size={18} />
          <span>AI Summary (TL;DR)</span>
        </div>
        <p className="text-indigo-100/80 leading-relaxed italic">
          {post.summary || "No summary generated."}
        </p>
      </div>

      <article className="prose prose-invert prose-indigo max-w-none mb-16">
        <div dangerouslySetInnerHTML={{ __html: post.content }} className="text-lg leading-relaxed text-slate-300" />
      </article>

      <section className="border-t border-slate-800 pt-12">
        <h2 className="text-2xl font-bold mb-8 flex items-center space-x-3">
          <MessageSquare className="text-indigo-400" />
          <span>Comments ({comments.length})</span>
        </h2>

        {isAuthenticated ? (
          <form onSubmit={handleComment} className="mb-12 space-y-4">
            <textarea
              className="input-field min-h-[120px] resize-none"
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="btn-primary flex items-center space-x-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                <span>Post Comment</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="glass p-8 rounded-2xl text-center mb-12">
            <p className="text-slate-400 mb-4">Please login to join the conversation.</p>
            <Link to="/login" className="btn-primary inline-block">Login to Comment</Link>
          </div>
        )}

        <div className="space-y-6">
          {comments.map((comment) => {
            const commentAuthor = comment.user?.username || comment.author?.username || 'Unknown';
            const commentSentLabel = comment.sentimentLabel || comment.sentiment?.label || 'NEUTRAL';
            const commentSentEmoji = comment.sentiment?.emoji || (commentSentLabel === 'POSITIVE' ? '😊' : commentSentLabel === 'NEGATIVE' ? '😟' : '😐');

            return (
              <div key={comment.id} className="glass p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                      {commentAuthor[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">{commentAuthor}</span>
                        <Badge variant={commentSentLabel === 'POSITIVE' ? 'positive' : commentSentLabel === 'NEGATIVE' ? 'negative' : 'neutral'}>
                          {commentSentEmoji}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            );
          })}

          {comments.length === 0 && (
            <p className="text-center text-slate-500 py-8">No comments yet. Start the discussion!</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default PostDetail;
