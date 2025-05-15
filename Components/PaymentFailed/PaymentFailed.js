import React from "react";
import { useRouter } from "next/router";
import { LuBadgeX } from "react-icons/lu";
import NextButton from "../NextButton/NextButton";

const PaymentFailed = () => {
  const GO = useRouter();

  const handleGoBack = () => {
    GO.push("/dashboard");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#F2EEFF] px-6 sm:px-44">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center w-full max-w-2xl">
        <LuBadgeX className="inline w-16 h-16 text-gray-200 fill-purple-600 mx-auto mb-4" />
        <h2 className="text-3xl niba-bold-font text-gray-800 mb-4">Payment Failed</h2>
        <p className="text-gray-600 mb-6 reg-font">It looks like your payment wasn’t completed. You can try again or contact us if you need help.</p>
        <div className="text-center flex justify-center">
          <NextButton
            onClick={handleGoBack}
            className={"s:!w-96 "}
            label="Continue to Available Treatments"
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
