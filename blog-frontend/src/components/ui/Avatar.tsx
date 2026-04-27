import React from 'react';
import { cn, getInitials } from '../../lib/utils';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-24 h-24 text-3xl',
};

/* Deterministic accent based on first char */
const colorPalette = [
  'bg-indigo-600',
  'bg-violet-600',
  'bg-blue-600',
  'bg-teal-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-cyan-600',
];

function getAvatarColor(name: string): string {
  const code = name.charCodeAt(0) || 0;
  return colorPalette[code % colorPalette.length];
}

const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'sm', className }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover ring-2 ring-white shadow-sm',
          sizeStyles[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white shadow-sm',
        sizeStyles[size],
        getAvatarColor(name),
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
