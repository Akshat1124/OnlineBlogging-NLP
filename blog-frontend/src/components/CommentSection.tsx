import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

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

  const getSentimentColor = (label: string | null) => {
    if (label === 'POSITIVE') return 'text-positive';
    if (label === 'NEGATIVE') return 'text-negative';
    return 'text-neutral-tag';
  };

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-[14px] font-bold tracking-tight mb-6">
        Discussion
        <span className="font-medium text-text-quaternary ml-2">
          {comments.length}
        </span>
      </h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-10 block">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-accent text-white flex-shrink-0 flex items-center justify-center text-[11px] font-bold mt-1">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <textarea
                className="w-full bg-surface border border-border px-4 py-3 text-[13px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none rounded-xl transition-all"
                rows={3}
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="text-[12px] font-bold tracking-wide uppercase bg-accent text-white px-5 py-2 rounded-lg hover:bg-accent-hover disabled:opacity-30 transition-colors"
                >
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-surface rounded-xl p-4 mb-8 text-center border border-border">
          <p className="text-[13px] text-text-tertiary">
            Log in to join the discussion.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-active text-text-secondary flex-shrink-0 flex items-center justify-center text-[11px] font-bold mt-1">
              {(comment.user?.username || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Link to={`/u/${comment.user?.username || 'Anonymous'}`} className="text-[13px] font-bold text-text-primary hover:underline">
                  {comment.user?.username || 'Anonymous'}
                </Link>
                <span className="text-text-quaternary text-[11px]">·</span>
                <span className="text-text-quaternary text-[12px]">
                  {formatDate(comment.createdAt)}
                </span>
                {comment.sentimentLabel && (
                  <>
                    <span className="text-text-quaternary text-[11px]">·</span>
                    <span className={`text-[12px] font-medium ${getSentimentColor(comment.sentimentLabel)}`}>
                      {comment.sentimentLabel.toLowerCase()}
                    </span>
                  </>
                )}
              </div>
              <p className="text-[14px] text-text-secondary leading-relaxed bg-surface hover:bg-surface-hover transition-colors px-4 py-3 rounded-tr-lg rounded-bl-lg rounded-br-3xl border border-transparent hover:border-border">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-[13px] text-text-tertiary text-center py-10">
          No comments yet. Start the conversation!
        </p>
      )}
    </section>
  );
};

export default CommentSection;
