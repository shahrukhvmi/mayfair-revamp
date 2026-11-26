import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  Clock,
  FileText,
  Lock,
  ShieldCheck,
  Stethoscope,
  UploadCloud,
  Video,
  X,
} from "lucide-react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCheckCircle } from "react-icons/fa";
import { FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import { ImageUplaodApi } from "@/api/ImageUploadApi";
import UploadPhotoLogs from "@/api/UploadLogsApi";
import NextButton from "@/Components/NextButton/NextButton";
import UploadBox from "@/Components/UploadBox/UploadBox";
import { bmi_video_call_url, orb_connect_url } from "@/config/constants";
import { BmiVideoUploadApi, BMI_VIDEO_ENDPOINT } from "@/api/BmiVideoUploadApi";
import {
  BMI_VIDEO_ACCEPT,
  BMI_VIDEO_FORMATS_TEXT,
  formatFileSize,
  validateBmiVideoFile,
} from "@/utils/bmiVideoFile";
import useOrbConsentStore from "@/store/orbConsentStore";
import { ORB_CONSENT_TEXT } from "@/Components/ThankYou/OrbVerificationCard";
import {
  GP_LETTER_ACCEPT,
  GP_LETTER_FORMATS_TEXT,
  getFileExtension,
  validateGpLetterFile,
} from "@/utils/gpLetterFile";

export const VERIFY_BMI_DESCRIPTION =
  "To verify your BMI, you can either have a video call with a healthcare professional or upload an approved letter from your GP. Your order will be processed after your BMI has been verified.";

export const BMI_VIDEO_REQUIREMENTS =
  "A short video of you standing on a weighing scale. Your weight must be clearly visible, with your ID placed beside you and its details clearly legible.";

export const GP_LETTER_REQUIREMENTS =
  "A letter from your GP or pharmacist confirming your height and weight. This must include your full name and date of birth, be printed on official headed paper or bear a pharmacy stamp, and be signed by a qualified healthcare professional.";

const OptionCard = ({ icon: Icon, title, description, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-[#47317c]/15 bg-white p-4 text-left transition-all duration-150 hover:border-[#47317c]/40 hover:bg-[#f5f2fc] active:scale-[0.99] sm:p-5"
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

// Like the GP booking popup: the call details sit in our own panel on the
// left and Calendly shows only its calendar (hide_event_type_details).
// embed_type + embed_domain (what Calendly's own embed script adds) give it a
// white background instead of its grey page background.
const withCalendlyEmbedParams = (url) => {
  const domain = typeof window !== "undefined" ? window.location.host : "";
  return `${url}${url.includes("?") ? "&" : "?"}hide_event_type_details=1&embed_type=Inline&embed_domain=${encodeURIComponent(domain)}`;
};

const CALL_DETAILS = [
  { icon: Clock, text: "10 mins" },
  { icon: Video, text: "Video call" },
  { icon: ShieldCheck, text: "Confidential & secure" },
];

const CalendlyView = ({ src }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="mt-5 flex flex-col border-t border-slate-200 sm:flex-row">
      <div className="shrink-0 border-b border-slate-200 py-4 sm:w-[240px] sm:border-b-0 sm:border-r sm:py-6 sm:pr-6">
        <p className="inter-reg-font hidden text-[12px] uppercase tracking-wider text-slate-400 sm:block">
          London Slimming Clinic
        </p>
        <h3 className="inter-semibold-font text-[16px] leading-tight text-slate-900 sm:mt-2 sm:text-[20px]">
          BMI verification call
        </h3>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 sm:mt-6 sm:flex-col sm:gap-4">
          {CALL_DETAILS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-1.5">
              <Icon aria-hidden="true" size={16} strokeWidth={1.8} className="shrink-0 text-slate-400" />
              <span className="inter-reg-font text-[13px] text-slate-600 sm:text-[14px]">{text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative h-[min(640px,calc(100dvh-210px))] min-h-[420px] w-full sm:w-auto sm:flex-1">
        {!loaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
            <AiOutlineLoading3Quarters className="h-6 w-6 animate-spin text-[#47317c]" />
          </div>
        )}
        <iframe
          title="Schedule a video call"
          src={withCalendlyEmbedParams(src)}
          onLoad={() => setLoaded(true)}
          className="h-full w-full border-0"
        />
      </div>
    </div>
  );
};

const VerifyBmiDialog = ({ orderId, resolveOrderId, onClose, onUploaded }) => {
  const router = useRouter();
  const [view, setView] = useState("options");
  const [letter, setLetter] = useState(null);
  const [checkingFile, setCheckingFile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [orbChecked, setOrbChecked] = useState(false);
  const [video, setVideo] = useState(null);
  const [uploadedKind, setUploadedKind] = useState("letter");
  const videoInputRef = useRef(null);
  const saveOrbConsent = useOrbConsentStore((state) => state.saveConsent);
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

  const clearVideo = () => {
    setVideo(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const goToOptions = () => {
    clearLetter();
    clearVideo();
    setOrbChecked(false);
    setView("options");
  };

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCheckingFile(true);
    try {
      const error = await validateBmiVideoFile(file);
      if (error) {
        logError(error);
        clearVideo();
        return;
      }
      setVideo(file);
    } catch (err) {
      logError("Something went wrong while processing this video.");
      clearVideo();
    } finally {
      setCheckingFile(false);
    }
  };

  const handleVideoUpload = async () => {
    if (!video || uploading) return;

    if (!BMI_VIDEO_ENDPOINT) {
      toast("Video upload will be available soon.");
      return;
    }

    setUploading(true);
    try {
      const targetOrderId = resolveOrderId ? await resolveOrderId() : orderId;
      if (!targetOrderId) {
        logError("We could not find your order. Please refresh the page and try again.");
        return;
      }

      const formData = new FormData();
      formData.append("video", video);
      formData.append("order_id", targetOrderId);

      await BmiVideoUploadApi(formData);
      clearVideo();
      setUploadedKind("video");
      setView("success");
      onUploaded();
    } catch (error) {
      if (error?.response?.data?.message === "Unauthenticated.") {
        logError("Failed to upload your video. Please login again.");
        router.push("/login");
      } else {
        logError(
          error?.response?.data?.errors?.video ||
            error?.response?.data?.errors?.Order ||
            "Something went wrong. Please try again.",
        );
      }
      clearVideo();
    } finally {
      setUploading(false);
    }
  };

  const handleOrbAgree = async () => {
    if (!orbChecked) return;

    const targetOrderId = resolveOrderId ? await resolveOrderId() : orderId;

    // TODO: send this consent to the API once the endpoint is available.
    saveOrbConsent(targetOrderId, {
      accepted: true,
      acceptedAt: new Date().toISOString(),
      text: ORB_CONSENT_TEXT,
    });

    if (!orb_connect_url) {
      toast("NHS GP records connection will be available soon.");
      return;
    }

    window.open(orb_connect_url, "_blank", "noopener,noreferrer");
    onClose();
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
      setUploadedKind("letter");
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
        className={`relative max-h-[calc(100dvh-48px)] w-full overflow-y-auto rounded-xl bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.24)] outline-none sm:p-8 ${
          isCalendly ? "max-w-[980px]" : "max-w-[560px]"
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

        {(view === "calendly" || view === "letter" || view === "video" || view === "orb") && (
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
                title="Verify BMI via video call scheduling"
                description="Book a video call with a healthcare professional, who will confirm your height and weight."
                onClick={() => setView("calendly")}
              />
              <OptionCard
                icon={FileText}
                title="Verify BMI via GP letter"
                description="Already have an approved letter from your GP? Upload it for our clinical team to review."
                onClick={() => setView("letter")}
              />
              <OptionCard
                icon={Stethoscope}
                title="Verify BMI using your GP records"
                description="Allow us to securely access your relevant GP clinical records through ORB to verify your height, weight and BMI."
                onClick={() => setView("orb")}
              />
            </div>
          </>
        )}

        {view === "video" && (
          <>
            <h2
              id="verify-bmi-heading"
              className="inter-semibold-font pr-10 text-[20px] leading-snug tracking-[-0.01em] text-slate-900 sm:text-[22px]"
            >
              Verify BMI via video upload
            </h2>
            <div className="mt-4 rounded-xl border border-[#47317c]/10 bg-[#f5f2fc] px-4 py-3.5">
              <p className="inter-reg-font text-[16px] leading-6 text-slate-600">
                {BMI_VIDEO_REQUIREMENTS}
              </p>
            </div>

            <input
              ref={videoInputRef}
              id="bmi-video-input"
              type="file"
              accept={BMI_VIDEO_ACCEPT}
              onChange={handleVideoChange}
              className="sr-only"
            />

            {!video ? (
              <label
                htmlFor="bmi-video-input"
                className="mt-5 flex min-h-[150px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#47317c]/40 bg-white px-4 py-6 text-center transition-colors hover:bg-[#f5f2fc]"
              >
                {checkingFile ? (
                  <AiOutlineLoading3Quarters className="h-7 w-7 animate-spin text-[#47317c]" />
                ) : (
                  <>
                    <UploadCloud aria-hidden="true" size={30} strokeWidth={1.6} className="text-[#47317c]" />
                    <span className="inter-semibold-font text-[16px] text-slate-900">
                      Choose or record a video
                    </span>
                    <span className="inter-reg-font text-[14px] text-slate-500">
                      {BMI_VIDEO_FORMATS_TEXT}
                    </span>
                  </>
                )}
              </label>
            ) : (
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#47317c]/25 bg-[#f5f2fc] p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#47317c]/10 text-[#47317c]">
                  <Video aria-hidden="true" size={20} strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="inter-semibold-font block truncate text-[15px] text-slate-900">
                    {video.name}
                  </span>
                  <span className="inter-reg-font block text-[14px] text-slate-500">
                    {formatFileSize(video.size)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={clearVideo}
                  disabled={uploading}
                  aria-label="Remove video"
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleVideoUpload}
              disabled={uploading || checkingFile || !video}
              className={`inter-semibold-font mt-5 flex min-h-[54px] w-full items-center justify-center rounded-xl px-6 py-3 text-[16px] transition-all duration-200 ${
                uploading || checkingFile || !video
                  ? "cursor-not-allowed bg-slate-200 text-slate-400"
                  : "cursor-pointer bg-[#47317c] text-white shadow-[0_8px_20px_rgba(71,49,124,0.18)] hover:bg-[#392765] active:scale-[0.99]"
              }`}
            >
              {uploading ? "Uploading video..." : "Upload"}
            </button>
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
              through ORB to verify your height, weight and BMI.
            </p>
            <p className="inter-reg-font mt-3 flex items-start gap-2 text-[15px] leading-relaxed text-slate-500">
              <Lock aria-hidden="true" size={15} strokeWidth={1.9} className="mt-1 shrink-0 text-[#47317c]" />
              You will be redirected to the NHS website, where you can securely
              authenticate your identity and authorise ORB to access your
              relevant clinical information.
            </p>

            <label className="mt-5 flex cursor-pointer select-none items-start gap-3 border border-[#47317c]/15 bg-[#f5f2fc] p-4">
              <span className="relative mt-0.5 flex shrink-0 items-center justify-center">
                <input
                  type="checkbox"
                  checked={orbChecked}
                  onChange={(e) => setOrbChecked(e.target.checked)}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-[4px] border-2 border-slate-300 bg-white transition-colors duration-200 checked:border-[#47317c] checked:bg-[#47317c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#47317c]/40 focus-visible:ring-offset-2"
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
              disabled={!orbChecked}
              className={`inter-semibold-font mt-5 flex min-h-[54px] w-full items-center justify-center gap-1.5 rounded-xl px-6 py-3 text-[16px] transition-all duration-200 ${
                orbChecked
                  ? "cursor-pointer bg-[#47317c] text-white shadow-[0_8px_20px_rgba(71,49,124,0.18)] hover:bg-[#392765] active:scale-[0.99]"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
              }`}
            >
              {/* Agree &amp; continue to NHS */}
              Connect to My NHS GP Records
              <ArrowUpRight aria-hidden="true" size={17} strokeWidth={2.2} />
            </button>
          </>
        )}

        {view === "calendly" && (
          <>
            <h2
              id="verify-bmi-heading"
              className="inter-semibold-font pr-10 text-[20px] leading-snug tracking-[-0.01em] text-slate-900 sm:text-[22px]"
            >
              Verify BMI via video call scheduling
            </h2>
            <CalendlyView src={bmi_video_call_url} />
          </>
        )}

        {view === "letter" && (
          <>
            <h2
              id="verify-bmi-heading"
              className="inter-semibold-font pr-10 text-[20px] leading-snug tracking-[-0.01em] text-slate-900 sm:text-[22px]"
            >
              Verify BMI via GP letter
            </h2>
            <div className="mt-4 rounded-xl border border-[#47317c]/10 bg-[#f5f2fc] px-4 py-3.5">
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
              {uploadedKind === "video" ? "Video uploaded" : "GP letter uploaded"}
            </h2>
            <p className="inter-reg-font mb-6 mt-3 text-[16px] leading-6 text-slate-600">
              Your {uploadedKind === "video" ? "video" : "GP letter"} has been
              uploaded and is now under review by our
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

// HEIC browser mein preview nahi hota, is liye photo upload ki tarah JPEG mein convert
const convertHeicToJpeg = async (file) => {
  const { heicTo } = await import("heic-to");
  try {
    const blob = await heicTo({ blob: file, toType: "image/jpeg", quality: 0.9 });
    return new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
      type: "image/jpeg",
    });
  } catch (err) {
    return file;
  }
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
