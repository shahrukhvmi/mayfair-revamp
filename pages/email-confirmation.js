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
import { registerUser } from "@/api/authApi";
import { useMutation } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import useUserDataStore from "@/store/userDataStore";
import useAuthStore from "@/store/authStore";
import Fetcher from "@/library/Fetcher";
// import toast from "react-hot-toast";

export default function EmailConfirmation() {
  const [showLoader, setShowLoader] = useState(false);

  const { firstName, lastName, email, confirmationEmail, setEmail, setConfirmationEmail } = useSignupStore();
  const { userData, setUserData } = useUserDataStore();
  const { token, setToken } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger, // ⭐️ to get live form values
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: "",
      confirmationEmail: "",
    },
  });

  const router = useRouter();

  // Register Mutation Function
  const registerMutation = useMutation(registerUser, {
    onSuccess: (data) => {
      console.log(data?.data?.data, "Dataaaaaaaaaa");

      if (data) {
        toast.success("User Register successfully!");
        setUserData(data?.data?.data);
        setToken(data?.data?.data?.token);
        setShowLoader(false)
        Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${token}`;
        router.push("/steps-information");
        
      }

      return;
    },
    onError: (error) => {
      // setLoading(false);
      console.log("error", error?.response?.data?.errors?.email);
      if (error?.response?.data?.errors?.email) {
        toast.error(error?.response?.data?.errors?.email);
      }
      setShowLoader(false);
    },
  });

  useEffect(() => {
    setValue("email", email);
    setValue("confirmationEmail", confirmationEmail);

    if (email) {
      trigger(["email", "confirmationEmail"]);
    }

    // trigger(["email", "confirmationEmail"]);
  }, [email, confirmationEmail, setValue, trigger]);

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    setEmail(data.email);
    setConfirmationEmail(data.confirmationEmail);
    setShowLoader(true);
    const formData = {
      email: data.email,
      email_confirmation: data.confirmationEmail,
      fname: firstName,
      lname: lastName,
      company_id: 1,
    };

    console.log(formData, "formData");
    registerMutation.mutate(formData);

    // await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <StepsHeader />
      <FormWrapper
        heading={"Please enter your email"}
        description={"This is where we'll send information from your prescriber and pharmacy."}
        percentage={"20"}
      >
        <PageAnimationWrapper>
          <div className="">
            <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TextField
                  label="Email Address"
                  name="email"
                  placeholder="Email Address"
                  type="email"
                  register={register}
                  required
                  errors={errors}
                  disablePaste={true}
                />

                <TextField
                  label="Confirm Email Address"
                  name="confirmationEmail"
                  placeholder="Confirm Email Address"
                  type="email"
                  register={register}
                  required
                  validation={{
                    validate: (value) => value === getValues("email") || "Email addresses must match.",
                  }}
                  errors={errors}
                  disablePaste={true}
                />

                <NextButton label="Next" disabled={!isValid} type="submit" />
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
