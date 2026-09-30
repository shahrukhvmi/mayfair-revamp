"use client";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Inter } from "next/font/google";
import { useMutation } from "@tanstack/react-query";
import { userConsultationApi } from "@/api/consultationApi";
import { postMedicalQuestions } from "@/api/getQuestions";
import useBmiStore from "@/store/bmiStore";
import useCheckoutStore from "@/store/checkoutStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import useGpDetailsStore from "@/store/gpDetailStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import usePatientInfoStore from "@/store/patientInfoStore";
import useMedicalQuestionsStore from "@/store/medicalQuestionStore";
import useConfirmationQuestionsStore from "@/store/confirmationQuestionStore";
import PageLoader from "@/Components/PageLoader/PageLoader";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useProductId from "@/store/useProductIdStore";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useLastBmi from "@/store/useLastBmiStore";
import toast from "react-hot-toast";
import useAuthStore from "@/store/authStore";
import usePasswordReset from "@/store/usePasswordReset";
import useUserDataStore from "@/store/userDataStore";
import useSignupStore from "@/store/signupStore";
import ProductSelection from "@/Components/ProductSelection/ProductSelection";
import useReorderButtonStore from "@/store/useReorderButton";
import StepsHeader from "@/layout/stepsHeader";
import MetaLayout from "@/Meta/MetaLayout";
import { FoundayoProductId, meta_url, WegovyPillProductId } from "@/config/constants";
import useReturning from "@/store/useReturningPatient";

