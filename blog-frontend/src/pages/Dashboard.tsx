import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import BlogCard, { Post } from '../components/BlogCard';
import { Search, TrendingUp, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPosts = async (keyword = '') => {
    setLoading(true);
    try {
      const url = keyword ? `/posts/search?keyword=${keyword}` : '/posts';
      const response = await api.get(url);
      setPosts(response.data);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts(search);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold font-display">Discover Insights</h1>
            
            <form onSubmit={handleSearch} className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search blogs or tags..."
                className="input-field pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            </form>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card h-64 animate-pulse bg-slate-800/50" />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass rounded-3xl">
              <p className="text-slate-400 text-lg">No posts found. Be the first to write one!</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 sticky top-24">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="text-indigo-400" size={20} />
              <h2 className="text-lg font-bold">Trending Topics</h2>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {['AI', 'Technology', 'Future', 'NLP', 'MachineLearning', 'Web3', 'Design'].map((tag) => (
                <button 
                  key={tag}
                  onClick={() => { setSearch(tag); fetchPosts(tag); }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/20 hover:text-indigo-400 border border-slate-700 transition-all text-sm"
                >
                  #{tag}
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="text-indigo-400" size={20} />
                <h2 className="text-lg font-bold">Filter by Sentiment</h2>
              </div>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-sm flex justify-between items-center">
                  <span>😊 Positive</span>
                  <span className="text-slate-500">12</span>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-sm flex justify-between items-center">
                  <span>😐 Neutral</span>
                  <span className="text-slate-500">5</span>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-sm flex justify-between items-center">
                  <span>😟 Negative</span>
                  <span className="text-slate-500">2</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
