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
import MetaLayout from "@/Meta/MetaLayout";
import { FoundayoProductId, meta_url, WegovyPillProductId } from "@/config/constants";

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
      pregnancy: "",
    },
  });

  const gender = watch("gender");
  const pregnancy = watch("pregnancy");

  const validateAge = (date) => {
    if (!date) return "Date of birth is required";

    const today = new Date();
    const age = differenceInYears(today, date);

    if (age < 18) {
      return "You must be at least 18 years old";
    }

    // 85th birthday calculate karo
    const birthDate = new Date(date);
    const eightyFifthBirthday = new Date(
      birthDate.getFullYear() + 85,
      birthDate.getMonth(),
      birthDate.getDate(),
    );

    // Agar aaj 85th birthday ke baad hai — block karo
    const isOver85 = today > eightyFifthBirthday;

    console.log(productId, age, "product id & Age");

    if (productId === 1 && isOver85) {
      return "Wegovy (Semaglutide) is not recommended for individuals above 85 years of age";
    }
    if (productId === FoundayoProductId && isOver85) {
      return "Foundayo (Orforglipron) is not recommended for individuals above 85 years of age";
    }

    if (productId === WegovyPillProductId && isOver85) {
      return "Wegovy Pill is not recommended for individuals above 85 years of age";
    }

    if (productId === 4 && isOver85) {
      return "Mounjaro (Tirzepatide) is not recommended for individuals above 85 years of age";
    }

    return true;
  };

  useEffect(() => {
    if (patientInfo?.dob) {
      const parsedDate = parse(patientInfo.dob, "dd-MM-yyyy", new Date());
      const fixedGender = patientInfo?.gender
        ? patientInfo.gender.charAt(0).toUpperCase() +
          patientInfo.gender.slice(1).toLowerCase()
        : "";

      setValue("dob", parsedDate);
      setValue("gender", fixedGender);
    }

    if (patientInfo?.pregnancy) {
      setValue("pregnancy", patientInfo.pregnancy);
    }

    if (patientInfo?.dob) {
      trigger(["dob", "pregnancy"]);
    }
  }, [patientInfo, patientInfo?.gender]);

  useEffect(() => {
    if (watch("gender") === "Male") {
      setValue("pregnancy", "");
    }
  }, [watch("gender")]);

  const onSubmit = async (data) => {
    const formattedDOB = format(data.dob, "dd-MM-yyyy");

    setPatientInfo({
      ...patientInfo, // 🧠 keep old data
      dob: formattedDOB,
      gender: data.gender,
      pregnancy: data.pregnancy || "", // Add this
    });

    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    router.push("/residential-address");
  };


  return (
    <>
      <MetaLayout canonical={`${meta_url}personal-details/`} />
      <StepsHeader />

      <FormWrapper
        heading={"Mention your sex at birth"}
        description={
          "This refers to your sex when you were born. We ask this because a range of health issues are specific to people based on their sex at birth."
        }
        percentage={"30"}
      >
        <PageAnimationWrapper>
          <div>
            <div
              className={`relative ${
                showLoader ? "pointer-events-none cursor-not-allowed" : ""
              }`}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Male / Female */}
                <div className="flex gap-3">
                  {["Male", "Female"].map((option) => {
                    const selected = watch("gender") === option;
                    return (
                      <label
                        key={option}
                        className={`
                          relative flex flex-1 cursor-pointer items-center gap-3 rounded-xl border-2 px-5 py-4
                          transition-all duration-200 select-none
                          ${selected
                            ? "border-[#47317c] bg-[#47317c]/[0.05]"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }
                        `}
                      >
                        <input
                          type="radio"
                          value={option}
                          {...register("gender", { required: true })}
                          className="hidden"
                        />
                        <div className={`
                          flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2
                          transition-all duration-200
                          ${selected ? "border-[#47317c] bg-[#47317c]" : "border-slate-300 bg-white"}
                        `}>
                          {selected && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                        <span className={`inter-medium-font text-[15px] ${selected ? "text-[#47317c]" : "text-slate-700"}`}>
                          {option}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {errors.gender && (
                  <p className="inter-reg-font text-[12px] text-red-500">
                    Please select your sex at birth
                  </p>
                )}

                {/* Pregnancy question — Female only */}
                {gender === "Female" && (
                  <div className="rounded-xl border border-slate-100 bg-[#FBFBFD] p-5 space-y-4">
                    <div>
                      <p className="inter-semibold-font text-[15px] text-slate-800 leading-snug">
                        Are you pregnant, breastfeeding, or trying to conceive?
                      </p>
                      <p className="inter-reg-font mt-1.5 text-[13px] text-slate-500 leading-relaxed">
                        Our treatment programme is not suitable while breastfeeding, pregnant, or trying to conceive.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      {["yes", "no"].map((option) => {
                        const isSelected = pregnancy === option;
                        return (
                          <label
                            key={option}
                            className={`
                              relative flex flex-1 cursor-pointer items-center gap-3 rounded-xl border-2 px-5 py-4
                              transition-all duration-200 select-none
                              ${isSelected
                                ? "border-[#47317c] bg-[#47317c]/[0.05]"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                              }
                            `}
                          >
                            <input
                              type="radio"
                              value={option}
                              {...register("pregnancy", { required: true })}
                              className="hidden"
                            />
                            <div className={`
                              flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2
                              transition-all duration-200
                              ${isSelected ? "border-[#47317c] bg-[#47317c]" : "border-slate-300 bg-white"}
                            `}>
                              {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                            <span className={`inter-medium-font text-[15px] capitalize ${isSelected ? "text-[#47317c]" : "text-slate-700"}`}>
                              {option}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {pregnancy === "yes" && (
                      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                        <p className="inter-reg-font text-[13px] text-red-600 leading-relaxed">
                          This treatment is not suitable if you are pregnant, trying to get pregnant or breastfeeding. We recommend you speak to your GP in person.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Date of Birth */}
                <div>
                  <MuiDatePickerField
                    name="dob"
                    label="Date of Birth"
                    control={control}
                    errors={errors}
                    rules={{ validate: validateAge }}
                  />
                </div>

                <NextButton
                  label="Next"
                  disabled={!isValid || (gender === "Female" && pregnancy === "yes")}
                />
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
