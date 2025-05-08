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
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import usePatientInfoStore from "@/store/patientInfoStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import useGpDetailsStore from "@/store/gpDetailStore";
import useBmiStore from "@/store/bmiStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import PaymentPage from "../PaymentSection/PaymentPage";
import sendStepData from "@/api/stepsDataApi";
import { useMutation } from "@tanstack/react-query";

const OrderSummary = () => {
  const router = useRouter();
  const [discountCode, setDiscountCode] = useState("");

  // Get some data to store✌✌ 
  const { items, totalAmount } = useCartStore();
  const { Coupon, setCoupon, clearCoupon } = useCouponStore();
  const { shipping, billing, billingSameAsShipping } = useShippingOrBillingStore();
  const { patientInfo } = usePatientInfoStore();
  const { medicalInfo } = useMedicalInfoStore();
  const { gpdetails } = useGpDetailsStore();
  const { bmi } = useBmiStore();
  const { confirmationInfo } = useConfirmationInfoStore();


  const isApplyEnabled = discountCode.trim().length > 0;
  const handleEdit = () => {
    router.push("dosage-selection");
  };
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    setCouponLoading(true);
    try {
      const res = await CouponApi({ coupon_code: discountCode });
      if (res?.data?.status === true) {
        toast.success("Coupon applied successfully!");
        setCoupon(res.data);
        setDiscountCode("");
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

  const shippingPrice = Number(shipping?.country_price) || 0;

  // Start calculation
  let finalTotal = totalAmount + shippingPrice;

  // Calculate discount
  if (Coupon?.Data?.type === "Percent") {
    discountAmount = (totalAmount / 100) * Coupon?.Data?.discount;
  } else {
    discountAmount = Coupon?.Data?.discount || 0;
  }

  // Apply discount if available
  if (discountAmount) {
    finalTotal = (totalAmount - discountAmount) + shippingPrice;
  }

  // handle Payment 
  const checkoutMutation = useMutation(sendStepData, {
    onSuccess: (data) => {
      console.log("Medical Questions Response:", data);
      if (data) {
        console.log("Data sent successfully");
      }
    },
    onError: (error) => {
      console.log("error", error?.response?.data?.message);
      if (error) {
        toast.error(error?.response?.data?.message || "Something went wrong");
        setShowLoader(false);
      }
    },
  });

  const handlePayment = () => {
    const checkout = {
      firstName: "jack",
      lastName: "jason",
      email: "jack@gmail.com",
      phoneNo: "+423493939",
      shipping: {
        postalcode: shipping?.postalcode,
        addressone: shipping?.addressone,
        addresstwo: shipping?.addresstwo,
        city: shipping?.city,
        state: shipping?.state,
        country: shipping?.country_name,
      },
      terms: true,
      sameAddress: billingSameAsShipping,
      billing: {
        postalcode: billing?.postalcode,
        addressone: billing?.addressone,
        addresstwo: billing?.addresstwo,
        city: billing?.city,
        state: billing?.state,
        country: billing?.country_name,
      },
      discount: {
        code: Coupon?.code,
        discount: Coupon?.discount,
        type: Coupon?.type,
        discount_value: discountAmount,
      },
      subTotal: parseFloat(totalAmount),
      total: parseFloat(finalTotal),
      shipment: {
        id: shipping?.id,
        name: shipping?.country_name,
        price: parseFloat(shipping?.country_price),
        status: 1,
        taggable_type: "App\\Models\\Product",
        taggable_id: "1",
      },
    };
    
    <PaymentPage paymentData={checkout}/>

    const formData = {
      checkout,
      patientInfo,
      items: items?.doses || [],
      addons: items?.addons || [],
      pid: 1,
      medicalInfo,
      gpdetails,
      bmi,
      confirmationInfo,
      reorder_concent: null,
      product_id: 1,
    };

    checkoutMutation.mutate(formData);
  };

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
                <React.Fragment key={index}>
                  {/* Standard dose item */}
                  <li
                    className="group flex items-center justify-between rounded-lg bg-[#F2EEFF] hover:bg-violet-50 p-4 shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-col">
                      <span className="text-base bold-font text-gray-900 truncate">
                        {dose?.product} {dose?.name}
                      </span>
                      <span className="bold-font text-sm text-gray-600 mt-1">
                        Qty: x{dose?.qty}
                      </span>
                    </div>

                    <span className="text-base bold-font text-black px-4 py-1 rounded-full">
                      £{dose?.price}
                    </span>
                  </li>

                  {/* Additional item if product is Mounjaro */}
                  {dose?.product === "Mounjaro (Tirzepatide)" && (
                    <li
                      className="group flex items-center justify-between rounded-lg bg-[#ececec] hover:bg-violet-50 p-4 shadow-md transition-all duration-200 mt-2"
                    >
                      <div className="flex flex-col">
                        <span className="text-base bold-font text-gray-900 truncate">
                          Pack of 5 Needle
                        </span>
                        <span className="bold-font text-sm text-gray-600 mt-1">
                          {dose.qty}x
                        </span>
                      </div>

                      <span className="text-base bold-font text-black px-4 py-1 rounded-full">
                        £0.00
                      </span>
                    </li>
                  )}
                </React.Fragment>
              ))}






              {items?.addons?.map((addon, index) => (
                <li
                  key={index}
                  className="group flex items-center justify-between rounded-lg bg-[#F2EEFF] hover:bg-violet-50  p-4 shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col">
                    <span className="text-base bold-font text-gray-900  truncate">
                      {addon?.name}
                    </span>
                    <span className="bold-font text-sm text-gray-600 mt-1">
                      Qty: x{addon?.qty}
                    </span>
                  </div>

                  <span className="text-base bold-font  text-black px-4 py-1 rounded-full">
                    £{addon?.price}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex justify-between items-center mt-8">
              <p className="bold-font paragraph !text-black">Subtotal</p>
              <p className="bold-font text-black">£{totalAmount?.toFixed(2)}</p>
            </div>

            <div className="flex justify-between items-center mt-4">
              <p className="bold-font paragraph !text-black">Shipping</p>
              <p className="bold-font text-black">£{shipping?.country_price}</p>
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
              <p className="bold-font text-xl text-black">Total</p>
              <p className="bold-font text-xl text-black">
                £{finalTotal?.toFixed(2)}

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
                    className="flex-1 text-sm text-gray-800 bg-gray-100 placeholder-gray-400 p-4 focus:outline-none reg-font"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!isApplyEnabled}
                    className={`px-6 text-sm bold-font text-white transition-all duration-200 ${isApplyEnabled
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
          <div className="my-5">


            <NextButton
              label="Proceed to Payment "
              onClick={handlePayment}
            />
          </div>
        </div>
      </div>


    </div>
  );
};

export default OrderSummary;
