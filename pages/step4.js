import React, { useState } from "react";
import { useForm } from "react-hook-form";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import ProgressBar from "@/Components/ProgressBar/ProgressBar";
import NextButton from "@/Components/NextButton/NextButton";
import TextField from "@/Components/TextField/TextField";
import { useRouter } from "next/navigation";

export default function Step4() {
  const [localStep, setLocalStep] = useState(1);
  const [heightUnit, setHeightUnit] = useState("metric");
  const [weightUnit, setWeightUnit] = useState("kg");
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
      handleSubmit((data) => {
        localStorage.setItem("step4", JSON.stringify(data));
        router.push("/step5");
      })();
    } else {
      setLocalStep(2);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF0] px-6 py-12">
      <FormWrapper>
        <ProgressBar percentage={localStep === 1 ? 50 : 70} />

        <div className="p-6">
          <h1 className="text-2xl font-semibold text-center text-green-900 mb-3">
            {localStep === 1 ? "What is your height?" : "What is your current weight?"}
          </h1>

          {/* Tab Toggle */}
          <div className="flex justify-center mb-6">
            <div className="w-full max-w-md grid grid-cols-2 rounded-md overflow-hidden border border-green-700">
              {(localStep === 1 ? ["metric", "imperial"] : ["kg", "stlb"]).map((unit) => {
                const isActive =
                  localStep === 1 ? heightUnit === unit : weightUnit === unit;
                return (
                  <button
                    key={unit}
                    type="button"
                    onClick={() =>
                      localStep === 1 ? setHeightUnit(unit) : setWeightUnit(unit)
                    }
                    className={`w-full py-2 text-sm font-semibold border-r border-green-700 last:border-none transition-all
                    ${
                      isActive
                        ? "bg-green-100 text-green-900"
                        : "bg-white text-green-900 hover:bg-gray-100"
                    }`}
                  >
                    {unit === "metric"
                      ? "cm"
                      : unit === "imperial"
                      ? "ft/inch"
                      : unit === "stlb"
                      ? "st/lb"
                      : "kg"}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Step 1: Height */}
            {localStep === 1 &&
              (heightUnit === "imperial" ? (
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    label="Feet (ft)"
                    name="heightFt"
                    type="number"
                    register={register}
                    required
                    errors={errors}
                  />
                  <TextField
                    label="Inches (in)"
                    name="heightIn"
                    type="number"
                    register={register}
                    required
                    errors={errors}
                  />
                </div>
              ) : (
                <TextField
                  label="Centimetres (cm)"
                  name="heightCm"
                  type="number"
                  register={register}
                  required
                  errors={errors}
                />
              ))}

            {/* Step 2: Weight */}
            {localStep === 2 &&
              (weightUnit === "stlb" ? (
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    label="Stone (st)"
                    name="weightSt"
                    type="number"
                    register={register}
                    required
                    errors={errors}
                  />
                  <TextField
                    label="Pounds (lb)"
                    name="weightLbs"
                    type="number"
                    register={register}
                    required
                    errors={errors}
                  />
                </div>
              ) : (
                <TextField
                  label="Kilograms (kg)"
                  name="weightKg"
                  type="number"
                  register={register}
                  required
                  errors={errors}
                />
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
            <NextButton
              label={localStep === 2 ? "Submit" : "Next"}
              onClick={handleNext}
              type="button"
            />

            {/* Back Button */}
            {localStep === 2 && (
              <button
                type="button"
                onClick={() => setLocalStep(1)}
                className="w-full mt-4 py-2 text-sm text-green-800 font-medium border border-green-800 rounded-md hover:bg-green-50 transition"
              >
                ← Back to height
              </button>
            )}
          </form>
        </div>
      </FormWrapper>
    </div>
  );
}
