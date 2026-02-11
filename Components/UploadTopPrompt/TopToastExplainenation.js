import useExplanationEvidenceStore from "@/store/useExplanationEvidenceStore";
import Link from "next/link";
import React from "react";
import { FiAlertCircle } from "react-icons/fi";

const TopToastExplanation = () => {
  const { explainenationEvidence } = useExplanationEvidenceStore();

  if (explainenationEvidence) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-6 py-3 rounded-2xl shadow-xl w-[90%] sm:w-auto animate-slide-down z-50 backdrop-blur-sm">
      <div className="sm:flex items-start gap-4">
        {/* Icon */}
        <FiAlertCircle className="text-2xl mt-0.5 flex-shrink-0" />

        {/* Message */}
        <div className="flex flex-col">
          <p className="text-md mont-bold-font">Higher dosage selected</p>
          <span className="text-xs opacity-90 mt-1 mont-medium-font">
            Order will not be approved until a medical explanation is provided.
          </span>
        </div>
        <Link
          href="/explanation-evidence"
          className="mt-2 text-sm font-medium border-1  p-1 rounded-md bg-white text-amber-400 hover:opacity-80 transition mont-bold-font"
        >
          Add explanation
        </Link>
      </div>
    </div>
  );
};

export default TopToastExplanation;
