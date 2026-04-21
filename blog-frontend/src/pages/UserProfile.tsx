import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Sparkles, FileText } from 'lucide-react';
import { Post } from '../store/blogStore';

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
        <div className="w-8 h-8 flex items-center justify-center border-4 border-accent border-t-transparent rounded-full animate-spin-slow"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 px-6">
        <h2 className="text-xl font-bold mb-2">User not found</h2>
        <Link to="/" className="text-accent underline">Go back to feed</Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-bg py-12 px-4 md:px-6">
      <div className="max-w-[720px] mx-auto mb-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-text-tertiary hover:text-text-primary transition-all mb-6 bg-white px-4 py-2 rounded-full border border-border shadow-sm hover:shadow-md w-max"
        >
          <ArrowLeft size={16} />
          Back to feed
        </Link>

        {/* Profile Card */}
        <div className="bg-surface rounded-3xl border border-border shadow-sm p-8 text-center relative overflow-hidden mb-10">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-accent-soft to-border/50"></div>
          
          <div className="w-28 h-28 mx-auto rounded-full bg-accent text-white flex items-center justify-center text-3xl font-bold border-4 border-surface shadow-md relative z-10 mb-4 bg-surface-active overflow-hidden">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              profile.username.charAt(0).toUpperCase()
            )}
          </div>
          
          <h1 className="text-2xl font-extrabold text-text-primary mb-2 relative z-10">
            {profile.username}
          </h1>
          <p className="text-[15px] text-text-secondary max-w-md mx-auto leading-relaxed relative z-10">
            {profile.bio || "This user hasn't written a bio yet."}
          </p>
        </div>

        <h2 className="text-xl font-bold mb-6 text-text-primary flex items-center gap-2">
          <FileText size={20} />
          {profile.username}'s Blog Posts
        </h2>

        {/* User's Posts Feed */}
        {posts.length === 0 ? (
          <div className="text-center bg-surface border border-border rounded-xl p-10 text-text-tertiary">
            It's quiet here... No posts yet.
          </div>
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
                    <span className="text-[14px] font-bold text-text-primary block">{post.username}</span>
                    <span className="text-[11px] text-text-tertiary font-medium">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[20px] font-bold tracking-tight leading-snug text-text-primary group-hover:text-accent transition-colors mb-2 truncate whitespace-normal line-clamp-2">
                      {post.title}
                    </h3>
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
