import { create } from "zustand";
import { persist } from "zustand/middleware";

const usePatientStatus = create(
  persist(
    (set) => ({
      patientStatus: null,
      newPatient: null,
      setReorderPatient: (status) => set({ patientStatus: status }),
      setNewPatient: (status) => set({ newPatient: status }),
      resetPatientStatus: () => set({ patientStatus: null }),
      resetNewPatientStatus: () => set({ patientStatus: null }),
    }),
    {
      name: "patient-status-storage",
    }
  )
);

export default usePatientStatus;
