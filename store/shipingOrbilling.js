import { create } from "zustand";
import { persist } from "zustand/middleware";

const useShippingOrBillingStore = create(
  persist(
    (set) => ({
      shipping: null,
      billing: null,
      billingSameAsShipping: false, // ✅ NEW STATE added

      setShipping: (info) => set({ shipping: info }),
      setBilling: (info) => set({ billing: info }),
      setBillingSameAsShipping: (status) => set({ billingSameAsShipping: status }),

      clearShipping: () => set({ shipping: null }),
      clearBilling: () => set({ billing: null }),
    }),
    {
      name: "shipping-billing-storage",
    }
  )
);

export default useShippingOrBillingStore;
