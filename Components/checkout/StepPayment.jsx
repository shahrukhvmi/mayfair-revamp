import React from "react";
import SectionWrapper from "./SectionWrapper";
import TextField from "@/Components/TextField/TextField";

const StepPayment = ({ register, errors, control }) => {
  return (
    <SectionWrapper>
      <h2 className="font-semibold text-lg mb-4">4. Confirm Payment</h2>

      {/* Discount Code */}
      <div className="mb-4">
        <TextField
          label="Discount code"
          name="discountCode"
          placeholder="Enter code"
          register={register}
          errors={errors}
        />
        <button
          type="button"
          className="mt-2 text-sm text-violet-600 hover:underline"
        >
          Apply
        </button>
      </div>

      {/* Card Details */}
      <div className="space-y-4">
        <TextField
          label="Card Number"
          name="cardNumber"
          placeholder="1234 5678 9012 3456"
          type="number"
          register={register}
          required
          errors={errors}
        />

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Expiry Date"
            name="expiry"
            placeholder="MM / YY"
            register={register}
            required
            errors={errors}
          />
          <TextField
            label="Security Code (CVC)"
            name="cvc"
            placeholder="123"
            type="number"
            register={register}
            required
            errors={errors}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <TextField
            label="Country"
            name="country"
            placeholder="United Kingdom"
            register={register}
            required
            errors={errors}
          />
          <TextField
            label="Postal Code"
            name="postalCode"
            placeholder="W1A 1AA"
            register={register}
            required
            errors={errors}
          />
        </div>
      </div>

      {/* Terms & Conditions */}
      <label className="flex items-start mt-6 gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          {...register("terms", { required: true })}
          className="mt-1 accent-violet-600"
        />
        I have read and agree to the{" "}
        <a href="#" className="text-violet-700 underline ml-1">
          Terms & Conditions
        </a>{" "}
        and acknowledge the{" "}
        <a href="#" className="text-violet-700 underline ml-1">
          Privacy Policy
        </a>
        .
      </label>

      {errors.terms && (
        <p className="text-sm text-red-600 mt-2">You must accept the terms.</p>
      )}
    </SectionWrapper>
  );
};

export default StepPayment;
