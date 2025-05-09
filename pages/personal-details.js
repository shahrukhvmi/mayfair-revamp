import { useForm } from "react-hook-form";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import ProgressBar from "@/Components/ProgressBar/ProgressBar";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/navigation";
import { FaRegCheckCircle } from "react-icons/fa";
import TextField from "@/Components/TextField/TextField";
import StepsHeader from "@/layout/stepsHeader";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import { useEffect, useState } from "react";
import PageLoader from "@/Components/PageLoader/PageLoader";
import { FiCheck } from "react-icons/fi";
import MuiDatePickerField from "@/Components/DatePicker/DatePicker";
import { differenceInYears, format, parse } from "date-fns";
import usePatientInfoStore from "@/store/patientInfoStore";
import useProductId from "@/store/useProductIdStore";

export default function PersonalDetails() {
  const [showLoader, setShowLoader] = useState(false);

  const router = useRouter();

  //Zustand Store State
  const { patientInfo, setPatientInfo } = usePatientInfoStore();
  const { productId } = useProductId();

  console.log(patientInfo, "patientInfo");

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      dob: "",
      gender: "",
    },
  });

  const validateAge = (date) => {
    if (!date) return "Date of birth is required";

    const age = differenceInYears(new Date(), date);

    if (age < 18) {
      return "You must be at least 18 years old";
    }

    if (productId === 4 && age > 75) {
      return "Wegovy (Semaglutide) is not recommended for individuals above 75 years of age";
    }

    if (productId === 1 && age > 85) {
      return "Mounjaro (Tirzepatide) is not recommended for individuals above 85 years of age";
    }

    return true;
  };

  useEffect(() => {
    if (patientInfo?.dob) {
      const parsedDate = parse(patientInfo.dob, "dd-MM-yyyy", new Date());
      const fixedGender = patientInfo?.gender ? patientInfo.gender.charAt(0).toUpperCase() + patientInfo.gender.slice(1).toLowerCase() : "";

      setValue("dob", parsedDate);
      setValue("gender", fixedGender);
    }

    if (patientInfo?.dob) {
      trigger(["dob"]);
    }
  }, [patientInfo, patientInfo?.gender]);

  const onSubmit = async (data) => {
    const formattedDOB = format(data.dob, "dd-MM-yyyy");

    setPatientInfo({
      ...patientInfo, // 🧠 keep old data
      dob: formattedDOB,
      gender: data.gender,
    });

    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    if (data.gender == "Male") {
      router.push("/residential-address");
    } else {
      router.push("/pregnancy-check");
    }
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
          <div>
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
                            ${
                              selected ? "bg-[#DACFFF] border-black text-black bold-font paragraph" : "border-gray-300 text-gray-900 hover:bg-gray-50"
                            } bold-font paragraph`}
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
                  <MuiDatePickerField name="dob" label="Date of Birth" control={control} errors={errors} rules={{ validate: validateAge }} />

                  {/* {errors.dob && <p className="text-red-500 text-sm mt-1 text-center">{errors.dob.message}</p>} */}

                  {/* {errors.dob && <p className="text-red-500 text-sm mt-1">Date of birth is required</p>} */}
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
