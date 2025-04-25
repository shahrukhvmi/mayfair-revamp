import TextField from "@/Components/TextField/TextField";
import { useForm } from "react-hook-form";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/navigation";
import PageLoader from "@/Components/PageLoader/PageLoader";
import { useState } from "react";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
export default function Home() {
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
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 2s
    router.push("/steps-information");
  };


  return (
    <>
    
      <PageAnimationWrapper>
        <FormWrapper
          heading={"Set up your account"}
          description={"If you are registering someone other than yourself, please enter their information."}
          percentage={"0"}
        >
          <div className="p-6">

            <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TextField label="First name" name="firstName" placeholder="First name" register={register} required errors={errors} />
                <TextField label="Last Name" name="lastname" placeholder="Last Name" register={register} required errors={errors} />
                <TextField
                  label="Email address"
                  name="email"
                  placeholder="Email address"
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
              </form>

              {showLoader && (
                <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">
                  <PageLoader />
                </div>
              )}
            </div>
          </div>


        </FormWrapper>

      </PageAnimationWrapper>
    </>
  );
}
