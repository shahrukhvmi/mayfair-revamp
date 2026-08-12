import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Info, Loader2, MapPin, Search } from "lucide-react";

import TextField from "@/Components/TextField/TextField";
import PageLoader from "@/Components/PageLoader/PageLoader";
import NextButton from "@/Components/NextButton/NextButton";
import MUISelectField from "@/Components/SelectField/SelectField";
import { getProfileData, sendProfileData } from "@/api/myProfileApi";

const SEARCH_BUTTON_CLASS = [
  "inter-medium-font inline-flex w-full cursor-pointer items-center justify-center gap-2",
  "rounded-sm border border-[#47317c] bg-[#47317c] px-4 py-4 mt-2",
  "text-[12px] text-white",
  "transition-all duration-150 hover:bg-[#392765]",
  "disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300 disabled:shadow-none",
].join(" ");

const UPDATE_BUTTON_CLASS = [
  "inter-medium-font !min-h-[46px] !rounded-xl",
  "!border-[#47317c] !bg-[#47317c] !px-6 !py-3",
  "!text-[12px] hover:!bg-[#392765]",
].join(" ");

export default function Shipping({ shipmentCountries = [] }) {
  const [showLoader, setShowLoader] = useState(false);

  const [addressOptions, setAddressOptions] = useState([]);

  const [selectedIndex, setSelectedIndex] = useState("");

  const [shippingIndex, setShippingIndex] = useState("");

  const [addressSearchLoading, setAddressSearchLoading] = useState(false);

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
      shippingCountry: "",
    },
  });

  const postalCodeValue = watch("postalcode");

  const getProfileDataMutation = useMutation(getProfileData, {
    onSuccess: (response) => {
      const shippingData = response?.data?.profile?.shipping;

      if (!shippingData) {
        return;
      }

      setValue("postalcode", shippingData?.postalcode || "");

      setValue("addressone", shippingData?.addressone || "");

      setValue("addresstwo", shippingData?.addresstwo || "");

      setValue("city", shippingData?.city || "");

      const country = shipmentCountries.find(
        (item) => item?.name === shippingData?.country,
      );

      if (country) {
        const countryId = country.id.toString();

        setValue("shippingCountry", countryId, {
          shouldValidate: true,
        });

        setShippingIndex(countryId);
      }
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to load profile data.",
      );
    },
  });

  useEffect(() => {
    if (shipmentCountries.length > 0) {
      getProfileDataMutation.mutate();
    }
  }, [shipmentCountries]);

  const handleSearch = async () => {
    const postcode = postalCodeValue?.trim();

    if (!postcode) {
      toast.error("Please enter a post code.");

      return;
    }

    setAddressSearchLoading(true);

    try {
      const response = await fetch(
        `https://api.ideal-postcodes.co.uk/v1/postcodes/${encodeURIComponent(
          postcode,
        )}?api_key=${process.env.NEXT_PUBLIC_IDEAL_POSTCODES_KEY}`,
      );

      const result = await response.json();

      if (Array.isArray(result?.result) && result.result.length > 0) {
        setAddressOptions(result.result);
        setSelectedIndex("");
      } else {
        setAddressOptions([]);

        toast.error("Invalid post code.");
      }
    } catch (error) {
      console.error("Postcode API error:", error);

      toast.error("Something went wrong while fetching addresses.");
    } finally {
      setAddressSearchLoading(false);
    }
  };

  const sendProfileDataMutation = useMutation(sendProfileData, {
    onSuccess: () => {
      setShowLoader(false);

      toast.success("Shipping updated successfully!");
    },

    onError: (error) => {
      setShowLoader(false);

      toast.error(error?.response?.data?.message || "Something went wrong.");
    },
  });

  const onSubmit = (formValues) => {
    setShowLoader(true);

    const selectedCountry = shipmentCountries.find(
      (country) => country?.id?.toString() === shippingIndex,
    );

    const formData = {
      shipping: true,
      country_name: selectedCountry?.name || "",
      postalcode: formValues.postalcode,
      addressone: formValues.addressone,
      addresstwo: formValues.addresstwo,
      city: formValues.city,
      state: "",
    };

    sendProfileDataMutation.mutate(formData);
  };

  return (
    <section className="relative mt-5 overflow-hidden rounded-[22px] border border-[#47317c]/10 bg-[#ffff] p-4 sm:p-5 lg:p-6">
      {/* Header */}
      <div className="flex items-start gap-3.5 border-b border-[#47317c]/[0.07] pb-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#47317c]/[0.08] text-[#47317c]">
          <MapPin size={19} strokeWidth={2} />
        </span>

        <div className="min-w-0">
          <h2 className="inter-bold-font text-[20px] leading-7 text-slate-950 sm:text-[23px]">
            Shipping information
          </h2>

          <p className="inter-reg-font mt-1.5 max-w-2xl text-[12.5px] leading-[1.7] text-slate-500 sm:text-[13px]">
            Update your shipping details — changes will apply to future orders only.


          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="address-form mt-6 space-y-5"
      >
        {/* Country */}
        <Controller
          name="shippingCountry"
          control={control}
          rules={{
            required: "Country is required",
          }}
          render={({ field }) => (
            <MUISelectField
              label="Select Country"
              name="shippingCountry"
              value={field.value}
              required
              onChange={(event) => {
                const id = event.target.value;

                field.onChange(id);
                setShippingIndex(id);

                setValue("postalcode", "");

                setValue("addressone", "");

                setValue("addresstwo", "");

                setValue("city", "");

                setAddressOptions([]);
                setSelectedIndex("");
              }}
              options={shipmentCountries.map((country) => ({
                value: country.id.toString(),
                label: country.name,
              }))}
            />
          )}
        />

        {/* Postcode and search */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_150px] sm:items-center">
          <TextField
            label="Post code"
            name="postalcode"
            register={register}
            required
            errors={errors}
          />

          <button
            type="button"
            onClick={handleSearch}
            disabled={addressSearchLoading}
            className={SEARCH_BUTTON_CLASS}
          >
            {addressSearchLoading ? (
              <>
                <Loader2 size={16} strokeWidth={2.3} className="animate-spin" />
                Searching
              </>
            ) : (
              <>
                <Search size={16} strokeWidth={2.3} />
                Search
              </>
            )}
          </button>
        </div>

        {/* Search result */}
        {postalCodeValue?.trim() &&
          !addressSearchLoading &&
          addressOptions.length > 0 && (
            <MUISelectField
              label="Select Your Address"
              name="addressSelect"
              value={selectedIndex}
              required
              onChange={(event) => {
                const index = event.target.value;

                const selected = addressOptions[index];

                setSelectedIndex(index);

                if (!selected) {
                  return;
                }

                setValue("addressone", selected?.line_1 || "", {
                  shouldValidate: true,
                });

                setValue("addresstwo", selected?.line_2 || "", {
                  shouldValidate: true,
                });

                setValue("city", selected?.post_town || "", {
                  shouldValidate: true,
                });
              }}
              options={addressOptions.map((address, index) => ({
                value: index,

                label: [
                  address?.line_1,
                  address?.line_2,
                  address?.line_3,
                  address?.post_town,
                  address?.postcode,
                ]
                  .filter(Boolean)
                  .join(", "),
              }))}
            />
          )}

        {/* Address fields */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <TextField
            label="Address"
            name="addressone"
            register={register}
            required
            errors={errors}
          />

          <TextField
            label="Address 2"
            name="addresstwo"
            register={register}
            errors={errors}
          />
        </div>

        <TextField
          label="Town / City"
          name="city"
          register={register}
          required
          errors={errors}
        />

        {/* Update */}
        <div className="!mt-9 flex justify-start border-t border-[#47317c]/[0.07] pt-5">
          <div className="w-full sm:w-auto sm:min-w-[180px]">
            <NextButton
              label="Update shipping"
              disabled={!isValid}
              className={UPDATE_BUTTON_CLASS}
            />
          </div>
        </div>
      </form>

      {/* Loader */}
      {showLoader && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[22px] bg-white/75 backdrop-blur-[2px]">
          <PageLoader />
        </div>
      )}

      <style jsx global>{`
        .address-form .MuiFormControl-root {
          width: 100%;
        }

        .address-form .MuiInputLabel-root {
          font-family: var(--inter-medium) !important;
          font-size: 13px !important;
          color: #64748b;
        }

        .address-form .MuiInputBase-root {
          min-height: 50px;
          border-radius: 14px !important;
          background: #ffffff;
          font-family: var(--inter-reg) !important;
          font-size: 13px !important;
        }

        .address-form .MuiOutlinedInput-notchedOutline {
          border-color: rgba(71, 49, 124, 0.12) !important;
        }

        .address-form
          .MuiInputBase-root:hover
          .MuiOutlinedInput-notchedOutline {
          border-color: rgba(71, 49, 124, 0.24) !important;
        }

        .address-form .Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: #47317c !important;
          border-width: 1px !important;
        }

        .address-form input,
        .address-form select,
        .address-form textarea {
          font-family: var(--inter-reg) !important;
          font-size: 13px !important;
          color: #0f172a !important;
        }

        .address-form label {
          font-family: var(--inter-medium) !important;
        }
      `}</style>
    </section>
  );
}
