import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700',
        className
      )}
    />
  );
};

/* Pre-composed skeleton variants */

export const SkeletonCard: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-6 w-16 rounded-lg" />
      <Skeleton className="h-6 w-20 rounded-lg" />
    </div>
  </div>
);

export const SkeletonArticle: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 md:p-12 space-y-6">
    <Skeleton className="h-10 w-3/4" />
    <div className="flex gap-4">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-36" />
      </div>
    </div>
    <div className="space-y-3 pt-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  </div>
);

export default Skeleton;
