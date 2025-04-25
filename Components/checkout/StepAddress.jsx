import React, { useState } from "react";
import TextField from "@/Components/TextField/TextField";
import SectionWrapper from "./SectionWrapper";

const StepAddress = ({ register, errors }) => {
  const [manual, setManual] = useState(false);

  return (
    <SectionWrapper>
      <h2 className="font-semibold text-lg mb-4 text-gray-800">
        2. Confirm Residential Address
      </h2>

      <div className="space-y-6">
        {/* Postal Code */}
        <TextField
          label="Postal Code"
          name="postalCode"
          placeholder="W1A 1AA"
          register={register}
          required
          errors={errors}
        />

        {/* Toggle Button */}
        <div className="text-sm">
          <button
            type="button"
            onClick={() => setManual(!manual)}
            className="text-black font-bold  underline transition"
          >
            {manual ? "Hide manual address entry" : "Enter your address manually"}
          </button>
        </div>

        {/* Manual Address Fields */}
        {manual && (
          <div className="space-y-4">
            <TextField
              label="Street Address"
              name="address"
              placeholder="123 Main Street"
              register={register}
              required
              errors={errors}
            />
            <TextField
              label="City"
              name="city"
              placeholder="e.g., London"
              register={register}
              required
              errors={errors}
            />
            <TextField
              label="Country"
              name="country"
              placeholder="United Kingdom"
              register={register}
              required
              errors={errors}
            />
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};

export default StepAddress;
