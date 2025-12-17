import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'READ_ONLY';

export interface AdminUser {
  id: string;
  name: string;
  role: AdminRole;
  avatar?: string;
}

interface AdminState {
  currentAdmin: AdminUser | null;
  isAuthenticated: boolean;
  login: (admin: AdminUser) => void;
  logout: () => void;
  hasPermission: (requiredRole: AdminRole) => boolean;
}

export const AVAILABLE_ADMINS: AdminUser[] = [
  { id: 'muse_mulatu', name: 'Muse Mulatu', role: 'SUPER_ADMIN', avatar: 'https://ui-avatars.com/api/?name=Muse+Mulatu&background=0D8ABC&color=fff' },
  { id: 'greg_pessoni', name: 'Greg Pessoni', role: 'ADMIN', avatar: 'https://ui-avatars.com/api/?name=Greg+Pessoni&background=F59E0B&color=fff' },
  { id: 'paul_fidika', name: 'Paul Fidika', role: 'ADMIN', avatar: 'https://ui-avatars.com/api/?name=Paul+Fidika&background=10B981&color=fff' },
  { id: 'guest_user', name: 'Guest Observer', role: 'READ_ONLY', avatar: 'https://ui-avatars.com/api/?name=Guest&background=6B7280&color=fff' },
];

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      currentAdmin: null,
      isAuthenticated: false,

      login: (admin: AdminUser) => {
        set({ currentAdmin: admin, isAuthenticated: true });
      },

      logout: () => {
        set({ currentAdmin: null, isAuthenticated: false });
      },

      hasPermission: (requiredRole: AdminRole) => {
        const { currentAdmin } = get();
        if (!currentAdmin) return false;

        const roleHierarchy: Record<AdminRole, number> = {
          'SUPER_ADMIN': 3,
          'ADMIN': 2,
          'READ_ONLY': 1
        };

        return roleHierarchy[currentAdmin.role] >= roleHierarchy[requiredRole];
      }
    }),
    {
      name: 'admin-storage', // unique name
    }
  )
);