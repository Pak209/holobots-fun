import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DevModeState {
  isDevModeEnabled: boolean;
  toggleDevMode: () => void;
  setDevMode: (enabled: boolean) => void;
}

export const useDevModeStore = create<DevModeState>()(
  persist(
    (set) => ({
      isDevModeEnabled: false,
      toggleDevMode: () => set((state) => ({ isDevModeEnabled: !state.isDevModeEnabled })),
      setDevMode: (enabled: boolean) => set({ isDevModeEnabled: enabled }),
    }),
    {
      name: 'dev-mode-storage', // unique name for localStorage
    }
  )
); 