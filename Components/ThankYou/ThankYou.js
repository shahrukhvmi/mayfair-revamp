import React from "react";
import { useRouter } from "next/router";
import { HiBadgeCheck } from "react-icons/hi";
import FormWrapper from "../FormWrapper/FormWrapper";
import NextButton from "../NextButton/NextButton";
import useCartStore from "@/store/useCartStore";

const ThankYou = () => {
  const GO = useRouter();
  const { items, totalAmount,finalTotal } = useCartStore();

  const handleGoBack = () => {
    GO.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2EEFF] px-4 sm:px-8 md:px-20 my-16">
      <div className="bg-white shadow-2xl rounded-3xl p-8 md:p-12 w-full max-w-3xl transition-all duration-300">
        <div className="text-center mb-10">
          <HiBadgeCheck className="w-20 h-20 text-gray-200 fill-purple-600 mx-auto mb-5" />
          <h2 className="text-4xl font-bold text-gray-800">Thank you for your order</h2>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4 text-left">Order Summary</h3>
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-700 font-semibold">
                  <tr>
                    <th className="px-6 py-4 text-left">Product</th>
                    <th className="px-6 py-4 text-right">Price</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {items.doses.length > 0 &&
                    items.doses.map((item, index) => (
                      <tr key={`dose-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-3">{item?.product} {item?.name}</td>
                        <td className="px-6 py-3 text-right">£{parseFloat(item?.price).toFixed(2)}</td>
                      </tr>
                    ))}

                  {items.addons.length > 0 &&
                    items.addons.map((item, index) => (
                      <tr key={`addon-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-3">{item?.product || item?.name || "Add-on"}</td>
                        <td className="px-6 py-3 text-right">£{parseFloat(item?.price).toFixed(2)}</td>
                      </tr>
                    ))}

                  <tr className="bg-gray-100 font-bold text-gray-900">
                    <td colSpan={2} className="px-6 py-3 text-right">Total</td>
                    <td className="px-6 py-3 text-right">£{parseFloat(finalTotal).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-left space-y-4 text-gray-700 text-sm leading-relaxed">
            <p>
              We have received your medical consultation form which is now being reviewed by our prescribers. You may be contacted by a member of
              our medical team for more information prior to your medication being dispensed. Details of your order have been emailed to you and is
              also available to view on the "my orders" section of your account.
            </p>
            <p>
              <span className="font-semibold underline text-black">Delivery:</span> All orders, once approved, are shipped by courier from Monday to
              Thursday by next-day tracked delivery. Please note that if your order is not approved by Thursday afternoon it will not be dispatched
              until the following Monday. This is due to cold-chain requirements.
            </p>
            <p>
              <span className="font-semibold underline text-black">Changes or cancellation:</span> If there are any changes you would like to make
              to your order or to cancel it, please contact us immediately by email on{" "}
              <a href="mailto:contact@mayfairweightlossclinic.co.uk." className="text-violet-700 font-semibold underline">
                contact@mayfairweightlossclinic.co.uk.
              </a>{" "}
              Please note that once your medication has been dispensed you will not be able to cancel or return your order. This is due to
              legislation around prescription-only medication.
            </p>
          </div>

          <div className="pt-6">
            <NextButton onClick={handleGoBack} label="Continue to View Order Details" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
