"use client";

import NextButton from "@/Components/NextButton/NextButton";
import StepsHeader from "@/layout/stepsHeader";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function StepsInformation() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const router = useRouter();

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
      <div className={`${inter.className} flex flex-col bg-green-50 text-center px-4 py-12`}>
        <motion.h1 initial="hidden" animate="visible" variants={textVariant} className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
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
            <div className="space-y-4 mt-4">
              {details.map((line, index) => (
                <motion.p key={index} custom={index} initial="hidden" animate="visible" variants={detailVariant} className="text-gray-700 text-md">
                  {line}
                </motion.p>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="mt-8">
              <div className="w-sm m-auto">
                <NextButton label="Next" onClick={() => router.push("/personal-details")} />
              </div>
            </motion.div>
          </>
        )}
      </div>
    </>
  );
}
