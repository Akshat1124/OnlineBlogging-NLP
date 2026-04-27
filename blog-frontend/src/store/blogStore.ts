import { create } from 'zustand';
import api from '../api/axios';

export interface Post {
  id: number;
  title: string;
  content: string;
  username: string;
  createdAt: string;
  summary: string | null;
  sentiment: string | null;
  isSpam: boolean | null;
  spamScore: number | null;
  tags: string | null;
  likesCount?: number;
}

interface BlogState {
  posts: Post[];
  currentPost: Post | null;
  totalPages: number;
  loading: boolean;
  fetchPosts: (page?: number, size?: number) => Promise<void>;
  fetchPostById: (id: number) => Promise<void>;
  createPost: (title: string, content: string, tags?: string) => Promise<Post>;
  searchPosts: (keyword: string, page?: number) => Promise<void>;
}

const useBlogStore = create<BlogState>((set) => ({
  posts: [],
  currentPost: null,
  totalPages: 0,
  loading: false,

  fetchPosts: async (page = 0, size = 10) => {
    set({ loading: true });
    try {
      const response = await api.get('/posts', {
        params: { page, size, sort: 'createdAt,desc' },
      });
      set({
        posts: response.data.content,
        totalPages: response.data.totalPages,
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchPostById: async (id: number) => {
    set({ loading: true, currentPost: null });
    try {
      const response = await api.get(`/posts/${id}`);
      set({ currentPost: response.data });
    } finally {
      set({ loading: false });
    }
  },

  createPost: async (title: string, content: string, tags?: string) => {
    const response = await api.post('/posts', { title, content, tags });
    return response.data;
  },

  searchPosts: async (keyword: string, page = 0) => {
    set({ loading: true });
    try {
      const response = await api.get('/posts/search', {
        params: { keyword, page, size: 10 },
      });
      set({
        posts: response.data.content,
        totalPages: response.data.totalPages,
      });
    } finally {
      set({ loading: false });
    }
  },
}));

export default useBlogStore;
