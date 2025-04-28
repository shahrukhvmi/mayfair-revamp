import TextField from "@/Components/TextField/TextField";
import { useForm } from "react-hook-form";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/navigation";
import PageLoader from "@/Components/PageLoader/PageLoader";
import { useState } from "react";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import StepsHeader from "@/layout/stepsHeader";
import BackButton from "@/Components/BackButton/BackButton";

export default function EmailConfirmation() {
  const [showLoader, setShowLoader] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
  });
  const router = useRouter();

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    router.push("/steps-information");
  };

  return (
    <>
      <StepsHeader />
      <FormWrapper
        heading={"And your email?"}
        description={"This is where we'll send information from your prescriber and pharmacy."}
        percentage={"20"}
      >
        <PageAnimationWrapper>
          <div className="p-6">
            <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* <TextField label="First Name" name="firstName" placeholder="First Name" register={register} required errors={errors} />
                <TextField label="Last Name" name="lastname" placeholder="Last Name" register={register} required errors={errors} /> */}
                <TextField label="Email Address" name="email" placeholder="Email Address" type="email" register={register} required errors={errors} />

                <TextField
                  label="Confirm Email Address"
                  name="email"
                  placeholder="Confirm Email Address"
                  type="email"
                  register={register}
                  required
                  errors={errors}
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
