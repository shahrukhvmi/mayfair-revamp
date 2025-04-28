import React from "react";

import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const NextButton = ({ label = "Next", loading = false, disabled = false, type = "submit", onClick, className }) => {
  return (
    <div className={`${className} mb-0`}>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`${inter.className} w-full px-12  py-3 rounded-xl text-white font-bold text-sm transition-all duration-150 ease-in-out
            flex justify-center items-center cursor-pointer
            ${disabled || loading ? "bg-gray-400 opacity-50 cursor-not-allowed" : "bg-violet-700 hover:bg-violet-950"}`}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        ) : (
          <span>{label}</span>
        )}
      </button>
    </div>
  );
};

export default NextButton;
