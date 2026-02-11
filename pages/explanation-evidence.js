import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { FiUpload } from "react-icons/fi";
import { AiOutlineCheckCircle } from "react-icons/ai";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import NextButton from "@/Components/NextButton/NextButton";
import useCartStore from "@/store/useCartStore";
import { PostPrescriptionEvidence } from "@/api/PrescriptionEvidenceApi";

const ExplanationEvidence = () => {
  const MAX_SIZE_MB = 5;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  const router = useRouter();
  const { orderId } = useCartStore();

  const { control, handleSubmit, setValue, watch } = useForm();
  const description = watch("description");
  const evidence = watch("evidence");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Compress image if needed
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
            if (blob)
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            else reject("Compression failed");
          },
          "image/jpeg",
          0.8,
        );
      };
      img.onerror = () => reject("Image load failed");
      img.src = url;
    });

  // Handle file upload
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Extended allowed types - ab PDF bhi include hai
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      // "image/avif",
      // "image/svg+xml",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Upload PNG, JPEG, AVIF, SVG, WEBP, or PDF.",
      );
      e.target.value = "";
      return;
    }

    // PDF ke liye size check (compression nahi karenge)
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

    // SVG ke liye compression nahi karenge
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

    // Images ke liye compression
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
        toast.success("Evidence submitted successfully!");
        await router.push("/dashboard");
      } else {
        toast.error(res?.data?.message || "Submission failed.");
      }
    } catch (err) {
      toast.error(err.response.data.errors.evidence || "Submission failed.");
      console.error(err.response.data.errors.evidence, "Evidence upload error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-16 p-8 bg-white rounded-3xl shadow-xl">
      <h2 className="text-2xl mont-bold-font mb-4 text-center text-black">
        Provide Evidence
      </h2>
      <p className="text-gray-600 mb-6 text-center text-sm mont-reg-font">
        Provide details about your prescription request.
        {/* <span className="block mt-2 text-xs text-gray-500">
          📎 Supported files: Images (JPG, PNG, SVG) or PDF • Max size: 5MB
        </span> */}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Description */}
        <p className="mb-2 font-medium text-gray-700 mont-medium-font">
          Explanation <span className="text-red-500">*</span>
        </p>
        <Controller
          name="description"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <textarea
              {...field}
              placeholder="Type your explanation here..."
              className="w-full p-4 border rounded-xl border-primary focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-32 mont-reg-font"
            />
          )}
        />

        {/* Optional Evidence File */}
        <Controller
          name="evidence"
          control={control}
          render={() => (
            <label className="flex flex-col items-start w-full cursor-pointer">
              <p className="mb-2 font-medium text-gray-700 mont-medium-font">
                Upload Attachment{" "}
                <span className="text-gray-500 text-xs">(Optional)</span>
              </p>
              <div className="w-full min-h-[140px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center border-purple-500 transition p-2 bg-gray-50">
                <input
                  type="file"
                  className="hidden"
                  accept=".png,.jpeg,.jpg,.avif,.svg,.webp,.pdf"
                  onChange={handleUpload}
                />
                {evidence ? (
                  <div className="relative w-full h-32">
                    {evidence.type === "application/pdf" ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 rounded-lg">
                        <svg
                          className="w-12 h-12 text-red-600 mb-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
                        </svg>
                        <span className="text-sm text-gray-700 mont-medium-font">
                          {evidence.name}
                        </span>
                        <AiOutlineCheckCircle className="absolute top-2 right-2 w-6 h-6 text-green-600" />
                      </div>
                    ) : (
                      <>
                        <img
                          src={previewUrl}
                          alt="Evidence preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                        <AiOutlineCheckCircle className="absolute top-2 right-2 w-6 h-6 text-green-600" />
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <FiUpload className="w-6 h-6 mb-1" />
                    <span className="text-xs">
                      Click to upload (Image or PDF)
                    </span>
                  </div>
                )}
              </div>
            </label>
          )}
        />

        <NextButton
          type="submit"
          label={loading ? "Submitting..." : "Submit"}
          disabled={loading || !description}
          className={`w-full py-3 rounded-full text-white font-semibold transition ${
            loading || !description
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-purple-700 hover:bg-purple-800"
          }`}
        />
      </form>
    </div>
  );
};

export default ExplanationEvidence;
