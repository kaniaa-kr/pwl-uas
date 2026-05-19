import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserInfo = {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
};

type AuthState = {
  token: string | null;
  user: UserInfo | null;
  setAuth: (token: string, user: UserInfo) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      hasPermission: (permission) =>
        get().user?.permissions.includes(permission) ?? false,
      hasRole: (role) =>
        get().user?.roles.includes(role) ?? false,
    }),
    { name: 'eduaccess-auth' }
  )
);