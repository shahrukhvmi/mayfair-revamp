import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FaCheck } from "react-icons/fa";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import StepsHeader from "@/layout/stepsHeader";
import BackButton from "@/Components/BackButton/BackButton";
import NextButton from "@/Components/NextButton/NextButton";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import PageLoader from "@/Components/PageLoader/PageLoader";
import useMedicalQuestionsStore from "@/store/medicalQuestionStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";

const MedicalQuestions = () => {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

  // This is for new User
  const { medicalQuestions, setMedicalQuestions } = useMedicalQuestionsStore();

  // This is If user old user and have data
  const { medicalInfo, setMedicalInfo } = useMedicalInfoStore();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isValid },
  } = useForm({ mode: "onChange" });

  useEffect(() => {
    medicalQuestions.forEach((q) => {
      setValue(`responses[${q.id}].answer`, "no");
      setValue(`responses[${q.id}].subfield_response`, "");
    });
  }, [medicalQuestions]);

  const isNextEnabled = medicalQuestions.every((q) => {
    const answer = watch(`responses[${q.id}].answer`);
    const subfield = watch(`responses[${q.id}].subfield_response`);

    if (answer === "no") return true;

    if (answer === "yes" && q.has_sub_field) {
      return subfield && subfield.trim() !== "";
    }

    if (answer === "yes" && !q.has_sub_field && q.validation_error_msg) {
      return false; // Block next if error message should show
    }

    return true;
  });

  const onSubmit = async () => {
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/patient-consent");
  };

  return (
    <>
      <StepsHeader />
      <FormWrapper heading={"Medical Questions"} percentage={"80"}>
        <PageAnimationWrapper>
          <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
              {medicalQuestions.map((q) => {
                const selectedAnswer = watch(`responses[${q.id}].answer`);
                const subfieldValue = watch(`responses[${q.id}].subfield_response`);
                const showValidationError = selectedAnswer === "yes" && !q.has_sub_field && q.validation_error_msg;

                return (
                  <div
                    key={q.id}
                    className={`p-5 shadow-sm border-1 rounded-md bg-white ${showValidationError ? "border-red-400" : "border-gray-200"}`}
                  >
                    <div
                      className="text-base text-[#1C1C29] reg-font paragraph mb-4 [&>ul]:list-disc [&>ul]:ml-6 [&>li]:mt-0.5"
                      dangerouslySetInnerHTML={{ __html: q.question }}
                    ></div>

                    {showValidationError && <p className="text-sm text-red-500 mt-2">{q.validation_error_msg}</p>}

                    <div className="flex gap-4 mt-4">
                      {q.options.map((option) => {
                        const isSelected = selectedAnswer === option;

                        return (
                          <label
                            key={option}
                            className={`bold-font paragraph flex items-center justify-start border px-6 py-2 transition-all cursor-pointer w-full sm:w-auto rounded-md
                                ${isSelected ? "bg-[#DACFFF] border-violet-700" : "border-gray-300 bg-white hover:bg-gray-50"}`}
                          >
                            <Controller
                              name={`responses[${q.id}].answer`}
                              control={control}
                              render={({ field }) => (
                                <input
                                  type="radio"
                                  {...field}
                                  value={option}
                                  checked={field.value === option}
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                    if (e.target.value === "no") {
                                      setValue(`responses[${q.id}].subfield_response`, "");
                                    }
                                  }}
                                  className="hidden"
                                />
                              )}
                            />
                            <div
                              className={`w-5 h-5 rounded-sm border mr-2 flex items-center justify-center 
                                ${isSelected ? "bg-violet-700 border-violet-700 text-white" : "border-gray-400"}`}
                            >
                              {isSelected && <FaCheck className="text-xs" />}
                            </div>
                            <span className={`reg-font paragraph ${isSelected ? "text-violet-700" : "text-gray-700"}`}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {q.has_sub_field && selectedAnswer === "yes" && (
                      <textarea
                        className="text-black w-full p-3 mt-4 border border-violet-300 focus:ring-2 focus:ring-violet-600 rounded-md text-sm"
                        placeholder={q.sub_field_prompt}
                        value={subfieldValue}
                        onChange={(e) => setValue(`responses[${q.id}].subfield_response`, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}

              <div className="">
                <NextButton disabled={!isNextEnabled} label="Next" />
                <BackButton label="Back" className="mt-2" onClick={() => router.back()} />
              </div>
            </form>

            {showLoader && (
              <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">
                <PageLoader />
              </div>
            )}
          </div>
        </PageAnimationWrapper>
      </FormWrapper>
    </>
  );
};

export default MedicalQuestions;
