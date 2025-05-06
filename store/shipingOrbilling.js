import { create } from "zustand";
import { persist } from "zustand/middleware";

const useShippingOrBillingStore = create(
  persist(
    (set) => ({
      shippingInfo: {
        postalCode: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
      },
      billingInfo: {
        postalCode: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
      },
      billingSameAsShipping: false, // ✅ NEW STATE added

      setShippingInfo: (info) => set({ shippingInfo: info }),
      setBillingInfo: (info) => set({ billingInfo: info }),
      setBillingSameAsShipping: (status) => set({ billingSameAsShipping: status }),

      clearShippingInfo: () => set({ shippingInfo: null }),
      clearBillingInfo: () => set({ billingInfo: null }),
    }),
    {
      name: "shipping-billing-storage",
    }
  )
);

export default useShippingOrBillingStore;
