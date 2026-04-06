import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { defaultAdminConfig } from '../data/adminDefaults';
import type { AdminConfig, AuthConfig, AuthSession, SectorId, UserRole } from '../types';

interface AppState {
  selectedSector: SectorId;
  selectedRole: UserRole;
  adminConfig: AdminConfig;
  authConfig: AuthConfig | null;
  authSession: AuthSession | null;
  configLoaded: boolean;
  authLoaded: boolean;
  setSelectedSector: (sector: SectorId) => void;
  setSelectedRole: (role: UserRole) => void;
  setAdminConfig: (config: AdminConfig) => void;
  setAuthConfig: (config: AuthConfig) => void;
  setAuthSession: (session: AuthSession) => void;
  updateAdminConfig: (updater: (config: AdminConfig) => AdminConfig) => void;
  setConfigLoaded: (loaded: boolean) => void;
  setAuthLoaded: (loaded: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedSector: 'helse-velferd',
      selectedRole: 'ansatt',
      adminConfig: defaultAdminConfig,
      authConfig: null,
      authSession: null,
      configLoaded: false,
      authLoaded: false,
      setSelectedSector: (selectedSector) => set({ selectedSector }),
      setSelectedRole: (selectedRole) => set({ selectedRole }),
      setAdminConfig: (adminConfig) => set({ adminConfig }),
      setAuthConfig: (authConfig) => set({ authConfig }),
      setAuthSession: (authSession) =>
        set({
          authSession,
          selectedRole: authSession.role
        }),
      updateAdminConfig: (updater) => set((state) => ({ adminConfig: updater(state.adminConfig) })),
      setConfigLoaded: (configLoaded) => set({ configLoaded }),
      setAuthLoaded: (authLoaded) => set({ authLoaded })
    }),
    {
      name: 'kommunehr-app',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedSector: state.selectedSector,
        selectedRole: state.selectedRole,
        adminConfig: state.adminConfig,
        authConfig: state.authConfig,
        authSession: state.authSession
      })
    }
  )
);
