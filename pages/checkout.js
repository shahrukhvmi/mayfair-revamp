import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import StepsHeader from "@/layout/stepsHeader";
import SetAPassword from "@/Components/checkout/SetAPassword";
import ShippingAddress from "@/Components/checkout/ShippingAddress";
import BillingAddress from "@/Components/checkout/BillingAddress";
import ProductConsent from "@/Components/checkout/ProductConsent";
import OrderSummary from "@/Components/checkout/OrderSummary";
import usePasswordReset from "@/store/usePasswordReset";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useCartStore from "@/store/useCartStore";
import { Inter } from "next/font/google";
import useReorder from "@/store/useReorderStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";

const inter = Inter({ subsets: ["latin"] });

const Checkout = () => {
  const { isPasswordReset, showResetPassword } = usePasswordReset();
  const { billingSameAsShipping } = useShippingOrBillingStore();
  const { reorder } = useReorder();
  const [isConcentCheck, setIsConcentCheck] = useState(false);
  const [isShippingCheck, setIsShippingCheck] = useState(false);
  const [isBillingCheck, setIsBillingCheck] = useState(false);

  const [showThankYouModal, setShowThankYouModal] = useState(false);

  const router = useRouter();

  const personalRef = useRef(null);
  const addressRef = useRef(null);
  const billingRef = useRef(null);
  const paymentRef = useRef(null);
  const summaryRef = useRef(null);
  const headingRef = useRef(null);

  const [refIndex, setRefIndex] = useState(0);

  useEffect(() => {
    headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const scrollToRef = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getStepRefs = () => {
    return [
      isPasswordReset && personalRef,
      addressRef,
      !billingSameAsShipping && billingRef,
      paymentRef,
      summaryRef,
    ].filter(Boolean);
  };

  const stepRefs = getStepRefs();

  const goToNextStep = () => {
    const nextIndex = refIndex + 1;
    if (stepRefs[nextIndex]) {
      setRefIndex(nextIndex);
      scrollToRef(stepRefs[nextIndex]);
    }
  };

  const handleCheckOut = () => {
    setShowThankYouModal(true);
  };

  const back = () => {
    router.push("/dosage-selection");
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}checkout/`} />
      <StepsHeader />
      <div className="bottom-[30px] fixed left-10 cursor-pointer py-2 rounded-full border-2 border-violet-700 sm:block hidden">
        {/* <BackButton label="Back" onClick={back} className="mt-2 sm:block hidden " /> */}
        <button
          label="Back"
          onClick={back}
          className="text-violet-700 reg-font px-6 cursor-pointer"
        >
          <span>Back</span>
        </button>
      </div>
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
              <p className="text-gray-600 text-sm">
                Your order has been successfully processed.
              </p>
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
        <div ref={headingRef} className="sm:px-6 px-0 pt-10 text-center">
          <h1 className="sm:px-6 px-0 text-2xl niba-reg-font heading mb-2 text-gray-900">
            {reorder ? (
              <>
                Confirm your treatment
                <br />
                re-order
              </>
            ) : (
              "Checkout to kick-start your weight loss journey"
            )}
          </h1>
          <p className="text-sm sm:px-6 px-0  reg-font paragraph mb-6">
            {reorder
              ? "You're almost done. Complete your checkout to continue your weight loss journey without interruption."
              : "Complete your details below to secure your consultation. If you decide not to proceed after your consult for any reason, you will be fully refunded."}
          </p>
        </div>

        {showResetPassword && (
          <div
            ref={personalRef}
            className={`${!isPasswordReset ? "cursor-not-allowed" : ""}`}
          >
            <div
              className={`${
                !isPasswordReset ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <SetAPassword onComplete={goToNextStep} />
            </div>
          </div>
        )}

        <div ref={addressRef}>
          <ShippingAddress
            onComplete={goToNextStep}
            setIsShippingCheck={setIsShippingCheck}
            setIsBillingCheck={setIsBillingCheck} // <-- add this prop
          />
        </div>

        {!billingSameAsShipping && (
          <div ref={billingRef}>
            <BillingAddress
              onComplete={goToNextStep}
              setIsBillingCheck={setIsBillingCheck}
            />
          </div>
        )}

        <div ref={paymentRef}>
          <ProductConsent
            onComplete={goToNextStep}
            setIsConcentCheck={setIsConcentCheck}
          />
        </div>

        <div ref={summaryRef}>
          <OrderSummary
            isConcentCheck={isConcentCheck}
            isShippingCheck={isShippingCheck}
            isBillingCheck={isBillingCheck}
          />
        </div>
      </div>
    </>
  );
};

export default Checkout;
