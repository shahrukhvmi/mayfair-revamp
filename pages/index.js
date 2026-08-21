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

    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}`} />
      <StepsHeader />

      <section className="min-h-[calc(100vh-66px)] bg-[#FBFBFD] px-4 py-8 sm:py-12">
        <div className="relative mx-auto w-full max-w-[580px] overflow-hidden rounded-2xl border border-[#47317c]/10 bg-white px-5 py-6 shadow-[0_12px_36px_rgba(71,49,124,0.09)] sm:px-8 sm:py-8">
          {/* Icon */}
          <div className="mb-6 flex h-[150px] items-center justify-center rounded-xl border border-[#47317c]/[0.07] bg-[#f7f5fc] sm:h-[165px]">
            <Image
              src={Weight}
              alt="Weight Loss Icon"
              width={132}
              height={132}
              priority
              className="h-[118px] w-[118px] object-contain sm:h-[132px] sm:w-[132px]"
            />
          </div>

          {/* Heading */}
          <h2 className="inter-semibold-font mb-2 text-start text-[21px] leading-[1.3] tracking-[-0.02em] text-slate-900 sm:text-[23px]">
            Let's get you started on your weight loss journey.
          </h2>

          <p className="inter-reg-font mb-6 text-start text-[13.5px] leading-6 text-slate-500">
            We’ll now ask a few questions about you and your health.
          </p>

          {/* Good to know */}
          <div className="mb-6">
            <p className="inter-semibold-font mb-2 text-[13px] text-slate-800">Good to know</p>
            <ul className="inter-reg-font list-inside list-disc divide-y divide-slate-100 border-y border-slate-100 text-[13px] leading-5 text-slate-600 marker:text-[#47317c] [&>li]:py-3">
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
              disabled={!isValid}
              className="!rounded-xl text-[16px]"
            />

            <button
              type="submit"
              name="action"
              value="Returning Patient"
              disabled={!isValid}
              className="group flex min-h-[54px] w-full cursor-pointer flex-col ite ms-center justify-center rounded-xl border border-[#47317c]/30 bg-white px-6 py-3 mt-3 text-[#47317c] transition-all duration-3 hover:border-[#47317c] hover:bg-[#47317c]/[0.04] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 inter-medium-font"
            >
              Returning Patient
              <p className="inter-reg-font mt-0.5 !text-[12px] text-[#47317c]/75 group-disabled:text-slate-400">
                Click here - your previous details will be saved
              </p>
            </button>
          </form>

          {showLoader && (
            <div className="fixed inset-0 z-[100] flex cursor-not-allowed items-center justify-center bg-white">
              <PageLoader />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
