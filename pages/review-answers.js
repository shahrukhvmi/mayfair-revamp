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
import normalizeConfirmationInfo from "@/utils/normalizeConfirmationInfo";
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

      if (data?.data?.lastConsultation) {
        setBmi(data?.data?.lastConsultation?.fields?.bmi);
        setConfirmationInfo(
          data?.data?.lastConsultation?.fields?.confirmationInfo,
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
      confirmationInfo: normalizeConfirmationInfo(confirmationInfo),
      medicalInfo: formattedMedicalInfo,
      pid: productId,
    };
    stepsDataMutation.mutate(formData);
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}review-answers/`} />
      <StepsHeader />
      <FormWrapper
        percentage={"95"}
        heading="Review Your Answers"
        description="Please check that your details and medical answers are correct before continuing."
        width="!max-w-[760px]"
      >
        <PageAnimationWrapper>
          <div>
            <div className="mx-auto max-w-[680px]">
              <section aria-labelledby="contact-summary-heading">
                <h2
                  id="contact-summary-heading"
                  className="inter-semibold-font text-[15px] text-slate-900"
                >
                  Contact details
                </h2>
                <div className="mt-3 grid overflow-hidden rounded-xl border border-slate-200 bg-[#FBFBFD] sm:grid-cols-[1.4fr_0.6fr] sm:divide-x sm:divide-slate-200">
                  <div className="px-4 py-4 sm:px-5">
                    <p className="inter-medium-font text-[10px] uppercase tracking-[0.1em] text-slate-400">
                      Residential address
                    </p>
                    <address className="inter-reg-font mt-2 not-italic text-[13px] leading-6 text-slate-700">
                      {[
                        patientInfo?.address?.addressone,
                        patientInfo?.address?.addresstwo,
                        patientInfo?.address?.city,
                        patientInfo?.address?.state,
                        patientInfo?.address?.postalcode,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Not provided"}
                    </address>
                  </div>
                  <div className="border-t border-slate-200 px-4 py-4 sm:border-t-0 sm:px-5">
                    <p className="inter-medium-font text-[10px] uppercase tracking-[0.1em] text-slate-400">
                      Phone number
                    </p>
                    <p className="inter-medium-font mt-2 break-words text-[13px] text-slate-700">
                      {patientInfo?.phoneNo || "Not provided"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="mt-7" aria-labelledby="medical-summary-heading">
                <div className="mb-3 flex items-end justify-between gap-4">
                  <div>
                    <h2
                      id="medical-summary-heading"
                      className="inter-semibold-font text-[15px] text-slate-900"
                    >
                      Medical questionnaire
                    </h2>
                    {/* <p className="inter-reg-font mt-1 text-[12.5px] text-slate-500">
                      {medicalInfo.length} answers to review
                    </p> */}
                  </div>
                </div>

                <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {medicalInfo.map((item, index) => (
                    <article key={index} className="px-4 py-5 sm:px-5">
                      <div className="flex items-start gap-3">
                        <span className="inter-semibold-font flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#47317c]/[0.07] text-[11px] text-[#47317c]">
                          {index + 1}
                        </span>
                        <div
                          className="inter-medium-font min-w-0 flex-1 text-[13.5px] leading-[1.65] text-slate-800 [&>ul]:ml-5 [&>ul]:mt-2 [&>ul]:list-disc [&>li]:mt-1 [&>li]:font-normal [&>li]:text-slate-600"
                          dangerouslySetInnerHTML={{ __html: item.question }}
                        />
                      </div>

                      <div className="ml-9 mt-3 border-l-2 border-[#47317c]/25 pl-3.5">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="inter-medium-font text-[10px] uppercase tracking-[0.09em] text-slate-400">
                            Your answer
                          </span>
                          <span className="inter-semibold-font text-[14px] capitalize text-[#47317c]">
                            {item?.answer || "Not answered"}
                          </span>
                        </div>

                        {String(item?.subfield_response || "").trim() && (
                          <p className="inter-reg-font mt-1.5 text-[13px] leading-relaxed text-slate-600">
                            {item.subfield_response}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              {/* Bottom Action Buttons */}
              <div className="mt-7 border-t border-slate-200 pt-6">
                <NextButton
                  label="Confirm and Proceed"
                  onClick={handleSubmit}
                />
                <BackButton
                  label="Edit answers"
                  className="mt-3"
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
