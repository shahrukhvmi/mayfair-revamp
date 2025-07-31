import React from "react";

import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const NextButton = ({
  label = "Next",
  loading = false,
  disabled = false,
  type = "submit",
  onClick,
  className,
  subHeading,
}) => {
  return (
    <div className={"mb-0"}>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`${className} w-full ${
          subHeading ? "" : "sm:px-12"
        }   border-2 py-3 rounded-full text-white bold-font text-sm transition-all duration-150 ease-in-out
            flex justify-center items-center cursor-pointer
            ${
              disabled || loading
                ? "bg-gray-300 !cursor-not-allowed"
                : " border-[#47317c] bg-[#47317c] hover:bg-[#47317c]"
            }`}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center ">
            <div>{label}</div>
            {subHeading && (
              <div className="text-[13px] reg-font pt-1 normal-case">
                {subHeading}
              </div>
            )}
          </div>
        )}
      </button>
    </div>
  );
};

export default NextButton;
