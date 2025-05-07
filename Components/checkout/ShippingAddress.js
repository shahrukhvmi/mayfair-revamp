import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { useRouter } from "next/router";
import useShipmentCountries from "@/store/useShipmentCountriesStore";
import { RiRadioButtonFill } from "react-icons/ri";
import { IoRadioButtonOff } from "react-icons/io5";

const api = new Client("_UFb05P76EyMidU1VHIQ_A42976");

export default function ShippingAddress({ isCompleted, onComplete }) {
  const [showLoader, setShowLoader] = useState(false);
  const [manual, setManual] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState("");

  const [shippingIndex, setShippingIndex] = useState("");

  const { shipping, setShipping, setBillingSameAsShipping, setBilling } = useShippingOrBillingStore();
  const { shipmentCountries } = useShipmentCountries();

  console.log(shipmentCountries, "shipmentCountries");

  console.log(shipping, "shipping");

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
      shippingCountry: "",
      same_as_shipping: false,
    },
  });

  // ✅ Watch all values and save in store

  const router = useRouter();

  const sameAsShippingValue = watch("same_as_shipping");

  useEffect(() => {
    setBillingSameAsShipping(sameAsShippingValue);
  }, [sameAsShippingValue, setBillingSameAsShipping]);

  useEffect(() => {
    if (!shipping || !shipmentCountries?.length) return;

    setValue("postalcode", shipping.postalcode || "");
    setValue("addressone", shipping.addressone || "");
    setValue("addresstwo", shipping.addresstwo || "");
    setValue("city", shipping.city || "");
    setValue("state", shipping.state || "");

    // ✅ Set country
    const country = shipmentCountries.find((c) => c.name === shipping.country_name);
    if (country) {
      setValue("shippingCountry", country.id.toString(), { shouldValidate: true });
      setShippingIndex(country.id.toString());
    }

    // ✅ This is now directly boolean from API → true or false
    setValue("same_as_shipping", shipping.same_as_shipping ?? false);
  }, [shipping, shipmentCountries]);

  const handleSearch = async () => {
    const postal = watch("postalcode");
    if (!postal) return alert("Please enter a postal code.");

    try {
      const result = await api.find(postal);
      if (result && result.addresses?.addresses?.length) {
        setAddressOptions(result.addresses.addresses);
        setManual(true);
      }
    } catch (error) {
      console.error("API error:", error);
      alert("Something went wrong while fetching addresses.");
    }
  };

  const onSubmit = async (data) => {
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setShowLoader(false);

    const selectedCountry = shipmentCountries.find((c) => c.id.toString() === shippingIndex);

    // ✅ Save shipping info
    setShipping({
      id: selectedCountry?.id || "",
      country_name: selectedCountry?.name || "",
      country_price: selectedCountry?.price || "",
      postalcode: data.postalcode,
      addressone: data.addressone,
      addresstwo: data.addresstwo,
      city: data.city,
      state: data.state,
      same_as_shipping: data.same_as_shipping, // ✅ ADD THIS LINE
    });

    if (data?.same_as_shipping == true) {
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
    }

    // ✅ Save billingSameAsShipping state
    // API gives same_as_shipping as 1/0 but we use boolean in zustand so true/false
    setBillingSameAsShipping(data.same_as_shipping);

    onComplete();
  };

  return (
    <>
      <SectionWrapper>
        <SectionHeader stepNumber={2} title="Shipping Address" description="" completed={isCompleted} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-5">
          <Controller
            name="shippingCountry"
            control={control}
            rules={{ required: "Country is required" }}
            render={({ field }) => (
              <MUISelectField
                label="Select Country"
                name="shippingCountry"
                value={field.value}
                onChange={(e) => {
                  const id = e.target.value;
                  field.onChange(id); // ✅ set id to RHF
                  setShippingIndex(id); // ✅ set id to local state
                }}
                options={(shipmentCountries || []).map((addr) => ({
                  value: addr.id.toString(), // ✅ Use country id as value
                  label: addr.name,
                }))}
              />
            )}
          />

          <TextField label="Postal Code" name="postalcode" placeholder="W1A 1AA" register={register} required errors={errors} />
          <button type="button" onClick={handleSearch} className="text-white bg-violet-700 px-3 py-1 rounded">
            <FaSearch className="inline-block me-2" /> Search
          </button>

          {addressOptions.length > 0 && (
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

          <Controller
            name="same_as_shipping"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => field.onChange(!field.value)}>
                {field.value ? <RiRadioButtonFill className="text-violet-700 text-xl" /> : <IoRadioButtonOff className="text-gray-400 text-xl" />}
                <span className="text-gray-700">Make billing address same as shipping</span>
              </div>
            )}
          />

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
