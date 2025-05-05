import useSignupStore from "@/store/signupStore"; // 🛒 import store
import TextField from "@/Components/TextField/TextField";
import { useForm } from "react-hook-form";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/navigation";
import PageLoader from "@/Components/PageLoader/PageLoader";
import { useState, useEffect } from "react";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import StepsHeader from "@/layout/stepsHeader";
import BackButton from "@/Components/BackButton/BackButton";

export default function SignUp() {
  const [showLoader, setShowLoader] = useState(false);

  // 🛒 Zustand State
  const { firstName, lastName, setFirstName, setLastName } = useSignupStore();

  const {
    register,
    handleSubmit,
    setValue,
    trigger, // ✅ to set initial values
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      firstName: "", // will override below
      lastName: "",
    },
  });

  const router = useRouter();

  // 🛒 Set default values from Zustand on load
  useEffect(() => {
    setValue("firstName", firstName);
    setValue("lastName", lastName);

    if (firstName || lastName) {
      trigger(["firstName", "lastName"]);
    }

    // After setting values, trigger validation manually
    // trigger(["firstName", "lastName"]);
  }, [firstName, lastName, setValue, trigger]);

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    // 🛒 Update Zustand with latest values
    setFirstName(data.firstName);
    setLastName(data.lastName);

    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    router.push("/email-confirmation");
  };

  return (
    <>
      <StepsHeader />
      <FormWrapper
        heading={"Please enter your name"}
        description={"We require this to generate an electronic prescription if your prescriber prescribes a treatment."}
        percentage={"10"}
      >
        <PageAnimationWrapper>
          <div className="">
            <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TextField label="First Name" name="firstName" placeholder="First Name" register={register} required errors={errors} />
                <TextField label="Last Name" name="lastName" placeholder="Last Name" register={register} required errors={errors} />

                <NextButton
                  label="Next"
                  disabled={!isValid} // ✅ disables until valid
                  type="submit"
                />
              </form>
              <BackButton label="Back" className="mt-3" onClick={() => router.back()} />

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
