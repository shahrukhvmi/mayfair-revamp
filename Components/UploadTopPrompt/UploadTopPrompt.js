import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Camera,
  ChevronRight,
  IdCard,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import useIdVerificationUploadStore from "@/store/useIdVerificationUploadStore";
import useImageUploadStore from "@/store/useImageUploadStore ";

const AlertBanner = ({ icon: Icon, title, description, buttonText, href }) => {
  return (
    <section className="w-full overflow-hidden rounded-[18px] border border-amber-200 bg-amber-50/70 shadow-[0_8px_22px_rgba(180,83,9,0.07)]">
      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Warning content */}
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] border border-amber-200 bg-white text-amber-600 shadow-sm">
            <Icon size={19} strokeWidth={2.2} />
          </div>

          <div className="min-w-0 flex-1">
            <span className="mont-semibold-font inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[8px] uppercase tracking-[0.12em] text-amber-700">
              Action required
            </span>

            <h3 className="mont-bold-font mt-2 text-[14px] leading-5 tracking-[-0.02em] text-slate-950 sm:text-[15px]">
              {title}
            </h3>

            <p className="mont-reg-font mt-1 max-w-3xl text-[10.5px] leading-[1.65] text-slate-600 sm:text-[11px]">
              {description}
            </p>
          </div>
        </div>

        {/* Warning action */}
        <Link
          href={href}
          className="
            mont-semibold-font group inline-flex min-h-[42px] w-full
            shrink-0 items-center justify-center gap-2 rounded-[12px]
            border border-amber-600 bg-amber-600 px-4 py-2.5
            text-[10.5px] text-white no-underline
            shadow-[0_6px_16px_rgba(217,119,6,0.2)]
            transition-all duration-200
            hover:border-amber-700 hover:bg-amber-700
            active:scale-[0.98]
            lg:w-auto lg:min-w-[145px]
          "
        >
          <UploadCloud size={14} strokeWidth={2.3} />

          <span>{buttonText}</span>

          <ChevronRight
            size={13}
            strokeWidth={2.5}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </section>
  );
};

const UploadTopPrompt = () => {
  const router = useRouter();

  const { imageUploaded } = useImageUploadStore();
  const { idVerificationUpload } = useIdVerificationUploadStore();

  const isDashboardRoute = router.pathname === "/dashboard";

  if (!isDashboardRoute) {
    return null;
  }

  /*
   * Priority 1:
   * Pehle BMI / patient image upload show hogi.
   */
  if (!imageUploaded) {
    return (
      <div className="w-full">
        <AlertBanner
          icon={Camera}
          title="Upload your photo "
          description="Please upload your photo and ID verification to complete your order."
          buttonText="Upload image"
          href="/photo-upload"
          stepLabel="Step 1 of 2"
        />
      </div>
    );
  }

  /*
   * Priority 2:
   * Image upload complete hone ke baad
   * ID verification show hogi.
   */
  if (!idVerificationUpload) {
    return (
      <div className="w-full">
        <AlertBanner
          icon={IdCard}
          title="Upload your ID"
          description="Please upload your ID verification to complete your order. Click here to upload"
          buttonText="Upload ID"
          href="/id-verification"
          stepLabel="Step 2 of 2"
        />
      </div>
    );
  }

  return null;
};

export default UploadTopPrompt;
