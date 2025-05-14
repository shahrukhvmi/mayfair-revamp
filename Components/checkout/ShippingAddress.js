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
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const api = new Client("_UFb05P76EyMidU1VHIQ_A42976");

export default function ShippingAddress({ isCompleted, onComplete }) {
  const [showLoader, setShowLoader] = useState(false);
  const [manual, setManual] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);

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
      first_name: "",
      last_name: "",
    },
  });

  // ✅ Watch all values and save in store

  const router = useRouter();

  const sameAsShippingValue = watch("same_as_shipping");

  useEffect(() => {
    if (sameAsShippingValue) {
      const selectedCountry = shipmentCountries.find((c) => c.id.toString() === shippingIndex);

      setBilling({
        id: selectedCountry?.id || "",
        country_name: selectedCountry?.name || "",
        country_price: selectedCountry?.price || "",
        postalcode: shipping?.postalcode,
        addressone: shipping?.addressone,
        addresstwo: shipping?.addresstwo,
        first_name: shipping?.first_name,
        last_name: shipping?.last_name,
        city: shipping?.city,
        state: shipping?.state,
        same_as_shipping: true,
      });
    }
  }, [sameAsShippingValue, shipping, shippingIndex, shipmentCountries]);

  useEffect(() => {
    setBillingSameAsShipping(sameAsShippingValue);
  }, [sameAsShippingValue, setBillingSameAsShipping]);

  useEffect(() => {
    if (!shipping || !shipmentCountries?.length) return;

    setValue("postalcode", shipping.postalcode || "");
    setValue("addressone", shipping.addressone || "");
    setValue("addresstwo", shipping.addresstwo || "");
    if (shipping.first_name) {
      setValue("first_name", shipping.first_name);
    }
    if (shipping.last_name) {
      setValue("last_name", shipping.last_name);
    }
    setValue("city", shipping.city || "");
    setValue("state", shipping.state || "");

    // ✅ Find country by name
    const country = shipmentCountries.find((c) => c.name === shipping.country_name);
    if (country) {
      setValue("shippingCountry", country.id.toString(), { shouldValidate: true });
      setShippingIndex(country.id.toString());

      // ✅ ONLY UPDATE if price or name is different → to avoid infinite loop
      if (shipping.country_price !== country.price || shipping.country_name !== country.name) {
        setShipping({
          ...shipping,
          country_name: country.name,
          country_price: country.price,
        });
      }
    }

    setValue("same_as_shipping", shipping.same_as_shipping ?? false);
  }, [shipping?.country_name, shipmentCountries]);

  const handleSearch = async () => {
    setAddressSearchLoading(true);
    const postal = watch("postalcode");
    if (!postal) {
      alert("Please enter a postal code.");
      setAddressSearchLoading(false);
    }

    try {
      const result = await api.find(postal);
      if (result && result.addresses?.addresses?.length) {
        setAddressOptions(result.addresses.addresses);
        setManual(true);
        setAddressSearchLoading(false);
      } else {
        setAddressSearchLoading(false);
        toast.error("Invalid Postal Code");
      }
    } catch (error) {
      setAddressSearchLoading(false);
      console.log("API error:", error);
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
      first_name: data.first_name,
      last_name: data.last_name,
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

  useEffect(() => {
    const subscription = watch((values) => {
      const selectedCountry =
        shipmentCountries.find((c) => c.id.toString() === values.shippingCountry) || shipmentCountries.find((c) => c.id.toString() === shippingIndex);

      setShipping({
        id: selectedCountry?.id || "",
        country_name: selectedCountry?.name || "",
        country_price: selectedCountry?.price || "",
        postalcode: values.postalcode || "",
        addressone: values.addressone || "",
        addresstwo: values.addresstwo || "",
        first_name: values.first_name || "",
        last_name: values.last_name || "",
        city: values.city || "",
        state: values.state || "",
        same_as_shipping: values.same_as_shipping ?? false,
      });
    });

    return () => subscription.unsubscribe();
  }, [watch, shipmentCountries, shippingIndex, setShipping]);

  return (
    <>
      <SectionWrapper>
        <SectionHeader stepNumber={2} title="Shipping Address" description="" completed={isCompleted} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-5">
          <TextField label="First Name" name="first_name" placeholder="Enter your first name" register={register} required errors={errors} />
          <TextField label="Last Name" name="last_name" placeholder="Enter your last name" register={register} errors={errors} />

          <Controller
            name="shippingCountry"
            control={control}
            rules={{ required: "Country is required" }}
            render={({ field }) => (
              <MUISelectField
                label="Select Country"
                name="shippingCountry"
                value={field.value}
                required
                onChange={(e) => {
                  const id = e.target.value;
                  field.onChange(id); // ✅ set id to RHF
                  setShippingIndex(id); // ✅ set id to local state
                  // ✅ Find selected country
                  const selectedCountry = shipmentCountries.find((c) => c.id.toString() === id);

                  if (selectedCountry) {
                    // ✅ Update shipping immediately when user changes country
                    setShipping({
                      ...shipping,
                      id: selectedCountry.id,
                      country_name: selectedCountry.name,
                      country_price: selectedCountry.price, // ✅ Update price
                    });
                  }
                }}
                options={(shipmentCountries || []).map((addr) => ({
                  value: addr.id.toString(), // ✅ Use country id as value
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
              className={`absolute right-3 transform -translate-y-1/2 text-white bg-primary px-3 py-1 rounded cursor-pointer w-28 flex items-center justify-center ${
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
                  className="w-6 h-6 border-4 border-t-transparent rounded-full text-white"
                />
              ) : (
                <span className="flex items-center reg-font">
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

          <Controller
            name="same_as_shipping"
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => field.onChange(!field.value)}>
                {field.value ? <RiRadioButtonFill className="text-primary text-xl" /> : <IoRadioButtonOff className="text-gray-400 text-xl" />}
                <span className="text-gray-700 reg-font">Make billing address same as shipping</span>
              </div>
            )}
          />

          <NextButton label="Continue" disabled={!isValid} />
        </form>

        {showLoader && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded ">
            <PageLoader />
          </div>
        )}
      </SectionWrapper>
    </>
  );
}
