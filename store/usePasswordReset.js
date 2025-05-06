import { create } from "zustand";
import { persist } from "zustand/middleware";

const usePasswordReset = create(
  persist(
    (set) => ({
      isPasswordReset: false,
      setIsPasswordReset: (isPasswordReset) => set({ isPasswordReset }),
      clearIsPasswordReset: () => set({ isPasswordReset: null }),
    }),
    {
      name: "user-password-reset", // localStorage key
    }
  )
);

export default usePasswordReset;
