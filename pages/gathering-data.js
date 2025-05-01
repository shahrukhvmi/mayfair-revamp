import StepsHeader from "@/layout/stepsHeader";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import doctorAnimation from "@/public/images/dr-animation.json";
import NextButton from "@/Components/NextButton/NextButton";
import { Inter } from "next/font/google";
import { useMutation } from "@tanstack/react-query";
import getVariationsApi from "@/api/getVariationsApi";
import toast from "react-hot-toast";
import Fetcher from "@/library/Fetcher";
import useVariationStore from "@/store/useVariationStore";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function GatherData() {
  const [ready, setReady] = useState(false);
  const [isLottieReady, setIsLottieReady] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const router = useRouter();

  // store addons or dose here 🔥🔥
  const { setVariation } = useVariationStore();

  // Animation ready handler
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLottieReady) setReady(true);
    }, 500);
    return () => clearTimeout(timeout);
  }, [isLottieReady]);

  // Show text after animation ready
  useEffect(() => {
    if (!ready) return;
    const timeout = setTimeout(() => setShowContent(true), 0);
    return () => clearTimeout(timeout);
  }, [ready]);

  // Variations fetch mutation
  const variationMutation = useMutation(getVariationsApi, {
    onSuccess: (data) => {
      console.log(data, "ckdsjksdkjsd")
      if (data) {
        toast.success("User registered successfully!");
        const token = data?.data?.data?.token;
        const variations = data?.data?.data || [];
        setVariation(variations);
        Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${token}`;

        // Redirect
        router.push("/steps-information");
      }
    },
    onError: (error) => {

      if (error?.response?.data?.errors) {
        toast.error(error?.response?.data?.errors);
      }
    },
  });

  // Call mutation on mount
  useEffect(() => {
    variationMutation.mutate({ id: 4, data: {} });
  }, []);

  const details = [
    "Wegovy is used for weight management.",
    "The typical dose is 2.4 mg once weekly.",
    "Common side effects include nausea, diarrhea, and headache.",
  ];

  const textVariant = {
    hidden: { y: -50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 1, ease: "easeOut" } },
  };

  const detailVariant = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.4, duration: 0.6 },
    }),
  };

  return (
    <>
      <StepsHeader />
      <div className={`${inter.className} flex flex-col bg-[#DACFFF] text-center px-4 py-12`}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center min-h-[200px]"
        >
          <Lottie
            animationData={doctorAnimation}
            loop={true}
            style={{ width: 200, height: 200 }}
            onDOMLoaded={() => setIsLottieReady(true)}
          />
        </motion.div>

        {showContent && (
          <>
            <motion.h1 initial="hidden" animate="visible" variants={textVariant} className="text-2xl md:text-3xl mt-6">
              Gathering your details
            </motion.h1>

            <div className="space-y-4 mt-6">
              {details.map((line, index) => (
                <motion.p key={index} custom={index} initial="hidden" animate="visible" variants={detailVariant} className="text-md text-gray-700">
                  {line}
                </motion.p>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
