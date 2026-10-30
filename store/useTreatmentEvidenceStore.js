import { create } from "zustand";
import { persist } from "zustand/middleware";

const useTreatmentEvidenceStore = create(
  persist(
    (set) => ({
      // true = nothing pending, so no banner until the API says otherwise
      treatmentEvidenceUploaded: true,
      setTreatmentEvidenceUploaded: (status) =>
        set({ treatmentEvidenceUploaded: status }),
    }),
    {
      name: "treatment-evidence-storage", // Key in localStorage
      partialize: (state) => ({
        treatmentEvidenceUploaded: state.treatmentEvidenceUploaded,
      }), // Only persist this field
    }
  )
);

export default useTreatmentEvidenceStore;
