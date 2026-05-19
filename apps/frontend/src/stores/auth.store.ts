import { create } from 'zustand';

type AuthState = {
  token: string | null;
  permissions: string[];
  setAuth: (token: string, permissions?: string[]) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
};

const storedToken = localStorage.getItem('token');
const storedPermissions = JSON.parse(localStorage.getItem('permissions') ?? '[]') as string[];

export const useAuthStore = create<AuthState>((set, get) => ({
  token: storedToken,
  permissions: storedPermissions,
  setAuth: (token, permissions = []) => {
    localStorage.setItem('token', token);
    localStorage.setItem('permissions', JSON.stringify(permissions));
    set({ token, permissions });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('permissions');
    set({ token: null, permissions: [] });
  },
  hasPermission: (permission) => get().permissions.includes(permission),
}));
