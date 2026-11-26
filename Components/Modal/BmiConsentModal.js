import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export const BMI_CONSENT = {
  title: "BMI Verification – GP Records Information/Consent",
  statements: [
    "To ensure that your BMI meets the eligibility criteria for treatment, we may need to verify your height and weight using your GP medical records, or via a video or video call prior to the order being approved.",
    "Your order will be processed after your BMI has been verified.",
  ],
  confirmation:
    "I confirm that the height and weight I entered are accurate. I understand that my BMI may be verified using my GP medical records, a video, or a video call, and that my order will be processed after this verification.",
};

const ConsentDialog = ({ onAccept, onBack }) => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleChange = (e) => {
    if (!e.target.checked) return;
    setChecked(true);
    onAccept(BMI_CONSENT);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bmi-consent-heading"
        className="max-h-[calc(100dvh-48px)] w-full max-w-[700px] overflow-y-auto rounded-xl bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.24)] sm:p-8"
      >
        <button
          type="button"
          onClick={onBack}
          className="inter-medium-font mb-4 inline-flex cursor-pointer items-center gap-1.5 text-[16px] text-[#47317c] transition-colors hover:text-[#392765] sm:text-[14px]"
        >
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={2.2} />
          Back
        </button>

        <h2
          id="bmi-consent-heading"
          className="inter-semibold-font text-[20px] leading-snug tracking-[-0.01em] text-slate-900 sm:whitespace-nowrap sm:text-[22px]"
        >
          {BMI_CONSENT.title}
        </h2>

        <ul className="inter-reg-font mt-4 list-disc space-y-2.5 pl-5 text-[16px] leading-relaxed text-slate-600 marker:text-[#47317c]">
          {BMI_CONSENT.statements.map((statement) => (
            <li key={statement}>{statement}</li>
          ))}
        </ul>

        <label
          htmlFor="bmi-consent-checkbox"
          className="group mt-5 grid cursor-pointer grid-cols-[20px_minmax(0,1fr)] items-start gap-3 rounded-xl border border-[#47317c]/15 bg-[#f5f2fc] p-4"
        >
          <input
            type="checkbox"
            id="bmi-consent-checkbox"
            checked={checked}
            onChange={handleChange}
            autoFocus
            className="peer sr-only"
          />
          <span
            className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-xl border-2 transition-all duration-150 group-hover:border-[#47317c]/60 peer-focus-visible:ring-2 peer-focus-visible:ring-[#47317c]/40 peer-focus-visible:ring-offset-2 ${
              checked
                ? "border-[#47317c] bg-[#47317c]"
                : "border-slate-300 bg-white"
            }`}
          >
            {checked && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className="inter-medium-font text-[15px] leading-[1.6] text-slate-800 max-sm:text-[16px]">
            {BMI_CONSENT.confirmation}
          </span>
        </label>
      </div>
    </motion.div>
  );
};

const BmiConsentModal = ({ isOpen, onAccept, onBack }) => (
  <AnimatePresence>
    {isOpen && <ConsentDialog key="bmi-consent" onAccept={onAccept} onBack={onBack} />}
  </AnimatePresence>
);

export default BmiConsentModal;
