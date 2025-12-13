import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

export type ModuleType = 'admin' | 'medical';

interface ActiveModuleState {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
}

export const useActiveModuleStore = create<ActiveModuleState>()(
  persist(
    (set) => ({
      activeModule: 'admin', // Default to admin
      setActiveModule: (module) => {
        set({ activeModule: module });
        // Sync with cookie for server-side reads if needed later
        Cookies.set('active-module', module, { expires: 365 });
      },
    }),
    {
      name: 'active-module-storage', // name of item in the storage (must be unique)
      // We can use localStorage (default)
    }
  )
);
