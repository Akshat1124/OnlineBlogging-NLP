import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const Card: React.FC<CardProps> = ({ children, className, padding = 'md', hover = false }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs',
        paddingStyles[padding],
        hover && 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
