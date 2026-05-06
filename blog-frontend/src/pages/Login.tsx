import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { BookOpen, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!username || !password) {
        toast.error("Please fill in both fields");
        setLoading(false);
        return;
    }

    try {
      await login(username, password);
      toast.success('Welcome back');
      navigate('/');
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 401 || error.response?.status === 400) {
          toast.error(error.response?.data?.message || "Invalid username or password");
      } else {
          toast.error(error.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-white dark:bg-slate-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400">
            <BookOpen size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            Welcome back
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Enter your details to sign in to your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Username"
            type="text"
            required
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            className="w-full py-3 mt-4"
            icon={!loading ? <ArrowRight size={18} /> : undefined}
          >
            Sign In
          </Button>
        </form>

        <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-slate-900 dark:text-white font-semibold hover:underline decoration-slate-300 dark:decoration-slate-600 underline-offset-4">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
