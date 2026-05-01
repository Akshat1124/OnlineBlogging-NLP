import React from 'react';
import { FileX2 } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-5 text-slate-400 dark:text-slate-500">
        {icon || <FileX2 size={28} />}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5">{description}</p>
      )}
      {action}
    </div>
  );
};

export default EmptyState;
