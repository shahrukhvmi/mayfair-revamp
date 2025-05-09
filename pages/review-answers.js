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
import sendStepData from "@/api/stepsDataApi";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useProductId from "@/store/useProductIdStore";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useCheckoutStore from "@/store/checkoutStore";

const ReviewAnswers = () => {
  const router = useRouter();

  const { patientInfo, setPatientInfo } = usePatientInfoStore();
  const { authUserDetail, setAuthUserDetail } = useAuthUserDetailStore();
  const { bmi, setBmi } = useBmiStore();
  const { medicalInfo, setMedicalInfo } = useMedicalInfoStore();
  const { confirmationInfo, setConfirmationInfo } = useConfirmationInfoStore();
  const { gpdetails, setGpDetails } = useGpDetailsStore();
  const { productId } = useProductId();

  console.log(confirmationInfo);

  //Send All steps data
  const stepsDataMutation = useMutation(sendStepData, {
    onSuccess: (data) => {
      console.log(data, "Medical Questions");

      if (data?.data?.lastConsultation) {
        console.log(data?.data?.lastConsultation?.fields, "data?.data?.data");
        setBmi(data?.data?.lastConsultation?.fields?.bmi);
        setConfirmationInfo(data?.data?.lastConsultation?.fields?.confirmationInfo);
        setGpDetails(data?.data?.lastConsultation?.fields?.gpdetails);
        setMedicalInfo(data?.data?.lastConsultation?.fields?.medicalInfo);
        setPatientInfo(data?.data?.lastConsultation?.fields?.patientInfo);
      }
      return;
    },
    onError: (error) => {
      // setLoading(false);
      console.log("error", error?.response?.data?.message);
      if (error) {
        toast.error(error?.response?.data?.message);
        setShowLoader(false);
      }
    },
  });

  const handleRestart = () => {
    router.push("/personal-details");
  };

  const handleSubmit = () => {
    const formattedMedicalInfo = medicalInfo.map((item) => ({
      question: item.question,
      qsummary: item.qsummary,
      answer: item.answer,
      subfield_response: item.subfield_response,
      sub_field_prompt: item.sub_field_prompt,
      has_sub_field: item.has_sub_field,
    }));

    const fname = patientInfo?.firstName ? patientInfo?.firstName : authUserDetail?.fname;
    const lname = patientInfo?.lastName ? patientInfo?.lastName : authUserDetail?.lname;

    const formData = {
      // patientInfo: patientInfo,
      patientInfo: {
        firstName: fname,
        lastName: lname,
        dob: patientInfo?.dob,
        ethnicity: patientInfo?.ethnicity,
        gender: patientInfo?.gender,
        phoneNo: patientInfo?.phoneNo,
        pregnancy: patientInfo?.pregnancy,
        address: patientInfo?.address,
      },
      bmi: bmi,
      gpdetails: gpdetails,
      confirmationInfo: confirmationInfo,
      medicalInfo: formattedMedicalInfo,
      pid: productId,
    };
    stepsDataMutation.mutate(formData);
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
                <NextButton label="Confirm and Proceed" onClick={handleSubmit} />
                <BackButton label="Edit answers" className="mt-2" onClick={handleRestart} />
              </div>
            </div>
          </div>
        </PageAnimationWrapper>
      </FormWrapper>
    </>
  );
};

export default ReviewAnswers;
