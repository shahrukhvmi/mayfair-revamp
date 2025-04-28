import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import NextButton from "@/Components/NextButton/NextButton";
import ProductConsent from "@/Components/checkout/ProductConsent";
import SetAPassword from "@/Components/checkout/SetAPassword";
import OrderSummary from "@/Components/checkout/OrderSummary"; // ⭐ Import
import ShippingAddress from "@/Components/checkout/ShippingAddress"
import StepsHeader from "@/layout/stepsHeader";
import { Inter } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion"; // ⭐ Import Framer Motion

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const Checkout = () => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    trigger,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const [step, setStep] = useState(1);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const personalRef = useRef(null);
  const addressRef = useRef(null);
  const paymentRef = useRef(null);
  const summaryRef = useRef(null);
  const addressFilled = watch("postalCode");
  const termsAccepted = watch("terms");

  const scrollToRef = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    if (step === 1) scrollToRef(personalRef);
    else if (step === 2) scrollToRef(addressRef);
    else if (step === 3) scrollToRef(paymentRef);
    else if (step === 4) scrollToRef(summaryRef);
  }, [step]);

  const handleNextStep = async () => {
    let isStepValid = false;

    if (step === 1) {
      const valid = await trigger(["password", "confirmPassword"]);
      if (valid && isPasswordValid) isStepValid = true;
      else {
        setStep(1);
        scrollToRef(personalRef);
      }
    } else if (step === 2) {
      const valid = await trigger(["postalCode"]);
      if (valid) isStepValid = true;
      else {
        setStep(2);
        scrollToRef(addressRef);
      }
    } else if (step === 3) {
      const valid = await trigger(["terms"]);
      if (valid && termsAccepted) isStepValid = true;
      else {
        setStep(3);
        scrollToRef(paymentRef);
      }
    }

    if (isStepValid) {
      setStep((prev) => prev + 1);
    }
  };

  const handleCheckOut = (data) => {
    console.log("Final Collected Data:", data);
    setShowThankYouModal(true); // ⭐ SHOW MODAL
  };

  return (
    <>

      <StepsHeader />
      <form onSubmit={handleSubmit(handleCheckOut)} className={`bg-green-50 w-full ${inter.className} `}>

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
              onClick={() => setShowThankYouModal(false)} // ⭐ close on background click
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center space-y-4"
                onClick={(e) => e.stopPropagation()} // ⭐ stop click bubble
              >
                <h2 className="text-2xl font-bold text-green-600">Thank You!</h2>
                <p className="text-gray-600 text-sm">
                  Your order has been successfully processed.
                </p>
                <button
                  type="button" // ⭐ make sure it's type=button
                  onClick={() => setShowThankYouModal(false)}
                  className="mt-6 px-6 py-2 bg-violet-700 text-white rounded-lg hover:bg-violet-800 transition"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


        <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">

          {/* Step 1 - Password */}
          <div ref={personalRef} className="relative">
            <SetAPassword
              register={register}
              control={control}
              setIsPasswordValid={setIsPasswordValid}
            />
            {step === 1 && (
              <NextButton
                onClick={handleNextStep}
                disabled={!isPasswordValid}
                label="Continue"
              />
            )}
          </div>

          {/* Step 2 - Address */}
          <div ref={addressRef} className={`${step < 2 ? "opacity-50 pointer-events-none" : ""}`}>
            <ShippingAddress
              register={register}
              errors={errors}
              control={control} // ⭐ Correct: Pass control here
            />
            {step === 2 && (
              <NextButton
                onClick={handleNextStep}
                disabled={!addressFilled}
                label="Continue"
              />
            )}
          </div>


          {/* Step 3 - Payment */}
          <div ref={paymentRef} className={`${step < 3 ? "opacity-50 pointer-events-none" : ""}`}>
            <ProductConsent
              register={register}
              errors={errors}
              control={control}
            />

            {step === 3 && (
              <NextButton
                onClick={handleNextStep}
                disabled={!termsAccepted}
                label="Continue"
              />
            )}
          </div>

          {/* Step 4 - Order Summary (Final Step) */}
          <div ref={summaryRef} className={`${step < 4 ? "opacity-50 pointer-events-none" : ""}`}>
            <OrderSummary />
            {step === 4 && (
              <NextButton
                type="submit"
                label="Process to payment"
              />
            )}
          </div>

        </div>
      </form>
    </>
  );
};

export default Checkout;
