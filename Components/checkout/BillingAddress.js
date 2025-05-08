import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { FaSearch } from "react-icons/fa";
import { IoRadioButtonOff } from "react-icons/io5";
import { RiRadioButtonFill } from "react-icons/ri";
import SectionWrapper from "./SectionWrapper";
import SectionHeader from "./SectionHeader";
import TextField from "@/Components/TextField/TextField";
import PageLoader from "@/Components/PageLoader/PageLoader";
import NextButton from "@/Components/NextButton/NextButton";
import MUISelectField from "@/Components/SelectField/SelectField";
import { Client } from "getaddress-api";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useBillingCountriesStore from "@/store/useBillingCountriesStore";
import useBillingCountries from "@/store/useBillingCountriesStore";
import { motion } from "framer-motion";

const api = new Client("_UFb05P76EyMidU1VHIQ_A42976");

export default function BillingAddress({ isCompleted, onComplete, sameAsShipping }) {
  const [showLoader, setShowLoader] = useState(false);
  const [manual, setManual] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [billingIndex, setBillingIndex] = useState("");
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);

  const { billing, setBilling, shipping } = useShippingOrBillingStore();
  const { billingCountries } = useBillingCountries();

  console.log(billing, "billing");

  const allowedSearchCountryIds = ["1", "2", "3"];

  const isDisabled = sameAsShipping;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      postalcode: "",
      addressone: "",
      addresstwo: "",
      city: "",
      state: "",
      billingCountry: "",
    },
  });

  const selectedBillingCountry = watch("billingCountry"); // get current selected billing country ID
  const isSearchAllowed = allowedSearchCountryIds.includes(selectedBillingCountry);

  // Prefill form fields
  useEffect(() => {
    if (shipping?.same_as_shipping) {
      setValue("postalcode", shipping.postalcode || "");
      setValue("addressone", shipping.addressone || "");
      setValue("addresstwo", shipping.addresstwo || "");
      setValue("city", shipping.city || "");
      setValue("state", shipping.state || "");

      const country = billingCountries.find((c) => c.name === shipping.country_name); // ✅ FIND BY NAME NOT ID
      if (country) {
        setValue("billingCountry", country.id.toString(), { shouldValidate: true });
        setBillingIndex(country.id.toString());
      }

      setValue("same_as_shipping", true);
    } else if (billing) {
      // ✅ Prefill from billing if available
      setValue("postalcode", billing.postalcode || "");
      setValue("addressone", billing.addressone || "");
      setValue("addresstwo", billing.addresstwo || "");
      setValue("city", billing.city || "");
      setValue("state", billing.state || "");

      const country = billingCountries.find((c) => c.name === billing.country_name);
      if (country) {
        setValue("billingCountry", country.id.toString(), { shouldValidate: true });
        setBillingIndex(country.id.toString());
      }

      setValue("same_as_shipping", false);
    }
  }, [shipping, billing, billingCountries]);

  // Handle postal code search
  const handleSearch = async () => {
    setAddressSearchLoading(true);
    const postal = watch("postalcode");
    if (!postal) return alert("Please enter a postal code.");

    try {
      const result = await api.find(postal);
      if (result && result.addresses?.addresses?.length) {
        setAddressOptions(result.addresses.addresses);
        setManual(true);
        setAddressSearchLoading(false);
      }
    } catch (error) {
      console.error("API error:", error);
      alert("Something went wrong while fetching addresses.");
    }
  };

  // Submit billing info
  const onSubmit = async (data) => {
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setShowLoader(false);

    const selectedCountry = billingCountries.find((c) => c.id.toString() === billingIndex);

    setBilling({
      id: selectedCountry?.id || "",
      country_name: selectedCountry?.name || "",
      country_price: selectedCountry?.price || "",
      postalcode: data.postalcode,
      addressone: data.addressone,
      addresstwo: data.addresstwo,
      city: data.city,
      state: data.state,
      same_as_shipping: data.same_as_shipping, // ✅ Save this also
    });

    onComplete();
  };

  if (sameAsShipping) {
    return null; // ✅ Do not render anything if same as shipping
  }

  return (
    <SectionWrapper>
      <SectionHeader stepNumber={3} title="Billing Address" description="" completed={isCompleted} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-5">
        <Controller
          name="billingCountry"
          control={control}
          rules={{ required: "Country is required" }}
          render={({ field }) => (
            <MUISelectField
              label="Select Country"
              name="billingCountry"
              value={field.value}
              onChange={(e) => {
                const id = e.target.value;
                field.onChange(id);
                setBillingIndex(id);
              }}
              options={(billingCountries || []).map((addr) => ({
                value: addr.id.toString(),
                label: addr.name,
              }))}
            />
          )}
        />

        <div className="relative">
          <TextField label="Postal Code" name="postalcode" placeholder="W1A 1AA" register={register} required errors={errors} />
          <button
            type="button"
            onClick={handleSearch}
            className={`absolute right-3 transform -translate-y-1/2 text-white bg-violet-700 px-3 py-1 rounded cursor-pointer w-32 flex items-center justify-center ${
              errors.postalcode ? "top-2/4" : "top-2/3"
            }`}
            disabled={addressSearchLoading}
          >
            {addressSearchLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  ease: "linear",
                }}
                className="w-6 h-6 border-4 border-t-transparent border-primary rounded-full text-white"
              />
            ) : (
              <span className="flex items-center">
                <FaSearch className="inline-block me-2" />
                Search
              </span>
            )}
          </button>
        </div>

        {!addressSearchLoading && addressOptions.length > 0 && (
          <MUISelectField
            label="Select Your Address"
            name="addressSelect"
            value={selectedIndex}
            onChange={(e) => {
              const idx = e.target.value;
              const selected = addressOptions[idx];
              setSelectedIndex(idx);

              setValue("addressone", selected.line_1 || "", { shouldValidate: true });
              setValue("addresstwo", selected.line_2 || "", { shouldValidate: true });
              setValue("city", selected.town_or_city || "", { shouldValidate: true });
              setValue("state", selected.county || "", { shouldValidate: true });
            }}
            options={addressOptions.map((addr, idx) => ({
              value: idx,
              label: addr.formatted_address.join(", "),
            }))}
          />
        )}

        <TextField label="Address 1" name="addressone" placeholder="123 Main Street" register={register} required errors={errors} />
        <TextField label="Address 2" name="addresstwo" placeholder="Flat 14" register={register} errors={errors} />
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
  );
}
