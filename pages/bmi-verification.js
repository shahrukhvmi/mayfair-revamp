import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";
import { heicTo, isHeic } from "heic-to";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  FileText,
  Mail,
  ShieldCheck,
  UploadCloud,
  Weight,
  X,
} from "lucide-react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaCheck } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import StepsHeader from "@/layout/stepsHeader";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import PageLoader from "@/Components/PageLoader/PageLoader";
import NextButton from "@/Components/NextButton/NextButton";
import ProtectedPage from "@/Components/ProtectedPage/ProtectedPage";
import { ImageUplaodApi } from "@/api/ImageUploadApi";
import { GetIdVerification } from "@/api/IdVerificationApi";
import UploadPhotoLogs from "@/api/UploadLogsApi";
import useImageUploadStore from "@/store/useImageUploadStore ";
import useIdVerificationUploadStore from "@/store/useIdVerificationUploadStore";
import FullBody from "@/public/images/full-body-ok.png";
import HalfBodyX from "@/public/images/half-body-x.png";
import FaceX from "@/public/images/face-x.png";

const EMAIL = "contact@mayfairweightlossclinic.co.uk";

// ✅ Allowed file types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/avif",
];

const BLOCKED_EXTENSIONS = [
  ".exe",
  ".bat",
  ".sh",
  ".cmd",
  ".msi",
  ".dll",
  ".js",
  ".ts",
  ".php",
  ".py",
  ".rb",
  ".zip",
  ".rar",
  ".tar",
  ".gz",
  ".mp4",
  ".mp3",
];

const MAX_SIZE_MB = 30;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// Each verification method. `apiType` is sent as `type` to BMIImagesForOrderProcess (null = normal BMI photo).
const OPTIONS = [
  {
    id: "photo",
    icon: Camera,
    title: "Upload a full body photo",
    summary: "The quickest way to verify, takes about a minute",
    badge: "Recommended",
    label: "full body photo",
    uploadTitle: "Upload a full-body photo",
    pendingCta: "Upload your photo to continue",
    submitCta: "Submit full body photo",
    apiType: null,
  },
  {
    id: "letter",
    icon: FileText,
    title: "Upload a letter from your GP or pharmacist",
    summary: "A signed letter confirming your height and weight",
    label: "GP or pharmacist letter",
    uploadTitle: "Upload your letter",
    pendingCta: "Upload your letter to continue",
    submitCta: "Submit letter",
    apiType: "evidence",
  },
  {
    id: "email",
    icon: Weight,
    title: "Email a photo or video on a weighing scale",
    summary: "Send it to our clinical team by email",
    label: "weighing scale photo or video",
  },
];

const getOption = (id) => OPTIONS.find((o) => o.id === id);

