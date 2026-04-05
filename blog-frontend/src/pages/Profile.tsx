import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import BlogCard, { Post } from '../components/BlogCard';
import { User, Mail, Calendar, Edit3, Grid, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'published' | 'liked'>('published');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      setLoading(true);
      try {
        const response = await api.get('/users/me/posts');
        setPosts(response.data);
      } catch (error) {
        toast.error('Failed to load your posts');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <div className="glass p-8 rounded-3xl mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-3xl -mr-32 -mt-32 rounded-full" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold shadow-2xl shadow-indigo-500/20">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 font-display">{user?.username}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400">
                <div className="flex items-center space-x-1">
                  <Mail size={16} />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>Joined April 2026</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4">
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold text-white">{posts.length}</p>
                <p className="text-sm text-slate-500 uppercase tracking-wider">Posts</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold text-white">1.2k</p>
                <p className="text-sm text-slate-500 uppercase tracking-wider">Views</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-2xl font-bold text-white">45</p>
                <p className="text-sm text-slate-500 uppercase tracking-wider">Likes</p>
              </div>
            </div>
          </div>
          
          <button className="btn-primary flex items-center space-x-2 px-6">
            <Edit3 size={18} />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-8">
        <div className="flex space-x-8 border-b border-slate-800">
          <button 
            onClick={() => setActiveTab('published')}
            className={`pb-4 text-lg font-bold transition-all relative ${activeTab === 'published' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <div className="flex items-center space-x-2">
              <Grid size={20} />
              <span>Published Blogs</span>
            </div>
            {activeTab === 'published' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-400 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('liked')}
            className={`pb-4 text-lg font-bold transition-all relative ${activeTab === 'liked' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <div className="flex items-center space-x-2">
              <Heart size={20} />
              <span>Liked Blogs</span>
            </div>
            {activeTab === 'liked' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-400 rounded-full" />}
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="glass-card h-64 animate-pulse bg-slate-800/50" />)}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => <BlogCard key={post.id} post={post} />)}
          </div>
        ) : (
          <div className="text-center py-20 glass rounded-3xl">
            <p className="text-slate-400">No posts found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
