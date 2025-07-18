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
import useMedicalQuestionsStore from "@/store/medicalQuestionStore";
import useConfirmationQuestionsStore from "@/store/confirmationQuestionStore";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useAuthStore from "@/store/authStore";
import usePasswordReset from "@/store/usePasswordReset";
import useUserDataStore from "@/store/userDataStore";
import useCheckoutStore from "@/store/checkoutStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useReorderBackProcessStore from "@/store/useReorderBackProcess";

const ConfirmationSummary = () => {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

  // Zustand States
  const { patientInfo, setPatientInfo, clearPatientInfo } =
    usePatientInfoStore();
  const { authUserDetail, setAuthUserDetail, clearAuthUserDetail } =
    useAuthUserDetailStore();
  const { bmi, setBmi, clearBmi } = useBmiStore();
  const { medicalInfo, setMedicalInfo, clearMedicalInfo } =
    useMedicalInfoStore();
  const { confirmationInfo, setConfirmationInfo, clearConfirmationInfo } =
    useConfirmationInfoStore();
  const { gpdetails, setGpDetails, clearGpDetails } = useGpDetailsStore();

  const { reorderBackProcess } = useReorderBackProcessStore();

  const { clearCheckout } = useCheckoutStore();
  const { clearMedicalQuestions } = useMedicalQuestionsStore();
  const { clearConfirmationQuestions } = useConfirmationQuestionsStore();
  const { clearShipping, clearBilling } = useShippingOrBillingStore();
  const { clearToken } = useAuthStore();
  const { setIsPasswordReset } = usePasswordReset();
  const { productId, clearProductId } = useProductId();
  const { setLastBmi, clearLastBmi } = useLastBmi();
  const { clearUserData } = useUserDataStore();

  //To get firstname and lastName from signup store
  const {
    clearFirstName,
    clearLastName,
    clearEmail,
    clearConfirmationEmail,
    firstName,
    lastName,
  } = useSignupStore();

  console.log(bmi);

  const stepsDataMutation = useMutation(sendStepData, {
    onSuccess: (data) => {
      console.log(data, "dataaaaaaaaaaaaaa");

      if (data?.data?.lastConsultation) {
        console.log(data?.data?.lastConsultation?.fields, "data?.data?.data");
        setBmi(data?.data?.lastConsultation?.fields?.bmi);
        setConfirmationInfo(
          data?.data?.lastConsultation?.fields?.confirmationInfo
        );
        setGpDetails(data?.data?.lastConsultation?.fields?.gpdetails);
        setMedicalInfo(data?.data?.lastConsultation?.fields?.medicalInfo);
        setPatientInfo(data?.data?.lastConsultation?.fields?.patientInfo);
        setLastBmi(data?.data?.lastConsultation?.fields?.bmi);
      }
      router.push("/gathering-data");
      return;
    },
    onError: (error) => {
      // setLoading(false);
      setShowLoader(false);
      if (error) {
        console.log("error", error?.response?.data?.message);
        if (error?.response?.data?.message == "Unauthenticated.") {
          toast.error("Session Expired");
          clearBmi();
          clearCheckout();
          clearConfirmationInfo();
          clearGpDetails();
          clearMedicalInfo();
          clearPatientInfo();
          clearBilling();
          clearShipping();
          clearAuthUserDetail();
          clearMedicalQuestions();
          clearConfirmationQuestions();
          clearToken();
          setIsPasswordReset(true);
          clearProductId();
          clearLastBmi();
          clearUserData();
          clearFirstName();
          clearLastName();
          clearEmail();
          clearConfirmationEmail();
          router.push("/login");
        } else if (error?.response?.data?.original?.errors) {
          console.log(error?.response?.data?.original?.errors, "error");
          // toast.error("Something went wrong");
          // toast.error(error?.response?.data?.original?.errors);
          const errorMessages = error?.response?.data?.original?.errors;
          Object.keys(errorMessages).forEach((key) => {
            const errorMessage = errorMessages[key];
            Array.isArray(errorMessage)
              ? errorMessage.forEach((msg) => toast.error(msg))
              : toast.error(errorMessage);
          });
        } else if (error?.response?.data?.errors) {
          const errorMessages = error?.response?.data?.original?.errors;
          Object.keys(errorMessages).forEach((key) => {
            const errorMessage = errorMessages[key];
            Array.isArray(errorMessage)
              ? errorMessage.forEach((msg) => toast.error(msg))
              : toast.error(errorMessage);
          });
        }
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
    if (reorderBackProcess == true) {
      router.push("/bmi-detail");
    } else {
      router.push("/gp-detail");
    }
  };
  return (
    <>
      <MetaLayout canonical={`${meta_url}confirmation-summary/`} />
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
                  <span className="bold-font paragraph">Post code: </span>
                  {patientInfo?.address?.postalcode}
                </p>
                <p className="bold-font text-black">
                  <span className="bold-font paragraph">Date of Birth:</span>{" "}
                  {patientInfo?.dob}
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
                  <span className="bold-font paragraph">Gender:</span>{" "}
                  <span className="capitalize">{patientInfo?.gender}</span>
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
                  <span className="text-sm text-gray-700 mt-1">BMI: </span>{" "}
                  {bmi?.bmi?.toFixed(1)}
                </p>
              </div>
            </div>

            {/* Confirm & Review Buttons */}
            <div className="space-y-3">
              <NextButton label="Confirm and proceed" onClick={hanldeConfirm} />
              <BackButton
                label="Review all answers"
                className="mt-2"
                onClick={reviewAll}
              />
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
