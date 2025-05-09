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
  // ✅ FROM 2 STORES
  const { medicalQuestions } = useMedicalQuestionsStore();
  const { medicalInfo, setMedicalInfo } = useMedicalInfoStore();
  const [questions, setQuestions] = useState([]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isValid },
  } = useForm({ mode: "onChange" });

  // Load questions → prefer medicalInfo first
  useEffect(() => {
    if (medicalInfo && medicalInfo.length) {
      console.log("✅ Loading questions from medicalInfo (saved user answers)");
      setQuestions(medicalInfo);
    } else if (medicalQuestions && medicalQuestions.length) {
      console.log("🟡 Loading questions from medicalQuestions (API or fallback)");
      const initialized = medicalQuestions.map((q) => ({
        ...q,
        subfield_response: "",
      }));
      setQuestions(initialized);
    } else {
      console.log("❌ No questions found");
    }
  }, [medicalQuestions, medicalInfo]);

  // Prefill form fields
  useEffect(() => {
    questions.forEach((q) => {
      if (q.answer) {
        setValue(`responses[${q.id}].answer`, q.answer);
      }
      if (q.subfield_response) {
        setValue(`responses[${q.id}].subfield_response`, q.subfield_response);
      }
    });
  }, [questions]);

  const handleAnswerChange = (id, value) => {
    const updated = questions.map((q) => (q.id === id ? { ...q, answer: value, subfield_response: value === "no" ? "" : q.subfield_response } : q));
    setQuestions(updated);
    setValue(`responses[${id}].answer`, value);
    if (value === "no") {
      setValue(`responses[${id}].subfield_response`, "");
    }
  };

  const handleSubFieldChange = (id, value) => {
    const updated = questions.map((q) => (q.id === id ? { ...q, subfield_response: value } : q));
    setQuestions(updated);
    setValue(`responses[${id}].subfield_response`, value);
  };

  const isNextEnabled = questions.every((q) => {
    const answer = watch(`responses[${q.id}].answer`);
    const subfield = watch(`responses[${q.id}].subfield_response`);

    if (answer === "no") return true;
    if (answer === "yes" && q.has_sub_field) return subfield && subfield.trim() !== "";
    if (answer === "yes" && !q.has_sub_field && q.validation_error_msg) return false;

    return true;
  });

  const onSubmit = async () => {
    // ✅ Save questions + user answers into medicalInfo
    setMedicalInfo(questions);

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
              {questions.map((q) => {
                const selectedAnswer = watch(`responses[${q.id}].answer`);
                const subfieldValue = watch(`responses[${q.id}].subfield_response`);
                const showValidationError = selectedAnswer === "yes" && !q.has_sub_field && q.validation_error_msg;

                return (
                  <div
                    key={q.id}
                    className={`p-5 shadow-sm border rounded-md bg-white ${showValidationError ? "border-red-400" : "border-gray-200"}`}
                  >
                    <div
                      className="text-base text-[#1C1C29] reg-font paragraph mb-4 [&>ul]:list-disc [&>ul]:ml-6 [&>li]:mt-0.5"
                      dangerouslySetInnerHTML={{ __html: q.question }}
                    ></div>

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
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
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

                    {showValidationError && <p className="text-sm text-red-500 mt-2">{q.validation_error_msg}</p>}

                    {q.has_sub_field && selectedAnswer === "yes" && (
                      <textarea
                        className="text-black w-full p-3 mt-4 border border-violet-300 focus:ring-2 focus:ring-violet-600 rounded-md text-sm"
                        placeholder={q.sub_field_prompt}
                        value={subfieldValue}
                        onChange={(e) => handleSubFieldChange(q.id, e.target.value)}
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
