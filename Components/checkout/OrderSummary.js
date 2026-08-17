import React, { useEffect, useState } from "react";
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
import useSignupStore from "@/store/signupStore";
import useProductId from "@/store/useProductIdStore";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useCheckoutStore from "@/store/checkoutStore";
import useMedicalQuestionsStore from "@/store/medicalQuestionStore";
import useConfirmationQuestionsStore from "@/store/confirmationQuestionStore";
import useAuthStore from "@/store/authStore";
import usePasswordReset from "@/store/usePasswordReset";
import useLastBmi from "@/store/useLastBmiStore";
import useUserDataStore from "@/store/userDataStore";
import lastOrderStore from "@/store/lastOrderStore";
import useAbandonCardStore from "@/store/abandonCardStore";

const OrderSummary = ({
  isConcentCheck,
  // isPostalCheck,
  isShippingCheck,
  isBillingCheck,
  onComplete,
}) => {
  const router = useRouter();
  const [discountCode, setDiscountCode] = useState("");
  // Get some data to store✌✌
  const { items, totalAmount, setCheckOut, setOrderId } = useCartStore();
  const { Coupon, setCoupon, clearCoupon } = useCouponStore();
  const {
    shipping,
    billing,
    billingSameAsShipping,
    clearShipping,
    clearBilling,
  } = useShippingOrBillingStore();

  const { patientInfo, clearPatientInfo } = usePatientInfoStore();
  const { medicalInfo, clearMedicalInfo } = useMedicalInfoStore();
  const { gpdetails, clearGpDetails } = useGpDetailsStore();
  const { bmi, clearBmi } = useBmiStore();
  const { confirmationInfo, clearConfirmationInfo } =
    useConfirmationInfoStore();
  const { email } = useSignupStore();
  const { productId, clearProductId } = useProductId();

  // store addons or dose here 🔥🔥

  const { clearAuthUserDetail } = useAuthUserDetailStore();

  const { clearCheckout } = useCheckoutStore();
  const { clearMedicalQuestions } = useMedicalQuestionsStore();
  const { clearConfirmationQuestions } = useConfirmationQuestionsStore();

  const { clearToken } = useAuthStore();
  const { setIsPasswordReset } = usePasswordReset();
  const { clearLastBmi } = useLastBmi();
  const { clearUserData } = useUserDataStore();
  const { clearLastOrder } = lastOrderStore();
  const { abandonCard, clearAbandonCard } = useAbandonCardStore();
  const { clearFirstName, clearLastName, clearEmail, clearConfirmationEmail } =
    useSignupStore();

  const isApplyEnabled = discountCode.trim().length > 0;
  const handleEdit = () => {
    router.push("dosage-selection");
  };
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const handleApplyCoupon = async () => {
    setCouponLoading(true);
    try {
      const res = await CouponApi({
        coupon_code: discountCode,
        product_id: productId,
        variant_ids: items?.doses?.map((item) => item?.item_id),
      });
      if (res?.data?.status === true) {
        toast.success("Coupon applied successfully!");
        console.log(res, "coupon");
        setCoupon(res.data);
        setDiscountCode("");
      }
    } catch (error) {
      const err = error?.response?.data?.errors?.Coupon;
      if (err) {
        console.log(err, "coupon error");
        toast.error(err);
        clearCoupon();
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
    finalTotal = totalAmount - discountAmount + shippingPrice;
  }

  // handle Payment ✌✌
  const checkoutMutation = useMutation(sendStepData, {
    onSuccess: (data) => {
      if (data) {
        setPaymentData(data?.data?.paymentData);
        setOrderId(data?.data?.paymentData?.order_id);
        clearCoupon();
        clearAbandonCard();
      }
    },
    onError: (error) => {
      console.log(error, "dsfdsdsdfsdf");
      const errors = error?.response?.data?.original?.errors;
      const product_error = error?.response?.data?.errors?.Product;
      const singleOutOfStock = error?.response?.data?.errors?.OutOfStock;

      if (error?.response?.data?.message == "Unauthenticated.") {
        console.log("error here");
        toast.error("Session Expired");
        clearBmi();
        clearCheckout();
        clearConfirmationInfo();
        clearGpDetails();
        clearMedicalInfo();
        clearPatientInfo();
        clearBilling();
        clearShipping();
        clearAuthUserDetail();
        clearMedicalQuestions();
        clearConfirmationQuestions();
        clearToken();
        setIsPasswordReset(true);
        clearProductId();
        clearLastBmi();
        clearUserData();
        clearFirstName();
        clearLastName();
        clearEmail();
        clearConfirmationEmail();
        setIsButtonLoading(false);
        clearLastOrder();
        clearAbandonCard();
        router.push("/login");
      } else if (errors && typeof errors === "object") {
        setIsButtonLoading(false);
        Object.keys(errors).forEach((key) => {
          const errorMessage = errors[key];
          Array.isArray(errorMessage)
            ? errorMessage.forEach((msg) => toast.error(msg))
            : toast.error(errorMessage);
        });
      } else if (singleOutOfStock && typeof singleOutOfStock === "object") {
        setIsButtonLoading(false);
        Object.keys(singleOutOfStock).forEach((key) => {
          const errorMessage = singleOutOfStock[key];
          Array.isArray(errorMessage)
            ? errorMessage.forEach((msg) => toast.error(msg))
            : toast.error(errorMessage);
        });
        router.push("/gathering-data");
      } else if (singleOutOfStock && typeof singleOutOfStock != "object") {
        toast.error(singleOutOfStock);
        console.log("from single Out Of stock");
        router.push("/gathering-data");
        setIsButtonLoading(false);
      } else {
        console.log("from other errors");
        toast.error(product_error);
        setIsButtonLoading(false);
      }
    },
  });
  // hanlde payment ✔✔✔✌✌
  const handlePayment = () => {
    setIsButtonLoading(true);
    const checkout = {
      firstName: shipping?.first_name,
      lastName: shipping?.last_name,
      email: email,
      phoneNo: patientInfo?.phoneNo,
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
        code: Coupon?.Data?.code ? Coupon?.Data?.code : null,
        discount: Coupon?.Data?.discount ? Coupon?.Data?.discount : null,
        type: Coupon?.Data?.type ? Coupon?.Data?.type : null,
        discount_value: discountAmount ? discountAmount : null,
      },
      type: abandonCard?.type ? abandonCard?.type : null,
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

    setCheckOut(checkout);

    const formData = {
      checkout,
      patientInfo,
      items: (items?.doses || []).map((d) => ({
        ...d,
        quantity: d.quantity || d.qty || 1,
      })),
      addons: (items?.addons || []).map((a) => ({
        ...a,
        quantity: a.quantity || a.qty || 1,
      })),
      pid: productId || abandonCard?.productId,
      medicalInfo,
      gpdetails,
      bmi,
      confirmationInfo,
      reorder_concent: null,
      product_id: productId,
    };

    checkoutMutation.mutate(formData);
  };

  // console.log(isPostalCheck, "22sasdsdsdsd");

  return (
    <>
      {paymentData ? (
        <PaymentPage paymentData={paymentData} />
      ) : (
        <>
          <div className="col-span-12 sm:col-span-4 mb-3">
            <div className="mb-24 sm:mb-0">
              <div className="rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(71,49,124,0.10)] border border-[#47317c]/[0.08] font-inter">
                <div className="bg-[#f5f2fc] px-6 py-4 border-b border-[#47317c]/[0.07] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[13px] transition-all duration-300 ${
                      onComplete ? "bg-[#47317c] text-white" : "border-2 border-[#47317c] text-[#47317c] inter-semibold-font"
                    }`}>
                      {onComplete ? (
                        <svg viewBox="0 0 14 12" fill="none" className="w-4 h-4">
                          <path d="M1 6l4 4L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : "4"}
                    </div>
                    <h2 className="inter-semibold-font text-[15px] text-slate-900">Order Summary</h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="flex items-center gap-1.5 inter-medium-font text-[12.5px] text-slate-500 hover:text-[#47317c] transition-colors cursor-pointer"
                  >
                    <HiOutlinePencilAlt className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>

                <div className="bg-white px-6 py-5">
                <div className="overflow-y-auto">
                  <ul className="space-y-4 overflow-y-auto max-h-[250px] pr-1 pb-4">
                    {items?.doses?.map((dose, index) => (
                      <React.Fragment key={index}>
                        {/* Standard dose item */}
                        <li className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#f5f2fc] p-4 transition-all duration-200">
                          <div className="flex flex-col">
                            <span className="inter-semibold-font text-[14px] text-slate-900 truncate">
                              {dose?.product} {dose?.name}
                            </span>
                            <span className="inter-reg-font text-[12px] text-slate-500 mt-1">
                              Quantity: x{dose?.qty}
                            </span>
                          </div>

                          <span className="inter-semibold-font text-[14px] text-[#47317c]">
                            £{dose?.price?.toFixed(2)}
                          </span>
                        </li>

                        {/* Additional item if product is Mounjaro */}
                        {dose?.product === "Mounjaro (Tirzepatide)" && (
                          <li className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all duration-200 mt-2">
                            <div className="flex flex-col">
                              <span className="inter-semibold-font text-[14px] text-slate-900 truncate">
                                Pack of 5 Needle
                              </span>
                              <span className="inter-reg-font text-[12px] text-slate-500 mt-1">
                                Quantity: x{dose.qty}
                              </span>
                            </div>

                            <span className="inter-semibold-font text-[14px] text-slate-500">
                              £0.00
                            </span>
                          </li>
                        )}
                      </React.Fragment>
                    ))}

                    {items?.addons?.map((addon, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#f5f2fc] p-4 transition-all duration-200"
                      >
                        <div className="flex flex-col">
                          <span className="inter-semibold-font text-[14px] text-slate-900 truncate">
                            {addon?.name}
                          </span>
                          <span className="inter-reg-font text-[12px] text-slate-500 mt-1">
                            Quantity: x{addon?.qty}
                          </span>
                        </div>

                        <span className="inter-semibold-font text-[14px] text-[#47317c]">
                          £{addon?.price?.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-between items-center mt-8">
                    <p className="inter-medium-font text-[13.5px] text-slate-600">Subtotal</p>
                    <p className="inter-semibold-font text-[14px] text-slate-900">
                      £{totalAmount?.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <p className="inter-medium-font text-[13.5px] text-slate-600">VAT</p>
                    <p className="inter-semibold-font text-[14px] text-slate-900">£0.00</p>
                  </div>

                  {Coupon && (
                    <div className="flex justify-between items-center mt-3">
                      <p className="inter-semibold-font text-[13px] text-[#47317c]">
                        Discount
                      </p>
                      <p className="inter-semibold-font text-[13px] text-[#47317c]">
                        -£{discountAmount?.toFixed(2)}
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-3">
                    <p className="inter-medium-font text-[13.5px] text-slate-600">
                      Shipping
                      <span className="inter-reg-font ms-1 text-slate-400">
                        ({shipping?.country_name})
                      </span>
                    </p>
                    <p className="inter-semibold-font text-[14px] text-slate-900">
                      £{shipping?.country_price}
                    </p>
                  </div>

                  <hr className="my-4 border-slate-100" />

                  <div className="flex justify-between items-center">
                    <p className="inter-bold-font text-[17px] text-slate-900">Total</p>
                    <p className="inter-bold-font text-[17px] text-[#47317c]">
                      £{finalTotal?.toFixed(2)}
                    </p>
                  </div>

                  <hr className="my-4 border-slate-100" />

                  {/* Discount Section */}
                  <AnimatePresence>
                    {Coupon ? (
                      <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="mt-6 flex items-center justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-3.5 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <GoCheckCircleFill size={20} className="shrink-0 text-emerald-600" />
                          <div>
                            <p className="flex flex-wrap items-center gap-1.5">
                              <span className="inter-semibold-font text-[13px] text-slate-900">{Coupon?.Data?.code}</span>
                              <span className="inter-medium-font rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">Applied</span>
                            </p>
                            <p className="inter-medium-font mt-0.5 text-[11.5px] text-emerald-700">
                              - £{Coupon?.Data?.discount}{" "}
                              {Coupon?.Data?.type === "Percent" &&
                                `(${Coupon?.Data?.discount}% off)`}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="ml-3 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-red-100 bg-white text-red-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <RxCross2 size={14} />
                        </button>
                      </motion.div>
                    ) : (
                      <div className="mt-6">
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white overflow-hidden px-3 py-1.5 focus-within:border-[#47317c] transition-colors duration-200">
                          <input
                            type="text"
                            placeholder="Enter discount code"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            className="inter-reg-font flex-1 text-[13.5px] text-slate-900 placeholder:text-slate-400 py-2 focus:outline-none bg-transparent"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={!isApplyEnabled}
                            className={`inter-semibold-font shrink-0 rounded-lg px-4 py-2 text-[12.5px] text-white transition-all duration-200 ${
                              isApplyEnabled
                                ? "bg-[#47317c] hover:bg-[#3a2769] cursor-pointer"
                                : "bg-slate-300 cursor-not-allowed"
                            }`}
                          >
                            {couponLoading ? "Applying..." : "Apply"}
                          </button>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="my-5">
                  {isButtonLoading == true ? (
                    <div className="w-full py-3 rounded-full bg-[#47317c] flex justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-[3px] border-t-transparent border-white rounded-full"
                      />
                    </div>
                  ) : (
                    <NextButton
                      disabled={
                        !isConcentCheck || !isShippingCheck || !isBillingCheck
                        // isPostalCheck
                      }
                      label="Proceed to Payment "
                      onClick={handlePayment}
                    />
                  )}
                </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default OrderSummary;
