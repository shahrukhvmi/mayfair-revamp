import useSignupStore from "@/store/signupStore"; // 🛒 import store
import TextField from "@/Components/TextField/TextField";
import { useForm } from "react-hook-form";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/navigation";
import Router from "next/router";
import PageLoader from "@/Components/PageLoader/PageLoader";
import { useState, useEffect, useRef } from "react";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import StepsHeader from "@/layout/stepsHeader";
import BackButton from "@/Components/BackButton/BackButton";
import useAuthStore from "@/store/authStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";

export default function SignUp() {
  const [showLoader, setShowLoader] = useState(false);
  const { token } = useAuthStore();

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
  const [isSlow, setIsSlow] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const targetRoute = useRef("");

  // Loading feedback: slow-internet hint, then retry/back if it drags on
  useEffect(() => {
    if (!showLoader) {
      setIsSlow(false);
      setIsStuck(false);
      return;
    }
    const slowTimer = setTimeout(() => setIsSlow(true), 5000);
    const stuckTimer = setTimeout(() => setIsStuck(true), 15000);
    return () => {
      clearTimeout(slowTimer);
      clearTimeout(stuckTimer);
    };
  }, [showLoader, attempt]);

  // Block browser back while navigating, and recover if navigation fails
  useEffect(() => {
    if (!showLoader) return;
    Router.beforePopState(() => false);
    const onError = () => setShowLoader(false);
    Router.events.on("routeChangeError", onError);
    return () => {
      Router.beforePopState(() => true);
      Router.events.off("routeChangeError", onError);
    };
  }, [showLoader]);

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
    // 🛒 Update Zustand with latest values
    setFirstName(data.firstName);
    setLastName(data.lastName);

    setShowLoader(true);
    targetRoute.current = token ? "/steps-information" : "/email-confirmation";
    router.push(targetRoute.current);
  };

  const retryNavigation = () => {
    setIsStuck(false);
    setAttempt((n) => n + 1);
    router.push(targetRoute.current);
  };

  const goBack = () => {
    Router.beforePopState(() => true);
    setShowLoader(false);
    router.push("/acknowledgment");
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}signup/`} />
      <StepsHeader />
      <FormWrapper
        heading={"Enter your full legal name"}
        description={
          "We require this to generate your prescription if you qualify for the treatment."
        }
        percentage={"10"}
      >
        <PageAnimationWrapper>
          <div className="">
            <div
className="relative"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TextField
                  label="First Name"
                  name="firstName"
                  placeholder="Enter your first name"
                  register={register}
                  required
                  errors={errors}
                />
                <TextField
                  label="Last Name"
                  name="lastName"
                  placeholder="Enter your last name"
                  register={register}
                  required
                  errors={errors}
                />

                <div className="mt-4 space-y-3">
                  <NextButton loading={showLoader}
                    label="Next"
                    disabled={!isValid}
                    type="submit"
                  />
                  <BackButton
                    label="Back"
                    className="flex justify-center mt-1"
                    onClick={() => router.push("/acknowledgment")}
                  />
                </div>
              </form>

              {showLoader && (
                <PageLoader
                  message={isSlow ? "Your internet connection seems slow. Please wait…" : ""}
                >
                  {isStuck && (
                    <div className="mt-3 flex w-full flex-col gap-2.5">
                      <button
                        type="button"
                        onClick={retryNavigation}
                        className="inter-medium-font min-h-[46px] w-full cursor-pointer rounded-xl bg-[#47317c] px-6 py-3 text-white transition-colors hover:bg-[#392765]"
                      >
                        Try again
                      </button>
                      <button
                        type="button"
                        onClick={goBack}
                        className="inter-medium-font min-h-[46px] w-full cursor-pointer rounded-xl border border-[#47317c]/30 bg-white px-6 py-3 text-[#47317c] transition-colors hover:bg-[#47317c]/[0.04]"
                      >
                        Back
                      </button>
                    </div>
                  )}
                </PageLoader>
              )}
            </div>
          </div>
        </PageAnimationWrapper>
      </FormWrapper>
    </>
  );
}
