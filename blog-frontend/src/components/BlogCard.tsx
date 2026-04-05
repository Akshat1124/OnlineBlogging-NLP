import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import Badge from './Badge';
import { MessageSquare, Heart, User } from 'lucide-react';

export interface Post {
  id: string;
  title: string;
  summary: string;
  content: string;
  username?: string; // from backed
  author?: {         // fallback for mocks
    username: string;
  };
  createdAt: string;
  tags?: string | string[]; // Backend sends a flattened string like "tag1,tag2"
  sentiment: any; // Backend sends a string ("POSITIVE") instead of object
  likesCount?: number;
}

interface BlogCardProps {
  post: Post;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  // Graceful handling of backend schema vs mocked frontend schema
  const sentimentScore = typeof post.sentiment === 'string' ? post.sentiment : post.sentiment?.label;
  const sentimentVariant = sentimentScore === 'POSITIVE' ? 'positive' : sentimentScore === 'NEGATIVE' ? 'negative' : 'neutral';
  
  // Safe extraction of emoji
  const emoji = typeof post.sentiment === 'object' && post.sentiment?.emoji ? post.sentiment.emoji :
    (sentimentScore === 'POSITIVE' ? '😊' : sentimentScore === 'NEGATIVE' ? '😟' : '😐');
    
  // Safe extraction of tags array from backend string
  const tagsArray = typeof post.tags === 'string' ? post.tags.split(',').filter(Boolean) : (post.tags || []);
  
  // Safe author extraction
  const authorName = post.username || post.author?.username || 'Unknown Author';

  return (
    <div className="glass-card p-6 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
            <User size={12} />
          </div>
          <span>{authorName}</span>
          <span>•</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>
        <Badge variant={sentimentVariant}>
          {emoji} {sentimentScore}
        </Badge>
      </div>

      <Link to={`/post/${post.id}`}>
        <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-400 transition-colors line-clamp-2">
          {post.title}
        </h3>
      </Link>

      <blockquote className="border-l-2 border-indigo-500/50 pl-4 mb-4 italic text-slate-400 text-sm line-clamp-3">
        {post.summary || "No summary available"}
      </blockquote>

      <div className="flex flex-wrap gap-2 mb-6">
        {tagsArray.map((tag, index) => (
          <Badge key={index} variant="indigo">#{tag.trim()}</Badge>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center text-slate-400 text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Heart size={16} className="text-rose-500" />
            <span>{post.likesCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageSquare size={16} />
            <span>View</span>
          </div>
        </div>
        <Link 
          to={`/post/${post.id}`}
          className="text-indigo-400 font-medium hover:underline"
        >
          Read More
        </Link>
      </div>
    </div>
  );
};

export default BlogCard;
