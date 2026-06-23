import useExplanationEvidenceStore from "@/store/useExplanationEvidenceStore";
import React, { useState } from "react";

import { AiOutlineCheckCircle } from "react-icons/ai";
import {
  FiAlertCircle,
  FiUploadCloud,
  FiX,
  FiFileText,
  FiShield,
  FiPaperclip,
  FiArrowRight,
  FiInfo,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import useCartStore from "@/store/useCartStore";
import {
  GetPrescriptionEvidence,
  PostPrescriptionEvidence,
} from "@/api/PrescriptionEvidenceApi";
import useAuthStore from "@/store/authStore";

const TopToastExplanation = () => {
  const MAX_SIZE_MB = 5;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const { orderId } = useCartStore();
  const { token } = useAuthStore();

  const {
    explainenationEvidence,
    setExplainenationEvidence,
    setExplainenationEvidenceDetails,
    explainenationEvidenceDetails,
  } = useExplanationEvidenceStore();

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const { control, handleSubmit, setValue, watch, reset } = useForm();
  const description = watch("description");
  const evidence = watch("evidence");

  if (explainenationEvidence?.require_evidence) return null;

  const compressImage = async (file) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);

            if (blob) {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            } else {
              reject("Compression failed");
            }
          },
          "image/jpeg",
          0.8,
        );
      };

      img.onerror = () => reject("Image load failed");
      img.src = url;
    });

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Upload PNG, JPEG, WEBP, or PDF.");
      e.target.value = "";
      return;
    }

    if (file.type === "application/pdf") {
      if (file.size > MAX_SIZE_BYTES) {
        toast.error(`PDF file is too large (max ${MAX_SIZE_MB}MB)`);
        e.target.value = "";
        return;
      }

      setValue("evidence", file);
      setPreviewUrl(URL.createObjectURL(file));
      return;
    }

    if (file.type === "image/svg+xml") {
      if (file.size > MAX_SIZE_BYTES) {
        toast.error(`SVG file is too large (max ${MAX_SIZE_MB}MB)`);
        e.target.value = "";
        return;
      }

      setValue("evidence", file);
      setPreviewUrl(URL.createObjectURL(file));
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      try {
        const compressed = await compressImage(file);
        setValue("evidence", compressed);
        setPreviewUrl(URL.createObjectURL(compressed));
      } catch {
        toast.error(`Image too large (max ${MAX_SIZE_MB}MB)`);
        return;
      }
    } else {
      setValue("evidence", file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
    });

  const handleCloseModal = () => {
    setShowModal(false);
    reset();
    setPreviewUrl(null);
  };

  const GetEvidence = async () => {
    try {
      const res = await GetPrescriptionEvidence({ token });
      console.log("Prescription Evidence Status", res);
      setExplainenationEvidence(res?.data?.require_evidence);
      setExplainenationEvidenceDetails(res?.data);
    } catch (error) {
      console.error("Failed to fetch prescription evidence status:", error);
    }
  };

  const onSubmit = async (data) => {
    if (!data.description) {
      toast.error("Explanation is required.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        order_id: orderId,
        explanation: data.description,
      };

      if (data.evidence) {
        payload.evidence = await toBase64(data.evidence);
      }

      const res = await PostPrescriptionEvidence(payload);

      if (res?.status === 200 || res?.data?.success) {
        toast.success(
          "Thank you. Your information has been submitted for clinical review. Our healthcare team will process your order and contact you if any additional details are needed.",
        );

        handleCloseModal();
        GetEvidence();
      } else {
        toast.error(res?.data?.message || "Submission failed.");
      }
    } catch (err) {
      toast.error(err?.response?.errors?.evidence || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const getMessage = () => {
    if (explainenationEvidenceDetails.patient_type === "new") {
      return `To complete your order for <span class="med-font">${explainenationEvidenceDetails?.product_name} ${explainenationEvidenceDetails.latest_dose}</span>, please provide details of your previous treatment. <br/> <br/>
       As a new patient requesting a higher dose, we require confirmation that you have previously completed the appropriate dose escalation under another healthcare provider, or a clinical explanation for why you are starting at this dose.<br/> <br/>

Please upload supporting evidence from your previous provider where available, such as photographs of your medication packaging, prescription labels, dispensing labels, clinic correspondence, or other relevant documentation.<br/> <br/>

All orders are reviewed by our clinical team to ensure safe and appropriate prescribing.`;
    } else {
      return `To complete your order for <span class="med-font">${explainenationEvidenceDetails?.product_name} ${explainenationEvidenceDetails.latest_dose}</span>, please provide details of your previous treatment. <br/> <br/>
       As a new patient requesting a higher dose, we require confirmation that you have previously completed the appropriate dose escalation under another healthcare provider, or a clinical explanation for why you are starting at this dose.<br/> <br/>

Please upload supporting evidence from your previous provider where available, such as photographs of your medication packaging, prescription labels, dispensing labels, clinic correspondence, or other relevant documentation.<br/> <br/>

All orders are reviewed by our clinical team to ensure safe and appropriate prescribing.`;
    }
  };

  return (
    <>
      {/* Modern Top Alert */}
      {/* Purple Compact Top Alert */}
      <motion.div
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 22,
        }}
        className="fixed left-1/2 top-3 z-[60] w-full max-w-[690px] -translate-x-1/2 px-4"
      >
        <div className="relative overflow-hidden rounded-[12px] bg-gradient-to-r from-[#47317c] via-[#5b3fa0] to-[#6d4fc2] px-3 py-2.5 shadow-2xl shadow-[#47317c]/30 sm:px-4">
          {/* soft glow */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 left-20 h-24 w-24 rounded-full bg-[#cbbcff]/20 blur-2xl" />

          <div className="relative flex items-center gap-3">
            {/* icon */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/12 text-white ring-1 ring-white/25">
              <FiAlertCircle className="text-[20px]" />
            </div>

            {/* text */}
            <div className="min-w-0 flex-1">
              <h3 className="text-[13px] leading-tight text-white mont-bold-font sm:text-sm">
                Action Required
              </h3>

              <p className="mt-0.5 truncate text-[10px] leading-tight text-white/90 mont-reg-font sm:text-xs">
                Please provide the required information to complete your order
              </p>
            </div>

            {/* button */}
            <motion.button
              type="button"
              onClick={() => setShowModal(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="shrink-0 cursor-pointer rounded-[8px] bg-white px-4 py-2 text-[12px] text-[#47317c] shadow-lg shadow-black/10 transition hover:bg-[#f5f1ff] sm:px-5 mont-bold-font"
            >
              Continue
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Modern Responsive Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 z-[70] bg-[#120b24]/75 backdrop-blur-md"
            />

            <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
              <motion.div
                initial={{ opacity: 0, y: 45, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 45, scale: 0.98 }}
                transition={{
                  type: "spring",
                  stiffness: 270,
                  damping: 28,
                }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-h-[94vh] w-full overflow-hidden rounded-t-[32px] border border-white/20 bg-white shadow-2xl shadow-black/35 sm:max-w-[620px] sm:rounded-[32px] lg:max-w-[680px]"
              >
                {/* Modal Background Glow */}
                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#47317c]/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#2fd8c4]/10 blur-3xl" />

                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#47317c] via-[#573c94] to-[#2f2157] px-5 pb-6 pt-7 text-white sm:px-6 sm:pt-6">
                  <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
                  <div className="absolute -bottom-16 left-10 h-32 w-32 rounded-full bg-[#c8b8ff]/20 blur-3xl" />

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="absolute right-4 top-4 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/15 transition hover:bg-white hover:text-[#47317c]"
                  >
                    <FiX className="h-5 w-5" />
                  </button>

                  <div className="relative flex items-start gap-4 pr-12">
                    {/* <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[20px] bg-white text-[#47317c] shadow-xl shadow-black/10">
                      <FiShield className="text-2xl" />
                    </div> */}

                    <div className="min-w-0">
                      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/85 ring-1 ring-white/15 mont-reg-font">
                        <FiInfo className="text-xs" />
                        Clinical step
                      </div>

                      <h2 className="text-2xl leading-tight text-white mont-bold-font sm:text-[26px] mt-2">
                        Evidence of Previous Treatment Required
                      </h2>

                      <p className="mt-2 max-w-[430px] text-sm leading-5 text-white/75 mont-reg-font">
                        Provide treatment details and optional evidence for
                        review.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="relative max-h-[calc(94vh-150px)] space-y-4 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 [scrollbar-width:thin] [scrollbar-color:#b8a9d6_transparent]"
                >
                  {/* Review Message */}
                  <div className="rounded-[24px] border border-[#47317c]/10 bg-gradient-to-br from-[#fbf9ff] to-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-[#47317c]/10 text-[#47317c]">
                          <FiFileText className="text-base" />
                        </div>

                        <h3 className="text-sm text-[#21143d] mont-bold-font">
                          Review note
                        </h3>
                      </div>

                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] text-[#47317c] shadow-sm ring-1 ring-[#47317c]/10 mont-bold-font bg-gradient-to-br from-[#fbf9ff] to-white">
                        Important
                      </span>
                    </div>

                    <div
                      className="max-h-[125px] overflow-y-auto pr-1 text-xs leading-5 text-gray-600 mont-reg-font sm:text-[13px] [&_.med-font]:text-[#47317c] [&_.med-font]:mont-bold-font [scrollbar-width:thin] [scrollbar-color:#b8a9d6_transparent]"
                      dangerouslySetInnerHTML={{ __html: getMessage() }}
                    />
                  </div>

                  {/* Upload Evidence */}
                  <div className="rounded-[24px] border border-[#47317c]/10 bg-white p-4 shadow-sm">
                    <label className="mb-1 flex items-center gap-2 text-sm text-[#21143d] mont-bold-font">
                      <FiPaperclip className="text-[#47317c]" />
                      Upload Evidence
                      <span className="rounded-full bg-[#47317c]/8 px-2 py-0.5 text-[10px] text-[#47317c] mont-medium-font">
                        Optional
                      </span>
                    </label>

                    <p className="mb-3 text-xs leading-5 text-gray-500 mont-reg-font sm:text-[13px]">
                      Please upload any supporting documentation relating to
                      your previous treatment.
                    </p>

                    <Controller
                      name="evidence"
                      control={control}
                      render={() => (
                        <label className="block cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept=".png,.jpeg,.jpg,.webp,.pdf"
                            onChange={handleUpload}
                          />

                          <div className="relative overflow-hidden rounded-[22px] border border-dashed border-[#47317c]/25 bg-gradient-to-br from-[#fbf9ff] to-white p-3 transition hover:border-[#47317c] hover:bg-[#f7f3ff]">
                            <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#47317c]/10 blur-2xl" />

                            {evidence ? (
                              <div className="relative flex items-center gap-3 rounded-[18px] bg-white p-3 shadow-sm ring-1 ring-[#47317c]/8">
                                {evidence.type === "application/pdf" ? (
                                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-[#47317c]/10 text-[#47317c]">
                                    <FiFileText className="text-2xl" />
                                  </div>
                                ) : (
                                  <img
                                    src={previewUrl}
                                    alt="Evidence preview"
                                    className="h-14 w-14 shrink-0 rounded-[16px] object-cover"
                                  />
                                )}

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm text-[#21143d] mont-medium-font">
                                    {evidence.name}
                                  </p>

                                  <p className="mt-0.5 text-xs text-gray-500 mont-reg-font">
                                    File selected successfully
                                  </p>
                                </div>

                                <AiOutlineCheckCircle className="h-6 w-6 shrink-0 text-emerald-600" />
                              </div>
                            ) : (
                              <div className="relative flex min-h-[96px] items-center gap-3">
                                <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[18px] bg-[#47317c] text-white shadow-lg shadow-[#47317c]/25">
                                  <FiUploadCloud className="text-2xl" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="text-sm text-[#21143d] mont-bold-font">
                                    Upload document
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-gray-500 mont-reg-font">
                                    PNG, JPEG, WEBP or PDF · Max 5MB
                                  </p>
                                </div>

                                <FiArrowRight className="hidden text-lg text-[#47317c] sm:block" />
                              </div>
                            )}
                          </div>
                        </label>
                      )}
                    />
                  </div>

                  {/* Treatment Details */}
                  <div className="rounded-[24px] border border-[#47317c]/10 bg-white p-4 shadow-sm">
                    <label className="mb-1 flex items-center gap-2 text-sm text-[#21143d] mont-bold-font">
                      <FiFileText className="text-[#47317c]" />
                      Treatment Details
                      <span className="text-red-500">*</span>
                    </label>

                    <p className="mb-3 text-xs leading-5 text-gray-500 mont-reg-font sm:text-[13px]">
                      If you are unable to provide the evidence, please provide
                      a clinical explanation for why you are starting at this
                      dose.
                    </p>

                    <Controller
                      name="description"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <textarea
                          {...field}
                          placeholder="Describe your current dose, treatment timeline, and reason for this dose..."
                          className="min-h-[120px] w-full resize-y rounded-[22px] border border-[#47317c]/15 bg-[#fbf9ff] p-4 text-sm leading-6 text-gray-700 outline-none transition placeholder:text-gray-400 hover:border-[#47317c]/40 focus:border-[#47317c] focus:bg-white focus:ring-4 focus:ring-[#47317c]/10 mont-reg-font"
                        />
                      )}
                    />
                  </div>

                  {/* Submit */}
                  <div className="sticky bottom-0 -mx-4 -mb-4 border-t border-[#47317c]/8 bg-white/95 px-4 py-3 backdrop-blur-xl sm:-mx-5 sm:-mb-5 sm:px-5">
                    <motion.button
                      type="submit"
                      disabled={loading || !description}
                      whileHover={{
                        scale: loading || !description ? 1 : 1.01,
                      }}
                      whileTap={{
                        scale: loading || !description ? 1 : 0.98,
                      }}
                      className={`flex w-full items-center justify-center gap-2 rounded-[20px] px-4 py-3.5 text-sm text-white transition mont-bold-font sm:text-base ${
                        loading || !description
                          ? "cursor-not-allowed bg-gray-300 shadow-none"
                          : "cursor-pointer bg-[#47317c] shadow-xl shadow-[#47317c]/25 hover:bg-[#37255f]"
                      }`}
                    >
                      {loading ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                          />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit
                          {/* <FiArrowRight className="text-lg" /> */}
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default TopToastExplanation;
