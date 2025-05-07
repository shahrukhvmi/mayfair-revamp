import React, { useState } from "react";
import { HiOutlinePencilAlt } from "react-icons/hi";
import SectionHeader from "./SectionHeader";
import { useRouter } from "next/router";
import useCartStore from "@/store/useCartStore";
import toast from "react-hot-toast";
import { CouponApi } from "@/api/couponApi";
import useCouponStore from "@/store/couponStore";
import { motion, AnimatePresence } from "framer-motion";
import { RxCross2 } from "react-icons/rx";
import NextButton from "../NextButton/NextButton";
import { GoCheckCircleFill } from "react-icons/go";

const OrderSummary = () => {
  const router = useRouter();
  const [discountCode, setDiscountCode] = useState("");

  const { items, totalAmount } = useCartStore();
  const { Coupon, setCoupon, clearCoupon } = useCouponStore();

  const isApplyEnabled = discountCode.trim().length > 0;
  const handleEdit = () => {
    router.push("dosage-selection");
  };

  console.log(Coupon, "Coupon")
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    setCouponLoading(true);
    try {
      const res = await CouponApi({ coupon_code: discountCode });
      if (res?.data?.status === true) {
        toast.success("Coupon applied successfully!");
        setCoupon(res.data); // assuming setCoupon is defined elsewhere
        setDiscountCode(""); // assuming setDiscountCode is defined elsewhere
      }
    } catch (error) {
      const err = error?.response?.data?.errors?.Coupon;
      if (err) {
        toast.error(err);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setCouponLoading(false);
    }
  };


  const handleRemoveCoupon = () => {
    clearCoupon();
    toast("Coupon removed");
  };

  let discountAmount = 0;
  const shipping = 9.99;
  let finalTotal = (totalAmount + shipping);
  if (Coupon?.Data?.type === "Percent") {
    discountAmount = (totalAmount / 100) * Coupon?.Data?.discount;
  } else {
    discountAmount = Coupon?.Data?.discount;
  }
  if (discountAmount) {
    finalTotal = (totalAmount - discountAmount) + shipping;
  }

  return (
    <div className="col-span-12 sm:col-span-4 mb-3">
      <div className="mb-24 sm:mb-0">
        <div className="bg-white p-6 rounded-2xl shadow-lg mt-6 sm:mt-[110px] font-inter">
          <div className="relative">
            <SectionHeader stepNumber={4} title="Order Summary" completed />
            <div className="absolute right-0 top-0">
              <button
                type="button"
                onClick={handleEdit}
                className="ml-2 p-2 rounded-full bg-white hover:bg-gray-100 text-violet-700 shadow transition"
              >
                <HiOutlinePencilAlt className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto">
            <ul className="space-y-4 overflow-y-auto max-h-[250px] pr-1 pb-4">
              {items?.doses?.map((dose, index) => (
                <li
                  key={index}
                  className="group flex items-center justify-between 
                  rounded-2xl bg-white hover:bg-violet-50 border
                   border-gray-200 p-3 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col flex-1  overflow-hidden">
                    <span className="text-lg bold-font text-gray-900 truncate group-hover:text-violet-700 transition">
                      {dose?.product} {dose?.name}

                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                        Qty: x{dose?.qty}
                      </span>

                      <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs">
                        £{dose?.price}
                      </span>
                    </span>

                  
                  </div>
                </li>
              ))}


              {items?.addons?.map((addon, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-violet-100 rounded-xl p-3 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="bold-font paragraph truncate">
                      {addon?.name}
                    </span>
                    <div className="flex items-center text-xs bold-font text-gray-800 mt-1 gap-2">
                      <span>(x{addon?.qty})</span>
                      <span>£{addon?.price}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center mt-8">
              <p className="bold-font paragraph">Subtotal</p>
              <p className="bold-font text-black">£{totalAmount.toFixed(2)}</p>
            </div>

            <div className="flex justify-between items-center mt-4">
              <p className="bold-font paragraph">Shipping</p>
              <p className="bold-font text-black">£{shipping}</p>
            </div>

            {Coupon && (
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-[#1f9e8c] bold-font">Discount</p>
                <p className="text-sm text-[#1f9e8c] bold-font">
                  -£{discountAmount?.toFixed(2)}
                </p>
              </div>
            )}

            <hr className="my-4 border-gray-200" />

            <div className="flex justify-between items-center">
              <p className="text-lg text-gray-900 font-bold">Total</p>
              <p className="text-lg text-gray-900 font-bold">
                £{finalTotal.toFixed(2)}
              </p>
            </div>

            <hr className="my-4 border-gray-200" />

            {/* Discount Section */}
            <AnimatePresence>
              {Coupon ? (
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="relative mt-6 rounded-lg border-2 border-[#1f9e8c] bg-green-50 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center  border-[#1f9e8c] text-[#1f9e8c]">
                      <GoCheckCircleFill size={32} />

                    </div>

                    <div>
                      <p className="niba-bold-font text-[#1f9e8c]">
                        {Coupon?.Data?.code} <span className="reg-font paragraph">Applied</span>
                      </p>
                      <p className="text-gray-700 text-md  reg-font">
                        - £{Coupon?.Data?.discount}{" "}
                        {Coupon?.Data?.type === "Percent" && `(${Coupon?.Data?.discount}% off)`}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-red-500 text-sm reg-font hover:underline cursor-pointer"
                  >
                    <RxCross2 className="bold-font " size={24} />

                  </button>
                </motion.div>
              ) : (
                <div className="flex mt-6 rounded-lg shadow-sm overflow-hidden">
                  <input
                    type="text"
                    placeholder="Enter discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-1 text-sm text-gray-800 bg-gray-100 placeholder-gray-400 p-4 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!isApplyEnabled}
                    className={`px-6 text-sm font-semibold text-white transition-all duration-200 ${isApplyEnabled
                      ? "bg-violet-600 hover:bg-violet-700"
                      : "bg-gray-300 cursor-not-allowed"
                      }`}
                  >
                    {couponLoading ? "Applying..." : "Apply"}
                  </button>
                </div>
              )}
            </AnimatePresence>



          </div>
        </div>
      </div>


    </div>
  );
};

export default OrderSummary;
