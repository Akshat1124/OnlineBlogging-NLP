import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import Avatar from './ui/Avatar';
import Button from './ui/Button';

interface Comment {
  id: number;
  content: string;
  user?: { username: string };
  sentimentLabel: string | null;
  createdAt: string;
}

interface CommentSectionProps {
  postId: number;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getSentimentStyle(label: string | null) {
  if (label === 'POSITIVE') return 'text-emerald-600';
  if (label === 'NEGATIVE') return 'text-red-600';
  return 'text-indigo-600';
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/comments/${postId}`);
        setComments(response.data || []);
      } catch {
        // Silently fail — comments are supplementary
      }
    };
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await api.post(`/comments/${postId}`, {
        content: newComment,
      });
      setComments((prev) => [response.data, ...prev]);
      setNewComment('');
    } catch {
      // Failed to post comment
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="comments-section">
      <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
        Discussion
        <span className="text-sm font-medium text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-lg">
          {comments.length}
        </span>
      </h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3 items-start">
            <Avatar name={user?.username || 'User'} size="sm" className="mt-1" />
            <div className="flex-1">
              <textarea
                id="comment-input"
                className="w-full bg-white border border-slate-200 px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none rounded-xl transition-all placeholder:text-slate-400"
                rows={3}
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="mt-3 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting || !newComment.trim()}
                  loading={submitting}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50 rounded-xl p-5 mb-8 text-center border border-slate-200">
          <p className="text-sm text-slate-500">
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Log in</Link> to join the discussion.
          </p>
        </div>
      )}

      <div className="space-y-5">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 animate-fade-in">
            <Avatar name={comment.user?.username || 'A'} size="sm" className="mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Link
                  to={`/u/${comment.user?.username || 'Anonymous'}`}
                  className="text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-colors"
                >
                  {comment.user?.username || 'Anonymous'}
                </Link>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-400">
                  {formatDate(comment.createdAt)}
                </span>
                {comment.sentimentLabel && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className={`text-xs font-medium ${getSentimentStyle(comment.sentimentLabel)}`}>
                      {comment.sentimentLabel.toLowerCase()}
                    </span>
                  </>
                )}
              </div>
              <div className="bg-slate-50 hover:bg-slate-100 transition-colors px-4 py-3 rounded-xl rounded-tl-sm text-sm text-slate-700 leading-relaxed border border-slate-100">
                {comment.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-10">
          No comments yet. Start the conversation!
        </p>
      )}
    </section>
  );
};

export default CommentSection;
