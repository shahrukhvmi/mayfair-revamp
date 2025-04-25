import { useForm } from "react-hook-form";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import ProgressBar from "@/Components/ProgressBar/ProgressBar";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/navigation";
import { FaRegCheckCircle } from "react-icons/fa";
import TextField from "@/Components/TextField/TextField";
import StepsHeader from "@/layout/stepsHeader";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import { useState } from "react";
import PageLoader from "@/Components/PageLoader/PageLoader";

export default function Step1() {
  const [showLoader, setShowLoader] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      dob: "",
      gender: "",
    },
  });

  const router = useRouter();

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    router.push("/step2");
  };

  return (
    <>
      <StepsHeader />

      <FormWrapper heading={"What is your date of birth?"} description={"Please ensure that this matches your ID."} percentage={"15"}>
        <PageAnimationWrapper>
          <div className="p-6">
            <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <TextField label="Date Of Birth" name="dob" type="date" placeholder="DD/MM/YYYY" register={register} required errors={errors} />

                  {errors.dob && <p className="text-red-500 text-sm mt-1">Date of birth is required</p>}
                </div>

                <div className="space-y-4">
                  <h1 className="text-lg font-semibold text-center mb-2 text-black">What is your gender</h1>
                  {/* <p className="text-sm text-green-900 text-center mb-6">
                                Why do we ask about your sex at birth?
                            </p> */}

                  <div className="space-y-3">
                    {["Female", "Male"].map((option) => {
                      const selected = watch("gender") === option;
                      return (
                        <label
                          key={option}
                          className={`relative block w-full border text-center py-3 rounded-md cursor-pointer transition-all duration-150 font-medium
                            ${
                              selected
                                ? "bg-green-100 border-green-800 text-green-900 scale-[1.01] shadow-sm"
                                : "bg-white border-green-800 text-green-800 hover:bg-green-50"
                            }`}
                        >
                          <input type="radio" value={option} {...register("gender", { required: true })} className="hidden" />

                          {option}
                          {selected && (
                            <span className="absolute top-1/2 right-4 -translate-y-1/2 text-green-800 text-lg">
                              <FaRegCheckCircle />
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {errors.gender && <p className="text-red-500 text-sm mt-1 text-center">Please select your gender</p>}
                </div>

                <NextButton label="Next" disabled={!isValid} />
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
