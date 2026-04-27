import { create } from 'zustand';
import api from '../api/axios';

interface User {
  id?: string;
  username: string;
  email?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,

  hydrate: () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    if (token && username) {
      set({ token, user: { username, email: email || undefined }, isAuthenticated: true });
    }
  },

  login: async (username: string, password: string) => {
    // Backend returns raw JWT string (not JSON object)
    const response = await api.post('/auth/login', { username, password });
    const token = response.data;

    // Fetch user profile with the new token
    let user: User = { username };
    try {
      const userResponse = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      user = userResponse.data;
    } catch {
      // If /users/me fails, fallback to just username
    }

    localStorage.setItem('token', token);
    localStorage.setItem('username', user.username);
    if (user.email) localStorage.setItem('email', user.email);
    set({ token, user, isAuthenticated: true });
  },

  register: async (username: string, email: string, password: string) => {
    await api.post('/auth/register', { username, email, password });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
