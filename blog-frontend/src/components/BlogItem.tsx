import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../store/blogStore';

interface BlogItemProps {
  post: Post;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

const BlogItem: React.FC<BlogItemProps> = ({ post }) => {
  const plainContent = stripHtml(post.content);
  const excerpt = post.summary || plainContent.slice(0, 180);

  return (
    <article className="py-8 border-b border-border last:border-b-0">
      <Link to={`/post/${post.id}`} className="block group">
        <h2 className="text-xl font-bold leading-tight mb-2 group-hover:opacity-70 transition-opacity">
          {post.title}
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed mb-3 line-clamp-2">
          {excerpt}
        </p>
        <div className="flex items-center gap-3 text-xs text-text-tertiary font-medium tracking-wide uppercase">
          <span>{post.username}</span>
          <span className="text-border">/</span>
          <span>{formatDate(post.createdAt)}</span>
          {post.sentiment && (
            <>
              <span className="text-border">/</span>
              <span>{post.sentiment.toLowerCase()}</span>
            </>
          )}
        </div>
      </Link>
    </article>
  );
};

export default BlogItem;