export default function StepsInformation() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isSlow, setIsSlow] = useState(false);
  const isMounted = useRef(true);

  const router = useRouter();

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);


  // If loading drags on, let the user retry or leave instead of waiting forever
  const [isStuck, setIsStuck] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!showLoader) {
      setIsStuck(false);
      return;
    }
    const timer = setTimeout(() => setIsStuck(true), 15000);
    return () => clearTimeout(timer);
  }, [showLoader, attempt]);

  // Tell the user when loading is taking unusually long
  useEffect(() => {
    if (!showLoader) {
      setIsSlow(false);
      return;
    }
    const timer = setTimeout(() => setIsSlow(true), 5000);
    return () => clearTimeout(timer);
  }, [showLoader]);

  // While loading, block the browser back button so the user can't leave mid-request
  useEffect(() => {
    if (!showLoader) return;
    router.beforePopState(() => false);
    return () => router.beforePopState(() => true);
  }, [showLoader]);

  //calling from zustand Store
  const { setBmi, clearBmi } = useBmiStore();
  const { isFromReorder } = useReorderButtonStore();
  const { setCheckout, clearCheckout } = useCheckoutStore();
  const { setConfirmationInfo, clearConfirmationInfo } =
    useConfirmationInfoStore();
  const { setGpDetails, clearGpDetails } = useGpDetailsStore();
  const { setMedicalInfo, clearMedicalInfo } = useMedicalInfoStore();
  const { setPatientInfo, clearPatientInfo } = usePatientInfoStore();
  const { setMedicalQuestions, clearMedicalQuestions } =
    useMedicalQuestionsStore();
  const { setConfirmationQuestions, clearConfirmationQuestions } =
    useConfirmationQuestionsStore();
  const { setAuthUserDetail, clearAuthUserDetail, authUserDetail } =
    useAuthUserDetailStore();
  const {
    billing,
    setBilling,
    shipping,
    setShipping,
    clearShipping,
    clearBilling,
    setCheckShippingForAccordion,
    setCheckBillingForAccordion,
  } = useShippingOrBillingStore();
  const { clearToken } = useAuthStore();
  const { setIsPasswordReset } = usePasswordReset();
  const { productId, clearProductId } = useProductId();
  const { setLastBmi, clearLastBmi } = useLastBmi();
  const { clearUserData } = useUserDataStore();
  const { clearFirstName, clearLastName, clearEmail, clearConfirmationEmail } =
    useSignupStore();
  const { setIsReturningPatient } = useReturning();

  /* ───────────────  stores (init only what we SET/CLEAR) ────────────── */

  const showProductSelection = isFromReorder || (!isFromReorder && !productId);

  const goBack = () => {
    router.beforePopState(() => true);
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  };

  const showLoadError = (error) => {
    setShowLoader(false);
    setLoadError(
      !error?.response
        ? "Your internet connection seems slow or unavailable. Please try again."
        : error?.response?.data?.message || "Something went wrong. Please try again.",
    );
  };

  /* ───────────────  product id store ────────────── */
  const consultationMutation = useMutation(userConsultationApi, {
    onSuccess: (data) => {
      if (!isMounted.current) return;

      if (data?.data?.data == null) {
        clearBmi();
        clearCheckout();
        clearConfirmationInfo();
        clearGpDetails();
        clearMedicalInfo();
        clearPatientInfo();
        clearBilling();
        clearShipping();
        clearAuthUserDetail();
      } else if (data?.data) {
        setBmi(data?.data?.data?.bmi);
        setCheckout(data?.data?.data?.checkout);
        setConfirmationInfo(data?.data?.data?.confirmationInfo);
        setGpDetails(data?.data?.data?.gpdetails);
        setMedicalInfo(data?.data?.data?.medicalInfo);
        setPatientInfo(data?.data?.data?.patientInfo);
        setShipping(data?.data?.data?.shipping);
        setCheckShippingForAccordion(data?.data?.data?.shipping);
        setBilling(data?.data?.data?.billing);
        setCheckBillingForAccordion(data?.data?.data?.billing);
        setAuthUserDetail(data?.data?.data?.auth_user);
        setLastBmi(data?.data?.data?.bmi);
        setIsReturningPatient(data?.data?.data?.isReturning);
      }

      if (productId && !showProductSelection) {
        router.push("/personal-details");
        return;
      }

      setShowLoader(false);
      return;
    },
    onError: (error) => {
      if (!isMounted.current) return;
      if (error?.response?.data?.message !== "Unauthenticated.") {
        showLoadError(error);
        return;
      }
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
      }
    },
  });


  /* ───────────────  medical questions mutation ────────────── */
  const medicalQuestionsMutation = useMutation(postMedicalQuestions, {
    onSuccess: (data) => {

      if (data) {
        setMedicalQuestions(data?.data?.data?.medical_question);
        setConfirmationQuestions(data?.data?.data?.confirmation_question);
      }
      return;
    },
    onError: (error) => {
      if (error && isMounted.current) {
        showLoadError(error);
      }
    },
  });

  const loadUserData = () => {
    if (productId == null) return;
    const formData = {
      clinic_id: 1,
      product_id: productId,
    };
    setLoadError("");
    setShowLoader(true);
    consultationMutation.mutate(formData);
    if (productId == WegovyPillProductId || productId == FoundayoProductId) {
      medicalQuestionsMutation.mutate(formData);
    } else {
      medicalQuestionsMutation.mutate();
    }
  };

  useEffect(() => {
    loadUserData();
  }, [productId]);

  // useEffect(() => {}, []);

  //   setTimeout(() => {
  //     router.push("/step1");
  //   }, 3000);

  return (
    <>
      <MetaLayout canonical={`${meta_url}steps-information/`} />
      <StepsHeader />

      <main className="min-h-[calc(100vh-66px)] bg-[#FBFBFD]">
        {showLoader && (
          <PageLoader
            message={isSlow ? "Your internet connection seems slow. Please wait…" : ""}
          >
            {isStuck && (
              <div className="mt-3 flex w-full flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsStuck(false);
                    setAttempt((n) => n + 1);
                    loadUserData();
                  }}
                  className="inter-medium-font min-h-[46px] w-full cursor-pointer rounded-xl bg-[#47317c] px-6 py-3 text-white transition-colors hover:bg-[#392765]"
                >
                  Try again
                </button>
                <button
                  type="button"
                  onClick={goBack}
                  className="inter-medium-font min-h-[46px] w-full cursor-pointer rounded-xl border border-[#47317c]/30 bg-white px-6 py-3 text-[#47317c] transition-colors hover:bg-[#47317c]/[0.04]"
                >
                  Back
                </button>
              </div>
            )}
          </PageLoader>
        )}

        {!showLoader && loadError && (
          <div className="flex min-h-[calc(100dvh-66px)] flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="inter-medium-font max-w-sm text-[15px] leading-snug text-slate-700">
              {loadError}
            </p>
            <button
              type="button"
              onClick={loadUserData}
              className="inter-medium-font min-h-[46px] w-full max-w-xs cursor-pointer rounded-xl bg-[#47317c] px-6 py-3 text-white transition-colors hover:bg-[#392765]"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={goBack}
              className="inter-medium-font min-h-[46px] w-full max-w-xs cursor-pointer rounded-xl border border-[#47317c]/30 bg-white px-6 py-3 text-[#47317c] transition-colors hover:bg-[#47317c]/[0.04]"
            >
              Back
            </button>
          </div>
        )}

        {showProductSelection && (
          <ProductSelection showProductSelection={showProductSelection} />
        )}
      </main>

      {/* )} */}
    </>
  );
}
