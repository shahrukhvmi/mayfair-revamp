import React, { useState } from "react";
import { useForm } from "react-hook-form";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import NextButton from "@/Components/NextButton/NextButton";
import { FiCheck } from "react-icons/fi";
import { useRouter } from "next/navigation";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import PageLoader from "@/Components/PageLoader/PageLoader";
import StepsHeader from "@/layout/stepsHeader";
import { GoDotFill } from "react-icons/go";
import BackButton from "@/Components/BackButton/BackButton";

const options = ["Yes", "No", "None of the above"];

export default function ConfirmEthnicity() {
  const [showLoader, setShowLoader] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      ethnicity: "",
    },
  });

  const selectedOption = watch("ethnicity");

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    router.push("/bmi-detail");
  };

  return (
    <>
      <StepsHeader />
      <FormWrapper
        heading={"Confirm Ethnicity for BMI"}
        description={
          "People of certain ethnicities may be suitable for treatment at a lower BMI than others, if appropriate. Does one of the following options describe your ethnic group or background?"
        }
        percentage={"60"}
      >
        <PageAnimationWrapper>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {["South Asian", "Chinese", "Other Asian", "Middle Eastern", "Black African", "African-Caribbean"].map((ethnicity, index) => (
                <div key={index} className="flex items-start gap-3">
                  {/* w-2.5 h-2.5 */}
                  <div className=" mt-2 bg-violet-700 rounded-full"></div>
                  <div className="flex items-center">
                    <GoDotFill className="me-2 text-gray-800 text-xs" />
                    <p className="text-sm text-gray-800">{ethnicity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  {options.map((option) => {
                    const isSelected = selectedOption === option;
                    return (
                      <label
                        key={option}
                        className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition-all cursor-pointer text-sm
                      ${isSelected ? "bg-green-50 border-black text-black font-medium" : "border-gray-300 text-gray-900 hover:bg-gray-50"}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-sm flex items-center justify-center border transition
                        ${isSelected ? "bg-violet-700 border-violet-800 text-white" : "border-gray-400 bg-white"}`}
                        >
                          {isSelected && <FiCheck className="w-4 h-4" />}
                        </div>
                        <input type="radio" value={option} {...register("ethnicity", { required: true })} className="hidden" />
                        {option}
                      </label>
                    );
                  })}
                </div>

                <NextButton disabled={!isValid} label="Next" />
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
