import ProgressBar from "../ProgressBar/ProgressBar";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const FormWrapper = ({ children, width = "", heading = "", description = "", percentage = 0, showLoader = false }) => {
  return (
    <>
      <div className={`${inter.className}  flex justify-center bg-[#DACFFF] p-6 sm:p-6 ${showLoader ? "cursor-not-allowed" : ""}`}>
        <div className={`bg-white rounded-xl shadow-md w-full max-w-3xl ${width}`}>
          {/* ✅ Move ProgressBar inside the card */}
          <ProgressBar percentage={percentage} />

          <div className="px-8 pt-6 pb-6">
            {/* Title */}
            <h1 className="niba-reg-font heading mb-2">{heading}</h1>

            {/* Description */}
            <p className="mb-6 reg-font paragraph">{description}</p>

            {/* Slot: Form Fields and Buttons */}
            <div className={`${showLoader ? "pointer-events-none opacity-50" : ""}`}>{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormWrapper;
