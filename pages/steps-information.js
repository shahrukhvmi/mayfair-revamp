"use client";

import NextButton from "@/Components/NextButton/NextButton";
import StepsHeader from "@/layout/stepsHeader";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { useMutation } from "@tanstack/react-query";
import { userConsultationApi } from "@/api/consultationApi";
import { getMedicalQuestions } from "@/api/getQuestions";
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

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function StepsInformation() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const router = useRouter();

  //calling from zustand Store
  const { setBmi, clearBmi } = useBmiStore();
  const { setCheckout, clearCheckout } = useCheckoutStore();
  const { setConfirmationInfo, clearConfirmationInfo } = useConfirmationInfoStore();
  const { setGpDetails, clearGpDetails } = useGpDetailsStore();
  const { setMedicalInfo, clearMedicalInfo } = useMedicalInfoStore();
  const { setPatientInfo, clearPatientInfo } = usePatientInfoStore();
  const { setMedicalQuestions } = useMedicalQuestionsStore();
  const { setConfirmationQuestions } = useConfirmationQuestionsStore();
  const { setAuthUserDetail, clearAuthUserDetail } = useAuthUserDetailStore();
  const { billing, setBilling, shipping, setShipping, clearShipping, clearBilling } = useShippingOrBillingStore();
  const { productId } = useProductId();
  const { setLastBmi } = useLastBmi();

  //Get Consultation Data
  const consultationMutation = useMutation(userConsultationApi, {
    onSuccess: (data) => {
      console.log(data, "Dataaaaaaaaaa");

      if (data?.data?.data == null) {
        console.log("true");
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
        setBilling(data?.data?.data?.billing);
        setAuthUserDetail(data?.data?.data?.auth_user);
        setLastBmi(data?.data?.data?.bmi);
      }

      return;
    },
    onError: (error) => {
      // setLoading(false);
      console.log("error", error?.response?.data?.errors?.email);
      if (error) {
      }
    },
  });

  //Get Mediacal Question Data
  const medicalQuestionsMutation = useMutation(getMedicalQuestions, {
    onSuccess: (data) => {
      console.log(data, "Medical Questions");

      if (data) {
        setMedicalQuestions(data?.data?.data?.medical_question);
        setConfirmationQuestions(data?.data?.data?.confirmation_question);
        router.push("/personal-details");
      }
      return;
    },
    onError: (error) => {
      // setLoading(false);
      console.log("error", error?.response?.data?.errors?.email);
      if (error) {
        setShowLoader(false);
      }
    },
  });

  useEffect(() => {
    const formData = {
      clinic_id: 1,
      product_id: productId,
    };
    setShowLoader(true);
    consultationMutation.mutate(formData);
    medicalQuestionsMutation.mutate();
  }, []);

  //   setTimeout(() => {
  //     router.push("/step1");
  //   }, 3000);

  return (
    <>
      <StepsHeader />
      {showLoader && (
        <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">
          <PageLoader />
        </div>
      )}
    </>
  );
}
