import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FaCheck } from "react-icons/fa";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import ProgressBar from "@/Components/ProgressBar/ProgressBar";
import StepsHeader from "@/layout/stepsHeader";
import BackButton from "@/Components/BackButton/BackButton";
import NextButton from "@/Components/NextButton/NextButton";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import PageLoader from "@/Components/PageLoader/PageLoader";

const MedicalQuestions = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [errorMessages, setErrorMessages] = useState({});
  const [showLoader, setShowLoader] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isValid },
  } = useForm({ mode: "onChange" });

  const medicalData = [
    {
      question: "Do you have any allergies or intolerances?",
      has_sub_field: true,
      sub_field_prompt: "Give us additional information, please.",
      answer: "no",
      subfield_response: "",
    },
    {
      question: "Have you been prescribed and are currently taking weight loss medication?",
      has_sub_field: true,
      sub_field_prompt: "Please mention the medication and dose.",
      answer: "no",
      subfield_response: "",
    },
    {
      question: "Are you currently taking any diabetes treatment medication?",
      has_sub_field: false,
      sub_field_prompt: "",
      answer: "no",
      subfield_response: "",
    },
  ];

  useEffect(() => {
    const initialized = medicalData.map((q, i) => ({ ...q, id: i }));
    setQuestions(initialized);

    initialized.forEach((q) => {
      setValue(`responses[${q.id}].answer`, q.answer);
      setValue(`responses[${q.id}].subfield_response`, q.subfield_response);
    });
  }, []);

  const handleChange = (id, value, isSubField = false) => {
    setResponses((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...(isSubField ? { subfield_response: value } : { answer: value }),
      },
    }));

    setValue(`responses[${id}].${isSubField ? "subfield_response" : "answer"}`, value);

    if (!isSubField && value === "no") {
      setErrorMessages((prev) => ({ ...prev, [id]: undefined }));
    } else if (isSubField && value.trim() !== "") {
      setErrorMessages((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const isNextEnabled = questions.every((q) => {
    const answer = watch(`responses[${q.id}].answer`);
    const subfield = watch(`responses[${q.id}].subfield_response`);
    return !errorMessages[q.id] && (answer === "no" || (answer === "yes" && (!q.has_sub_field || (subfield && subfield.trim() !== ""))));
  });

  const onSubmit = async () => {
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    router.push("/patient-consent");
  };

  return (
    <>
      <StepsHeader />
      <FormWrapper heading={"Medical Questions"} description={""} percentage={"80"}>
        <PageAnimationWrapper>
          <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
              {questions.map((q) => {
                const selectedAnswer = watch(`responses[${q.id}].answer`);

                return (
                  <div
                    key={q.id}
                    className={`p-5 shadow-sm border-1 rounded-md m-3 bg-white ${errorMessages[q.id] ? "border-red-400" : "border-gray-200"}`}
                  >
                    <p className="text-base text-[#1C1C29] font-inter mb-4">{q.question}</p>

                    {errorMessages[q.id] && <p className="text-sm text-red-500 mt-2">{errorMessages[q.id]}</p>}

                    <div className="flex gap-4 mt-4">
                      {["yes", "no"].map((option) => {
                        const isSelected = selectedAnswer === option;
                        return (
                          <label
                            key={option}
                            className={`flex items-center justify-start border px-6 py-2 transition-all cursor-pointer w-full sm:w-auto rounded-md
                                ${isSelected ? "bg-green-50 border-violet-700" : "border-gray-300 bg-white hover:bg-gray-50"}`}
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
                                  onChange={(e) => handleChange(q.id, e.target.value)}
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
                            <span className={`text-sm font-medium ${isSelected ? "text-violet-700" : "text-gray-700"}`}>
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
                        value={responses[q.id]?.subfield_response}
                        onChange={(e) => handleChange(q.id, e.target.value, true)}
                      />
                    )}
                  </div>
                );
              })}

              {/* <BackButton label="Back" onClick={() => router.back()} /> */}
              <div className="m-6">
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
