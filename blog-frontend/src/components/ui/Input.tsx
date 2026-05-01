import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-xl border bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200',
              'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
              'disabled:bg-slate-50 dark:disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed',
              error && 'border-red-400 focus:ring-red-500/20 focus:border-red-500',
              icon && 'pl-10',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
