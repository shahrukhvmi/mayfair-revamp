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

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function StepsInformation() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
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
      } else if (data?.data) {
        setBmi(data?.data?.data?.bmi);
        setCheckout(data?.data?.data?.checkout);
        setConfirmationInfo(data?.data?.data?.confirmationInfo);
        setGpDetails(data?.data?.data?.gpdetails);
        setMedicalInfo(data?.data?.data?.medicalInfo);
        setPatientInfo(data?.data?.data?.patientInfo);
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

  useEffect(() => {
    consultationMutation.mutate();
    medicalQuestionsMutation.mutate();
  }, []);

  useEffect(() => {
    if (!imageLoaded) return;
    const timeout = setTimeout(() => setShowContent(true), 500); // buffer after image loads
    return () => clearTimeout(timeout);
  }, [imageLoaded]);

  const textVariant = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  const detailVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.4, duration: 0.6 },
    }),
  };

  //   setTimeout(() => {
  //     router.push("/step1");
  //   }, 3000);

  const details = [
    "Wegovy is used for weight management.",
    "The typical dose is 2.4 mg once weekly.",
    "Common side effects include nausea, diarrhea, and headache.",
  ];

  return (
    <>
      <StepsHeader />
      <div className={`${inter.className} flex flex-col bg-[#DACFFF] text-center px-4 py-12`}>
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={textVariant}
          className="text-2xl md:text-3xl niba-bold-font heading text-gray-800 mb-6"
        >
          You are proceeding with Wegovy
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-6 flex justify-center min-h-[200px]"
        >
          <Image
            src="/images/wegovy.png"
            alt="Wegovy Image"
            width={250}
            height={250}
            priority
            loading="eager"
            onLoad={() => setImageLoaded(true)} // ✅ sets flag when image fully loaded
          />
        </motion.div>

        {showContent && (
          <>
            <div className="space-y-4 mt-4 reg-font paragraph">
              {details.map((line, index) => (
                <motion.p key={index} custom={index} initial="hidden" animate="visible" variants={detailVariant} className="reg-font paragraph">
                  {line}
                </motion.p>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="mt-8">
              <div className="w-sm m-auto reg-font paragraph">
                <NextButton label="Next" onClick={() => router.push("/personal-details")} />
              </div>
            </motion.div>
          </>
        )}
      </div>
    </>
  );
}
