import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, Sparkles, User } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Quick validation
    if (!username || !password) {
        toast.error("Please fill in both fields");
        setLoading(false);
        return;
    }

    try {
      // 1. Get token (Backend returns just the token string)
      const response = await api.post('/auth/login', { username, password });
      const token = response.data;
      
      // 2. Fetch user profile with this token
      const userResponse = await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
      });
      const user = userResponse.data;
      
      // 3. Complete login via Context
      login(token, user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 401) {
          toast.error("Invalid username or password");
      } else {
          toast.error(error.response?.data?.message || 'Login failed! Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    toast.success('Browsing as Demo User');
    navigate('/');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 glass rounded-3xl overflow-hidden shadow-2xl">
        {/* Left Side - Hero */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-white blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-8">
              <Sparkles className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold mb-6 font-display">Online Blogging via NLP</h1>
            <p className="text-indigo-100 text-lg leading-relaxed">
              Unlock AI-Powered Insights. Join our community of forward-thinking writers. Analyze your content, detect spam, and optimize your reach.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-slate-900/50">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400">Sign in to continue your writing journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Username</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2 py-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleGuestLogin}
                className="w-full py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium flex items-center justify-center space-x-2"
              >
                <User size={18} />
                <span>Continue as Guest (Demo)</span>
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
