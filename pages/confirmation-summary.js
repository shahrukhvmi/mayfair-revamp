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
import sendStepData from "@/api/stepsDataApi";
import { useMutation } from "@tanstack/react-query";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import useProductId from "@/store/useProductIdStore";
import useGpDetailsStore from "@/store/gpDetailStore";
import useSignupStore from "@/store/signupStore";
import useLastBmi from "@/store/useLastBmiStore";
import toast from "react-hot-toast";

const ConfirmationSummary = () => {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

  // Zustand States
  const { patientInfo, setPatientInfo } = usePatientInfoStore();
  const { authUserDetail, setAuthUserDetail } = useAuthUserDetailStore();
  const { bmi, setBmi } = useBmiStore();
  const { medicalInfo, setMedicalInfo } = useMedicalInfoStore();
  const { confirmationInfo, setConfirmationInfo } = useConfirmationInfoStore();
  const { gpdetails, setGpDetails } = useGpDetailsStore();
  const { productId } = useProductId();
  const { setLastBmi } = useLastBmi();

  //To get firstname and lastName from signup store
  const { firstName, lastName } = useSignupStore();

  console.log(bmi);

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
        setLastBmi(data?.data?.lastConsultation?.fields?.bmi);
      }
      

      // router.push("/gathering-data");
      return;
    },
    onError: (error) => {
      // setLoading(false);
      setShowLoader(false);
      if (error) {
        toast.error("Something went wrong");
        setShowLoader(false);
      }
    },
  });

  //handle Confirm
  const hanldeConfirm = async () => {
    setShowLoader(true);

    const formattedMedicalInfo = medicalInfo.map((item) => ({
      question: item.question,
      qsummary: item.qsummary,
      answer: item.answer,
      subfield_response: item.subfield_response,
      sub_field_prompt: item.sub_field_prompt,
      has_sub_field: item.has_sub_field,
    }));

    const fname = firstName ? firstName : patientInfo?.firstName;
    const lname = lastName ? lastName : patientInfo?.lastName;

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
    // await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    // router.push("/gathering-data");
  };
  const reviewAll = () => {
    router.push("/review-answers");
  };

  const back = () => {
    router.push("/gp-detail");
  };
  return (
    <>
      <StepsHeader />
      <FormWrapper
        heading="Confirm your answers"
        description="It’s important your answers are accurate, as we’ll use them to determine your suitability for the treatment."
        percentage={95}
      >
        <PageAnimationWrapper>
          <div className="space-y-6">
            {/* Summary Box */}
            <div className="bg-[#F2EEFF] border border-green-100 rounded-md p-5 text-sm text-gray-800">
              <p className="bold-font text-black mb-1">
                <span className="bold-font paragraph">Full Name: </span>{" "}
                {firstName ? (
                  <>
                    {" "}
                    {firstName} {lastName}
                  </>
                ) : (
                  <>
                    {patientInfo?.firstName} {patientInfo?.lastName}
                  </>
                )}
              </p>
              {/* <hr className="border-gray-300 mb-3" /> */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8">
                <p className="bold-font text-black">
                  <span className="bold-font paragraph">Postal Code:</span> {patientInfo?.address?.postalcode}
                </p>
                <p className="bold-font text-black">
                  <span className="bold-font paragraph">Date of Birth:</span> {patientInfo?.dob}
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
              <BackButton label="Back" onClick={back} />
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
