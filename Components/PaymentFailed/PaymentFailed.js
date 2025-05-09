import React from "react";
import { useRouter } from "next/router";
import { LuBadgeX } from "react-icons/lu";
import NextButton from "../NextButton/NextButton";

const PaymentFailed = () => {
  const GO = useRouter();

  const handleGoBack = () => {
    GO.push("/");
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-[#dacfff] px-6 sm:px-44">
        <div className="bg-white  rounded-lg shadow-lg p-8 text-center w-full">
          <div className="text-center">
            <div role="status" className="mb-8">
              <LuBadgeX className="inline w-16 h-16 text-gray-200  fill-purple-600 mx-auto mb-4" />
              <h2 className="text-3xl bold-font text-gray-800  mb-4">Ohh Sorry!</h2>
              <div className="text-left text-gray-600  mb-5">
                <center>
                  {" "}
                  <p>Your Payment has Failed!.</p>
                </center>
              </div>
            </div>
            <NextButton
              onClick={handleGoBack}
              label=" Continue to Available Treatments"
            />

          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentFailed;
