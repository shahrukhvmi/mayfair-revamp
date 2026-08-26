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
import { Inter } from "next/font/google";
import useReorder from "@/store/useReorderStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useReturning from "@/store/useReturningPatient";
import { ArrowLeft } from "lucide-react";

const Checkout = () => {
  const { isReturningPatient } = useReturning();

  const { isPasswordReset, showResetPassword } = usePasswordReset();
  // const [isCompleted, setCompleted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
  });
  const { reorder } = useReorder();
  const { billingSameAsShipping } = useShippingOrBillingStore();
  const [isConcentCheck, setIsConcentCheck] = useState(false);
  // const [isPostalCheck, setIsPostalCheck] = useState(false);
  const [isShippingCheck, setIsShippingCheck] = useState(false);
  const [isBillingCheck, setIsBillingCheck] = useState(false);
  const [closeShipping, setCloseShipping] = useState(false);
  const [closeBilling, setCloseBilling] = useState(false);

  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const router = useRouter();
  // console.log(isPostalCheck, "isPostalCheck")
  const personalRef = useRef(null);
  const addressRef = useRef(null);
  const billingRef = useRef(null);
  const paymentRef = useRef(null);
  const summaryRef = useRef(null);
  const headingRef = useRef(null);

  const [refIndex, setRefIndex] = useState(0);
  const [showPasswordStep] = useState(
    () => isPasswordReset && !isReturningPatient,
  );
  const passwordStepIndex = showPasswordStep ? 0 : null;
  const shippingStepIndex = showPasswordStep ? 1 : 0;
  const billingStepIndex = billingSameAsShipping
    ? null
    : shippingStepIndex + 1;
  const consentStepIndex = billingSameAsShipping
    ? shippingStepIndex + 1
    : billingStepIndex + 1;
  const shippingDone = completedSteps[shippingStepIndex] || closeShipping;
  const billingDone =
    billingSameAsShipping || completedSteps[billingStepIndex] || closeBilling;

  useEffect(() => {
    headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const scrollToRef = (ref) => {
    if (ref?.current) {
      const headerOffset = 78;
      const sectionTop =
        ref.current.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: sectionTop, behavior: "smooth" });
    }
  };

  const getStepRefs = () => {
    return [
      showPasswordStep && personalRef,
      addressRef,
      !billingSameAsShipping && billingRef,
      paymentRef,
      summaryRef,
    ].filter(Boolean);
  };
  const stepRefs = getStepRefs();

  const goToNextStep = (stepIndexOverride) => {
    const currentIndex =
      typeof stepIndexOverride === "number" ? stepIndexOverride : refIndex;
    const nextIndex = currentIndex + 1;

    // ✅ Mark correct step as complete
    setCompletedSteps((prev) => ({
      ...prev,
      [currentIndex]: true,
    }));

    // ✅ Go to next step
    if (stepRefs[nextIndex]) {
      setRefIndex(nextIndex);
      setTimeout(() => scrollToRef(stepRefs[nextIndex]), 420);
    }
  };

  const back = () => {
    router.push("/dosage-selection");
  };

  console.log(showResetPassword, "showResetPassword");
  return (
    <>
      <MetaLayout canonical={`${meta_url}checkout/`} />

      <StepsHeader />

      <AnimatePresence>
        {showThankYouModal && (
          <motion.div
            key="thank-you-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 flex items-center justify-center bg-opacity-40 backdrop-blur-sm z-60"
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
                className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-[#4565BF] transition"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-[calc(100vh-66px)] bg-[#FBFBFD]">
      <div className="max-w-2xl mx-auto px-4 pb-14 space-y-6">
        <div ref={headingRef} className="px-0 pt-6 sm:px-6 sm:pt-8">
          <div className="mb-5 flex justify-start">
            <button
              type="button"
              onClick={back}
              className="inter-medium-font inline-flex cursor-pointer items-center gap-1.5 py-1 text-[13px] text-slate-500 transition-colors duration-150 hover:text-[#47317c] focus-visible:outline-none focus-visible:text-[#47317c]"
              aria-label="Back to dosage selection"
            >
              <ArrowLeft size={14} strokeWidth={1.8} />
              <span>Back</span>
            </button>
          </div>

          <div className="text-center">
            <h1 className="inter-bold-font mb-2 text-[22px] text-slate-900 sm:text-[26px]">
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
            <p className="inter-reg-font mb-6 text-[13.5px] text-slate-500">
              {reorder
                ? "You're almost done. Complete your checkout to continue your weight loss journey without interruption."
                : "Complete your details below to secure your consultation. If you decide not to proceed after your consult for any reason, you will be fully refunded."}
            </p>
          </div>
        </div>

        {/* Sections */}
        {showPasswordStep && (
          <motion.div ref={personalRef} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <SetAPassword
              onComplete={() => goToNextStep(passwordStepIndex)}
              isCompleted={completedSteps[passwordStepIndex] || !isPasswordReset}
            />
          </motion.div>
        )}

        {(!showPasswordStep || completedSteps[passwordStepIndex]) && (
        <motion.div ref={addressRef} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <ShippingAddress
            onComplete={() => goToNextStep(shippingStepIndex)}
            isCompleted={completedSteps[shippingStepIndex] || closeShipping}
            setIsShippingCheck={setIsShippingCheck}
            setIsBillingCheck={setIsBillingCheck}
            setCloseShipping={setCloseShipping}
            // setIsPostalCheck={setIsPostalCheck}
          />
        </motion.div>
        )}

        {!billingSameAsShipping && shippingDone && (
          <motion.div ref={billingRef} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <BillingAddress
              onComplete={() => goToNextStep(billingStepIndex)}
              isCompleted={completedSteps[billingStepIndex] || closeBilling}
              setIsBillingCheck={setIsBillingCheck}
              setCloseBilling={setCloseBilling}
            />
          </motion.div>
        )}

        {shippingDone && billingDone && (
        <motion.div ref={paymentRef} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <ProductConsent
            onComplete={() => goToNextStep(consentStepIndex)}
            setIsConcentCheck={setIsConcentCheck}
            isCompleted={setIsConcentCheck}
          />
        </motion.div>
        )}

        {isConcentCheck && (
        <motion.div ref={summaryRef} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <OrderSummary
            onComplete={isConcentCheck}
            // isPostalCheck={isPostalCheck}
            isConcentCheck={isConcentCheck}
            isShippingCheck={isShippingCheck}
            isBillingCheck={isBillingCheck}
          />
        </motion.div>
        )}
      </div>
      </div>
    </>
  );
};

export default Checkout;
