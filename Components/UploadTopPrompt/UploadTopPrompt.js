import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ChevronRight,
  IdCard,
  ShieldCheck,
  Stethoscope,
  UploadCloud,
} from "lucide-react";

import useIdVerificationUploadStore from "@/store/useIdVerificationUploadStore";
import useImageUploadStore from "@/store/useImageUploadStore ";
import useCartStore from "@/store/useCartStore";
import { getCurrentOrderId } from "@/utils/currentOrder";
import VerifyBmiModal, { VERIFY_BMI_DESCRIPTION } from "../Modal/VerifyBmiModal";

const ACTION_CLASS_NAME =
  "inter-medium-font group inline-flex min-h-[38px] w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border bg-amber-50 border-amber-200 px-5 py-2 text-[15px] max-sm:text-[16px] text-amber-600 no-underline whitespace-nowrap transition-all duration-150 hover:bg-amber-100 active:scale-[0.98] lg:w-[190px]";

const AlertBanner = ({
  icon: Icon,
  title,
  description,
  buttonText,
  href,
  onClick,
  actionIcon: ActionIcon = UploadCloud,
}) => {
  const actionContent = (
    <>
      <ActionIcon size={14} strokeWidth={2.2} />
      <span>{buttonText}</span>
      <ChevronRight size={13} strokeWidth={2.5} className="transition-transform duration-150 group-hover:translate-x-0.5" />
    </>
  );

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-amber-200/70 bg-amber-50/40 shadow-[0_1px_4px_rgba(180,83,9,0.06)]">
      <div className="flex w-full flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Content */}
        <div className="flex min-w-0 flex-1 items-center">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
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
        {onClick ? (
          <button type="button" onClick={onClick} className={ACTION_CLASS_NAME}>
            {actionContent}
          </button>
        ) : (
          <Link href={href} className={ACTION_CLASS_NAME}>
            {actionContent}
          </Link>
        )}
      </div>
    </section>
  );
};

const UploadTopPrompt = ({ isLoading = false }) => {
  const router = useRouter();

  const [uploadStoresHydrated, setUploadStoresHydrated] = useState(() =>
    typeof window !== "undefined" &&
    useImageUploadStore.persist.hasHydrated() &&
    useIdVerificationUploadStore.persist.hasHydrated(),
  );

  const { imageUploaded, setImageUploaded } = useImageUploadStore();
  const { idVerificationUpload } = useIdVerificationUploadStore();
  const { orderId } = useCartStore();
  const [showVerifyBmi, setShowVerifyBmi] = useState(false);

  useEffect(() => {
    const updateHydrationState = () => {
      setUploadStoresHydrated(
        useImageUploadStore.persist.hasHydrated() &&
          useIdVerificationUploadStore.persist.hasHydrated(),
      );
    };

    updateHydrationState();

    const unsubscribeImage =
      useImageUploadStore.persist.onFinishHydration(updateHydrationState);
    const unsubscribeId =
      useIdVerificationUploadStore.persist.onFinishHydration(updateHydrationState);

    return () => {
      unsubscribeImage?.();
      unsubscribeId?.();
    };
  }, []);

  const isDashboardRoute = router.pathname === "/dashboard";

  if (!isDashboardRoute || !uploadStoresHydrated) return null;

  // Dono upload ho chuke hain — banner aayega hi nahi, skeleton bhi nahi
  if (imageUploaded && idVerificationUpload && !showVerifyBmi) return null;

  // Prompt eligibility API se confirm hone tak optional area render na karo.
  // Is se first visit par default `false` store values ki wajah se false skeleton flash nahi hota.
  if (isLoading) return null;

  let banner = null;

  if (!imageUploaded) {
    banner = (
      <div className="w-full">
        <AlertBanner
          icon={Stethoscope}
          actionIcon={ShieldCheck}
          title="BMI Verification"
          description={VERIFY_BMI_DESCRIPTION}
          buttonText="Verify BMI"
          onClick={() => setShowVerifyBmi(true)}
        />
      </div>
    );
  } else if (!idVerificationUpload) {
    banner = (
      <div className="w-full">
        <AlertBanner
          icon={IdCard}
          title="Identity Verification"
          description="Please upload a valid proof of ID to verify your identity and complete your order."
          buttonText="Upload ID"
          href="/id-verification"
        />
      </div>
    );
  }

  // Modal banner se bahar hai: upload ke baad banner badal jata hai, success message nahi jana chahiye
  return (
    <>
      {banner}
      <VerifyBmiModal
        isOpen={showVerifyBmi}
        resolveOrderId={() => getCurrentOrderId(orderId)}
        onClose={() => setShowVerifyBmi(false)}
        onUploaded={() => setImageUploaded(true)}
      />
    </>
  );
};

export default UploadTopPrompt;
