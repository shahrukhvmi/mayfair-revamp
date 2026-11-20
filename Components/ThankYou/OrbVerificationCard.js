import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronRight, Lock, ShieldCheck, Stethoscope, X } from "lucide-react";
import { FiCheck } from "react-icons/fi";
import { orb_connect_url } from "@/config/constants";
import useOrbConsentStore from "@/store/orbConsentStore";

export const ORB_CONSENT_TEXT =
  "I consent to Mayfair Weight Loss Clinic obtaining access to my relevant GP medical records through ORB for the purpose of verifying my BMI and treatment eligibility.";

const OrbConsentDialog = ({ onClose, onAgree }) => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="orb-consent-heading"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[calc(100dvh-48px)] w-full max-w-[520px] overflow-y-auto rounded-xl bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.24)] sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={20} strokeWidth={2} />
        </button>

        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#47317c]/10 text-[#47317c]">
          <Lock aria-hidden="true" size={20} strokeWidth={1.8} />
        </span>
        <h2
          id="orb-consent-heading"
          className="inter-semibold-font mt-3 pr-10 text-[20px] leading-snug tracking-[-0.01em] text-slate-900 sm:text-[22px]"
        >
          Before you connect
        </h2>
        <p className="inter-reg-font mt-2 text-[16px] leading-relaxed text-slate-600 sm:text-[15px]">
          You will be redirected to the NHS website, where you can securely
          authenticate your identity and authorise ORB to access your relevant
          clinical information.
        </p>

        <label className="mt-5 flex cursor-pointer select-none items-start gap-3 border border-[#47317c]/15 bg-[#f5f2fc] p-4">
          <span className="relative mt-0.5 flex shrink-0 items-center justify-center">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="peer h-5 w-5 cursor-pointer appearance-none rounded-xl border-2 border-slate-300 bg-white transition-colors duration-200 checked:border-[#47317c] checked:bg-[#47317c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#47317c]/40 focus-visible:ring-offset-2"
            />
            <FiCheck size={13} className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100" />
          </span>
          <span className="inter-medium-font text-[15px] leading-snug text-slate-800">
            {ORB_CONSENT_TEXT}
          </span>
        </label>

        <button
          type="button"
          onClick={() => checked && onAgree()}
          disabled={!checked}
          className={`inter-semibold-font mt-5 flex min-h-[50px] w-full items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-[16px] transition-all duration-200 ${
            checked
              ? "cursor-pointer bg-[#47317c] text-white shadow-[0_8px_20px_rgba(71,49,124,0.18)] hover:bg-[#392765] active:scale-[0.99]"
              : "cursor-not-allowed bg-slate-200 text-slate-400"
          }`}
        >
          Agree &amp; continue to NHS
          <ArrowUpRight aria-hidden="true" size={17} strokeWidth={2.2} />
        </button>
      </div>
    </motion.div>
  );
};

// Thank-you page only (not on the dashboard).
// The card shows the heading, description and the "Connect" button. Pressing
// the button opens the consent modal; only after it is accepted does the
// third-party ORB / NHS link open.
const OrbVerificationCard = ({ orderId }) => {
  const [showConsent, setShowConsent] = useState(false);
  const saveConsent = useOrbConsentStore((state) => state.saveConsent);

  const handleAgree = () => {
    // TODO: send this consent to the API once the endpoint is available.
    saveConsent(orderId, {
      accepted: true,
      acceptedAt: new Date().toISOString(),
      text: ORB_CONSENT_TEXT,
    });
    setShowConsent(false);

    if (!orb_connect_url) {
      toast("NHS GP records connection will be available soon.");
      return;
    }

    window.open(orb_connect_url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <section
        aria-labelledby="orb-verification-heading"
        className="w-full overflow-hidden rounded-xl border border-[#47317c]/30 bg-[#47317c]/[0.05] shadow-[0_1px_4px_rgba(71,49,124,0.08)]"
      >
        <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="inter-medium-font inline-flex items-center gap-1.5 rounded-full border border-[#47317c]/30 bg-[#47317c]/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[#47317c] max-sm:text-[13px]">
                <Stethoscope aria-hidden="true" size={14} strokeWidth={2} className="h-3 w-3 shrink-0 max-sm:h-3.5 max-sm:w-3.5" />
                GP records
              </span>
            </div>
            <h3
              id="orb-verification-heading"
              className="inter-semibold-font text-[18px] leading-snug text-slate-900 sm:text-[16px]"
            >
              Verify Your BMI Using Your GP Records
            </h3>
            <p className="inter-reg-font mt-1.5 text-[16px] leading-relaxed text-slate-500 sm:text-[14px]">
              Allow us to securely access your relevant GP clinical records
              through ORB to verify your height, weight and BMI.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowConsent(true)}
            className="inter-medium-font group inline-flex min-h-[38px] w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#47317c]/40 bg-[#47317c]/10 px-3 py-2.5 text-[15px] text-[#47317c] transition-all duration-150 hover:bg-[#47317c]/20 active:scale-[0.98] sm:px-5 sm:text-[16px] lg:w-auto"
          >
            <ShieldCheck aria-hidden="true" size={14} strokeWidth={2.2} className="max-sm:hidden" />
            <span>Connect to My NHS GP Records</span>
            <ChevronRight
              aria-hidden="true"
              size={13}
              strokeWidth={2.5}
              className="shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
            />
          </button>
        </div>
      </section>

      <AnimatePresence>
        {showConsent && (
          <OrbConsentDialog
            key="orb-consent"
            onClose={() => setShowConsent(false)}
            onAgree={handleAgree}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default OrbVerificationCard;
