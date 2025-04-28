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
import { FiCheck } from "react-icons/fi";

export default function PersonalDetails() {
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
    router.push("/residential-address");
  };

  return (
    <>
      <StepsHeader />

      <FormWrapper
        heading={"What is your sex at birth?"}
        description={
          "This refers to your sex when you were born. We ask this because a range of health issues are specific to people based on their sex at birth."
        }
        percentage={"30"}
      >
        <PageAnimationWrapper>
          <div className="p-6">
            <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  {/* <h1 className="text-lg font-semibold text-center mb-2 text-black">What is your gender</h1> */}
                  {/* <p className="text-sm text-green-900 text-center mb-6">
                                Why do we ask about your sex at birth?
                            </p> */}

                  <div className="space-y-3">
                    {["Male", "Female"].map((option) => {
                      const selected = watch("gender") === option;
                      return (
                        <label
                          key={option}
                          className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition-all cursor-pointer text-sm
                            ${selected ? "bg-green-50 border-black text-black font-medium" : "border-gray-300 text-gray-900 hover:bg-gray-50"}`}
                        >
                          <div
                            className={`w-5 h-5 rounded-sm flex items-center justify-center border transition
                            ${selected ? "bg-violet-700 border-violet-800 text-white" : "border-gray-400 bg-white"}`}
                          >
                            {selected && <FiCheck className="w-4 h-4" />}
                          </div>
                          <input type="radio" value={option} {...register("gender", { required: true })} className="hidden" />

                          {option}
                        </label>
                      );
                    })}
                  </div>

                  {errors.gender && <p className="text-red-500 text-sm mt-1 text-center">Please select your gender</p>}
                </div>
                <div>
                  <TextField label="Date Of Birth" name="dob" type="date" placeholder="DD/MM/YYYY" register={register} required errors={errors} />

                  {errors.dob && <p className="text-red-500 text-sm mt-1">Date of birth is required</p>}
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
