import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function EmailConfirmation() {
  const [showLoader, setShowLoader] = useState(false);
  const [already, setAlready] = useState(false);
  // const [showLoginModal, setShowLoginModal] = useState(false);
  console.log(showLoader, "showLoader");
  const router = useRouter();
  const { firstName, lastName, setLastName, setFirstName, email, confirmationEmail, setEmail, setConfirmationEmail } = useSignupStore();
  const { setUserData } = useUserDataStore();
  const { token, setToken } = useAuthStore();
  const { setIsPasswordReset, isPasswordReset } = usePasswordReset();
  const { showLoginModal, closeLoginModal, openLoginModal } = useLoginModalStore();

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

  const registerMutation = useMutation(registerUser, {
    onSuccess: (data) => {
      const user = data?.data?.data;
      setUserData(user);
      setToken(user?.token);
      setIsPasswordReset(true);
      Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user?.token}`;
      router.push("/steps-information");
    },
    onError: (error) => {
      const emailError = error?.response?.data?.errors?.email;
      if (emailError === "The email has already been taken.") setAlready(true);
      if (emailError) toast.error(emailError);
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
      <LoginModal
        show={showLoginModal}
        onClose={closeLoginModal}
        isLoading={showLoader}
        onLogin={async (data) => {
          console.log(data, "dfkjdskjjkffskj");
          setShowLoader(true);
          try {
            const response = await loginMutation.mutateAsync({ ...data, company_id: 1 });
            const user = response?.data?.data;
            setIsPasswordReset(false);
            setUserData(user);
            setToken(user?.token);
            setFirstName(user?.fname);
            setLastName(user?.lname);

            toast.success("Login Successfully");
            Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user.token}`;
            closeLoginModal();

            // ✅ Hide loader immediately after success
            setShowLoader(false);
            router.push("/dashboard");
          } catch (error) {
            const errorMsg = error?.response?.data?.errors;
            const firstMsg = errorMsg && typeof errorMsg === "object" ? Object.values(errorMsg)[0] : "Something went wrong.";
            toast.error(firstMsg);
            setShowLoader(false);
          }
        }}
      />

      {/*  */}

      <StepsHeader />
      <FormWrapper heading="Enter your email address" description="This is where we will send information about your order." percentage="20">
        <PageAnimationWrapper>
          <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
            <form onSubmit={handleSubmit(handleSignupSubmit)} className="space-y-4">
              <TextField label="Email Address" name="email" type="email" placeholder="Email Address" register={register} required errors={errors} />

              <TextField
                label="Confirm Email Address"
                name="confirmationEmail"
                type="email"
                placeholder="Confirm Email Address"
                register={register}
                required
                validation={{
                  validate: (value) => value === getValues("email") || "Email addresses must match.",
                }}
                errors={errors}
              />

              {already && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-md">
                  This email address is already taken.{" "}
                  <span onClick={openLoginModal} className="text-blue-600 underline cursor-pointer font-medium hover:text-blue-800">
                    Please click here to login.
                  </span>
                </div>
              )}

              <NextButton label="Next" type="submit" disabled={!isValid} />
              <BackButton label="Back" className="mt-2" onClick={() => router.back()} />
            </form>

            {showLoader && (
              <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg">
                <PageLoader />
              </div>
            )}
          </div>
        </PageAnimationWrapper>
      </FormWrapper>
    </>
  );
}
