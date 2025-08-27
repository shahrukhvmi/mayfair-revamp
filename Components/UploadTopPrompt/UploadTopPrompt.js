import Link from "next/link";
import React from "react";
import { FiUpload } from "react-icons/fi";

const UploadTopPrompt = () => {
  return (
    <div className="fixed top-4 left-1/2   bg-amber-500 text-white px-5 py-2 rounded-xl shadow-lg w-[90%] sm:w-auto animate-slide-down z-50">
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="bg-white/20 p-2 rounded-full">
          <FiUpload className="text-lg" />
        </div>

        {/* Message */}
        <div className="text-sm reg-font">
          Please upload your photos to complete your order{" "}
          <Link
            href="/photo-upload"
            className="font-medium underline underline-offset-4 hover:text-white/80 transition mx-2"
          >
            Click here to upload
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UploadTopPrompt;
