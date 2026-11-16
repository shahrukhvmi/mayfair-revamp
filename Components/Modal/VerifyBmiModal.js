import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, FileText, Video, X } from "lucide-react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCheckCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import { ImageUplaodApi } from "@/api/ImageUploadApi";
import UploadPhotoLogs from "@/api/UploadLogsApi";
import NextButton from "@/Components/NextButton/NextButton";
import UploadBox from "@/Components/UploadBox/UploadBox";
import { bmi_video_call_url } from "@/config/constants";
import {
  GP_LETTER_ACCEPT,
  GP_LETTER_FORMATS_TEXT,
  convertHeicToJpeg,
  getFileExtension,
  validateGpLetterFile,
} from "@/utils/gpLetterFile";

export const VERIFY_BMI_DESCRIPTION =
  "To verify your BMI, you can either have a video call with a healthcare professional or upload an approved letter from your GP. Your order will be processed after your BMI has been verified.";

export const GP_LETTER_REQUIREMENTS =
  "A letter from your GP or pharmacist confirming your height and weight. This must include your full name and date of birth, be printed on official headed paper or bear a pharmacy stamp, and be signed by a qualified healthcare professional.";

const OptionCard = ({ icon: Icon, title, description, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-[#47317c]/15 bg-white p-4 text-left transition-all duration-150 hover:border-[#47317c]/40 hover:bg-[#f8f6fc] active:scale-[0.99] sm:p-5"
  >
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f5f2fc] text-[#47317c]">
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

const VerifyBmiDialog = ({ orderId, resolveOrderId, onClose, onUploaded }) => {
  const router = useRouter();
  const [view, setView] = useState("options");
  const [calendlyLoaded, setCalendlyLoaded] = useState(false);
  const [letter, setLetter] = useState(null);
  const [checkingFile, setCheckingFile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const dialogRef = useRef(null);

  const requestClose = () => {
    if (!uploading) onClose();
  };

  const logError = (message) => {
    toast.error(message);
    UploadPhotoLogs({ message }).catch(() => {});
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  // Har view par scroll upar se shuru ho aur focus dialog ke andar rahe
  useEffect(() => {
    dialogRef.current?.scrollTo?.(0, 0);
    dialogRef.current?.focus();
  }, [view]);

  const clearLetter = () => {
    setLetter(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const goToOptions = () => {
    clearLetter();
    setView("options");
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCheckingFile(true);
    try {
      const error = await validateGpLetterFile(file);
      if (error) {
        logError(error);
        clearLetter();
        return;
      }

      const extension = getFileExtension(file.name);
      if (extension === "heic" || extension === "heif") {
        setLetter(await convertHeicToJpeg(file));
      } else {
        setLetter(file);
      }
    } catch (err) {
      logError("Something went wrong while processing this file.");
      clearLetter();
    } finally {
      setCheckingFile(false);
    }
  };

  const handleUpload = async () => {
    if (!letter || uploading) return;

    setUploading(true);
    try {
      const targetOrderId = resolveOrderId ? await resolveOrderId() : orderId;
      if (!targetOrderId) {
        logError("We could not find your order. Please refresh the page and try again.");
        return;
      }

      const formData = new FormData();
      formData.append("front", letter);
      formData.append("order_id", targetOrderId);

      await ImageUplaodApi(formData);
      clearLetter();
      setView("success");
      onUploaded();
    } catch (error) {
      const frontError = error?.response?.data?.errors?.front;
      const orderError = error?.response?.data?.errors?.Order;

      if (error?.response?.data?.message === "Unauthenticated.") {
        logError("Failed to upload your letter. Please login again.");
        router.push("/login");
      } else {
        logError(frontError || orderError || "Something went wrong. Please try again.");
      }
      clearLetter();
    } finally {
      setUploading(false);
    }
  };

  const isCalendly = view === "calendly";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={view === "options" || view === "success" ? requestClose : undefined}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="verify-bmi-heading"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`relative max-h-[calc(100dvh-48px)] w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.24)] outline-none sm:p-8 ${
          isCalendly ? "max-w-[860px]" : "max-w-[560px]"
        }`}
      >
        <button
          type="button"
          onClick={requestClose}
          disabled={uploading}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={20} strokeWidth={2} />
        </button>

        {(view === "calendly" || view === "letter") && (
          <button
            type="button"
            onClick={goToOptions}
            disabled={uploading}
            className="inter-medium-font mb-3 inline-flex cursor-pointer items-center gap-1.5 text-[16px] text-[#47317c] transition-colors hover:text-[#392765] disabled:cursor-not-allowed disabled:opacity-50 sm:text-[14px]"
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
              Please choose how you would like to verify your BMI. Your order
              will be processed after your BMI has been verified.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <OptionCard
                icon={Video}
                title="Schedule a video call"
                description="Book a video call with a healthcare professional, who will confirm your height and weight."
                onClick={() => setView("calendly")}
              />
              <OptionCard
                icon={FileText}
                title="Upload GP letter"
                description="Already have an approved letter from your GP? Upload it for our clinical team to review."
                onClick={() => setView("letter")}
              />
            </div>
          </>
        )}

        {view === "calendly" && (
          <>
            <h2
              id="verify-bmi-heading"
              className="inter-semibold-font pr-10 text-[20px] leading-snug tracking-[-0.01em] text-slate-900 sm:text-[22px]"
            >
              Schedule a video call
            </h2>
            <div className="relative mt-4 h-[min(660px,calc(100dvh-200px))] min-h-[420px] w-full overflow-hidden rounded-xl border border-slate-200">
              {!calendlyLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-white">
                  <AiOutlineLoading3Quarters className="h-6 w-6 animate-spin text-[#47317c]" />
                </div>
              )}
              <iframe
                title="Schedule a video call"
                src={bmi_video_call_url}
                onLoad={() => setCalendlyLoaded(true)}
                className="relative h-full w-full border-0"
              />
            </div>
          </>
        )}

        {view === "letter" && (
          <>
            <h2
              id="verify-bmi-heading"
              className="inter-semibold-font pr-10 text-[20px] leading-snug tracking-[-0.01em] text-slate-900 sm:text-[22px]"
            >
              Upload GP letter
            </h2>
            <div className="mt-4 rounded-xl border border-[#47317c]/10 bg-[#f8f6fc] px-4 py-3.5">
              <p className="inter-reg-font text-[16px] leading-6 text-slate-600">
                {GP_LETTER_REQUIREMENTS}
              </p>
            </div>

            <div className="mt-5">
              <UploadBox
                label="GP letter"
                title="Upload your GP letter"
                photo={letter}
                type="gpLetter"
                loadingPhoto={checkingFile}
                onUpload={handleFileChange}
                onRemove={clearLetter}
                inputRef={fileInputRef}
                accept={GP_LETTER_ACCEPT}
                formatsText={GP_LETTER_FORMATS_TEXT}
                removeTitle="Remove file"
              />
            </div>

            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || checkingFile || !letter}
              className={`inter-semibold-font mt-5 flex min-h-[54px] w-full items-center justify-center rounded-xl px-6 py-3 text-[16px] transition-all duration-200 ${
                uploading || checkingFile || !letter
                  ? "cursor-not-allowed bg-slate-200 text-slate-400"
                  : "cursor-pointer bg-[#47317c] text-white shadow-[0_8px_20px_rgba(71,49,124,0.18)] hover:bg-[#392765] active:scale-[0.99]"
              }`}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </>
        )}

        {view === "success" && (
          <div className="py-2 text-center">
            <FaCheckCircle className="mx-auto mb-4 text-[#47317c]" size={64} />
            <h2
              id="verify-bmi-heading"
              className="inter-semibold-font text-[22px] text-slate-900 max-sm:text-[24px]"
            >
              GP letter uploaded
            </h2>
            <p className="inter-reg-font mb-6 mt-3 text-[16px] leading-6 text-slate-600">
              Your GP letter has been uploaded and is now under review by our
              prescribers. We&apos;ll approve your order once the review is
              complete and notify you straight away.
            </p>
            <NextButton label="Done" type="button" onClick={onClose} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const VerifyBmiModal = ({ isOpen, orderId, resolveOrderId, onClose, onUploaded }) => (
  <AnimatePresence>
    {isOpen && (
      <VerifyBmiDialog
        key="verify-bmi"
        orderId={orderId}
        resolveOrderId={resolveOrderId}
        onClose={onClose}
        onUploaded={onUploaded}
      />
    )}
  </AnimatePresence>
);

export default VerifyBmiModal;
