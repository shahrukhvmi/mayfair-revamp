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
          <div className="p-6 space-y-6">
            {/* Summary Box */}
            <div className="bg-green-50 border border-green-100 rounded-md p-5 text-sm text-gray-800">
              <p className="font-semibold text-lg mb-3">Json Brown</p>
              <hr className="border-gray-300 mb-3" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8">
                <p>
                  <span className="font-semibold">Age:</span> 25
                </p>
                <p>
                  <span className="font-semibold">Height:</span> 125 cm
                </p>
                <p>
                  <span className="font-semibold">Sex at birth:</span> Male
                </p>
                <p>
                  <span className="font-semibold">Weight:</span> 78 kg
                </p>
                <p className="sm:col-span-2">
                  <span className="font-semibold">Ethnicity:</span> Aboriginal or Torres Strait Islander
                </p>
              </div>
            </div>

            {/* Confirm & Review Buttons */}
            <div className="space-y-3">
              <NextButton label="Confirm answers" className="!bg-lime-200 !text-black !font-semibold hover:!bg-lime-300" onClick={hanldeConfirm} />
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
