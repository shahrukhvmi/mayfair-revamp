import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import StepsHeader from "@/layout/stepsHeader";
import PageLoader from "@/Components/PageLoader/PageLoader";
import NextButton from "@/Components/NextButton/NextButton";
import BackButton from "@/Components/BackButton/BackButton";
import { useRouter } from "next/navigation";
import { FaRegCircle, FaDotCircle } from "react-icons/fa";
import useConfirmationQuestionsStore from "@/store/confirmationQuestionStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import normalizeConfirmationInfo from "@/utils/normalizeConfirmationInfo";

export default function PatientConsent() {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

  const { confirmationQuestions } = useConfirmationQuestionsStore();
  const { confirmationInfo, setConfirmationInfo } = useConfirmationInfoStore();
  const [questions, setQuestions] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
  });

  // Load questions → prefer confirmationInfo
  useEffect(() => {
    if (confirmationQuestions?.length) {
      const initialized = confirmationQuestions.map((q) => {
        const existingAnswer = confirmationInfo?.find(
          (item) => item.id === q.id,
        );

        return {
          ...q,
          answer: existingAnswer?.answer ?? false,
        };
      });

      setQuestions(initialized);
    } else {
      setQuestions([]);
    }
  }, [confirmationQuestions]);

  // Prefill form fields
  useEffect(() => {
    questions.forEach((q) => {
      setValue(`responses[${q.id}].answer`, q.answer ?? false);
    });
  }, [questions]);

  const handleCheckboxChange = (id, value) => {
    const updated = questions.map((q) =>
      q.id === id
        ? { ...q, answer: value, has_check_list: true, has_checklist: true }
        : q,
    );

    setQuestions(updated);
    setValue(`responses[${id}].answer`, value);
  };

  const isNextEnabled = questions.every(
    (q) => watch(`responses[${q.id}].answer`) === true,
  );

  console.log(questions, "questions");

  const onSubmit = async () => {
    setConfirmationInfo(
      normalizeConfirmationInfo(questions, confirmationQuestions),
    );

    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/gp-detail");
  };

  useEffect(() => {
    console.log("confirmationQuestions", confirmationQuestions);
    console.log("questions state", questions);
  }, [confirmationQuestions, questions]);
  return (
    <>
      <MetaLayout canonical={`${meta_url}patient-consent/`} />
      <StepsHeader />

      <FormWrapper
        heading={"Patient Consent"}
        description=""
        percentage={"85"}
      >
        <PageAnimationWrapper>
          <div>
            <div
              className={`relative ${
                showLoader ? "pointer-events-none cursor-not-allowed" : ""
              }`}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <section aria-labelledby="consent-statements-heading">
                  <div className="mb-2 border-b border-slate-200 pb-4">
                    <h2
                      id="consent-statements-heading"
                      className="inter-semibold-font text-[16px] text-slate-900 sm:text-[17px]"
                    >
                      I confirm and understand that:
                    </h2>
                    
                  </div>

                  <div className="divide-y divide-slate-200">
                    {questions.map((q) => {
                      const selectedAnswer = watch(`responses[${q.id}].answer`);

                      return (
                        <article key={q.id} className="py-5 first:pt-4">
                          <div className="min-w-0">
                              {q.checklist && (
                                <div
                                  className="inter-reg-font mb-4 text-[14px] leading-[1.75] text-slate-600 sm:text-[16px] [&>ul]:ml-5 [&>ul]:list-disc [&>li]:mt-1.5"
                                  dangerouslySetInnerHTML={{ __html: q.checklist }}
                                />
                              )}

                              <label
                                htmlFor={`question-${q.id}`}
                                className="group grid cursor-pointer grid-cols-[20px_minmax(0,1fr)] items-center gap-3"
                              >
                                <input
                                  type="checkbox"
                                  id={`question-${q.id}`}
                                  checked={selectedAnswer}
                                  onChange={(e) =>
                                    handleCheckboxChange(q.id, e.target.checked)
                                  }
                                  className="sr-only"
                                />
                                <span
                                  className={`flex h-5 w-5 items-center justify-center self-center rounded-[6px] border-2 transition-all duration-150 group-hover:border-[#47317c]/60 ${
                                    selectedAnswer
                                      ? "border-[#47317c] bg-[#47317c]"
                                      : "border-slate-300 bg-white"
                                  }`}
                                >
                                  {selectedAnswer && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </span>
                                <span className={`inter-medium-font text-[15px] leading-[1.65] transition-colors sm:text-[15.5px] ${selectedAnswer ? "text-[#47317c]" : "text-slate-800"}`}>
                                  {q?.qsummary
                                    ?.replace("I confirm and understand that:", "")
                                    ?.replace("below", "above")
                                    ?.trim()}
                                </span>
                              </label>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>

                {/* Show error if not accepted */}
                {!isNextEnabled && (
                  <p className="inter-reg-font border-l-2 border-amber-300 pl-3 text-[13.5px] leading-relaxed text-amber-700">
                    You must confirm before proceeding.
                  </p>
                )}

                <NextButton label="Next" disabled={!isNextEnabled} />
                <BackButton
                  label="Back"
                  className="mt-2"
                  onClick={() => router.push("/medical-questions")}
                />
              </form>

              {showLoader && (
                <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">
                  <PageLoader />
                </div>
              )}
            </div>
          </div>
        </PageAnimationWrapper>
      </FormWrapper>
    </>
  );
}
