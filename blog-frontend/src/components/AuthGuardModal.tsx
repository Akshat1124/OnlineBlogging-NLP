import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, X, Shield } from 'lucide-react';
import Button from './ui/Button';

interface AuthGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  action?: string;
}

const AuthGuardModal: React.FC<AuthGuardModalProps> = ({ isOpen, onClose, action }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-sm w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X size={16} />
          </button>

          <div className="w-14 h-14 mx-auto mb-4 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center">
            <Shield size={28} className="text-indigo-600 dark:text-indigo-400" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
            Login Required
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {action
              ? `You need to sign in to ${action}.`
              : 'Sign in or create an account to continue.'}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-3">
          <Link to="/login" onClick={onClose} className="block">
            <Button className="w-full" icon={<LogIn size={16} />}>
              Sign In
            </Button>
          </Link>
          <Link to="/register" onClick={onClose} className="block">
            <Button variant="secondary" className="w-full" icon={<UserPlus size={16} />}>
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthGuardModal;
