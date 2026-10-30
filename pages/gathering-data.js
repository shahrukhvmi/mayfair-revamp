import StepsHeader from "@/layout/stepsHeader";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import getVariationsApi from "@/api/getVariationsApi";
import toast from "react-hot-toast";
import Fetcher from "@/library/Fetcher";
import useVariationStore from "@/store/useVariationStore";
import PageLoader from "@/Components/PageLoader/PageLoader";
import useShipmentCountries from "@/store/useShipmentCountriesStore";
import useBillingCountries from "@/store/useBillingCountriesStore";
import useCartStore from "@/store/useCartStore";
import useProductId from "@/store/useProductIdStore";
import usePatientInfoStore from "@/store/patientInfoStore";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import useGpDetailsStore from "@/store/gpDetailStore";
import useCheckoutStore from "@/store/checkoutStore";
import useMedicalQuestionsStore from "@/store/medicalQuestionStore";
import useConfirmationQuestionsStore from "@/store/confirmationQuestionStore";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useAuthStore from "@/store/authStore";
import usePasswordReset from "@/store/usePasswordReset";
import useLastBmi from "@/store/useLastBmiStore";
import useSignupStore from "@/store/signupStore";
import useBmiStore from "@/store/bmiStore";
import useUserDataStore from "@/store/userDataStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useAbandonCardStore from "@/store/abandonCardStore";
import { userConsultationApi } from "@/api/consultationApi";
import useReturning from "@/store/useReturningPatient";
import lastOrderStore from "@/store/lastOrderStore";

export default function GatherData() {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);
  const [loadError, setLoadError] = useState("");
  const isMounted = useRef(true);

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
  const [isSlow, setIsSlow] = useState(false);
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

  // store addons or dose here 🔥🔥
  const { setVariation } = useVariationStore();
  const { setShipmentCountries } = useShipmentCountries();
  const { setBillingCountries } = useBillingCountries();
  const { clearCart } = useCartStore();

  const { setPatientInfo, clearPatientInfo } = usePatientInfoStore();
  const { setAuthUserDetail, clearAuthUserDetail } = useAuthUserDetailStore();
  const { setBmi, clearBmi } = useBmiStore();
  const { setMedicalInfo, clearMedicalInfo } = useMedicalInfoStore();
  const { setConfirmationInfo, clearConfirmationInfo } =
    useConfirmationInfoStore();
  const { setGpDetails, clearGpDetails } = useGpDetailsStore();

  const { setCheckout, clearCheckout } = useCheckoutStore();
  const { clearMedicalQuestions } = useMedicalQuestionsStore();
  const { clearConfirmationQuestions } = useConfirmationQuestionsStore();
  const {
    billing,
    setBilling,
    shipping,
    setShipping,
    setCheckShippingForAccordion,
    clearShipping,
    clearBilling,
    setCheckBillingForAccordion,
  } = useShippingOrBillingStore();
  const { clearToken } = useAuthStore();
  const { setIsPasswordReset } = usePasswordReset();
  const { productId, clearProductId } = useProductId();
  const { setLastBmi, clearLastBmi } = useLastBmi();
  const { clearUserData } = useUserDataStore();
  const { abandonCard, setExtra, clearAbandonCard } = useAbandonCardStore();
  const {
    clearFirstName,
    clearLastName,
    clearEmail,
    setFirstName,
    setLastName,
    clearConfirmationEmail,
  } = useSignupStore();
  const { setIsReturningPatient } = useReturning();
  const { setLastOrder, clearLastOrder } = lastOrderStore();
  // Variations fetch mutation
  const variationMutation = useMutation(getVariationsApi, {
    onSuccess: (data) => {
      if (data && isMounted.current) {
        clearCart();
        // toast.success("User registered successfully!");
        const variations = data?.data?.data || [];
        setVariation(variations);
        setShipmentCountries(data?.data?.data?.shippment_countries);
        setBillingCountries(data?.data?.data?.billing_countries);
        // Redirect
        router.push("/dosage-selection");
      }
    },
    onError: (error) => {
      if (error && isMounted.current) {
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
          // clearProductId();
          clearLastBmi();
          clearUserData();
          clearFirstName();
          clearLastName();
          clearEmail();
          clearConfirmationEmail();
          clearAbandonCard();
          router.push("/login");
        } else {
          setShowLoader(false);
          const message =
            error?.response?.data?.errors?.Product ||
            (error?.response
              ? "Something went wrong while loading your treatment."
              : "Your internet connection seems slow or unavailable. Please try again.");
          setLoadError(message);
          toast.error(message);
        }
      }
    },
  });

  // Call mutation on mount
  const goBack = () => {
    router.beforePopState(() => true);
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/steps-information");
  };

  const loadVariations = () => {
    if (productId == null) {
      setShowLoader(false);
      setLoadError("No treatment selected. Please select a treatment to continue.");
      return;
    }
    setLoadError("");
    setShowLoader(true);
    variationMutation.mutate({ id: productId, data: {} });
  };

  useEffect(() => {
    loadVariations();
  }, [productId]);

  // Abandoned cart post api call

  const consultationMutation = useMutation(userConsultationApi, {
    onSuccess: (data) => {
      setExtra(data?.data?.data?.extra);

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
        clearLastOrder();
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
        setFirstName(data?.data?.data?.auth_user?.fname);
        setLastName(data?.data?.data?.auth_user?.lname);
        setIsReturningPatient(data?.data?.data?.isReturning);
        setLastOrder(data?.data?.data?.last_order);
      }

      setShowLoader(false);
      return;
    },
    onError: (error) => {
      // setLoading(false);
      if (error && isMounted.current) {
        setShowLoader(false);
      }
    },
  });

  useEffect(() => {
    if (!abandonCard?.type) return;

    if (abandonCard.type === "abandoned-cart") {
      setShowLoader(true);

      consultationMutation.mutate({
        clinic_id: 1,
        product_id: abandonCard.productId,
        type: abandonCard.type,
        eid: Number(abandonCard.eid),
      });
    }
  }, [abandonCard]);

  return (
    <>
      <MetaLayout canonical={`${meta_url}gathering-data/`} />
      <StepsHeader />
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
                    loadVariations();
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
          <div className="flex w-full max-w-xs flex-col gap-3">
            {productId != null && (
              <button
                type="button"
                onClick={loadVariations}
                className="inter-medium-font min-h-[46px] cursor-pointer rounded-xl bg-[#47317c] px-6 py-3 text-white transition-colors hover:bg-[#392765]"
              >
                Try again
              </button>
            )}
            <button
              type="button"
              onClick={goBack}
              className="inter-medium-font min-h-[46px] cursor-pointer rounded-xl border border-[#47317c]/30 bg-white px-6 py-3 text-[#47317c] transition-colors hover:bg-[#47317c]/[0.04]"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </>
  );
}
