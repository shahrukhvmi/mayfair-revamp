import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Inter } from "next/font/google";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import ProgressBar from "@/Components/ProgressBar/ProgressBar";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import TextField from "@/Components/TextField/TextField";
import StepsHeader from "@/layout/stepsHeader";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import PageLoader from "@/Components/PageLoader/PageLoader";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function Step2() {
  const [showLoader, setShowLoader] = useState(false);
  const [postalValue, setPostalValue] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      postalCode: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
    },
  });

  const router = useRouter();

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 2s
    router.push("/step3");
  };

  return (
    <>
      <StepsHeader />
      <FormWrapper heading={"Residential Address"} description={"Require for age verification purpose"} percentage={"30"}>
        <PageAnimationWrapper>
          <div className="p-6">
            <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Postal Code + Search Button */}
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Postal Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register("postalCode", {
                        required: "Postal code is required",
                        onChange: (e) => setPostalValue(e.target.value),
                      })}
                      placeholder="Enter postal code"
                      className="text-black w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-700"
                    />

                    {postalValue && <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />}
                  </div>
                  {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>}
                </div>

                {/* Grid of Address Fields */}
                <div className="grid grid-cols-12 sm:grid-cols-2 gap-4">
                  <TextField label="Address Line 1" name="address1" placeholder="123 Example Street" register={register} required errors={errors} />
                  <TextField label="Address Line 2" name="address2" placeholder="Apartment, suite, etc." register={register} errors={errors} />
                  <TextField label="City" name="city" placeholder="City" register={register} required errors={errors} />
                  <TextField label="State / Province / Region" name="state" placeholder="Region" register={register} required errors={errors} />
                </div>

                <NextButton label="Next" disabled={!isValid} />
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
