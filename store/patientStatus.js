import { create } from "zustand";
import { persist } from "zustand/middleware";

const usePatientStatus = create(
  persist(
    (set) => ({
      patientStatus: null,
      setReorderPatient: () => set({ patientStatus: "reorder" }),
      setNewPatient: () => set({ patientStatus: "new" }),
      resetStatus: () => set({ patientStatus: null }),
    }),
    {
      name: "patient-status-storage",
    }
  )
);

export default usePatientStatus;
