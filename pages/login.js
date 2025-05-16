import useSignupStore from "@/store/signupStore";
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
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useUserDataStore from "@/store/userDataStore";
import useAuthStore from "@/store/authStore";
import Fetcher from "@/library/Fetcher";
import { Login } from "@/api/loginApi";
import usePasswordReset from "@/store/usePasswordReset";
import LoginModal from "@/Components/LoginModal/LoginModal";
import useLoginModalStore from "@/store/useLoginModalStore";
import Link from "next/link";

export default function LoginScreen() {
  const [showLoader, setShowLoader] = useState(false);
  const { userData, setUserData } = useUserDataStore();
  const { setLastName, setFirstName, setEmail } = useSignupStore();
  const { token, setToken } = useAuthStore();
  const { setIsPasswordReset } = usePasswordReset();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { showLoginModal, closeLoginModal, openLoginModal } = useLoginModalStore();

  const loginMutation = useMutation(Login, {
    onSuccess: (data) => {
      const user = data?.data?.data;
      console.log(user, "user");
      if (user) {
        setUserData(user);
        setToken(user?.token);
        setFirstName(user?.fname);
        setLastName(user?.lname);
        setEmail(user?.lname);
        toast.success("Login Successfully");
        Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user.token}`;
        setShowLoader(false);
        setIsPasswordReset(false);
        router.push("/dashboard");
      }
    },
    onError: (error) => {
      console.log(error?.response?.data?.errors, "sdseds");

      const errorObj = error?.response?.data?.errors;

      if (errorObj && typeof errorObj === "object") {
        const firstErrorKey = Object.keys(errorObj);
        const firstErrorMessage = errorObj[firstErrorKey]; // Get first message of first key

        toast.error(firstErrorMessage);
      } else {
        toast.error("Something went wrong.");
      }

      setShowLoader(false);
    },
  });

  useEffect(() => {
    const storedEmail = getValues("email");
    const storedPassword = getValues("password");

    if (storedEmail || storedPassword) {
      trigger(["email", "password"]);
    }
  }, [getValues, trigger]);

  const onSubmit = (data) => {
    setShowLoader(true);
    const formData = {
      email: data.email,
      password: data.password,
      company_id: 1,
    };
    setEmail(data?.email);
    loginMutation.mutate(formData);
  };

  return (
    <>
      <StepsHeader />
      {/* <FormWrapper
        heading="Login"
        description="In order for our doctors to assess your suitability for treatment, you will be asked to complete a short medical questionnaire at the next step."
        percentage="0"
      > */}
      <div className={`flex justify-center bg-[#F2EEFF] py-16`}>
        <div className={`bg-white rounded-xl shadow-md w-full max-w-lg p-8`}>
          {/* Title */}
          <h1 className="niba-reg-font heading mb-2">Login</h1>

          {/* Description */}
          <p className="mb-6 reg-font paragraph">
            In order for our doctors to assess your suitability for treatment, you will be asked to complete a short medical questionnaire at the next
            step.
          </p>

          <PageAnimationWrapper>
            <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TextField label="Email Address" name="email" placeholder="Email Address" type="email" register={register} required errors={errors} />

                <TextField label="Password" name="password" placeholder="Password" type="password" register={register} required errors={errors} />
                <NextButton label="Login" disabled={!isValid} type="submit" className="mb-5" />
                <p className="reg-font text-black text-sm text-center">
                  Are you a new patient?{" "}
                  <Link href={"/acknowledgment"} className="text-primary underline">
                    Get started with the consultation
                  </Link>
                </p>
                {/* <BackButton onClick={startConsultation} label="Are you a new patient? Get started with the consultation." /> */}
                <BackButton onClick={openLoginModal} label="Forgot password" />
                {/* <BackButton label="Back" className="mt-2" onClick={() => router.back()} /> */}
              </form>

              {showLoader && (
                <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">
                  <PageLoader />
                </div>
              )}
            </div>
          </PageAnimationWrapper>
        </div>
      </div>

      <LoginModal
        modes="forgot"
        show={showLoginModal}
        onClose={closeLoginModal}
        isLoading={showLoader}
        onLogin={async (data) => {
          setShowLoader(true);
          try {
            const response = await loginMutation.mutateAsync({ ...data, company_id: 1 });
            const user = response?.data?.data;
            setIsPasswordReset(false);
            setUserData(user);
            setToken(user?.token);
            setFirstName(user?.fname);
            setLastName(user?.lname);
            setEmail(user?.email);
            toast.success("Login Successfully");

            Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user.token}`;
            closeLoginModal();
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
    </>
  );
}
