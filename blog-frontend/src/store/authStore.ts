import { create } from 'zustand';
import api from '../api/axios';

interface AuthState {
  user: { username: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  hydrate: () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      set({ token, user: { username }, isAuthenticated: true });
    }
  },

  login: async (username: string, password: string) => {
    // Backend returns raw JWT string (not JSON object)
    const response = await api.post('/auth/login', { username, password });
    const token = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    set({ token, user: { username }, isAuthenticated: true });
  },

  register: async (username: string, email: string, password: string) => {
    await api.post('/auth/register', { username, email, password });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
