import TextField from "@/Components/TextField/TextField";
import { useForm } from "react-hook-form";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/navigation";
import PageLoader from "@/Components/PageLoader/PageLoader";
import { useEffect, useState } from "react";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import StepsHeader from "@/layout/stepsHeader";
import BackButton from "@/Components/BackButton/BackButton";
import usePatientInfoStore from "@/store/patientInfoStore";

export default function SignUp() {
  const [showLoader, setShowLoader] = useState(false);

  const { patientInfo, setPatientInfo } = usePatientInfoStore();

  console.log(patientInfo?.phoneNo, "patientInfo");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      phoneNo: patientInfo?.phoneNo,
    },
  });
  const router = useRouter();

  useEffect(() => {
    setValue("phoneNo", patientInfo?.phoneNo);
  }, [patientInfo]);

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    setPatientInfo({
      ...patientInfo, // 🧠 keep old data
      phoneNo: data?.phoneNo, // 🆕 update or add phoneNo
    });
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    router.push("/confirm-ethnicity");
  };

  return (
    <>
      <StepsHeader />
      <FormWrapper heading={"What is your preferred phone number?"} description={""} percentage={"50"}>
        <PageAnimationWrapper>
          <div>
            <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TextField
                  label="Phone Number"
                  name="phoneNo"
                  placeholder="Enter phone number"
                  type="text"
                  register={register}
                  required
                  errors={errors}
                  value={watch("phoneNo")}
                />

                <NextButton
                  label="Next"
                  disabled={!isValid} // ✅ disables until valid
                  type="submit"
                />
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
