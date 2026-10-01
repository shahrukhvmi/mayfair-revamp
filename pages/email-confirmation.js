import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Router from "next/router";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import useSignupStore from "@/store/signupStore";
import useUserDataStore from "@/store/userDataStore";
import useAuthStore from "@/store/authStore";
import { registerUser } from "@/api/authApi";
import { Login } from "@/api/loginApi";
import Fetcher from "@/library/Fetcher";

import NextButton from "@/Components/NextButton/NextButton";
import BackButton from "@/Components/BackButton/BackButton";
import StepsHeader from "@/layout/stepsHeader";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import LoginModal from "@/Components/LoginModal/LoginModal";
import TextField from "@/Components/TextField/TextField";
import PageLoader from "@/Components/PageLoader/PageLoader";
import useLoginModalStore from "@/store/useLoginModalStore";
import usePasswordReset from "@/store/usePasswordReset";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useReturning from "@/store/useReturningPatient";
import patientSource from "@/api/patientSource";
import {
  getStoredAttribution,
  toPatientSourceTouches,
  trackSignup,
} from "@/library/mayfairAnalytics";

export default function EmailConfirmation() {
  const [showLoader, setShowLoader] = useState(false);
  const [already, setAlready] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const isMounted = useRef(true);
  // const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();
  const {
    firstName,
    lastName,
    setLastName,
    setFirstName,
    email,
    confirmationEmail,
    setEmail,
    setConfirmationEmail,
  } = useSignupStore();
  const { userData, setUserData } = useUserDataStore();
  const { token, setToken } = useAuthStore();
  const { setIsPasswordReset, isPasswordReset, setShowResetPassword } =
    usePasswordReset();
  const { showLoginModal, closeLoginModal, openLoginModal } =
    useLoginModalStore();
  const { setAuthUserDetail } = useAuthUserDetailStore();
  const { setIsReturningPatient } = useReturning();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: { email: "", confirmationEmail: "" },
  });
  useEffect(() => {
    setValue("email", email);
    setValue("confirmationEmail", confirmationEmail);
    if (email) trigger(["email", "confirmationEmail"]);
  }, [email, confirmationEmail, setValue, trigger]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);


  // If loading drags on, let the user retry or leave instead of waiting forever
  const [isStuck, setIsStuck] = useState(false);
  useEffect(() => {
    if (!showLoader) {
      setIsStuck(false);
      return;
    }
    const timer = setTimeout(() => setIsStuck(true), 15000);
    return () => clearTimeout(timer);
  }, [showLoader]);

  // Tell the user when loading is taking unusually long
  useEffect(() => {
    if (!showLoader) {
      setIsSlow(false);
      return;
    }
    const timer = setTimeout(() => setIsSlow(true), 5000);
    return () => clearTimeout(timer);
  }, [showLoader]);

  // While loading, block the browser back button so the user can't leave mid-request
  useEffect(() => {
    if (!showLoader) return;
    Router.beforePopState(() => false);
    return () => Router.beforePopState(() => true);
  }, [showLoader]);

  const registerMutation = useMutation(registerUser, {
    onSuccess: async (data, variables) => {
      const user = data?.data?.data;
      setAuthUserDetail(user);
      setUserData(user);
      setToken(user?.token);
      setIsPasswordReset(true);
      setIsReturningPatient(user?.isReturning);
      Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user?.token}`;

      // Links this new patient to their existing anonymous visitor (same
      // visitor ID, original first/last touch untouched).
      trackSignup(user, variables?.email);

      const stored = getStoredAttribution();

      if (stored) {
        // Fire and forget: a slow attribution call must not keep the user waiting
        patientSource({
          // The newly registered user (userData here still holds the previous value).
          user_id: user?.id || userData?.id,
          type: "register",
          ...toPatientSourceTouches(stored),
        }).catch((attributionError) => {
          console.error("Attribution API failed:", attributionError);
        });
      }

      if (!isMounted.current) return;
      router.push("/steps-information");
    },
    onError: (error) => {
      if (!isMounted.current) return;
      const emailError = error?.response?.data?.errors?.email;
      if (emailError === "This email is already registered.") setAlready(true);
      toast.error(
        emailError ||
          (!error?.response
            ? "Your internet connection seems slow or unavailable. Please try again."
            : error?.response?.data?.message || "Something went wrong. Please try again."),
      );
      setShowLoader(false);
    },
  });

  const loginMutation = useMutation(Login); // no onSuccess/onError

  const handleSignupSubmit = (data) => {
    setEmail(data.email);
    setConfirmationEmail(data.confirmationEmail);
    setShowLoader(true);

    registerMutation.mutate({
      email: data.email,
      email_confirmation: data.confirmationEmail,
      fname: firstName,
      lname: lastName,
      company_id: 1,
    });
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}email-confirmation/`} />

      <LoginModal
        show={showLoginModal}
        onClose={closeLoginModal}
        isLoading={showLoader}
        onCancelLoading={() => setShowLoader(false)}
        onLogin={async (data) => {
          setShowLoader(true);
          try {
            const response = await loginMutation.mutateAsync({
              ...data,
              company_id: 1,
            });
            const user = response?.data?.data;
            setIsPasswordReset(false);
            setUserData(user);
            setAuthUserDetail(user);
            setToken(user?.token);
            setFirstName(user?.fname);
            setLastName(user?.lname);
            setEmail(user?.email);
            setShowResetPassword(user?.show_password_reset);
            setIsReturningPatient(user?.isReturning);

            toast.success("Login Successfully");
            Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user.token}`;
            closeLoginModal();

            // ✅ Hide loader immediately after success
            setShowLoader(false);
            router.push("/dashboard");
          } catch (error) {
            if (!isMounted.current) return;
            const errorMsg = error?.response?.data?.errors;
            const firstMsg =
              errorMsg && typeof errorMsg === "object"
                ? Object.values(errorMsg)[0]
                : !error?.response
                  ? "Your internet connection seems slow or unavailable. Please try again."
                  : "Something went wrong.";
            toast.error(firstMsg);
            setShowLoader(false);
          }
        }}
      />

      {/*  */}
      <StepsHeader />
      <FormWrapper
        heading="Enter your email address"
        description="This is where we will send information about your order."
        percentage="20"
      >
        <PageAnimationWrapper>
          <div
            className="relative"
          >
            <form
              onSubmit={handleSubmit(handleSignupSubmit)}
              className="space-y-4"
            >
              <TextField
                label="Email Address"
                name="email"
                type="email"
                placeholder="name@example.com"
                register={register}
                required
                errors={errors}
                disablePaste
              />

              <TextField
                label="Confirm Email Address"
                name="confirmationEmail"
                type="email"
                placeholder="Re-enter your email address"
                register={register}
                required
                validation={{
                  validate: (value) =>
                    value === getValues("email") || "Email address must match.",
                }}
                errors={errors}
                disablePaste
              />

              {already && (
                <div className="inter-reg-font rounded-xl border border-red-100 bg-red-50 px-4 py-3.5 text-[13px] max-sm:text-[16px] text-red-600">
                  The email address you have entered is already associated with
                  an existing account{" "}
                  <span
                    onClick={openLoginModal}
                    className="inter-medium-font cursor-pointer text-[#47317c] underline hover:text-[#3d2a6b]"
                  >
                    Click here to login.
                  </span>
                </div>
              )}

              <NextButton loading={showLoader} label="Next" type="submit" disabled={!isValid} />
              <BackButton
                label="Back"
                className="mt-2"
                onClick={() => router.push("/signup")}
              />
            </form>

            {showLoader && (
              <PageLoader
                message={isSlow ? "Your internet connection seems slow. Please wait…" : ""}
              >
            {isStuck && (
              <div className="mt-3 flex w-full flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowLoader(false)}
                  className="inter-medium-font min-h-[46px] w-full cursor-pointer rounded-xl bg-[#47317c] px-6 py-3 text-white transition-colors hover:bg-[#392765]"
                >
                  Cancel and try again
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className="inter-medium-font min-h-[46px] w-full cursor-pointer rounded-xl border border-[#47317c]/30 bg-white px-6 py-3 text-[#47317c] transition-colors hover:bg-[#47317c]/[0.04]"
                >
                  Back
                </button>
              </div>
            )}
          </PageLoader>
            )}
          </div>
        </PageAnimationWrapper>
      </FormWrapper>
    </>
  );
}
