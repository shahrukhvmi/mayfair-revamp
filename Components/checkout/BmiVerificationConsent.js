import React, { useEffect, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { ShieldCheck } from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import SectionHeader from "./SectionHeader";
import useCheckoutConsentStore from "@/store/checkoutConsentStore";
import useSignupStore from "@/store/signupStore";

export const BMI_VERIFICATION_NOTICE =
  "Before proceeding to checkout, please be aware that your order can only be processed once your BMI has been successfully verified.";

export const BMI_VERIFICATION_CHECKBOX =
  "I understand that my order can only be processed once my BMI has been successfully verified.";

// Checkout step shown after the Treatment Consent. Payment stays disabled
// until the patient ticks the confirmation (see OrderSummary).
const BmiVerificationConsent = ({ onComplete, setIsBmiConsentCheck }) => {
  const [isChecked, setIsChecked] = useState(false);
  const { setCheckoutConsent, clearCheckoutConsent } = useCheckoutConsentStore();
  const { email } = useSignupStore();

  useEffect(() => {
    setIsBmiConsentCheck(isChecked);

    if (isChecked) {
      // Sent to the Mayfair API together with the payment (see
      // checkoutConsentStore).
      setCheckoutConsent({
        accepted: true,
        acceptedAt: new Date().toISOString(),
        email: email || "",
        title: "Important – BMI Verification Required",
        notice: BMI_VERIFICATION_NOTICE,
        confirmation: BMI_VERIFICATION_CHECKBOX,
      });
      onComplete?.();
    } else {
      clearCheckoutConsent();
    }
  }, [isChecked]);

  return (
    <SectionWrapper>
      <SectionHeader
        stepNumber={<ShieldCheck size={16} strokeWidth={2} />}
        title="Important – BMI Verification Required"
        isCompleted={isChecked}
      >
        <p className="inter-reg-font my-3 text-[14px] leading-relaxed text-slate-600 sm:text-[13px]">
          {BMI_VERIFICATION_NOTICE}
        </p>

        <div className="mb-3 mt-4 sm:mb-5">
          <label className="flex cursor-pointer select-none items-start gap-3 text-slate-900">
            <div className="relative mt-0.5 flex shrink-0 items-center justify-center">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="peer h-6 w-6 cursor-pointer appearance-none rounded-[5px] border-2 border-slate-300 bg-white transition-all duration-300 checked:border-[#47317c] checked:bg-[#47317c] checked:shadow-md checked:shadow-[#47317c]/10 focus:outline-none"
              />
              <FiCheck size={16} className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100" />
            </div>
            <span className="inter-semibold-font text-[14px] leading-snug text-slate-800 sm:text-[13px]">
              {BMI_VERIFICATION_CHECKBOX}
            </span>
          </label>

          {!isChecked && (
            <p className="mt-2 text-xs text-red-600">
              You must confirm this to continue.
            </p>
          )}
        </div>
      </SectionHeader>
    </SectionWrapper>
  );
};

export default BmiVerificationConsent;
