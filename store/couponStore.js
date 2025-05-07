import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCouponStore = create(
  persist(
    (set) => ({
      Coupon: null,
      setCoupon: (Coupon) => set({ Coupon }),
      clearCoupon: () => set({ Coupon: null }),
    }),
    {
      name: "Coupon-storage",
    }
  )
);

export default useCouponStore;
