import { create } from "zustand";
import { persist } from "zustand/middleware";

// Temporary, browser-only record of the ORB (GP records) consent.
// TODO: replace with the consent API once the backend endpoint exists.
const useOrbConsentStore = create(
  persist(
    (set) => ({
      consents: {},
      saveConsent: (orderId, consent) =>
        set((state) => ({
          consents: { ...state.consents, [String(orderId)]: consent },
        })),
    }),
    {
      name: "orb-consent",
    }
  )
);

export default useOrbConsentStore;