/* ── Upload box (same look as photo-upload) ── */
const UploadBox = ({ title, file, loadingFile, disabled, onUpload, onRemove, inputRef }) => {
  // ✅ Memoize blob URL — only created once per file, not on every render
  const fileUrl = useMemo(() => {
    if (!file || !(file instanceof File)) return null;
    return URL.createObjectURL(file);
  }, [file]);

  // ✅ Revoke old blob URL when file changes or component unmounts
  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  return (
    <div className={`w-full ${disabled ? "pointer-events-none select-none opacity-45" : ""}`} aria-disabled={disabled}>
      <div className="relative w-full">
        <label className="block w-full cursor-pointer rounded-xl focus-within:ring-2 focus-within:ring-[#47317c]/25 focus-within:ring-offset-2">
          <div className="relative flex min-h-[164px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#9b87c8] bg-[#f8f6fc] px-5 py-6 text-center transition-all duration-200 hover:border-[#47317c] hover:bg-[#f4f1fa]">
            <input
              ref={inputRef}
              type="file"
              disabled={disabled}
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,image/avif,application/pdf"
              onChange={onUpload}
              className="hidden"
            />

            {loadingFile ? (
              <div className="flex flex-col items-center justify-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#47317c]/10">
                  <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin text-[#47317c]" />
                </div>
                <p className="inter-medium-font text-[16px] text-slate-700">Preparing your file...</p>
              </div>
            ) : !file ? (
              <div className="flex flex-col items-center justify-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#47317c] shadow-sm ring-1 ring-[#47317c]/10">
                  <UploadCloud className="h-5 w-5" strokeWidth={2} />
                </div>
                <p className="inter-semibold-font text-[16px] text-slate-800">{title}</p>
                <p className="inter-reg-font mt-1 text-[16px] leading-6 text-slate-500">
                  Tap to browse files from your device
                </p>
              </div>
            ) : (
              <div className="relative flex w-full flex-col items-center">
                {file?.type === "application/pdf" ? (
                  <div className="my-1 flex h-36 w-full max-w-[240px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white">
                    <FileText className="mb-2 h-9 w-9 text-red-500" strokeWidth={1.6} />
                    <p className="inter-reg-font w-full truncate px-3 text-center text-[16px] text-slate-600">
                      {file?.name}
                    </p>
                  </div>
                ) : (
                  <img
                    src={fileUrl}
                    alt={`${title} preview`}
                    className="my-1 h-36 w-full max-w-[240px] rounded-xl bg-white object-contain shadow-sm ring-1 ring-slate-200"
                  />
                )}
                <p className="inter-medium-font mt-2 inline-flex items-center gap-1.5 text-[14px] text-emerald-700">
                  <CheckCircle2 size={15} strokeWidth={2.2} />
                  Ready to submit · Tap to replace
                </p>
              </div>
            )}
          </div>
        </label>

        {/* ✅ Delete button — outside the label so it doesn't reopen the file picker */}
        {file && !loadingFile && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -right-2 -top-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-red-600 shadow-md ring-1 ring-red-100 transition-colors duration-200 hover:bg-red-50"
            title="Remove file"
            aria-label="Remove file"
          >
            <RxCross2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="inter-reg-font mt-3 text-center text-[16px] leading-6 text-slate-500">
        JPEG, PNG, WEBP, HEIC, HEIF, AVIF or PDF · Maximum 30 MB
      </p>
    </div>
  );
};

/* ── Small check list used inside the panels ── */
const CheckList = ({ heading, items }) => (
  <div className="rounded-xl border border-[#47317c]/10 bg-[#f8f6fc] px-4 py-3.5">
    <p className="inter-semibold-font mb-2.5 text-[16px] text-slate-800">{heading}</p>
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="inter-reg-font flex items-start gap-2.5 text-[16px] leading-6 text-slate-600">
          <span className="mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#47317c]/10 text-[#47317c]">
            <Check size={11} strokeWidth={3} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

/* ── Accordion item ── */
const OptionItem = ({ option, isSelected, isOpen, hasFile, onToggle, children }) => {
  const reduceMotion = useReducedMotion();
  const Icon = option.icon;
  const panelId = `bmi-option-panel-${option.id}`;
  const headerId = `bmi-option-header-${option.id}`;
  const itemRef = useRef(null);

  // Keep the opened option in view on small screens
  useEffect(() => {
    if (!isOpen || !itemRef.current) return;
    const t = setTimeout(() => {
      itemRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
    }, 260);
    return () => clearTimeout(t);
  }, [isOpen, reduceMotion]);

  return (
    <div
      ref={itemRef}
      className={`overflow-hidden rounded-2xl border bg-white transition-all duration-200 ${
        // Green border stays on the option that holds the file, even when it is closed
        hasFile
          ? "border-emerald-400 shadow-[0_2px_8px_rgba(16,185,129,0.08)]"
          : isSelected
            ? "border-[#47317c] shadow-[0_2px_8px_rgba(71,49,124,0.06)]"
            : "border-slate-200 hover:border-[#47317c]/35"
      }`}
    >
      <button
        type="button"
        id={headerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left focus:outline-none focus-visible:bg-[#f8f6fc] sm:gap-4 sm:px-5"
      >
        {/* Icon */}
        <span
          aria-hidden="true"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
            isSelected ? "bg-[#47317c] text-white" : "bg-[#f4f1fa] text-[#47317c]"
          }`}
        >
          <Icon size={19} strokeWidth={1.9} />
        </span>

        {/* Text */}
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inter-semibold-font text-[16px] leading-snug text-slate-900">
              {option.title}
            </span>
            {option.badge && (
              <span className="inter-medium-font rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] max-sm:text-[12px] uppercase tracking-[0.06em] text-emerald-700 ring-1 ring-emerald-200">
                {option.badge}
              </span>
            )}
            {hasFile && (
              <span className="inter-medium-font inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] max-sm:text-[12px] uppercase tracking-[0.06em] text-emerald-700 ring-1 ring-emerald-200">
                <Check size={11} strokeWidth={3} />
                File added
              </span>
            )}
          </span>
          <span className="inter-reg-font mt-0.5 block text-[14px] max-sm:text-[15px] leading-snug text-slate-500">
            {option.summary}
          </span>
        </span>

        {/* Chevron */}
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.22 }}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isOpen ? "bg-[#47317c]/[0.07] text-[#47317c]" : "text-slate-400"
          }`}
        >
          <ChevronDown size={18} strokeWidth={2.2} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            key="panel"
            initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-4 pb-5 pt-4 sm:px-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Notice shown in an option when a file was already added in another option ── */
const OtherFileNotice = ({ otherOption, onSwitch }) => (
  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3.5">
    <div className="flex items-start gap-2.5">
      <AlertCircle size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-amber-600" />
      <div className="min-w-0">
        <p className="inter-medium-font text-[15px] leading-6 text-amber-900">
          You have already added a {otherOption.label}.
        </p>
        <p className="inter-reg-font text-[15px] leading-6 text-amber-800">
          Only one verification method is needed. Remove it to use this option instead.
        </p>
        <button
          type="button"
          onClick={onSwitch}
          className="inter-medium-font mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-[14px] text-amber-800 transition-colors hover:bg-amber-100"
        >
          <X size={14} strokeWidth={2.4} />
          Remove it and use this option
        </button>
      </div>
    </div>
  </div>
);

const BmiVerification = () => {
  const GO = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();

  const [selectedId, setSelectedId] = useState(null);
  const [openId, setOpenId] = useState(null);
  // Only ONE file can exist at a time across all options
  const [upload, setUpload] = useState(null); // { optionId, file }
  const [loadingFile, setLoadingFile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [orderIdGetUrl, setOrderIdGetUrl] = useState(null);

  const inputRefs = { photo: useRef(null), letter: useRef(null) };

  const { setImageUploaded } = useImageUploadStore();
  const { idVerificationUpload, setIdVerificationUpload } = useIdVerificationUploadStore();

  const selectedOption = getOption(selectedId);
  const fileOption = upload ? getOption(upload.optionId) : null;

  const logError = (message) => {
    toast.error(message);
    UploadPhotoLogs({ message }).catch(() => {});
  };

  // get order id from url (email link)
  useEffect(() => {
    const param = searchParams.get("order_id");
    if (param) {
      const parsedId = parseInt(param, 10);
      if (!isNaN(parsedId)) setOrderIdGetUrl(parsedId);
    }
  }, [searchParams]);

  // Refresh ID status so the next step after submit is correct
  useEffect(() => {
    GetIdVerification()
      .then((res) => setIdVerificationUpload(res?.data?.status))
      .catch(() => {});
  }, []);

  const clearUpload = () => {
    setUpload(null);
    Object.values(inputRefs).forEach((ref) => {
      if (ref.current) ref.current.value = "";
    });
  };

  const handleToggle = (id) => {
    setSelectedId(id);
    setOpenId((current) => (current === id ? null : id));
  };

  // ✅ Compress image using <canvas>
  const compressImage = (file, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (blob) resolve(blob);
            else reject(new Error("Image compression failed."));
          },
          "image/jpeg",
          quality,
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to load image for compression."));
      };
      img.src = objectUrl;
    });
  };

  // ✅ Handle upload + conversion + compression (same rules as photo-upload)
  const handleUpload = async (e, optionId) => {
    const file = e.target.files[0];
    if (!file) return;

    const resetInput = () => {
      if (e?.target?.value !== undefined) e.target.value = "";
    };

    // Guard: never keep two files from different options
    if (upload && upload.optionId !== optionId) {
      resetInput();
      return;
    }

    const fileName = file.name.toLowerCase();
    if (BLOCKED_EXTENSIONS.some((ext) => fileName.endsWith(ext))) {
      logError("The file must be an image (jpeg, png, webp, heic, heif, avif) or a pdf.");
      resetInput();
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      logError(`File too large. Maximum allowed size is ${MAX_SIZE_MB} MB.`);
      resetInput();
      return;
    }

    try {
      const isPdf = file.type === "application/pdf";
      const isAllowedImage = ALLOWED_TYPES.includes(file.type) || isHeic(file);

      if (!isPdf && !isAllowedImage) {
        logError("Only JPEG, PNG, WEBP, HEIC, HEIF, AVIF, or PDF files are allowed.");
        resetInput();
        return;
      }

      setLoadingFile(true);

      // ✅ PDF — no compression or HEIC conversion needed
      if (isPdf) {
        setUpload({ optionId, file });
        return;
      }

      let processedFile = file;

      // ✅ Try HEIC conversion
      if (isHeic(file)) {
        try {
          const heicBlob = await heicTo({ blob: file, toType: "image/jpeg", quality: 0.9 });
          processedFile = new File([heicBlob], file.name.replace(/\.heic$/i, ".jpg"), {
            type: "image/jpeg",
          });
        } catch (err) {
          // 🚫 Block completely if file seems corrupted
          if (file.size === 0 || !file.type || file.name === "") {
            logError("This file appears to be corrupted. Please try another image.");
            resetInput();
            return;
          }
          // Otherwise continue using the original HEIC file
        }
      }

      // ✅ Compress large files
      if (processedFile.size > MAX_SIZE_BYTES) {
        const compressedBlob = await compressImage(processedFile, 0.8);
        if (compressedBlob.size > MAX_SIZE_BYTES) {
          logError(`Image too large even after compression (max ${MAX_SIZE_MB} MB).`);
          resetInput();
          return;
        }
        processedFile = new File([compressedBlob], file.name, { type: "image/jpeg" });
      }

      setUpload({ optionId, file: processedFile });
    } catch (err) {
      logError("Something went wrong while processing this file.");
      resetInput();
    } finally {
      setLoadingFile(false);
    }
  };

  const onSubmit = async () => {
    if (!upload || !fileOption) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("front", upload.file);
      if (fileOption.apiType) formData.append("type", fileOption.apiType);
      // order_id only comes from the email link (?order_id=); skip it otherwise
      if (orderIdGetUrl) formData.append("order_id", orderIdGetUrl);

      const res = await ImageUplaodApi(formData);

      if (res?.status === 200) {
        setImageUploaded(true);
        setSubmittedId(upload.optionId);
        clearUpload();
      }
    } catch (error) {
      const frontError = error?.response?.data?.errors?.front;
      const orderError = error?.response?.data?.errors?.Order;

      if (error?.response?.data?.message === "Unauthenticated.") {
        logError("Failed to upload your file. Please login again.");
        GO.push("/login");
        return;
      }

      if (frontError) logError(frontError);
      else if (orderError) logError(orderError);
      else logError("Something went wrong. Please try again.");

      // ✅ Clear the file on any API error — forces user to re-select
      clearUpload();
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Please copy the email address manually.");
    }
  };

  const mailtoHref = useMemo(() => {
    const subject = `BMI verification${orderIdGetUrl ? ` - Order ${orderIdGetUrl}` : ""}`;
    const body = [
      "Hello,",
      "",
      "Please find attached a photo or video of me standing on a weighing scale, with my identification document beside me, to verify my BMI.",
      "",
      "Full name:",
      `Order number: ${orderIdGetUrl || ""}`,
      "",
      "Thank you",
    ].join("\n");
    return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [orderIdGetUrl]);

  const handleRedirect = () => {
    setIsRedirecting(true);
    GO.push(idVerificationUpload ? "/dashboard" : "/id-verification");
  };

  // Bottom action state
  const blockedByOtherFile = !!(upload && selectedId && upload.optionId !== selectedId);
  // A file anywhere means the page is ready to submit that file, even if another option is open
  const canSubmit = !!(upload && !loadingFile && !loading);
  let ctaLabel = "Select an option to continue";
  if (upload) ctaLabel = fileOption.submitCta;
  else if (selectedOption?.submitCta) ctaLabel = selectedOption.pendingCta;
  if (loading) ctaLabel = "Submitting...";

  const renderUploadArea = (option) => (
    <>
      {blockedByOtherFile && openId === option.id && (
        <OtherFileNotice otherOption={fileOption} onSwitch={clearUpload} />
      )}
      <UploadBox
        title={option.uploadTitle}
        file={upload?.optionId === option.id ? upload.file : null}
        loadingFile={loadingFile && selectedId === option.id}
        disabled={!!(upload && upload.optionId !== option.id)}
        onUpload={(e) => handleUpload(e, option.id)}
        onRemove={clearUpload}
        inputRef={inputRefs[option.id]}
      />
    </>
  );

  const submittedOption = getOption(submittedId);

  return (
    <>
      <StepsHeader />
      <MetaLayout canonical={`${meta_url}bmi-verification/`} />
      {loading && <PageLoader message="Please wait while your file is being uploaded..." />}

      <main className="min-h-[calc(100vh-66px)] bg-[#FBFBFD] px-4 py-8 sm:py-12">
        {/* ── Success popup ── */}
        <AnimatePresence>
          {submittedOption && (
            <motion.div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="bmi-success-heading"
                initial={reduceMotion ? { opacity: 0 } : { y: 50, opacity: 0 }}
                animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { y: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative mx-4 w-full max-w-md rounded-2xl border border-[#47317c]/10 bg-white p-7 shadow-[0_20px_60px_rgba(30,20,60,0.18)] sm:p-8"
              >
                <motion.div
                  initial={reduceMotion ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 250, damping: 15 }}
                  className="mb-4 flex justify-center"
                >
                  <CheckCircle2 className="text-[#47317c]" size={64} strokeWidth={1.6} />
                </motion.div>

                <h2
                  id="bmi-success-heading"
                  className="inter-semibold-font text-center text-[22px] text-slate-900 max-sm:text-[24px]"
                >
                  Successfully uploaded
                </h2>

                {/* Which option was used */}
                <div className="mt-3 flex justify-center">
                  <span className="inter-medium-font inline-flex items-center gap-2 rounded-full bg-[#47317c]/[0.07] px-3 py-1.5 text-[14px] text-[#47317c]">
                    <submittedOption.icon size={15} strokeWidth={2} />
                    Verified with: {submittedOption.label.charAt(0).toUpperCase() + submittedOption.label.slice(1)}
                  </span>
                </div>

                <p className="inter-reg-font mb-6 mt-4 text-center text-[16px] leading-6 text-slate-600">
                  Your {submittedOption.label} has been uploaded and is now under review by our prescribers.{" "}
                  {!idVerificationUpload
                    ? "You need to complete the ID verification to proceed. Please click the button below to continue."
                    : "We'll approve your order once the review is complete and notify you straight away."}
                </p>

                <NextButton
                  label={!idVerificationUpload ? "Upload ID verification photo" : "Return to Dashboard"}
                  onClick={handleRedirect}
                  className="w-full"
                  loading={isRedirecting}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-auto mb-4 flex w-full max-w-[620px] items-center">
          <button
            type="button"
            onClick={() => GO.push("/dashboard")}
            aria-label="Back to dashboard"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-[#47317c]/40 hover:text-[#47317c]"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        <div className="mx-auto w-full max-w-[620px] rounded-2xl border border-[#47317c]/10 bg-white px-4 py-6 shadow-[0_12px_36px_rgba(71,49,124,0.09)] sm:px-8 sm:py-8">
          {/* ── Intro ── */}
          <div className="mb-6 text-left">
            <h1 className="inter-semibold-font text-[24px] leading-[1.3] tracking-[-0.02em] text-slate-900">
              Submit your BMI verification for prescriber review
            </h1>
            <p className="inter-reg-font mt-2 text-[16px] leading-6 text-slate-500">
              The clinical team needs to verify your BMI before your order can be processed.
              Choose the option that suits you best,{" "}
              <span className="inter-semibold-font text-slate-700">you only need to complete one</span>.
            </p>

            <div className="mt-5 rounded-xl border border-[#47317c]/10 bg-[#f8f6fc] px-4 py-3.5">
              <p className="inter-semibold-font mb-2 text-[16px] text-slate-800">Why we need this</p>
              <ul className="inter-reg-font list-disc space-y-2 pl-5 text-[16px] leading-6 text-slate-600 marker:text-[#47317c]">
                <li>We will only ask for this once.</li>
                <li>
                  We realise it's inconvenient, but this is a regulatory requirement designed for your
                  safety and to prevent inappropriate use.
                </li>
              </ul>
            </div>
          </div>

          {/* ── Options ── */}
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <p className="inter-semibold-font text-[16px] text-slate-800">Choose how to verify</p>
            <p className="inter-reg-font text-[14px] max-sm:text-[15px] text-slate-400">Pick any one</p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Option 1 — full body photo */}
            <OptionItem
              option={OPTIONS[0]}
              isSelected={selectedId === "photo"}
              isOpen={openId === "photo"}
              hasFile={upload?.optionId === "photo"}
              onToggle={() => handleToggle("photo")}
            >
              <p className="inter-reg-font mb-4 text-[16px] leading-6 text-slate-600">
                Please upload a recent{" "}
                <span className="inter-semibold-font text-slate-700">full body</span> photo for the
                clinical team to verify your BMI. Make sure your whole body is visible, from head to feet.
              </p>

              <p className="inter-semibold-font mb-3 text-[16px] text-slate-800">Photo guidance</p>
              <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
                <div className="relative overflow-hidden rounded-xl border-2 border-emerald-400 bg-white">
                  <Image src={FullBody} alt="Correct full-body photo example" className="aspect-[3/4] h-auto w-full object-cover" />
                  <span className="inter-semibold-font absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-1 text-[13px] text-emerald-700 shadow-sm">
                    <FaCheck size={10} /> Good
                  </span>
                </div>
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <Image src={FaceX} alt="Close-up photo example" className="aspect-[3/4] h-auto w-full object-cover" />
                </div>
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <Image src={HalfBodyX} alt="Half-body photo example to avoid" className="aspect-[3/4] h-auto w-full object-cover" />
                  <span className="inter-semibold-font absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-1 text-[13px] text-red-600 shadow-sm">
                    <RxCross2 size={10} /> Avoid
                  </span>
                </div>
              </div>

              {renderUploadArea(OPTIONS[0])}
            </OptionItem>

            {/* Option 2 — GP / pharmacist letter */}
            <OptionItem
              option={OPTIONS[1]}
              isSelected={selectedId === "letter"}
              isOpen={openId === "letter"}
              hasFile={upload?.optionId === "letter"}
              onToggle={() => handleToggle("letter")}
            >
              <p className="inter-reg-font mb-4 text-[16px] leading-6 text-slate-600">
                Upload a letter from your GP or pharmacist confirming your height and weight. A PDF or a
                clear photo of the letter is fine.
              </p>
              <div className="mb-5">
                <CheckList
                  heading="Your letter must"
                  items={[
                    "Confirm your height and weight.",
                    "Include your full name and date of birth.",
                    "Be printed on official headed paper or bear a pharmacy stamp.",
                    "Be signed by a qualified healthcare professional.",
                  ]}
                />
              </div>
              {renderUploadArea(OPTIONS[1])}
            </OptionItem>

            {/* Option 3 — weighing scale photo / video by email */}
            <OptionItem
              option={OPTIONS[2]}
              isSelected={selectedId === "email"}
              isOpen={openId === "email"}
              hasFile={false}
              onToggle={() => handleToggle("email")}
            >
              {blockedByOtherFile && openId === "email" && (
                <OtherFileNotice otherOption={fileOption} onSwitch={clearUpload} />
              )}
              <p className="inter-reg-font mb-4 text-[16px] leading-6 text-slate-600">
                Take a photo or video of yourself standing on a weighing scale and email it to our
                clinical team.
              </p>
              <div className="mb-5">
                <CheckList
                  heading="Please make sure"
                  items={[
                    "Your weight is clearly visible on the scale.",
                    "Your identification document is placed beside you, with all details clearly legible.",
                    "You include your full name in the email so we can match it to your account.",
                  ]}
                />
              </div>

              <div className={`rounded-xl border border-slate-200 bg-white p-4 ${blockedByOtherFile ? "pointer-events-none opacity-45" : ""}`}>
                <p className="inter-reg-font text-[14px] max-sm:text-[15px] text-slate-500">Send it to</p>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                  <a
                    href={mailtoHref}
                    className="inter-semibold-font min-w-0 text-[16px] text-[#47317c] underline-offset-4 hover:underline"
                  >
                    contact<wbr />@mayfairweightlossclinic.co.uk
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className={`inter-medium-font inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[14px] transition-colors ${
                      copied
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#47317c]/40 hover:text-[#47317c]"
                    }`}
                  >
                    {copied ? <Check size={14} strokeWidth={2.6} /> : <Copy size={14} strokeWidth={2.2} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="inter-reg-font mt-3 flex items-start gap-2 text-[14px] max-sm:text-[15px] leading-relaxed text-slate-500">
                  <Mail size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-slate-400" />
                  Videos are usually too large to upload here, so this option is completed by email.
                </p>
              </div>
            </OptionItem>
          </div>

          {/* ── Action ── */}
          <div className="mt-6 w-full">
            {selectedId === "email" && !upload ? (
              <a
                href={blockedByOtherFile ? undefined : mailtoHref}
                aria-disabled={blockedByOtherFile}
                className={`inter-semibold-font flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-[16px] transition-all duration-200 ${
                  blockedByOtherFile
                    ? "pointer-events-none cursor-not-allowed bg-slate-200 text-slate-400"
                    : "cursor-pointer bg-[#47317c] text-white shadow-[0_8px_20px_rgba(71,49,124,0.18)] hover:bg-[#392765] active:scale-[0.99]"
                }`}
              >
                <Mail size={18} strokeWidth={2.2} />
                {blockedByOtherFile ? "Only one option can be submitted" : "Email your photo or video"}
              </a>
            ) : (
              <button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit}
                className={`inter-semibold-font flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-[16px] transition-all duration-200 ${
                  canSubmit
                    ? "cursor-pointer bg-[#47317c] text-white shadow-[0_8px_20px_rgba(71,49,124,0.18)] hover:bg-[#392765] active:scale-[0.99]"
                    : "cursor-not-allowed bg-slate-200 text-slate-400"
                }`}
              >
                {canSubmit && <UploadCloud size={18} strokeWidth={2.2} />}
                {ctaLabel}
              </button>
            )}

            <button
              type="button"
              onClick={() => GO.push("/dashboard")}
              className="inter-medium-font mx-auto mt-4 flex min-h-11 cursor-pointer items-center justify-center gap-2 text-[17px] text-[#47317c] transition-colors hover:text-[#392765]"
            >
              <ArrowLeft size={17} />
              I’ll do it later
            </button>
          </div>

          <p className="inter-reg-font mt-4 flex items-start justify-center gap-2 text-[14px] max-sm:text-[15px] leading-relaxed text-slate-500">
            <ShieldCheck size={17} strokeWidth={1.8} className="mt-0.5 shrink-0 text-teal-800" />
            Your uploads are stored securely and handled confidentially as part of your clinical review.
          </p>
        </div>
      </main>
    </>
  );
};

// Wait for the auth store to hydrate before deciding; logged-out users go to /login
const BmiVerificationPage = () => (
  <ProtectedPage>
    <BmiVerification />
  </ProtectedPage>
);

export default BmiVerificationPage;
