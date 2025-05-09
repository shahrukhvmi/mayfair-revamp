import BackButton from "@/Components/BackButton/BackButton";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import NextButton from "@/Components/NextButton/NextButton";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import { useRouter } from "next/router";
import React, { useState } from "react";
import StepsHeader from "@/layout/stepsHeader";
import PageLoader from "@/Components/PageLoader/PageLoader";
import usePatientInfoStore from "@/store/patientInfoStore";
import useBmiStore from "@/store/bmiStore";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";

const ConfirmationSummary = () => {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

  const { patientInfo } = usePatientInfoStore();

  const { authUserDetail } = useAuthUserDetailStore();
  const { bmi } = useBmiStore();

  console.log(bmi);

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
              <p className="bold-font text-black">
                <span className="bold-font paragraph">Full Name: </span>{" "}
                {patientInfo?.firstName ? (
                  <>
                    {" "}
                    {patientInfo?.firstName} {patientInfo?.lastName}
                  </>
                ) : (
                  <>
                    {authUserDetail?.fname} {authUserDetail?.lname}
                  </>
                )}
              </p>
              <hr className="border-gray-300 mb-3" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8">
                <p className="bold-font text-black">
                  <span className="bold-font paragraph">Postcode:</span> {patientInfo?.address?.postalcode}
                </p>
                <p className="bold-font text-black">
                  <span className="bold-font paragraph">Date of birth:</span> {patientInfo?.dob}
                </p>
                <p className="bold-font text-black">
                  <span className="bold-font paragraph">Height:</span>{" "}
                  {bmi?.height_unit == "imperial" ? (
                    <span>
                      {bmi?.ft} ft {bmi?.inch} inch
                    </span>
                  ) : (
                    <span>{bmi?.cm} cm</span>
                  )}
                </p>
                <p className="bold-font text-black">
                  <span className="bold-font paragraph">Gender:</span> <span className="capitalize">{patientInfo?.gender}</span>
                </p>
                <p className="bold-font text-black">
                  <span className="bold-font paragraph">Weight:</span>{" "}
                  {bmi?.weight_unit == "metrics" ? (
                    <span>{bmi?.kg} kg</span>
                  ) : (
                    <span>
                      {bmi?.stones} stones {bmi?.pound} pound
                    </span>
                  )}
                </p>
                <p className="bold-font text-black">
                  <span className="text-sm text-gray-700 mt-1">BMI: </span> {bmi?.bmi}
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
