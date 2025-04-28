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
import BackButton from "@/Components/BackButton/BackButton";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function ResidendialAddress() {
  const [showLoader, setShowLoader] = useState(false);
  const [manual, setManual] = useState(false);
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

  const postalCode = watch("postalCode");

  const router = useRouter();

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    router.push("/preferred-phone-number");
  };

  return (
    <>
      <StepsHeader />
      <FormWrapper heading={"Patient Residential Address"} description={"Require for age verification purpose"} percentage={"40"}>
        <PageAnimationWrapper>
          <div className="p-6">
            <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Postal Code + Search Button */}
                <div className="space-y-6">
                  {/* Postal Code Field with Search Button inside */}
                  <div className="relative">
                    {/* Postal Code Field */}
                    <TextField label="Postal Code" name="postalCode" placeholder="W1A 1AA" register={register} required errors={errors} />

                    {/* Search Button (Inside the Field) */}
                    <button
                      type="button"
                      onClick={() => console.log("Searching for postal code:", watch("postalCode"))}
                      className={`absolute right-3 transform -translate-y-1/2  cursor-pointer flex items-center bg-violet-700 text-white px-2 py-1 rounded ${
                        errors.postalCode ? "top-2/4" : "top-2/3"
                      }`}
                    >
                      <FaSearch className="w-4 h-4 me-2" /> Search
                    </button>
                  </div>

                  {/* Toggle Button */}
                  <div className="text-sm text-right">
                    <button type="button" onClick={() => setManual(!manual)} className="text-black font-bold underline transition cursor-pointer">
                      {manual ? "Hide manual address entry" : "Enter your address manually"}
                    </button>
                  </div>

                  {/* Manual Address Fields */}
                  {manual && (
                    <div className="space-y-4">
                      <TextField label="Address 1" name="address" placeholder="123 Main Street" register={register} required errors={errors} />
                      <TextField label="Address 2" name="address" placeholder="Flat 14" register={register} required errors={errors} />
                      <TextField label="City" name="city" placeholder="e.g., London" register={register} required errors={errors} />
                      <TextField label="State" name="state" placeholder="Essex" register={register} required errors={errors} />
                    </div>
                  )}
                </div>

                <NextButton label="Next" disabled={!isValid} />
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
