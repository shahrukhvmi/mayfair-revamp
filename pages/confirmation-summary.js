import BackButton from "@/Components/BackButton/BackButton";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import NextButton from "@/Components/NextButton/NextButton";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import { useRouter } from "next/router";
import React, { useState } from "react";
import StepsHeader from "@/layout/stepsHeader";
import PageLoader from "@/Components/PageLoader/PageLoader";

const ConfirmationSummary = () => {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

  const hanldeConfirm = async () => {
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    router.push("/gathering-data");
  };
  const reviewAll = () => {
    router.push("/review-answers");
  };
  return (
    <>
      <StepsHeader />
      <FormWrapper
        heading="Confirm your answers"
        description="It’s important your answers are accurate, as we’ll use them to determine your suitability for the Weight Reset Program."
        percentage={95}
      >
        <PageAnimationWrapper>
          <div className="space-y-6">
            {/* Summary Box */}
            <div className="bg-[#DACFFF] border border-green-100 rounded-md p-5 text-sm text-gray-800">
              <p className="bold-font text-black  mb-3">Json Brown</p>
              <hr className="border-gray-300 mb-3" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8">
                <p className="bold-font text-black">
                  <span className="bold-font paragraph">Age:</span> 25
                </p>
                <p className="bold-font text-black">
                  <span className="bold-font paragraph">Height:</span> 125 cm
                </p>
                <p className="bold-font text-black">
                  <span className="bold-font paragraph">Sex at birth:</span> Male
                </p>
                <p className="bold-font text-black">
                  <span className="bold-font paragraph">Weight:</span> 78 kg
                </p>
                <p className="sm:col-span-2 bold-font text-black">
                  <span className="bold-font paragraph">Ethnicity:</span> Yes
                </p>
              </div>
            </div>

            {/* Confirm & Review Buttons */}
            <div className="space-y-3">
              <NextButton label="Confirm and proceed" onClick={hanldeConfirm} />
              <BackButton label="Review all" className="mt-2" onClick={reviewAll} />
            </div>
            {showLoader && (
              <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">
                <PageLoader />
              </div>
            )}
          </div>
        </PageAnimationWrapper>
      </FormWrapper>
    </>
  );
};

export default ConfirmationSummary;
