import BackButton from "@/Components/BackButton/BackButton";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import NextButton from "@/Components/NextButton/NextButton";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import { useRouter } from "next/router";
import React, { useState } from "react";
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
import useLastBmi from "@/store/useLastBmiStore";
import useMedicalQuestionsStore from "@/store/medicalQuestionStore";
import useConfirmationQuestionsStore from "@/store/confirmationQuestionStore";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useAuthStore from "@/store/authStore";
import usePasswordReset from "@/store/usePasswordReset";
import useUserDataStore from "@/store/userDataStore";
import useSignupStore from "@/store/signupStore";
import PageLoader from "@/Components/PageLoader/PageLoader";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import { trackCustomerLabsLead } from "@/config/CustomerLabs";

const ReviewAnswers = () => {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

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

  const { clearCheckout } = useCheckoutStore();
  const { clearMedicalQuestions } = useMedicalQuestionsStore();
  const { clearConfirmationQuestions } = useConfirmationQuestionsStore();
  const { clearShipping, clearBilling } = useShippingOrBillingStore();
  const { clearToken } = useAuthStore();
  const { setIsPasswordReset } = usePasswordReset();
  const { productId, clearProductId } = useProductId();
  const { setLastBmi, clearLastBmi } = useLastBmi();
  const { clearUserData, userData } = useUserDataStore();

  const { clearFirstName, clearLastName, clearEmail, clearConfirmationEmail } =
    useSignupStore();

  // Customer lab data mutation

  const getProductNameById = (id) => {
    const normalizedId = String(id || "");

    if (normalizedId === "1") return "Wegovy";
    if (normalizedId === "4") return "Mounjaro";

    return "Weight Loss Treatment";
  };

  // const trackCustomerLabsConsultationSubmit = (responseData) => {
  //   console.log("CustomerLabs: function called");

  //   if (typeof window === "undefined") return;

  //   if (!window._cl) {
  //     console.log("CustomerLabs: _cl not loaded");
  //     return;
  //   }

  //   const consultationId = responseData?.data?.lastConsultation?.id || "";

  //   const selectedProductId = productId || "";
  //   const selectedProductName = getProductNameById(selectedProductId);

  //   const fname = userData?.fname || firstName || patientInfo?.firstName || "";
  //   const lname = userData?.lname || lastName || patientInfo?.lastName || "";
  //   const email = userData?.email || "";
  //   const phone = userData?.phone || patientInfo?.phoneNo || "";
  //   const userId = userData?.id || "";

  //   const uniqueKey = consultationId
  //     ? `customerlabs_lead_${consultationId}`
  //     : null;

  //   if (uniqueKey && localStorage.getItem(uniqueKey)) {
  //     console.log("CustomerLabs: duplicate event stopped", uniqueKey);
  //     return;
  //   }

  //   const userTraits = {
  //     first_name: {
  //       t: "string",
  //       v: fname,
  //     },
  //     last_name: {
  //       t: "string",
  //       v: lname,
  //     },
  //   };

  //   if (email) {
  //     userTraits.email = {
  //       t: "string",
  //       v: email,
  //     };
  //   }

  //   if (phone) {
  //     userTraits.phone = {
  //       t: "string",
  //       v: String(phone),
  //     };
  //   }

  //   if (userId) {
  //     userTraits.user_id = {
  //       t: "string",
  //       v: String(userId),
  //     };
  //   }

  //   const customProperties = {
  //     user_traits: {
  //       t: "Object",
  //       v: userTraits,
  //     },

  //     form_name: {
  //       t: "string",
  //       v: "Consultation Form",
  //     },

  //     form_id: {
  //       t: "string",
  //       v: "mayfair_consultation_form",
  //     },

  //     page_url: {
  //       t: "string",
  //       v: window.location.href,
  //     },

  //     consultation_id: {
  //       t: "string",
  //       v: String(consultationId),
  //     },

  //     user_id: {
  //       t: "string",
  //       v: String(userId),
  //     },

  //     product_id: {
  //       t: "string",
  //       v: String(selectedProductId),
  //     },

  //     product_name: {
  //       t: "string",
  //       v: selectedProductName,
  //     },

  //     treatment_name: {
  //       t: "string",
  //       v: selectedProductName,
  //     },

  //     event_source: {
  //       t: "string",
  //       v: "confirmation_summary_success",
  //     },
  //   };

  //   if (email) {
  //     customProperties.identify_by_email = {
  //       t: "string",
  //       v: email,
  //       ib: true,
  //     };
  //   }

  //   if (phone) {
  //     customProperties.external_ids = {
  //       t: "Object",
  //       v: {
  //         identify_by_phone: {
  //           t: "string",
  //           v: String(phone),
  //         },
  //       },
  //     };
  //   }

  //   const properties = {
  //     customProperties,
  //   };

  //   if (email || phone) {
  //     window._cl.identify(properties);
  //     console.log("CustomerLabs: identify fired", properties);
  //   }

  //   window._cl.trackSubmit("Lead", properties);
  //   console.log("CustomerLabs: Lead fired", properties);

  //   if (uniqueKey) {
  //     localStorage.setItem(uniqueKey, "true");
  //   }
  // };

  //Send All steps data
  const stepsDataMutation = useMutation(sendStepData, {
    onSuccess: (data) => {
      console.log(data, "Medical Questions");

      if (data?.data?.lastConsultation) {
        console.log(data?.data?.lastConsultation?.fields, "data?.data?.data");
        setBmi(data?.data?.lastConsultation?.fields?.bmi);
        setConfirmationInfo(
          data?.data?.lastConsultation?.fields?.confirmationInfo,
        );
        setGpDetails(data?.data?.lastConsultation?.fields?.gpdetails);
        setMedicalInfo(data?.data?.lastConsultation?.fields?.medicalInfo);
        setPatientInfo(data?.data?.lastConsultation?.fields?.patientInfo);
        setLastBmi(data?.data?.lastConsultation?.fields?.bmi);
      }
      // CustomerLabs Lead/Form Submit trigger
      trackCustomerLabsLead({
        formName: "Consultation Form",
        formId: "mayfair_consultation_form",
        dedupeKey: data?.data?.lastConsultation?.id
          ? `customerlabs_lead_${data.data.lastConsultation.id}`
          : null,
        identity: {
          firstName: userData?.fname || firstName || patientInfo?.firstName,
          lastName: userData?.lname || lastName || patientInfo?.lastName,
          email: userData?.email,
          phone: userData?.phone || patientInfo?.phoneNo,
          userId: userData?.id,
        },
        properties: {
          consultation_id: data?.data?.lastConsultation?.id || "",
          product_id: productId || "",
          product_name:
            { 1: "Wegovy", 4: "Mounjaro" }[productId] ||
            "Weight Loss Treatment",
          treatment_name:
            { 1: "Wegovy", 4: "Mounjaro" }[productId] ||
            "Weight Loss Treatment",
          event_source: "confirmation_summary_success",
        },
      });
      router.push("/gathering-data");
      return;
    },
    onError: (error) => {
      // setLoading(false);
      console.log("error", error?.response?.data?.message);
      if (error) {
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
          setShowLoader(false);
          const errorMessages = error?.response?.data?.original?.errors;
          Object.keys(errorMessages).forEach((key) => {
            const errorMessage = errorMessages[key];
            Array.isArray(errorMessage)
              ? errorMessage.forEach((msg) => toast.error(msg))
              : toast.error(errorMessage);
          });
        } else if (error?.response?.data?.errors) {
          setShowLoader(false);
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

  const handleRestart = () => {
    router.push("/personal-details");
  };

  const handleSubmit = () => {
    setShowLoader(true);

    const formattedMedicalInfo = medicalInfo.map((item) => ({
      question: item.question,
      qsummary: item.qsummary,
      answer: item.answer,
      subfield_response: item.subfield_response,
      sub_field_prompt: item.sub_field_prompt,
      has_sub_field: item.has_sub_field,
    }));

    const fname = patientInfo?.firstName
      ? patientInfo?.firstName
      : authUserDetail?.fname;
    const lname = patientInfo?.lastName
      ? patientInfo?.lastName
      : authUserDetail?.lname;

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
      <MetaLayout canonical={`${meta_url}review-answers/`} />
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
                  <p className="text-sm font-semibold text-black">
                    Patient Residential Address
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {patientInfo?.address?.postalcode}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {patientInfo?.address?.addressone}
                  </p>
                  {patientInfo?.address?.addresstwo?.trim() && (
                    <p className="text-sm text-gray-700 mt-1">
                      {patientInfo.address.addresstwo}
                    </p>
                  )}
                  <p className="text-sm text-gray-700 mt-1">
                    {patientInfo?.address?.city}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {patientInfo?.address?.state}
                  </p>
                  <hr className="mt-4 border-gray-200" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">
                    Phone Number
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {patientInfo?.phoneNo}
                  </p>
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
                      <p className="text-sm text-gray-700 mt-1 capitalize">
                        {item?.answer}{" "}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {item?.subfield_response}
                      </p>
                      <hr className="mt-4 border-gray-200" />
                    </div>
                  );
                })}
              </div>

              {/* Bottom Action Buttons */}
              <div className="mt-8 space-y-3">
                <NextButton
                  label="Confirm and Proceed"
                  onClick={handleSubmit}
                />
                <BackButton
                  label="Edit answers"
                  className="mt-2"
                  onClick={handleRestart}
                />
              </div>

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
};

export default ReviewAnswers;
