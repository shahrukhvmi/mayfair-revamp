import { create } from "zustand";
import { persist } from "zustand/middleware";

// "Important – BMI Verification Required" consent given on the checkout page.
// Separate from bmiConsentStore because it is sent with the payment request
// to the Mayfair API: OrderSummary adds it to the `order/consultationMayfair`
// request as the separate top-level key `checkoutConsent`.
const useCheckoutConsentStore = create(
  persist(
    (set) => ({
      checkoutConsent: null,
      setCheckoutConsent: (checkoutConsent) => set({ checkoutConsent }),
      clearCheckoutConsent: () => set({ checkoutConsent: null }),
    }),
    {
      name: "checkout-consent",
    }
  )
);

export default useCheckoutConsentStore;
