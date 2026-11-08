import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearAuth, setToken } from '@/lib/auth/storage';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: ({ user, token }) => {
        setToken(token);
        set({ user, token, isAuthenticated: true });
      },
      updateUser: (user) => set({ user }),
      logout: () => {
        clearAuth();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: 'clinic-auth' }
  )
);

export default useAuthStore;
