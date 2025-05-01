import React, { useState } from "react";
import { useWatch } from "react-hook-form";
import SectionHeader from "./SectionHeader";
import TextField from "@/Components/TextField/TextField";
import SectionWrapper from "./SectionWrapper";
import { FiChevronDown } from "react-icons/fi";
import { FaDotCircle, FaRegCircle } from "react-icons/fa";

const ShippingAddress = ({ register, errors, control, isComp }) => {
  const [manual, setManual] = useState(false);
  const [sameAsShiping, setSameAsShiping] = useState(false);

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
            className="bold-font paragraph underline transition "
          >
            <span className="reg-font paragraph">
              {manual ? "Hide manual address entry" : "Enter your address manually"}

            </span>
          </button>
        </div>


        {/* Manual Address Fields */}
        {manual && (<>


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
            <div className="grid grid-cols-12 md:grid-cols-1 gap-4">

              <div className="relative w-full">
                <label className="block mb-2 bold-font paragraph">Country</label>

                <select
                  {...register("country", { required: manual })}
                  className="w-full appearance-none bg-white border border-black text-gray-900 text-sm rounded-md focus:ring-violet-500 focus:border-violet-500  py-5 px-3 pr-12 transition duration-300 ease-in-out mb-3"
                >
                  <option value="">Select your country</option>
                  <option value="United Kingdom">United Kingdom (Mainland)</option>
                  <option value="United States">Channel Islands</option>
                  <option value="Canada">Northern Ireland</option>
                </select>

                {/* Custom React Icon Dropdown Arrow */}
                <div className="pointer-events-none absolute top-16 right-3 transform -translate-y-1/2">
                  <FiChevronDown className="w-5 h-5 text-gray-500" />
                </div>

                {errors.country && (
                  <p className="text-red-500 text-xs mt-2">Country is required.</p>
                )}
              </div>




            </div>

            {/* Address Line 2 (optional) */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Address Line 1"
                name="addressLine1"
                placeholder="123 Main Street"
                register={register}
                required={manual}
                errors={errors}
              />
              <TextField
                label="Address Line 2"
                name="addressLine2"
                placeholder="Apartment, suite, etc. (optional)"
                register={register}
                required={false}
                errors={errors}
              />
            </div>

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
          <div
            className="flex items-center gap-3 cursor-pointer select-none mt-4"
            onClick={() => setSameAsShiping(!sameAsShiping)}
          >
            {sameAsShiping ? (
              <FaDotCircle className="text-violet-700 w-5 h-5" />
            ) : (
              <FaRegCircle className="text-gray-500 w-5 h-5" />
            )}

            <span className="text-sm font-medium text-gray-800">
              {sameAsShiping ? "Make billing address same as shipping" : "Make billing address same as shipping"}
            </span>
          </div>
        </>
        )}





        {!sameAsShiping && (
          <div className="space-y-6">

            {/* First Name + Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Postal code"
                name="firstName"
                placeholder="John"
                register={register}
                required={sameAsShiping}
                errors={errors}
              />
            
            </div>

            {/* Country + Address Line 1 */}
            <div className="grid grid-cols-12 md:grid-cols-1 gap-4">

              <div className="relative w-full">
                <label className="block mb-2 bold-font paragraph">Country</label>

                <select
                  {...register("country", { required: sameAsShiping })}
                  className="w-full appearance-none bg-white border border-black text-gray-900 text-sm rounded-md focus:ring-violet-500 focus:border-violet-500  py-5 px-3 pr-12 transition duration-300 ease-in-out mb-3"
                >
                  <option value="">Select your country</option>
                  <option value="United Kingdom">United Kingdom (Mainland)</option>
                  <option value="United States">Channel Islands</option>
                  <option value="Canada">Northern Ireland</option>
                </select>

                {/* Custom React Icon Dropdown Arrow */}
                <div className="pointer-events-none absolute top-16 right-3 transform -translate-y-1/2">
                  <FiChevronDown className="w-5 h-5 text-gray-500" />
                </div>

                {errors.country && (
                  <p className="text-red-500 text-xs mt-2">Country is required.</p>
                )}
              </div>




            </div>

            {/* Address Line 2 (optional) */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Address Line 1"
                name="addressLine1"
                placeholder="123 Main Street"
                register={register}
                required={sameAsShiping}
                errors={errors}
              />
              <TextField
                label="Address Line 2"
                name="addressLine2"
                placeholder="Apartment, suite, etc. (optional)"
                register={register}
                required={false}
                errors={errors}
              />
            </div>

            {/* City + State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="City"
                name="city"
                placeholder="e.g., London"
                register={register}
                required={sameAsShiping}
                errors={errors}
              />
              <TextField
                label="State"
                name="state"
                placeholder="e.g., England"
                register={register}
                required={sameAsShiping}
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
