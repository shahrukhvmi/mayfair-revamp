import { create } from "zustand";
import { persist } from "zustand/middleware";

const useExplanationEvidenceStore = create(
  persist(
    (set) => ({
      explainenationEvidence: false,

      setExplainenationEvidence: (status) =>
        set({ explainenationEvidence: status }),
    }),
    {
      name: "explainenation-evidence-storage", // localStorage key
      partialize: (state) => ({
        explainenationEvidence: state.explainenationEvidence,
      }),
    },
  ),
);

export default useExplanationEvidenceStore;
