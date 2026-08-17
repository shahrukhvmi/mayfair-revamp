import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";

import NextButton from "@/Components/NextButton/NextButton";
import StepsHeader from "@/layout/stepsHeader";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import PageLoader from "@/Components/PageLoader/PageLoader";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useReorderButtonStore from "@/store/useReorderButton";
import useReorderBackProcessStore from "@/store/useReorderBackProcess";

const CONSENT_ITEMS = [
  "You consent for your medical information to be assessed by the clinical team at Mayfair Weight Loss Clinic and its pharmacy and to be prescribed medication.",
  "You consent to an age and ID check when placing your first order.",
  "You will answer all questions honestly and accurately, and understand that it is an offence to provide false information.",
  "You have capacity to understand all about the condition and medication information we have provided and that you give fully informed consent to the treatment option provided.",
  "You understand that the treatment or medical advice provided is based on the information you have provided.",
];

const QUESTIONS = [
  {
    id: "personalUse",
    text: "Are you purchasing this medication for yourself, of your own free will and the medicine is for your personal use only?",
  },
  {
    id: "decisionCapacity",
    text: "Do you believe you have the ability to make healthcare decisions for yourself?",
  },
];

export default function Acknowledgment() {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);
  const { setIsFromReorder } = useReorderButtonStore();
  const { setReorderBackProcess } = useReorderBackProcessStore();

  const { register, handleSubmit, watch, formState: { isValid } } = useForm({
    mode: "onChange",
    defaultValues: { personalUse: "", decisionCapacity: "", confirmConsent: false },
  });

  useEffect(() => { setReorderBackProcess(false); }, []);

  const personalUse = watch("personalUse");
  const decisionCapacity = watch("decisionCapacity");
  const confirmConsent = watch("confirmConsent");

  const isNoSelected = personalUse === "no" || decisionCapacity === "no";
  const showConsentBox = personalUse === "yes" && decisionCapacity === "yes";

  const onSubmit = async (data) => {
    setShowLoader(true);
    setIsFromReorder(false);
    await new Promise((r) => setTimeout(r, 500));
    router.push("/signup");
  };

  const renderYesNo = (fieldName, value) => (
    <div className="mt-3 flex gap-3">
      {["yes", "no"].map((option) => {
        const isSelected = value === option;
        const isYes = option === "yes";
        return (
          <label
            key={option}
            className={`
              relative flex flex-1 cursor-pointer items-center gap-3 rounded-xl border-2 px-5 py-4
              transition-all duration-200 select-none
              ${isSelected
                ? isYes
                  ? "border-[#47317c] bg-[#47317c]/[0.05]"
                  : "border-red-400 bg-red-50"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }
            `}
          >
            <input
              type="radio"
              value={option}
              {...register(fieldName, { required: true })}
              className="hidden"
            />
            <div
              className={`
                flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2
                transition-all duration-200
                ${isSelected
                  ? isYes
                    ? "border-[#47317c] bg-[#47317c]"
                    : "border-red-400 bg-red-400"
                  : "border-slate-300 bg-white"
                }
              `}
            >
              {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
            </div>
            <span
              className={`inter-medium-font text-[15px] capitalize ${
                isSelected
                  ? isYes ? "text-[#47317c]" : "text-red-600"
                  : "text-slate-700"
              }`}
            >
              {option}
            </span>
          </label>
        );
      })}
    </div>
  );

  return (
    <>
      <MetaLayout canonical={`${meta_url}acknowledgment/`} />
      <StepsHeader />
      <FormWrapper heading="Acknowledgment" description="" percentage="0">
        <PageAnimationWrapper>
          <div className="relative">
            <form onSubmit={handleSubmit(onSubmit)}>

              {/* Questions */}
              <div className="divide-y divide-slate-100">
                {QUESTIONS.map((q) => {
                  const val = q.id === "personalUse" ? personalUse : decisionCapacity;
                  return (
                    <div key={q.id} className="py-6 first:pt-0">
                      <p className="inter-medium-font text-[15px] leading-relaxed text-slate-800">
                        {q.text}
                      </p>
                      {renderYesNo(q.id, val)}
                    </div>
                  );
                })}
              </div>

              {/* No selected — cannot proceed */}
              {isNoSelected && (
                <div className="mt-2 rounded-xl border border-red-100 bg-red-50 px-5 py-4">
                  <p className="inter-medium-font text-[13px] leading-relaxed text-red-600">
                    Unfortunately we are unable to proceed. Please consult a healthcare professional if you have concerns.
                  </p>
                </div>
              )}

              {/* Consent */}
              {showConsentBox && (
                <div className="mt-2 rounded-xl border border-[#47317c]/[0.14] bg-[#faf9fd] p-5">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      {...register("confirmConsent", { required: true })}
                      className="hidden"
                    />
                    <div
                      className={`
                        mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-2
                        transition-all duration-200
                        ${confirmConsent
                          ? "border-[#47317c] bg-[#47317c]"
                          : "border-slate-300 bg-white"
                        }
                      `}
                    >
                      {confirmConsent && <Check size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className="inter-semibold-font text-[14px] text-slate-800">
                      Do you confirm that:
                    </span>
                  </label>

                  <ul className="inter-reg-font mt-4 space-y-3 pl-0 sm:pl-8 text-[13px] text-slate-600 leading-relaxed">
                    {CONSENT_ITEMS.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ShieldCheck
                          size={14}
                          className="mt-0.5 shrink-0 text-[#47317c]/50"
                          strokeWidth={2}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA */}
              <div className="mt-6">
                <NextButton disabled={!isValid || isNoSelected} label="I Confirm" />
              </div>

            </form>

            {showLoader && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-white/60 cursor-not-allowed">
                <PageLoader />
              </div>
            )}
          </div>
        </PageAnimationWrapper>
      </FormWrapper>
    </>
  );
}
