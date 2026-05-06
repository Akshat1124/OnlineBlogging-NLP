import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import { Post } from '../store/blogStore';
import { Mail, Calendar, Grid, MessageSquare, PenSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { SkeletonCard } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { getSentimentConfig } from '../lib/utils';

const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'published' | 'comments'>('published');
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const postsRes = await api.get('/users/me/posts');
        setPosts(postsRes.data);
        const commentsRes = await api.get('/users/me/comments');
        setComments(commentsRes.data);
      } catch (error) {
        // Failed to load data
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 lg:py-10">
        {/* Profile Header */}
        <Card padding="lg" className="mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-slate-50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10 pt-4">
            <Avatar name={user?.username || 'User'} size="xl" className="ring-4 ring-white dark:ring-slate-800 shadow-lg" />

            <div className="flex-1 text-center md:text-left space-y-3">
              <div>
                <h1 id="profile-heading" className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                  {user?.username}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400">
                  {user?.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail size={14} />
                      <span>{user.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>Member</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-2">
                <div className="text-center md:text-left">
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white">{posts.length}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Posts</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white">{comments.length}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Comments</p>
                </div>
              </div>
            </div>

            <Link to="/write">
              <Button variant="secondary" icon={<PenSquare size={15} />}>
                New Post
              </Button>
            </Link>
          </div>
        </Card>

        {/* Tabs */}
        <div className="space-y-6">
          <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('published')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'published'
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Grid size={16} />
              Published
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'comments'
                  ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <MessageSquare size={16} />
              Comments
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : activeTab === 'published' ? (
            posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {posts.map(post => (
                  <ProfilePostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <Card>
                <EmptyState
                  title="No posts yet"
                  description="Start writing to see your posts here."
                  action={
                    <Link to="/write">
                      <Button icon={<PenSquare size={15} />}>Write Your First Post</Button>
                    </Link>
                  }
                />
              </Card>
            )
          ) : (
            comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map(comment => (
                  <ProfileCommentCard key={comment.id} comment={comment} />
                ))}
              </div>
            ) : (
              <Card>
                <EmptyState
                  title="No comments yet"
                  description="Engage with others by leaving a comment on a post."
                />
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Profile Post Card ───────────────────────────────────────── */
function ProfilePostCard({ post }: { post: Post }) {
  const sentimentConfig = getSentimentConfig(post.sentiment);
  const tagsArray = post.tags ? post.tags.split(',').filter(Boolean).slice(0, 3) : [];

  return (
    <Link
      to={`/post/${post.id}`}
      className="block group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300"
    >
      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2 line-clamp-2 leading-snug">
        {post.title}
      </h3>
      {post.summary && (
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">{post.summary}</p>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        {tagsArray.map((tag, i) => (
          <Badge key={i} variant="outline">#{tag.trim()}</Badge>
        ))}
        {post.sentiment && (
          <Badge variant={post.sentiment === 'POSITIVE' ? 'positive' : post.sentiment === 'NEGATIVE' ? 'negative' : 'neutral'}>
            {sentimentConfig.label}
          </Badge>
        )}
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
      </p>
    </Link>
  );
}

/* ─── Profile Comment Card ────────────────────────────────────── */
function ProfileCommentCard({ comment }: { comment: any }) {
  const sentimentConfig = getSentimentConfig(comment.sentimentLabel);

  return (
    <Card padding="md" className="group hover:border-slate-300 dark:hover:border-slate-600 transition-all">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500 dark:text-slate-400">
          <MessageSquare size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
            {comment.content}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {comment.sentimentLabel && (
              <Badge variant={comment.sentimentLabel === 'POSITIVE' ? 'positive' : comment.sentimentLabel === 'NEGATIVE' ? 'negative' : 'neutral'}>
                {sentimentConfig.label} Sentiment
              </Badge>
            )}
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default Profile;
