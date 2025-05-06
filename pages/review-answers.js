import BackButton from "@/Components/BackButton/BackButton";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import NextButton from "@/Components/NextButton/NextButton";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import { useRouter } from "next/router";
import React from "react";
import StepsHeader from "@/layout/stepsHeader";
import usePatientInfoStore from "@/store/patientInfoStore";
import useBmiStore from "@/store/bmiStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import useGpDetailsStore from "@/store/gpDetailStore";

const ReviewAnswers = () => {
  const router = useRouter();

  const { patientInfo } = usePatientInfoStore();
  const { bmi } = useBmiStore();
  const { medicalInfo } = useMedicalInfoStore();
  const { confirmationInfo } = useConfirmationInfoStore();
  const { gpdetails } = useGpDetailsStore();

  console.log(bmi);

  const handleRestart = () => {
    router.push("/gathering-data");
  };

  return (
    <>
      <StepsHeader />
      <FormWrapper percentage={"95"} heading="Review Your Answers">
        <PageAnimationWrapper>
          <div className="py-12">
            <div className="max-w-2xl mx-auto">
              {/* Q&A Summary */}
              <div className="space-y-6">
                {/* <div>
                  <p className="text-sm font-semibold text-black">What is your sex at birth?</p>
                  <p className="text-sm text-gray-700 mt-1">{patientInfo?.gender}</p>
                  <hr className="mt-4 border-gray-200" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">What is your date of birth?</p>
                  <p className="text-sm text-gray-700 mt-1">{patientInfo?.dob}</p>
                  <hr className="mt-4 border-gray-200" />
                </div> */}
                <div>
                  <p className="text-sm font-semibold text-black">Patient Residential Address</p>
                  <p className="text-sm text-gray-700 mt-1">{patientInfo?.address?.postalcode}</p>
                  <p className="text-sm text-gray-700 mt-1">{patientInfo?.address?.addressone}</p>
                  {patientInfo?.address?.addresstwo?.trim() && <p className="text-sm text-gray-700 mt-1">{patientInfo.address.addresstwo}</p>}
                  <p className="text-sm text-gray-700 mt-1">{patientInfo?.address?.city}</p>
                  <p className="text-sm text-gray-700 mt-1">{patientInfo?.address?.state}</p>
                  <hr className="mt-4 border-gray-200" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">Phone Number</p>
                  <p className="text-sm text-gray-700 mt-1">{patientInfo?.phoneNo}</p>
                  <hr className="mt-4 border-gray-200" />
                </div>

                {/* <div>
                  <p className="text-sm font-semibold text-black">Your BMI</p>
                  <p className="text-sm text-gray-700 mt-1">BMI: {bmi?.bmi}</p>
                  <p className="text-sm text-gray-700 mt-1">BMI: {bmi?.bmi}</p>
                  {bmi?.bmiConsent?.previously_taking_medicine?.[0]?.trim() && (
                    <p className="text-sm text-gray-700 mt-1">{bmi.bmiConsent.previously_taking_medicine[0]}</p>
                  )}
                  <p className="text-sm text-gray-700 mt-1">{bmi.bmiConsent?.assian_message}</p>
                  <p className="text-sm text-gray-700 mt-1">{bmi.bmiConsent?.weight_related_comorbidity[0]}</p>
                  <p className="text-sm text-gray-700 mt-1">{bmi.bmiConsent?.weight_related_comorbidity_explanation}</p>
                  <hr className="mt-4 border-gray-200" />
                </div> */}

                {medicalInfo.map((item, index) => {
                  return (
                    <div>
                      <div
                        className="text-sm font-semibold text-black [&>ul]:list-disc [&>ul]:ml-6 [&>li]:mt-0.5"
                        dangerouslySetInnerHTML={{ __html: item.question }}
                      ></div>
                      <p className="text-sm text-gray-700 mt-1 capitalize">{item?.answer} </p>
                      <p className="text-sm text-gray-700 mt-1">{item?.subfield_response}</p>
                      <hr className="mt-4 border-gray-200" />
                    </div>
                  );
                })}
              </div>

              {/* Bottom Action Buttons */}
              <div className="mt-8 space-y-3">
                <NextButton label="Confirm and Proceed" onClick={handleRestart} />
                <BackButton label="Edit answers" className="mt-2" onClick={() => router.push("/confirmation-summary")} />
              </div>
            </div>
          </div>
        </PageAnimationWrapper>
      </FormWrapper>
    </>
  );
};

export default ReviewAnswers;
