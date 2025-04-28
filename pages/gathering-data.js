import StepsHeader from "@/layout/stepsHeader";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import doctorAnimation from "@/public/images/dr-animation.json";
import NextButton from "@/Components/NextButton/NextButton";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Dynamically import Lottie with SSR disabled
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function GatherData() {
  const [ready, setReady] = useState(false); // 🔑 unified flag for everything
  const [isLottieReady, setIsLottieReady] = useState(false);
  const [showContent, setShowContent] = useState(false); // shows text/details/buttons
  const router = useRouter();

  // Wait for both animation and a minimum timeout
  useEffect(() => {
    const minimumWait = setTimeout(() => {
      if (isLottieReady) setReady(true);
    }, 500);

    return () => clearTimeout(minimumWait);
  }, [isLottieReady]);

  useEffect(() => {
    if (!ready) return;
    const timeout = setTimeout(() => setShowContent(true), 0); // animation buffer
    return () => clearTimeout(timeout);
  }, [ready]);

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

  setTimeout(() => {
    router.push("/dosage-selection");
  }, 4000);

  const details = [
    "Wegovy is used for weight management.",
    "The typical dose is 2.4 mg once weekly.",
    "Common side effects include nausea, diarrhea, and headache.",
  ];

  return (
    <>
      <StepsHeader />
      <div className={`${inter.className} flex flex-col bg-green-50 text-center px-4 py-12`}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center min-h-[200px]"
        >
          <Lottie animationData={doctorAnimation} loop={true} style={{ width: 200, height: 200 }} onDOMLoaded={() => setIsLottieReady(true)} />
        </motion.div>

        {showContent && (
          <>
            <motion.h1 initial="hidden" animate="visible" variants={textVariant} className="text-2xl md:text-3xl font-semibold text-gray-800 mt-6">
              Gathering your details
            </motion.h1>

            <div className="space-y-4 mt-6">
              {details.map((line, index) => (
                <motion.p key={index} custom={index} initial="hidden" animate="visible" variants={detailVariant} className="text-gray-700 text-md">
                  {line}
                </motion.p>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="mt-8">
              <div className="w-md m-auto">
                <NextButton
                  label="Continue"
                  className="!bg-lime-200 !text-black !font-semibold hover:!bg-lime-300"
                  onClick={() => router.push("/dosage-selection")}
                />
              </div>
            </motion.div>
          </>
        )}
      </div>
    </>
  );
}
