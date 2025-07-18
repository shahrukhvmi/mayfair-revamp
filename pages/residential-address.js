import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Inter } from "next/font/google";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import TextField from "@/Components/TextField/TextField";
import StepsHeader from "@/layout/stepsHeader";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import PageLoader from "@/Components/PageLoader/PageLoader";
import BackButton from "@/Components/BackButton/BackButton";
import usePatientInfoStore from "@/store/patientInfoStore";
import { Client } from "getaddress-api";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import MUISelectField from "@/Components/SelectField/SelectField";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";

const api = new Client("_UFb05P76EyMidU1VHIQ_A42976");
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function ResidentialAddress() {
  const [showLoader, setShowLoader] = useState(false);
  const [manual, setManual] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [searching, setSearching] = useState(false);
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);

  const { patientInfo, setPatientInfo } = usePatientInfoStore();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      postalCode: "",
      address1: "",
      address2: "",
      city: "",
      country: "",
    },
  });

  const router = useRouter();
  // 👇 Watch individual address fields
  const address1 = watch("address1");
  const city = watch("city");
  const country = watch("country");

  // 👇 Enable Next only when required fields are filled
  const isNextEnabled =
    !!address1?.trim() && !!city?.trim() && !!country?.trim();

  const handleSearch = async () => {
    setAddressSearchLoading(true);
    const postal = watch("postalCode");
    if (!postal) {
      // alert("Please enter a postcode.");
      setAddressSearchLoading(false);
    }

    try {
      const result = await api.find(postal);
      console.log(result, "result");

      if (result && result.addresses?.addresses?.length) {
        setAddressOptions(result.addresses.addresses);
        setManual(true);
        setAddressSearchLoading(false);
      } else {
        setAddressSearchLoading(false);
        toast.error("Invalid Post code");
      }
    } catch (error) {
      console.error("API error:", error);
      alert("Something went wrong while fetching addresses.");
      setAddressSearchLoading(false);
    }
  };

  useEffect(() => {
    if (patientInfo?.address) {
      setValue("postalCode", patientInfo.address.postalcode || "");
      setValue("address1", patientInfo.address.addressone || "");
      setValue("address2", patientInfo.address.addresstwo || "");
      setValue("city", patientInfo.address.city || "");
      setValue("country", patientInfo.address.country || "");

      if (
        patientInfo.address.addressone ||
        patientInfo.address.addresstwo ||
        patientInfo.address.city ||
        patientInfo.address.country
      ) {
        setManual(true);
      }
    }
  }, [patientInfo]);

  const onSubmit = async (data) => {
    const fullAddress = {
      postalcode: data.postalCode,
      addressone: data.address1,
      addresstwo: data.address2,
      city: data.city,
      state: "",
      country: data.country,
    };

    setPatientInfo({ ...patientInfo, address: fullAddress });
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push("/preferred-phone-number");
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}residential-address/`} />
      <StepsHeader />
      <FormWrapper
        heading="Mention Your Residential Address"
        description="Required for age verification purpose"
        percentage="40"
      >
        <PageAnimationWrapper>
          <div>
            <div
              className={`relative ${
                showLoader ? "pointer-events-none cursor-not-allowed" : ""
              }`}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-6">
                  <div className="relative">
                    <TextField
                      label="Post code"
                      name="postalCode"
                      placeholder="W1A 1AA"
                      register={register}
                      required
                      errors={errors}
                    />
                    <button
                      type="button"
                      onClick={handleSearch}
                      className={`bold-medium-font absolute right-3 transform -translate-y-1/2 cursor-pointer flex items-center bg-primary text-white px-2 py-1 rounded w-32 justify-center ${
                        errors.postalCode ? "top-2/4" : "top-2/3"
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

                  {addressOptions.length > 0 && (
                    <MUISelectField
                      label="Select Your Address"
                      name="addressSelect"
                      value={selectedIndex}
                      required
                      onChange={(e) => {
                        const idx = e.target.value;
                        const selected = addressOptions[idx];
                        setSelectedIndex(idx);

                        // ✅ Set values and revalidate to clear any existing errors
                        setValue("address1", selected.line_1 || "", {
                          shouldValidate: true,
                        });
                        setValue("address2", selected.line_2 || "", {
                          shouldValidate: true,
                        }); // optional but still validate
                        setValue("city", selected.town_or_city || "", {
                          shouldValidate: true,
                        });
                        setValue("country", selected.country || "", {
                          shouldValidate: true,
                        });
                      }}
                      options={addressOptions.map((addr, idx) => ({
                        value: idx,
                        label: addr.formatted_address.join(", "),
                      }))}
                      error={errors?.addressSelect?.message}
                    />
                  )}

                  <div className="text-sm sm:text-right text-center">
                    <button
                      type="button"
                      onClick={() => setManual(!manual)}
                      className="bold-font paragraph underline transition cursor-pointer"
                    >
                      {manual
                        ? "Hide manual address entry"
                        : "Enter your address manually"}
                    </button>
                  </div>

                  {manual && (
                    <div className="space-y-4">
                      <TextField
                        label="Address"
                        name="address1"
                        placeholder="123 Main Street"
                        register={register}
                        required
                        errors={errors}
                      />
                      <TextField
                        label="Address 2"
                        name="address2"
                        placeholder="Flat 14"
                        register={register}
                        errors={errors}
                      />
                      <TextField
                        label="Town / City"
                        name="city"
                        placeholder="e.g., London"
                        register={register}
                        required
                        errors={errors}
                      />
                      <TextField
                        label="Country"
                        name="country"
                        placeholder="England"
                        register={register}
                        required
                        errors={errors}
                      />
                    </div>
                  )}
                </div>

                <NextButton label="Next" disabled={!isNextEnabled} />
                <BackButton
                  label="Back"
                  className="mt-2"
                  onClick={() => router.push("/personal-details")}
                />
              </form>

              {showLoader && (
                <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">
                  <PageLoader />
                </div>
              )}
            </div>
          </div>
        </PageAnimationWrapper>
      </FormWrapper>
    </>
  );
}
