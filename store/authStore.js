import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      hasHydrated: false,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
      setHasHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => () => {
        get().setHasHydrated(); // ✅ mark hydration complete after persist loads
      },
    }
  )
);

export default useAuthStore;
