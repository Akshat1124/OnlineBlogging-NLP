import React from 'react';
import BlogItem from './BlogItem';
import { Post } from '../store/blogStore';

interface BlogListProps {
  posts: Post[];
  loading: boolean;
}

const BlogList: React.FC<BlogListProps> = ({ posts, loading }) => {
  if (loading) {
    return (
      <div className="py-20 text-center text-text-tertiary text-sm tracking-wide uppercase">
        Loading
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-text-tertiary text-sm tracking-wide uppercase mb-2">
          No posts yet
        </p>
        <p className="text-text-secondary text-sm">
          Be the first to write something.
        </p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <BlogItem key={post.id} post={post} />
      ))}
    </div>
  );
};

export default BlogList;
