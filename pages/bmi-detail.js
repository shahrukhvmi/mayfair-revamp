import React, { useState } from "react";
import { useForm } from "react-hook-form";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import ProgressBar from "@/Components/ProgressBar/ProgressBar";
import NextButton from "@/Components/NextButton/NextButton";
import TextField from "@/Components/TextField/TextField";
import { useRouter } from "next/navigation";
import StepsHeader from "@/layout/stepsHeader";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import PageLoader from "@/Components/PageLoader/PageLoader";
import { Inter } from "next/font/google";
import BackButton from "@/Components/BackButton/BackButton";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function BmiDetail() {
  const [localStep, setLocalStep] = useState(1);
  const [heightUnit, setHeightUnit] = useState("metric");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [showLoader, setShowLoader] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      heightFt: "",
      heightIn: "",
      heightCm: "",
      weightSt: "",
      weightLbs: "",
      weightKg: "",
    },
  });

  const handleNext = async () => {
    const fields =
      localStep === 1
        ? heightUnit === "imperial"
          ? ["heightFt", "heightIn"]
          : ["heightCm"]
        : weightUnit === "stlb"
        ? ["weightSt", "weightLbs"]
        : ["weightKg"];

    const isValid = await trigger(fields);
    if (!isValid) return;

    if (localStep === 2) {
      handleSubmit(async (data) => {
        console.log(data);
        setShowLoader(true);
        await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 1s
        router.push("/medical-questions");
      })();
    } else {
      setLocalStep(2);
    }
  };

  // const onSubmit = async (data) => {
  //   console.log("Form Data:", data);
  //   setShowLoader(true);
  //   await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 2s
  //   router.push("/steps-information");
  // };

  return (
    <>
      <StepsHeader />
      <FormWrapper
        heading={localStep === 1 ? "What is your height?" : "What is your current weight?"}
        description={
          "Your Body Mass Index (BMI) is an important factor in assessing your eligibility for treatment. Please enter your height and weight below to allow us to calculate your BMI."
        }
        percentage={"70"}
      >
        <PageAnimationWrapper>
          <div className="p-6">
            {/* Tab Toggle */}
            <div className="flex justify-center mb-6">
              <div className="w-full max-w-md grid grid-cols-2 rounded-md overflow-hidden border border-green-700">
                {(localStep === 1 ? ["metric", "imperial"] : ["kg", "stlb"]).map((unit) => {
                  const isActive = localStep === 1 ? heightUnit === unit : weightUnit === unit;
                  return (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => (localStep === 1 ? setHeightUnit(unit) : setWeightUnit(unit))}
                      className={`w-full py-2 text-sm font-semibold border-r border-green-700 last:border-none transition-all
                    ${isActive ? "bg-green-100 text-green-900" : "bg-white text-green-900 hover:bg-gray-100"}`}
                    >
                      {unit === "metric" ? "cm" : unit === "imperial" ? "ft/inch" : unit === "stlb" ? "st/lb" : "kg"}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                {/* Step 1: Height */}
                {localStep === 1 &&
                  (heightUnit === "imperial" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <TextField label="Feet (ft)" name="heightFt" type="number" register={register} required errors={errors} />
                      <TextField label="Inches (in)" name="heightIn" type="number" register={register} required errors={errors} />
                    </div>
                  ) : (
                    <TextField label="Centimetres (cm)" name="heightCm" type="number" register={register} required errors={errors} />
                  ))}

                {/* Step 2: Weight */}
                {localStep === 2 &&
                  (weightUnit === "stlb" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <TextField label="Stone (st)" name="weightSt" type="number" register={register} required errors={errors} />
                      <TextField label="Pounds (lb)" name="weightLbs" type="number" register={register} required errors={errors} />
                    </div>
                  ) : (
                    <TextField label="Kilograms (kg)" name="weightKg" type="number" register={register} required errors={errors} />
                  ))}

                {/* Info Box */}
                {localStep === 2 && (
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 text-sm rounded-md">
                    <p>
                      <strong>ℹ</strong> Your previous recorded weight was <strong>80 st & 20 lbs</strong>
                    </p>
                  </div>
                )}

                {/* Next / Submit */}
                <NextButton label={localStep === 2 ? "Next" : "Next"} onClick={handleNext} type="button" />

                {/* Back Button */}
                {localStep === 2 ? (
                  <BackButton type="button" label="Back" className="mt-3" onClick={() => setLocalStep(1)} />
                ) : (
                  <BackButton label="Back" className="mt-2" onClick={() => router.back()} />
                )}
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
