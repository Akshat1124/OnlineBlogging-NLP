import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, FileText } from 'lucide-react';
import { Post } from '../store/blogStore';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { getSentimentConfig } from '../lib/utils';

interface PublicProfile {
  username: string;
  bio?: string;
  profilePicture?: string;
}

const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        const [profileRes, postsRes] = await Promise.all([
          api.get(`/users/profile/${username}`),
          api.get(`/users/posts/${username}`)
        ]);
        setProfile(profileRes.data);
        setPosts(postsRes.data);
      } catch (err) {
        console.error("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchUserAndPosts();
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin-slow" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card>
          <EmptyState
            title="User not found"
            description="This user doesn't seem to exist."
            action={
              <Link to="/" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline text-sm">
                Go back to feed
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto py-8 lg:py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to feed
        </Link>

        {/* Profile Card */}
        <Card padding="lg" className="text-center relative overflow-hidden mb-8 shadow-none border border-slate-200 dark:border-slate-700">
          <div className="absolute top-0 left-0 w-full h-24 bg-slate-50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700" />

          <div className="relative z-10">
            <Avatar
              name={profile.username}
              src={profile.profilePicture}
              size="xl"
              className="mx-auto mb-4 ring-4 ring-white dark:ring-slate-800 shadow-lg"
            />

            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              {profile.username}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {profile.bio || "This user hasn't written a bio yet."}
            </p>

            <div className="mt-4">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{posts.length}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">posts</span>
            </div>
          </div>
        </Card>

        <h2 className="text-lg font-bold mb-5 text-slate-900 dark:text-white flex items-center gap-2">
          <FileText size={18} />
          {profile.username}'s Posts
        </h2>

        {/* User's Posts Feed */}
        {posts.length === 0 ? (
          <Card>
            <EmptyState
              title="It's quiet here..."
              description="This user hasn't published any posts yet."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {posts.map((post) => {
              const sentimentConfig = getSentimentConfig(post.sentiment);
              const tagsArray = post.tags ? post.tags.split(',').filter(Boolean).slice(0, 3) : [];

              return (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="block group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={post.username || 'U'} size="sm" />
                    <div className="leading-tight">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">{post.username}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold tracking-tight leading-snug text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  {post.summary && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">{post.summary}</p>
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
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
