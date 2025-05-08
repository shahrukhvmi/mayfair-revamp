import React, { useRef } from "react";
import { useRouter } from "next/router";
import { HiBadgeCheck } from "react-icons/hi";
import FormWrapper from "../FormWrapper/FormWrapper";

const ThankYou = () => {
  const GO = useRouter();

  const handleGoBack = () => {
    GO.push("/");
  };

  return (
    <FormWrapper percentage={100}>


      <div className="text-center">
        <div role="status" className="mb-8">
          <HiBadgeCheck className="inline w-16 h-16 text-gray-200 fill-purple-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800  mb-4">Thank you for your order</h2>
          <div className="text-left text-gray-600  mb-5 xl:w-3/5 xl:mx-auto">
            <p>
              We have received your medical consultation form which is now being reviewed by our prescribers. You may be contacted by a member of
              our medical team for more information prior to your medication being dispensed. Details of your order have been emailed to you and is
              also available to view on the ‘my orders’ section of your account.
            </p>
            <p className="mt-2">
              <span className="font-semibold underline text-black">Delivery:</span> All orders, once approved, are shipped by courier from Monday to
              Thursday by next-day tracked delivery. Please note that if your order is not approved by Thursday afternoon it will not be dispatched
              until the following Monday. This is due to cold-chain requirements.
            </p>
            <p className="mt-2">
              <span className="font-semibold underline text-black">Changes or cancellation:</span> If there are any changes you would like to make
              to your order or to cancel it, please contact us immediately by email on{" "}
              <a href="mailto:contact@mayfairweightlossclinic.co.uk." className="text-violet-700 font-semibold">
                contact@mayfairweightlossclinic.co.uk.
              </a>{" "}
              Please note that as once your medication has been dispensed you will not be able to cancel or return your order. This is due to
              legislation around prescription only medication.
            </p>
          </div>
        </div>
        <button
          onClick={handleGoBack}
          className="bg-violet-700 hover:bg-violet-600 text-white px-2 sm:px-8 py-2 rounded-md font-medium transition-all duration-150 ease-in"
        >
          Continue to View Order Details
        </button>
      </div>
    </FormWrapper>


  );
};

export default ThankYou;
