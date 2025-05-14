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
    if (confirmationInfo && confirmationInfo.length) {
      console.log("✅ Loading from confirmationInfo (user answers)");
      setQuestions(confirmationInfo);
    } else if (confirmationQuestions && confirmationQuestions.length) {
      console.log("🟡 Loading from confirmationQuestions (API fallback)");
      const initialized = confirmationQuestions.map((q) => ({
        ...q,
        answer: false, // default unchecked
        has_check_list: true, // <-- hardcoded
      }));

      console.log(initialized, "initialized");
      setQuestions(initialized);
    } else {
      console.log("❌ No questions found");
    }
  }, [confirmationInfo, confirmationQuestions]);

  // Prefill form fields
  useEffect(() => {
    questions.forEach((q) => {
      setValue(`responses[${q.id}].answer`, q.answer ?? false);
    });
  }, [questions]);

  const handleCheckboxChange = (id, value) => {
    const updated = questions.map((q) => (q.id === id ? { ...q, answer: value, has_check_list: true } : q));

    setQuestions(updated);
    setValue(`responses[${id}].answer`, value);
  };

  const isNextEnabled = questions.every((q) => watch(`responses[${q.id}].answer`) === true);

  const onSubmit = async () => {
    setConfirmationInfo(questions);

    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/gp-detail");
  };

  return (
    <>
      <StepsHeader />

      <FormWrapper heading={"Patient Consent"} percentage={"85"}>
        <PageAnimationWrapper>
          <div className="pt-2 pb-6">
            <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {questions.map((q) => {
                  const selectedAnswer = watch(`responses[${q.id}].answer`);

                  return (
                    <div key={q.id} className="space-y-4 border rounded-md border-gray-700 p-5">
                      {/* Question and Checkbox */}
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id={`question-${q.id}`}
                          checked={selectedAnswer}
                          onChange={(e) => handleCheckboxChange(q.id, e.target.checked)}
                          className="hidden"
                        />
                        <label htmlFor={`question-${q.id}`} className="flex items-start gap-2 cursor-pointer">
                          {selectedAnswer ? (
                            <FaDotCircle className="text-violet-700 w-9 h-9 mt-1" />
                          ) : (
                            <FaRegCircle className="text-violet-700 w-9 h-9 mt-1" />
                          )}
                          <span className="bold-font text-gray-700">{q.question}</span>
                        </label>
                      </div>

                      {/* Checklist (if exists) */}
                      {q.checklist && (
                        <div
                          className="list-disc list-outside pl-5 text-sm text-gray-700 space-y-2 reg-font paragraph [&>ul]:list-disc [&>ul]:ml-6 [&>li]:mt-0.5"
                          dangerouslySetInnerHTML={{ __html: q.checklist }}
                        ></div>
                      )}
                    </div>
                  );
                })}

                {/* Show error if not accepted */}
                {!isNextEnabled && <p className="text-sm text-red-500 mt-2">You must confirm before proceeding.</p>}

                <NextButton label="Next" disabled={!isNextEnabled} />
                <BackButton label="Back" className="mt-2" onClick={() => router.back()} />
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
