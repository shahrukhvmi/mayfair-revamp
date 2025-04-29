import React, { useState } from "react";
import { useWatch } from "react-hook-form";
import SectionHeader from "./SectionHeader";
import TextField from "@/Components/TextField/TextField";
import SectionWrapper from "./SectionWrapper";

const ShippingAddress = ({ register, errors, control,isComp }) => {
  const [manual, setManual] = useState(false);

  const postalCode = useWatch({ control, name: "postalCode" }) || "";
  const addressLine1 = useWatch({ control, name: "addressLine1" }) || "";
  const city = useWatch({ control, name: "city" }) || "";
  const country = useWatch({ control, name: "country" }) || "";
  const firstName = useWatch({ control, name: "firstName" }) || "";
  const lastName = useWatch({ control, name: "lastName" }) || "";
  const state = useWatch({ control, name: "state" }) || "";

  // Completed Logic
  const isCompleted = manual
    ? firstName.length > 0 &&
    lastName.length > 0 &&
    addressLine1.length > 0 &&
    city.length > 0 &&
    country.length > 0 &&
    state.length > 0
    : postalCode.length > 0;

  return (
    <SectionWrapper>
      <SectionHeader
        stepNumber={2}
        title="Shipping Address"
        description=""
        completed={isComp}
      />

      <div className="space-y-6">
        {/* Postal Code */}
        <TextField
          label="Postal Code"
          name="postalCode"
          placeholder=""
          register={register}
          required
          errors={errors}
        />

        {/* Toggle Manual Entry Button */}
        <div className="text-sm">
          <button
            type="button"
            onClick={() => setManual(!manual)}
            className="text-black font-bold underline transition"
          >
            {manual ? "Hide manual address entry" : "Enter your address manually"}
          </button>
        </div>

        {/* Manual Address Fields */}
        {manual && (
          <div className="space-y-6">

            {/* First Name + Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="First Name"
                name="firstName"
                placeholder="John"
                register={register}
                required={manual}
                errors={errors}
              />
              <TextField
                label="Last Name"
                name="lastName"
                placeholder="Doe"
                register={register}
                required={manual}
                errors={errors}
              />
            </div>

            {/* Country + Address Line 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-black">Country</label>
                <select
                  {...register("country", { required: manual })}
                  className="w-full border rounded-lg p-3 text-sm text-black py-4"
                >
                  <option value="">Select your country</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
                {errors.country && (
                  <p className="text-red-500 text-xs mt-1">Country is required.</p>
                )}
              </div>

              <TextField
                label="Address Line 1"
                name="addressLine1"
                placeholder="123 Main Street"
                register={register}
                required={manual}
                errors={errors}
              />
            </div>

            {/* Address Line 2 (optional) */}
            <TextField
              label="Address Line 2 (Optional)"
              name="addressLine2"
              placeholder="Apartment, suite, etc. (optional)"
              register={register}
              required={false}
              errors={errors}
            />

            {/* City + State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="City"
                name="city"
                placeholder="e.g., London"
                register={register}
                required={manual}
                errors={errors}
              />
              <TextField
                label="State"
                name="state"
                placeholder="e.g., England"
                register={register}
                required={manual}
                errors={errors}
              />
            </div>

          </div>
        )}

      </div>
    </SectionWrapper>
  );
};

export default ShippingAddress;
