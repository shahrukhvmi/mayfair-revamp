import { create } from "zustand";
import { persist } from "zustand/middleware";

const useReorder = create(
  persist(
    (set) => ({
      reorder: false,
      setReorder: (status) => set({ reorder: status }),
      resetReorder: () => set({ reorder: false }),
    }),
    {
      name: "reorder-status",
    }
  )
);

export default useReorder;
