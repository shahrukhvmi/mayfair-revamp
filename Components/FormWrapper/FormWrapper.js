import StepsHeader from "@/layout/stepsHeader";
import ProgressBar from "../ProgressBar/ProgressBar";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const FormWrapper = ({ children, width = "", heading = "", description = "", percentage = 0, showLoader = false }) => {
  return (
    <>
      <StepsHeader />
      <div
        className={`${inter.className} min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 ${showLoader ? "cursor-not-allowed" : ""}`}
      >
        <div className={`bg-white rounded-xl shadow-md w-full max-w-md ${width}`}>
          {/* ✅ Move ProgressBar inside the card */}
          <ProgressBar percentage={percentage} />

          <div className="px-6 pt-6 pb-8">
            {/* Title */}
            <h1 className="text-xl font-semibold text-center mb-2 text-gray-900">{heading}</h1>

            {/* Description */}
            <p className="text-sm text-gray-600 text-center mb-6">{description}</p>

            {/* Slot: Form Fields and Buttons */}
            <div className={`${showLoader ? "pointer-events-none opacity-50" : ""}`}>{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormWrapper;
