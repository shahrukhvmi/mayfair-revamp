import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  ArrowUpRight,
  Camera,
  ChevronRight,
  Lock,
  PlayCircle,
  Stethoscope,
  X,
} from "lucide-react";
import { FiCheck } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import toast from "react-hot-toast";

import { orb_connect_url, orb_guide_url } from "@/config/constants";
import useCartStore from "@/store/useCartStore";
import useAuthStore from "@/store/authStore";
import { BMIGpRecordsORBPostCosent } from "@/api/bmiConsentApi";
import { getCurrentOrderId } from "@/utils/currentOrder";
import { handleApiError } from "@/utils/apiError";

export const ORB_CONSENT_TEXT =
  "I consent to Mayfair Weight Loss Clinic obtaining access to my relevant GP medical records through ORB for the purpose of verifying my BMI and treatment eligibility.";

const OptionCard = ({ icon: Icon, title, description, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-[#47317c]/15 bg-white p-4 text-left transition-all duration-150 hover:border-[#47317c]/40 hover:bg-[#f7f5fb] active:scale-[0.99] sm:p-5"
  >
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#47317c]/10 text-[#47317c]">
      <Icon aria-hidden="true" size={22} strokeWidth={1.8} />
    </span>
    <span className="min-w-0 flex-1">
      <span className="inter-semibold-font block text-[16px] leading-snug text-slate-900 sm:text-[17px]">
        {title}
      </span>
      <span className="inter-reg-font mt-1 block text-[16px] leading-snug text-slate-500 sm:text-[14px]">
        {description}
      </span>
    </span>
    <ChevronRight
      aria-hidden="true"
      size={18}
      strokeWidth={2.2}
      className="shrink-0 text-[#47317c] transition-transform duration-150 group-hover:translate-x-0.5"
    />
  </button>
);

const VerifyBmiDialog = ({ onClose }) => {
  const router = useRouter();
  const [view, setView] = useState("options");
  const [orbChecked, setOrbChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { orderId } = useCartStore();
  const clearToken = useAuthStore((state) => state.clearToken);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handlePhoto = () => {
    onClose();
    router.push("/photo-upload");
  };

  // Saves the ORB consent through the API first. Only when that succeeds does
  // the patient move on to the NHS link; on failure they stay here with the
  // error shown, so no consent is ever lost silently.
  const handleOrbAgree = async () => {
    if (!orbChecked || submitting) return;
    setSubmitting(true);
    try {
      const targetOrderId = await getCurrentOrderId(orderId);
      if (!targetOrderId) {
        toast.error("We could not find your order. Please refresh the page and try again.");
        return;
      }
      await BMIGpRecordsORBPostCosent({
        order_id: Number(targetOrderId),
        consent_type: "bmi_gp_records_orb",
        accepted: true,
        consent_text: ORB_CONSENT_TEXT,
        source: "web",
        meta: { verification_method: "gp_records" },
      });
    } catch (error) {
      const unauthorized = handleApiError(error, { clearToken, router });
      if (unauthorized) onClose();
      return;
    } finally {
      setSubmitting(false);
    }

    if (!orb_connect_url) {
      toast.success("Your consent has been saved. NHS GP records connection will be available soon.");
      return;
    }
    window.open(orb_connect_url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="verify-bmi-heading"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[calc(100dvh-48px)] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.24)] sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={20} strokeWidth={2} />
        </button>

        {view === "orb" && (
          <button
            type="button"
            onClick={() => setView("options")}
            className="inter-medium-font mb-3 inline-flex cursor-pointer items-center gap-1.5 text-[16px] text-[#47317c] transition-colors hover:text-[#392765] sm:text-[14px]"
          >
            <ArrowLeft aria-hidden="true" size={16} strokeWidth={2.2} />
            Back to options
          </button>
        )}

        {view === "options" && (
          <>
            <h2
              id="verify-bmi-heading"
              className="inter-semibold-font pr-10 text-[20px] leading-snug tracking-[-0.01em] text-slate-900 sm:text-[22px]"
            >
              Verify your BMI
            </h2>
            <p className="inter-reg-font mt-2 text-[16px] leading-relaxed text-slate-600">
              Please choose how you would like to verify your BMI.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <OptionCard
                icon={Camera}
                title="Verify BMI via photo upload"
                description="Upload a recent photo for our clinical team to review and verify your BMI."
                onClick={handlePhoto}
              />
              <OptionCard
                icon={Stethoscope}
                title="Verify BMI using your GP records"
                description="Allow us to securely access your relevant GP clinical records through ORB to verify your height, weight, and BMI."
                onClick={() => setView("orb")}
              />
            </div>
          </>
        )}

        {view === "orb" && (
          <>
            <h2
              id="verify-bmi-heading"
              className="inter-semibold-font pr-10 text-[20px] leading-snug tracking-[-0.01em] text-slate-900 sm:text-[22px]"
            >
              Verify BMI using your GP records
            </h2>
            <p className="inter-reg-font mt-2 text-[16px] leading-relaxed text-slate-600">
              Allow us to securely access your relevant GP clinical records
              through ORB to verify your height, weight, and BMI.
            </p>
            <p className="inter-reg-font mt-3 flex items-start gap-2 text-[15px] leading-relaxed text-slate-500">
              <Lock aria-hidden="true" size={15} strokeWidth={1.9} className="mt-1 shrink-0 text-[#47317c]" />
              You will be redirected to the NHS website, where you can securely
              authenticate your identity and authorise ORB to access your
              relevant clinical information.
            </p>

            <label className="mt-5 flex cursor-pointer select-none items-start gap-3 rounded-xl border border-[#47317c]/15 bg-[#f7f5fb] p-4">
              <span className="relative mt-0.5 flex shrink-0 items-center justify-center">
                <input
                  type="checkbox"
                  checked={orbChecked}
                  onChange={(e) => setOrbChecked(e.target.checked)}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-slate-300 bg-white transition-colors duration-200 checked:border-[#47317c] checked:bg-[#47317c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#47317c]/40 focus-visible:ring-offset-2"
                />
                <FiCheck size={13} className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100" />
              </span>
              <span className="inter-medium-font text-[15px] leading-snug text-slate-800">
                {ORB_CONSENT_TEXT}
              </span>
            </label>

            <button
              type="button"
              onClick={handleOrbAgree}
              disabled={!orbChecked || submitting}
              className={`inter-semibold-font mt-5 flex min-h-[54px] w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-3 text-[15px] transition-all duration-200 sm:px-6 sm:text-[16px] ${
                orbChecked && !submitting
                  ? "cursor-pointer bg-[#47317c] text-white shadow-[0_8px_20px_rgba(71,49,124,0.18)] hover:bg-[#392765] active:scale-[0.99]"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
              }`}
            >
              {submitting ? (
                <>
                  <AiOutlineLoading3Quarters aria-hidden="true" className="h-5 w-5 animate-spin" />
                  Saving consent...
                </>
              ) : (
                <>
                  Connect to My NHS GP Records
                  <ArrowUpRight aria-hidden="true" size={17} strokeWidth={2.2} />
                </>
              )}
            </button>

            <p className="inter-reg-font mt-3 flex items-start justify-center gap-1.5 text-center text-[16px] leading-snug text-slate-500 sm:text-[14px]">
              <PlayCircle aria-hidden="true" size={16} strokeWidth={1.9} className="mt-0.5 shrink-0 text-[#47317c]" />
              <span>
                Not sure how it works?{" "}
                <a
                  href={orb_guide_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inter-medium-font text-[#47317c] underline underline-offset-2 hover:text-[#392765]"
                >
                  Watch the step-by-step guide
                </a>
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// Opens when the patient clicks the BMI Verification button. Two options:
// photo upload (goes to /photo-upload) and ORB / NHS GP records.
const VerifyBmiModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return <VerifyBmiDialog onClose={onClose} />;
};

export default VerifyBmiModal;
