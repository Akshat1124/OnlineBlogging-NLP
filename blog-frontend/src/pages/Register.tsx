import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { BookOpen, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(username, email, password);
      toast.success('Registration successful. Please sign in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
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
            Create an account
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Start writing with AI-powered insights today.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Username"
            type="text"
            required
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            className="w-full py-3 mt-4"
            icon={!loading ? <ArrowRight size={18} /> : undefined}
          >
            Create Account
          </Button>
        </form>

        <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-slate-900 dark:text-white font-semibold hover:underline decoration-slate-300 dark:decoration-slate-600 underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
