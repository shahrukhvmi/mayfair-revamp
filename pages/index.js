import TextField from "@/Components/TextField/TextField";
import { useForm } from "react-hook-form";
import { Inter } from "next/font/google";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import ProgressBar from "@/Components/ProgressBar/ProgressBar";
import NextButton from "@/Components/NextButton/NextButton";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
import { useRouter } from "next/navigation";
import StepsHeader from "@/layout/stepsHeader";

export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
  });
  const router = useRouter();
  const onSubmit = (data) => {
    console.log("Form Data:", data);
    router.push('step1')
  };

  return (
    <>
      <StepsHeader />

      <div
        className={`${inter.className} min-h-screen flex items-center justify-center bg-gray-50 p-6 sm:p-12`}
      >
        <FormWrapper>
          <ProgressBar percentage={0} />
          <div className="p-6">
            <h1 className="text-xl font-semibold text-center mb-2 text-black">Set up your account</h1>
            <p className="text-sm text-gray-600 text-center mb-6">
              If you are registering someone other than yourself, please enter their information.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <TextField
                label="First name"
                name="firstName"
                placeholder="First name"
                register={register}
                required
                errors={errors}
              />
              <TextField
                label="Last Name"
                name="lastname"
                placeholder="Last Name"
                register={register}
                required
                errors={errors}
              />
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
          </div>
        </FormWrapper>
      </div>

    </>
  );
}
