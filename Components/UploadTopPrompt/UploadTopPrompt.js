import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Camera,
  ChevronRight,
  IdCard,
  Pill,
  UploadCloud,
} from "lucide-react";

import useIdVerificationUploadStore from "@/store/useIdVerificationUploadStore";
import useImageUploadStore from "@/store/useImageUploadStore ";
import useTreatmentEvidenceStore from "@/store/useTreatmentEvidenceStore";

const AlertBanner = ({
  icon: Icon,
  title,
  description,
  buttonText,
  href,
}) => {
  return (
    <section className="h-full w-full overflow-hidden rounded-2xl border border-amber-200/70 bg-amber-50/40 shadow-[0_1px_4px_rgba(180,83,9,0.06)]">
      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Content */}
        <div className="flex min-w-0 flex-1 items-center">
          <div className="min-w-0 flex-1">
            <div className="-ml-1.5 mb-2 flex items-center gap-2">
              <span className="inter-medium-font inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] max-sm:text-[13px] uppercase tracking-[0.08em] text-amber-600">
                <Icon size={14} strokeWidth={2} className="h-3 w-3 shrink-0 max-sm:h-3.5 max-sm:w-3.5" />
                Action required
              </span>
            </div>
            <h3 className="inter-semibold-font text-[16px] leading-snug text-slate-900">
              {title}
            </h3>
            <p className="inter-reg-font mt-1 text-[16px] sm:text-[14px] leading-relaxed text-slate-500">
              {description}
            </p>
          </div>
        </div>

        {/* Action */}
        <Link
          href={href}
          className="inter-medium-font group inline-flex min-h-[38px] w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border bg-amber-50 border border-amber-200 px-5 py-2 text-[15px] max-sm:text-[16px] text-amber-600 no-underline whitespace-nowrap transition-all duration-150 hover:bg-amber-100 active:scale-[0.98] lg:w-[190px]"
        >
          <UploadCloud size={14} strokeWidth={2.2} />
          <span>{buttonText}</span>
          <ChevronRight size={13} strokeWidth={2.5} className="transition-transform duration-150 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
};

const UploadTopPrompt = ({ isLoading = false }) => {
  const router = useRouter();

  const [uploadStoresHydrated, setUploadStoresHydrated] = useState(() =>
    typeof window !== "undefined" &&
    useImageUploadStore.persist.hasHydrated() &&
    useIdVerificationUploadStore.persist.hasHydrated() &&
    useTreatmentEvidenceStore.persist.hasHydrated(),
  );

  const { imageUploaded } = useImageUploadStore();
  const { idVerificationUpload } = useIdVerificationUploadStore();
  const { treatmentEvidenceUploaded } = useTreatmentEvidenceStore();

  useEffect(() => {
    const updateHydrationState = () => {
      setUploadStoresHydrated(
        useImageUploadStore.persist.hasHydrated() &&
          useIdVerificationUploadStore.persist.hasHydrated() &&
          useTreatmentEvidenceStore.persist.hasHydrated(),
      );
    };

    updateHydrationState();

    const unsubscribeImage =
      useImageUploadStore.persist.onFinishHydration(updateHydrationState);
    const unsubscribeId =
      useIdVerificationUploadStore.persist.onFinishHydration(updateHydrationState);
    const unsubscribeTreatment =
      useTreatmentEvidenceStore.persist.onFinishHydration(updateHydrationState);

    return () => {
      unsubscribeImage?.();
      unsubscribeId?.();
      unsubscribeTreatment?.();
    };
  }, []);

  const isDashboardRoute = router.pathname === "/dashboard";

  if (!isDashboardRoute || !uploadStoresHydrated) return null;

  // Sab upload ho chuke hain — banner aayega hi nahi, skeleton bhi nahi
  if (imageUploaded && idVerificationUpload && treatmentEvidenceUploaded) return null;

  // Prompt eligibility API se confirm hone tak optional area render na karo.
  // Is se first visit par default `false` store values ki wajah se false skeleton flash nahi hota.
  if (isLoading) return null;

  // BMI pehle, phir ID — ek waqt mein inme se ek hi dikhta hai
  let verificationBanner = null;
  if (!imageUploaded) {
    verificationBanner = (
      <AlertBanner
        icon={Camera}
        title="BMI Verification"
        description="Please verify your height and weight so the clinical team can confirm your BMI. This may be required to process your order."
        buttonText="Verify Now"
        href="/bmi-verification"
      />
    );
  } else if (!idVerificationUpload) {
    verificationBanner = (
      <AlertBanner
        icon={IdCard}
        title="Identity Verification"
        description="Please upload a valid proof of ID to verify your identity and complete your order."
        buttonText="Upload ID"
        href="/id-verification"
      />
    );
  }

  const treatmentBanner = !treatmentEvidenceUploaded ? (
    <AlertBanner
      icon={Pill}
      title="Proof of Current Treatment"
      description="As you are currently receiving weight loss medication from another clinic or pharmacy, please upload proof of your existing treatment. This is required before your treatment can be approved."
      buttonText="Upload Proof"
      href="/treatment-proof-upload"
    />
  ) : null;

  if (!verificationBanner && !treatmentBanner) return null;

  // BMI / ID banner left column mein; treatment banner uske saath right column mein,
  // aur agar BMI / ID ka koi banner na ho to treatment banner left column mein
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 sm:col-span-6">
        {verificationBanner || treatmentBanner}
      </div>
      {verificationBanner && treatmentBanner && (
        <div className="col-span-12 sm:col-span-6">{treatmentBanner}</div>
      )}
    </div>
  );
};

export default UploadTopPrompt;
