import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import PageLoader from "@/Components/PageLoader/PageLoader";
import StepsHeader from "@/layout/stepsHeader";
import NextButton from "@/Components/NextButton/NextButton";
import Image from "next/image";
import useProductId from "@/store/useProductIdStore";
import { useSearchParams } from "next/navigation";
import useReorder from "@/store/useReorderStore";
import useAuthStore from "@/store/authStore";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useReorderButtonStore from "@/store/useReorderButton";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import Weight from "@/public/images/intro.svg";

export default function Index() {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);
  const [loadingAction, setLoadingAction] = useState("");
  const { authUserDetail } = useAuthUserDetailStore();

  const { setIsFromReorder } = useReorderButtonStore();
  //Search Param to get product ID
  const searchParams = useSearchParams();

  //From zustand Store
  const { productId, setProductId } = useProductId();
  const { reorder, setReorder } = useReorder();
  const { token } = useAuthStore();

  useEffect(() => {
    setIsFromReorder(false);
  }, []);

  useEffect(() => {
    const param = searchParams.get("product_id");
    if (param) {
      const parsedId = parseInt(param, 10);
      if (!isNaN(parsedId)) {
        setProductId(parsedId); // ✅ store in Zustand + localStorage
      }
    }
  }, [searchParams, setProductId]);

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {},
  });

  const onSubmit = async (data, e) => {
    const action = e.nativeEvent.submitter.value;
    if (showLoader) return;
    setLoadingAction(action);
    setShowLoader(true);

    if (action === "Returning Patient") {
      if (token && authUserDetail?.isReturning) {
        router.push("/steps-information");
        setIsFromReorder(true);
      } else {
        router.push("/dashboard");
      }
    } else {
      setReorder(false);
      setIsFromReorder(false);
      router.push("/acknowledgment");
    }
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}`} />
      <StepsHeader />

      <section className="min-h-[calc(100dvh-66px)] bg-[#FBFBFD] px-4 py-4 max-sm:flex max-sm:items-center sm:py-12">
        <div className="relative mx-auto w-full max-w-[580px] overflow-hidden rounded-2xl border border-[#47317c]/10 bg-white px-4 py-4 shadow-[0_12px_36px_rgba(71,49,124,0.09)] sm:px-8 sm:py-8 max-sm:w-full">
          {/* Icon */}
          {/* <div className="mb-6 flex items-center justify-center">
            <Image
              src={Weight}
              alt="Weight Loss Icon"
              width={132}
              height={132}
              priority
              className="h-[118px] w-[118px] object-contain sm:h-[132px] sm:w-[132px]"
            />
          </div> */}

          {/* Heading */}
          <h2 className="max-sm:text-[24px] inter-semibold-font mb-1.5 text-start text-[21px] leading-[1.3] tracking-[-0.02em] text-slate-900 sm:text-[24px]">
            Let's get you started on your weight loss journey.
          </h2>

          <p className="inter-reg-font mb-3 text-start text-[13.5px] max-sm:text-[16px] leading-[1.5] text-slate-500 sm:mb-6 sm:leading-6">
            We’ll now ask a few questions about you and your health.
          </p>

          {/* Good to know */}
          <div className="mb-4 sm:mb-6">
            <p className="inter-semibold-font mb-1 text-[13px] max-sm:text-[16px] text-slate-800">Good to know</p>
            <ul className="inter-reg-font list-outside list-disc divide-y divide-slate-100 border-y border-slate-100 pl-4 text-[13px] max-sm:text-[16px] leading-[1.4] text-slate-600 marker:text-[#47317c] [&>li]:py-1.5 sm:[&>li]:py-3">
              <li>
                Your consultation will take about five minutes to complete.
              </li>
              <li>All your responses are confidential and securely stored.</li>
              <li>
                We’ll show suitable treatment options based on the information
                you provide.
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <NextButton
              type="submit"
              label="New Patient"
              subHeading="Click here to start online consultation"
              subHeadingClassName="max-sm:hidden"
              loading={showLoader && loadingAction !== "Returning Patient"}
              disabled={!isValid || showLoader}
              className="!rounded-xl text-[16px]"
            />

            <button
              type="submit"
              name="action"
              value="Returning Patient"
              disabled={!isValid || (showLoader && loadingAction !== "Returning Patient")}
              className="group flex min-h-[54px] max-sm:min-h-[48px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-[#47317c]/30 bg-white px-6 py-2.5 mt-2 sm:mt-3 sm:py-3 text-[#47317c] transition-all duration-3 hover:border-[#47317c] hover:bg-[#47317c]/[0.04] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 inter-medium-font"
            >
              {showLoader && loadingAction === "Returning Patient" ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#47317c] border-t-transparent" />
                  Please wait...
                </span>
              ) : (
                <>
                  Returning Patient
                  <p className="inter-reg-font mt-0.5 !text-[12px] max-sm:hidden text-[#47317c]/75 group-disabled:text-slate-400">
                    Click here - your previous details will be saved
                  </p>
                </>
              )}
            </button>
          </form>

          {/* {showLoader && (
            <div className="fixed inset-0 z-[100] flex cursor-not-allowed items-center justify-center bg-white">
              <PageLoader />
            </div>
          )} */}
        </div>
      </section>
    </>
  );
}
