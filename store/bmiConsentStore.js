import { create } from "zustand";
import { persist } from "zustand/middleware";

const useBmiConsentStore = create(
  persist(
    (set) => ({
      consent: null,
      setConsent: (consent) => set({ consent }),
      clearConsent: () => set({ consent: null }),
    }),
    {
      name: "bmi-consent",
    }
  )
);

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

// The store lives in the browser, so a consent only counts for the patient who gave it.
export const hasBmiConsent = (consent, email) =>
  consent?.accepted === true &&
  normalizeEmail(consent?.email) === normalizeEmail(email);

export default useBmiConsentStore;
