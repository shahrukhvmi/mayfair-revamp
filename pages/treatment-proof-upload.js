import React, { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { FiUpload, FiArrowLeft } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import { heicTo, isHeic } from "heic-to";
import useCartStore from "@/store/useCartStore";
import StepsHeader from "@/layout/stepsHeader";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import UploadPhotoLogs from "@/api/UploadLogsApi";
import { TreatmentEvidenceUpload } from "@/api/TreatmentEvidenceApi";
import useTreatmentEvidenceStore from "@/store/useTreatmentEvidenceStore";
import PageLoader from "@/Components/PageLoader/PageLoader";

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

const UploadBox = ({ label, file, type, loadingFile, onUpload, onRemove, inputRef }) => {
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
    <div className="w-full">
      <div className="relative w-full">
        <label className="block w-full cursor-pointer rounded-xl focus-within:ring-2 focus-within:ring-[#47317c]/25 focus-within:ring-offset-2">
          <div className="relative flex min-h-[164px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#9b87c8] bg-[#f8f6fc] px-5 py-6 text-center transition-all duration-200 hover:border-[#47317c] hover:bg-[#f4f1fa]">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,image/avif,application/pdf"
              onChange={(e) => onUpload(e, type)}
              className="hidden"
            />

            {loadingFile ? (
              <div className="flex flex-col items-center justify-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#47317c]/10">
                  <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin text-[#47317c]" />
                </div>
                <p className="inter-medium-font text-[16px] text-slate-700">Uploading...</p>
              </div>
            ) : !file ? (
              <div className="flex flex-col items-center justify-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#47317c] shadow-sm ring-1 ring-[#47317c]/10">
                  <FiUpload className="h-5 w-5" />
                </div>
                <p className="inter-semibold-font text-[16px] text-slate-800">
                  Upload your proof of treatment
                </p>
                <p className="inter-reg-font mt-1 text-[16px] leading-6 text-slate-500">
                  Tap to browse files from your device
                </p>
              </div>
            ) : (
              <div className="relative flex w-full flex-col items-center">
                {file?.type === "application/pdf" ? (
                  <div className="my-1 flex h-36 w-full max-w-[240px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mb-2 h-9 w-9 text-red-500"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
                    </svg>
                    <p className="inter-reg-font w-full truncate px-3 text-center text-[16px] text-slate-600">
                      {file?.name}
                    </p>
                  </div>
                ) : (
                  <img
                    src={fileUrl}
                    alt={`${label} preview`}
                    className="my-1 h-36 w-full max-w-[240px] rounded-xl bg-white object-contain shadow-sm ring-1 ring-slate-200"
                  />
                )}
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
              onRemove(type);
            }}
            className="absolute -right-2 -top-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-red-600 shadow-md ring-1 ring-red-100 transition-colors duration-200 hover:bg-red-50"
            title="Remove file"
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

const TreatmentProofUpload = () => {
  const GO = useRouter();
  const searchParams = useSearchParams();
  const proofInputRef = React.useRef(null);

  const [orderIdGetUrl, setOrderIdGetUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);

  const { orderId } = useCartStore();
  const { setTreatmentEvidenceUploaded } = useTreatmentEvidenceStore();
  const { control, setValue, handleSubmit, watch } = useForm();
  const proofFile = watch("proofFile");

  const logError = (message) => {
    toast.error(message);
    UploadPhotoLogs({ message }).catch(() => {});
  };

  const resetInput = (e) => {
    if (e?.target?.value !== undefined) e.target.value = "";
  };

  // get order id from url (same as photo-upload)
  useEffect(() => {
    const param = searchParams.get("order_id");
    if (param) {
      const parsedId = parseInt(param, 10);
      if (!isNaN(parsedId)) {
        setOrderIdGetUrl(parsedId);
      }
    }
  }, [searchParams]);

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

  // ✅ Handle upload + conversion + compression
  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (BLOCKED_EXTENSIONS.some((ext) => fileName.endsWith(ext))) {
      logError("The file must be an image (jpeg, png, webp, heic, heif, avif) or a pdf.");
      resetInput(e);
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      logError(`File too large. Maximum allowed size is ${MAX_SIZE_MB} MB.`);
      resetInput(e);
      return;
    }

    try {
      const isPdf = file.type === "application/pdf";
      const isAllowedImage = ALLOWED_TYPES.includes(file.type) || isHeic(file);

      if (!isPdf && !isAllowedImage) {
        logError("Only JPEG, PNG, WEBP, HEIC, HEIF, AVIF, or PDF files are allowed.");
        resetInput(e);
        setValue(type, null);
        return;
      }

      setLoadingFile(true);

      // ✅ PDF — no compression or HEIC conversion needed
      if (isPdf) {
        setValue(type, file);
        return;
      }

      let processedFile = file;

      // ✅ Try HEIC conversion
      if (isHeic(file)) {
        try {
          const heicBlob = await heicTo({
            blob: file,
            toType: "image/jpeg",
            quality: 0.9,
          });
          processedFile = new File([heicBlob], file.name.replace(/\.heic$/i, ".jpg"), {
            type: "image/jpeg",
          });
        } catch (err) {
          // 🚫 Block completely if file seems corrupted
          if (file.size === 0 || !file.type || file.name === "") {
            logError("This file appears to be corrupted. Please try another image.");
            resetInput(e);
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
          resetInput(e);
          return;
        }

        processedFile = new File([compressedBlob], file.name, {
          type: "image/jpeg",
        });
      }

      setValue(type, processedFile);
    } catch (err) {
      logError("Something went wrong while processing this file.");
      resetInput(e);
    } finally {
      setLoadingFile(false);
    }
  };

  const onSubmit = async (data) => {
    if (!data.proofFile) {
      logError("Please upload your proof of treatment.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("documents", data.proofFile);
      formData.append("order_id", orderIdGetUrl ? orderIdGetUrl : orderId);

      const res = await TreatmentEvidenceUpload(formData);

      if (res?.status === 200) {
        toast.success("Proof of treatment submitted successfully!");
        setTreatmentEvidenceUploaded(true);
        setValue("proofFile", null);
        if (proofInputRef.current) proofInputRef.current.value = "";
        GO.push("/dashboard");
      }
    } catch (error) {
      const documentsError = error?.response?.data?.errors?.documents;
      const orderError = error?.response?.data?.errors?.Order;

      if (error?.response?.data?.message === "Unauthenticated.") {
        logError("Failed to upload your proof. Please login again.");
        GO.push("/login");
        return;
      }

      if (documentsError) {
        logError(documentsError);
      } else if (orderError) {
        logError(orderError);
      } else {
        logError("Something went wrong. Please try again.");
      }

      // ✅ Clear the file on any API error — forces user to re-select
      setValue("proofFile", null);
      if (proofInputRef.current) proofInputRef.current.value = "";
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StepsHeader />
      <MetaLayout canonical={`${meta_url}treatment-proof-upload/`} />
      {loading && (
        <PageLoader message="Please wait while your proof is being uploaded..." />
      )}
      <main className="min-h-[calc(100vh-66px)] bg-[#FBFBFD] px-4 py-8 sm:py-12">
        <div className="mx-auto mb-4 flex w-full max-w-[620px] items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => GO.push("/dashboard")}
            aria-label="Back to dashboard"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-[#47317c]/40 hover:text-[#47317c]"
          >
            <FiArrowLeft size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto w-full max-w-[620px] rounded-2xl border border-[#47317c]/10 bg-white px-5 py-6 shadow-[0_12px_36px_rgba(71,49,124,0.09)] sm:px-8 sm:py-8"
        >
          <div className="mb-6 text-left">
            <h1 className="inter-semibold-font text-[24px] leading-[1.3] tracking-[-0.02em] text-slate-900">
              Submit proof of your current weight loss treatment
            </h1>

            <p className="inter-reg-font mt-2 text-[16px] leading-6 text-slate-500">
              You confirmed that you are currently receiving weight loss
              medication from another clinic or pharmacy. Please upload proof
              of your{" "}
              <span className="inter-semibold-font text-slate-700">
                existing treatment
              </span>{" "}
              so our prescribers can review it before your treatment is
              approved.
            </p>

            <div className="mt-5 rounded-xl border border-[#47317c]/10 bg-[#f8f6fc] px-4 py-3.5">
              <p className="inter-semibold-font mb-2 text-[16px] text-slate-800">
                What we accept
              </p>
              <ul className="inter-reg-font list-disc space-y-2 pl-5 text-[16px] leading-6 text-slate-600 marker:text-[#47317c]">
                <li>A photo of your prescription or pharmacy dispensing label.</li>
                <li>
                  A dispensing record or order confirmation from your previous
                  clinic or pharmacy.
                </li>
                <li>
                  A letter or email from your previous provider confirming your
                  treatment.
                </li>
              </ul>
            </div>

            <div className="mt-4 rounded-xl border border-[#47317c]/10 bg-[#f8f6fc] px-4 py-3.5">
              <p className="inter-semibold-font mb-2 text-[16px] text-slate-800">
                Please make sure it clearly shows
              </p>
              <ul className="inter-reg-font list-disc space-y-2 pl-5 text-[16px] leading-6 text-slate-600 marker:text-[#47317c]">
                <li>Your full name.</li>
                <li>The name and dose of the medication.</li>
                <li>The date it was prescribed or dispensed.</li>
                <li>The name of the clinic or pharmacy.</li>
              </ul>
            </div>

            <div className="mt-4 rounded-xl border border-[#47317c]/10 bg-[#f8f6fc] px-4 py-3.5">
              <p className="inter-semibold-font mb-2 text-[16px] text-slate-800">
                Why we need this
              </p>
              <ul className="inter-reg-font list-disc space-y-2 pl-5 text-[16px] leading-6 text-slate-600 marker:text-[#47317c]">
                <li>
                  Your current BMI is below our usual starting threshold, so we
                  can only continue your treatment once we have confirmed you
                  are already on weight loss medication.
                </li>
                <li>
                  This is a regulatory requirement designed for your safety and
                  to prevent inappropriate use.
                </li>
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <Controller
              name="proofFile"
              control={control}
              defaultValue={null}
              render={() => (
                <UploadBox
                  label="Proof of treatment"
                  file={proofFile}
                  type="proofFile"
                  loadingFile={loadingFile}
                  onUpload={handleUpload}
                  onRemove={(type) => {
                    setValue(type, null);
                    if (proofInputRef.current) proofInputRef.current.value = "";
                  }}
                  inputRef={proofInputRef}
                />
              )}
            />
          </div>

          <div className="w-full">
            <button
              type="submit"
              disabled={loading || loadingFile || !proofFile}
              className={`inter-semibold-font flex min-h-[54px] w-full items-center justify-center rounded-xl px-6 py-3 text-[16px] text-white transition-all duration-200
                ${
                  loading || loadingFile || !proofFile
                    ? "cursor-not-allowed bg-slate-200 text-slate-400"
                    : "cursor-pointer bg-[#47317c] shadow-[0_8px_20px_rgba(71,49,124,0.18)] hover:bg-[#392765] active:scale-[0.99]"
                }
              `}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              onClick={() => GO.push("/dashboard")}
              className="inter-medium-font mx-auto mt-4 flex min-h-11 cursor-pointer items-center justify-center gap-2 text-[17px] text-[#47317c] transition-colors hover:text-[#392765]"
            >
              <FiArrowLeft size={17} />
              I’ll do it later
            </button>
          </div>
        </form>
      </main>
    </>
  );
};

export default TreatmentProofUpload;
