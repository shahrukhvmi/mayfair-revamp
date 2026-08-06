import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Camera,
  ChevronRight,
  IdCard,
  UploadCloud,
} from "lucide-react";

import useIdVerificationUploadStore from "@/store/useIdVerificationUploadStore";
import useImageUploadStore from "@/store/useImageUploadStore ";

const AlertBanner = ({
  icon: Icon,
  title,
  description,
  buttonText,
  href,
}) => {
  return (
    <section className="w-full overflow-hidden rounded-[18px] border border-amber-200 bg-amber-50/70 shadow-[0_8px_22px_rgba(180,83,9,0.07)]">
      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Warning content */}
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] border border-amber-200 bg-white text-amber-600 shadow-sm sm:h-12 sm:w-12">
            <Icon
              size={21}
              strokeWidth={2.2}
              className="sm:h-[22px] sm:w-[22px]"
            />
          </div>

          <div className="min-w-0 flex-1">
            <span className="mont-semibold-font inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-amber-700 sm:text-[10.5px] md:text-[11px]">
              Action required
            </span>

            <h3 className="mont-bold-font mt-2 text-[16px] leading-[1.45] tracking-[-0.02em] text-slate-950 sm:text-[17px] md:text-[18px]">
              {title}
            </h3>

            <p className="mont-reg-font mt-1 max-w-3xl text-[13px] leading-[1.65] text-slate-600 sm:text-[13.5px] md:text-[14px]">
              {description}
            </p>
          </div>
        </div>

        {/* Warning action */}
        <Link
          href={href}
          className="
            mont-semibold-font group inline-flex min-h-[46px] w-full
            shrink-0 items-center justify-center gap-2 rounded-[12px]
            border border-amber-600 bg-amber-600 px-5 py-2.5
            text-[13px] text-white no-underline
            shadow-[0_6px_16px_rgba(217,119,6,0.2)]
            transition-all duration-200
            hover:border-amber-700 hover:bg-amber-700
            active:scale-[0.98]
            sm:text-[13.5px]
            md:text-[14px]
            lg:w-auto lg:min-w-[155px]
          "
        >
          <UploadCloud
            size={17}
            strokeWidth={2.3}
            className="sm:h-[18px] sm:w-[18px]"
          />

          <span>{buttonText}</span>

          <ChevronRight
            size={16}
            strokeWidth={2.5}
            className="transition-transform duration-200 group-hover:translate-x-0.5 sm:h-[17px] sm:w-[17px]"
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
          title="Upload your photo"
          description="Please upload your photo and ID verification to complete your order."
          buttonText="Upload image"
          href="/photo-upload"
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
          description="Please upload your ID verification to complete your order. Click here to upload."
          buttonText="Upload ID"
          href="/id-verification"
        />
      </div>
    );
  }

  return null;
};

export default UploadTopPrompt;