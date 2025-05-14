import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import NextButton from "@/Components/NextButton/NextButton";
import ProductConsent from "@/Components/checkout/ProductConsent";
import SetAPassword from "@/Components/checkout/SetAPassword";
import OrderSummary from "@/Components/checkout/OrderSummary";
import ShippingAddress from "@/Components/checkout/ShippingAddress";
import StepsHeader from "@/layout/stepsHeader";
import { Inter } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import usePasswordReset from "@/store/usePasswordReset";
import useCheckoutStep from "../store/useCheckoutStep";
import BillingAddress from "@/Components/checkout/BillingAddress";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useCartStore from "@/store/useCartStore";
import { useRouter } from "next/router";

const Checkout = () => {

  const { items } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    if (items?.doses?.length === 0) {
      router.push("/dosage-selection");
    }
  }, [items, router]);

const { isPasswordReset } = usePasswordReset();
const [showThankYouModal, setShowThankYouModal] = useState(false);

const [isStep1Completed, setIsStep1Completed] = useState(false);
const [isStep2Completed, setIsStep2Completed] = useState(false);
const [isStep3Completed, setIsStep3Completed] = useState(false);
const [productConsentAccepted, setProductConsentAccepted] = useState(false);
const { step, setStep, resetStep } = useCheckoutStep();
const [hasInitialized, setHasInitialized] = useState(false);

const actualStep = step + (isPasswordReset ? 0 : -1);

const { shipping, setShipping, billingSameAsShipping } = useShippingOrBillingStore();

const personalRef = useRef(null);
const addressRef = useRef(null);
const billingRef = useRef(null);
const paymentRef = useRef(null);
const summaryRef = useRef(null);
const isFirstRender = useRef(true);
const headingRef = useRef(null);

const scrollToRef = (ref) => {
  if (ref?.current) {
    ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

useEffect(() => {
  setStep(1); // ✅ Always reset step to 1 when arriving here
}, []);

useEffect(() => {
  if (step === 1) return; // 🚫 Don't scroll on initial load

  const delayScroll = setTimeout(() => {
    // Step 2: password OR shipping
    if (!isPasswordReset && step === 2) scrollToRef(personalRef);
    else if (isPasswordReset && step === 2) scrollToRef(addressRef);
    // Step 3: Billing or skip to Payment
    else if (step === 3) {
      if (billingSameAsShipping) scrollToRef(paymentRef);
      else scrollToRef(billingRef);
    }

    // Step 4: Payment
    else if (step === 4) scrollToRef(paymentRef);
    // Step 5: Summary
    else if (step === 5) scrollToRef(summaryRef);
  }, 800);

  return () => clearTimeout(delayScroll);
}, [step, isPasswordReset, billingSameAsShipping]);

const handleCheckOut = (data) => {
  console.log("Final Collected Data:", data);
  setShowThankYouModal(true);
};

useEffect(() => {
  if (isPasswordReset === true) {
    setIsStep1Completed(true); // Mark password as already completed
  }
}, [isPasswordReset]);

useEffect(() => {
  headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
}, []);

return (
  <>
    <StepsHeader />

    {/* <form onSubmit={handleSubmit(handleCheckOut)} className={`bg-[#DACFFF] w-full ${inter.className}`}> */}
    {/* Thank You Modal */}
    <AnimatePresence>
      {showThankYouModal && (
        <motion.div
          key="thank-you-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 flex items-center justify-center bg-opacity-40 backdrop-blur-sm z-50"
          onClick={() => setShowThankYouModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-green-600">Thank You!</h2>
            <p className="text-gray-600 text-sm">Your order has been successfully processed.</p>
            <button
              type="button"
              onClick={() => setShowThankYouModal(false)}
              className="mt-6 px-6 py-2 bg-violet-700 text-white rounded-lg hover:bg-violet-800 transition"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <div className="max-w-2xl mx-auto px-4 pb-10 space-y-10">
      <div ref={headingRef} className="px-6 pt-10 text-center">
        <h1 className="px-6 text-2xl niba-reg-font heading mb-2 text-gray-900">Checkout to kick-start your weight loss journey</h1>
        <p className="text-sm px-6 reg-font paragraph mb-6">
          Complete your details below to secure your consultation. If you decide not to proceed after your consult for any reason, you will be fully
          refunded.
        </p>
      </div>

      {/* Step 1 - Password */}
      {!isPasswordReset && (
        <div ref={personalRef} className="relative">
          <SetAPassword
            isCompleted={isStep1Completed}
            onComplete={() => {
              setIsStep1Completed(true);
              setStep(1);
            }}
          />
        </div>
      )}

      {/* Step 2 - Address */}
      <div ref={addressRef} className={`${actualStep < 1 ? "opacity-50 pointer-events-none" : ""}`}>
        <ShippingAddress
          isCompleted={isStep1Completed}
          onComplete={() => {
            setIsStep2Completed(true);
            setStep(2);
          }}
        />

        {/* <BillingAddress
            isCompleted={isStep1Completed}
            onComplete={() => {
              setIsStep1Completed(true);
              setStep(step + 1);
            }}
          /> */}
      </div>

      <div ref={billingRef} className={`${actualStep < 1 ? "opacity-50 pointer-events-none" : ""}`}>
        <BillingAddress
          isCompleted={isStep1Completed}
          sameAsShipping={billingSameAsShipping}
          onComplete={() => {
            setStep(3); // ✅ Always go to payment next
          }}
        />
      </div>

      {/* Step 3 - Payment */}
      <div ref={paymentRef} className={`${actualStep < 2 ? "opacity-50 pointer-events-none" : ""}`}>
        <ProductConsent
          isCompleted={isStep3Completed}
          onConsentChange={(isChecked) => setProductConsentAccepted(isChecked)}
          onComplete={() => {
            setIsStep3Completed(true);
            setStep(4); // ✅ Summary is last
          }}
        />
        {/* {step === 3 && (
            <NextButton
              isCompleted={true}
              label="Continue"
              onComplete={() => {
                setIsStep1Completed(true);
                setStep(step + 1);
              }}
            />
          )} */}
      </div>

      {/* Step 4 - Order Summary */}
      <div ref={summaryRef} className={`${step < 4 ? "opacity-50 pointer-events-none" : ""}`}>
        <OrderSummary />
        {/* {step === 4 && <NextButton type="submit" label="Proceed to payment" />} */}
      </div>

      {/* </form> */}
    </div>
  </>
);
};

export default Checkout;
