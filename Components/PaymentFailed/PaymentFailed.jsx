import React from "react";
import { useRouter } from "next/router";
import { LuBadgeX } from "react-icons/lu";

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
              <h2 className="text-3xl font-bold text-gray-800  mb-4">Ohh Sorry!</h2>
              <div className="text-left text-gray-600  mb-5 xl:w-3/5 xl:mx-auto">
                <center>
                  {" "}
                  <p>Your Payment has Failed!.</p>
                </center>
              </div>
            </div>
            <button
              onClick={handleGoBack}
              className="bg-violet-700 hover:bg-violet-600 text-white px-2 sm:px-8 py-2 rounded-md font-medium transition-all duration-150 ease-in"
            >
              Continue to Available Treatments
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentFailed;
