import React from "react";
import TextField from "@/Components/TextField/TextField";
import SectionWrapper from "./SectionWrapper";

const StepAddress = ({ register, errors }) => {
  return (
    <SectionWrapper>
      <h2 className="font-semibold text-lg mb-4">2. Residential Address</h2>

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
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField
            label="Postal Code"
            name="postalCode"
            placeholder="W1A 1AA"
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
      </div>
    </SectionWrapper>
  );
};

export default StepAddress;
