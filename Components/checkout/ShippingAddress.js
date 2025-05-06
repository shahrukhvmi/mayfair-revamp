import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Inter } from "next/font/google";
import SectionWrapper from "./SectionWrapper";
import SectionHeader from "./SectionHeader";
import { FaSearch } from "react-icons/fa";
import TextField from "@/Components/TextField/TextField";
import PageLoader from "@/Components/PageLoader/PageLoader";
import { Client } from "getaddress-api";
import NextButton from "@/Components/NextButton/NextButton";
import MUISelectField from "@/Components/SelectField/SelectField";
import useShippingOrBillingStore from "@/store/shipingOrbilling";

const api = new Client("_UFb05P76EyMidU1VHIQ_A42976");

export default function ShippingAddress({ isComp }) {
  const [showLoader, setShowLoader] = useState(false);
  const [manual, setManual] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState("");

  const { shippingInfo, setShippingInfo } = useShippingOrBillingStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: shippingInfo || {},
  });

  const postalCode = watch("postalCode");
  const address1 = watch("address1");
  const address2 = watch("address2");
  const city = watch("city");
  const state = watch("state");

  // ✅ Watch all values and save in store
  useEffect(() => {
    setShippingInfo({
      postalCode,
      address1,
      address2,
      city,
      state,
    });
  }, [postalCode, address1, address2, city, state]);

  const handleSearch = async () => {
    if (!postalCode) return alert("Please enter postal code.");

    try {
      const result = await api.find(postalCode);
      if (result?.addresses?.addresses?.length) {
        setAddressOptions(result.addresses.addresses);
        setManual(true);
      }
    } catch (error) {
      console.error("API error:", error);
      alert("Something went wrong while fetching addresses.");
    }
  };
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const onSubmit = async () => {
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setShowLoader(false);
    alert("Shipping Info Saved Successfully");
  };

  return (
    <>

      <SectionWrapper>
        <SectionHeader
          stepNumber={2}
          title="Shipping Address"
          description=""
          completed={isComp}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <TextField label="Postal Code" name="postalCode" placeholder="W1A 1AA" register={register} required errors={errors} />
          <button type="button" onClick={handleSearch} className="text-white bg-violet-700 px-3 py-1 rounded">
            <FaSearch className="inline-block me-2" /> Search
          </button>

          {hasMounted && addressOptions.length > 0 && (
            <MUISelectField
              label="Select Your Address"
              name="addressSelect"
              value={selectedIndex}
              onChange={(e) => {
                const idx = e.target.value;
                const selected = addressOptions[idx];
                setSelectedIndex(idx);

                setValue("address1", selected.line_1 || "", { shouldValidate: true });
                setValue("address2", selected.line_2 || "", { shouldValidate: true });
                setValue("city", selected.town_or_city || "", { shouldValidate: true });
                setValue("state", selected.county || "", { shouldValidate: true });
              }}
              options={addressOptions.map((addr, idx) => ({
                value: idx,
                label: addr.formatted_address.join(", "),
              }))}
            />
          )}


          <TextField label="Address 1" name="address1" placeholder="123 Main Street" register={register} required errors={errors} />
          <TextField label="Address 2" name="address2" placeholder="Flat 14" register={register} errors={errors} />
          <TextField label="City" name="city" placeholder="e.g., London" register={register} required errors={errors} />
          <TextField label="State" name="state" placeholder="e.g., Essex" register={register} required errors={errors} />

          <NextButton label="Next" disabled={!isValid} />
        </form>

        {showLoader && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded">
            <PageLoader />
          </div>
        )}
      </SectionWrapper>

    </>
  );
}
