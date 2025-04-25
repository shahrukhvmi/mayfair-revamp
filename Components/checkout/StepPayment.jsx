import React from "react";
import SectionWrapper from "./SectionWrapper";
import TextField from "@/Components/TextField/TextField";

const StepPayment = ({ register, errors }) => {
  return (
    <SectionWrapper>
      <h2 className="font-semibold text-lg mb-6 text-gray-700">4. Confirm Payment</h2>

      {/* Discount Code + Apply */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Discount code
        </label>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            {...register("discountCode")}
            placeholder="Enter code"
            className="flex-1 px-4 py-4 border border-black rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 transition"
          />

          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-md transition"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Terms Agreement */}
      <div className="mt-6 space-y-2">
        <label className="flex items-start gap-2 text-sm text-gray-800">
          <input
            type="checkbox"
            {...register("terms", { required: true })}
            className="mt-1 accent-violet-600"
          />
          <span>
            I have read and agree to the{" "}
            <a href="#" className="text-violet-700 underline">
              Terms & Conditions
            </a>{" "}
            and acknowledge the{" "}
            <a href="#" className="text-violet-700 underline">
              Privacy Policy
            </a>
            .
          </span>
        </label>

        {errors.terms && (
          <p className="text-sm text-red-600">You must accept the terms.</p>
        )}
      </div>
    </SectionWrapper>
  );
};

export default StepPayment;
