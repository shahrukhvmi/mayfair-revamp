import { useForm } from "react-hook-form";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import ProgressBar from "@/Components/ProgressBar/ProgressBar";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/navigation";
import { FaCheck, FaRegCheckCircle, FaSearch } from "react-icons/fa";
import TextField from "@/Components/TextField/TextField";
import StepsHeader from "@/layout/stepsHeader";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import { useState } from "react";
import PageLoader from "@/Components/PageLoader/PageLoader";
import { FiCheck } from "react-icons/fi";
import { FaRegCircle } from "react-icons/fa";
import { FaDotCircle } from "react-icons/fa";
import BackButton from "@/Components/BackButton/BackButton";

export default function GpDetail() {
  const [showLoader, setShowLoader] = useState(false);
  const [manual, setManual] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      gpDetails: "",
      postalCode: "",
    },
  });

  const gpDetails = watch("gpDetails");
  const gepTreatMent = watch("gepTreatMent");
  const postalCode = watch("postalCode");
  const searchClicked = watch("searchClicked", false);
  const addressOptions = watch("addressOptions", []);
  const selectedAddress = watch("selectedAddress", null);

  console.log(isValid, "isValid");

  const router = useRouter();

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    router.push("/confirmation-summary");
  };

  return (
    <>
      <StepsHeader />

      <FormWrapper heading={"GP Details"} percentage={"90"}>
        <PageAnimationWrapper>
          <div className="pt-2 pb-6 px-2">
            <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
              <div>
                <h1 className="text-gray-500 text-base">
                  Would you like us to inform your GP about this consultation and any prescribed treatments?
                </h1>
                <div className="flex mt-4 gap-2">
                  {/* GP DETAIL Yes */}
                  <label
                    htmlFor="yes"
                    className={
                      gpDetails === "yes"
                        ? "w-1/2 flex items-center gap-3 px-4 py-3 border rounded-lg transition-all cursor-pointer text-sm bg-green-50 border-black text-black font-medium"
                        : "w-1/2 flex items-center gap-3 px-4 py-3 border rounded-lg transition-all cursor-pointer text-sm border-gray-300 text-gray-900 hover:bg-gray-50"
                    }
                  >
                    <div
                      className={`w-5 h-5 rounded-sm flex items-center justify-center border transition
                            ${gpDetails === "yes" ? "bg-violet-700 border-violet-800 text-white" : "border-gray-400 bg-white"}`}
                    >
                      {gpDetails === "yes" && <FiCheck className="w-4 h-4" />}
                    </div>{" "}
                    Yes
                    <input type="radio" value="yes" id="yes" {...register("gpDetails", { required: true })} className="hidden" />
                  </label>

                  {/* GP DETAIL NO */}
                  <label
                    className={
                      gpDetails === "no"
                        ? "w-1/2 flex items-center gap-3 px-4 py-3 border rounded-lg transition-all cursor-pointer text-sm bg-green-50 border-black text-black font-medium"
                        : "w-1/2 flex items-center gap-3 px-4 py-3 border rounded-lg transition-all cursor-pointer text-sm border-gray-300 text-gray-900 hover:bg-gray-50"
                    }
                  >
                    <div
                      className={`w-5 h-5 rounded-sm flex items-center justify-center border transition
                        ${gpDetails === "no" ? "bg-violet-700 border-violet-800 text-white" : "border-gray-400 bg-white"}`}
                    >
                      {gpDetails === "no" && <FiCheck className="w-4 h-4" />}
                    </div>
                    No
                    <input type="radio" value="no" {...register("gpDetails", { required: true })} className="hidden" />
                  </label>
                </div>
                {errors.gpDetails && <p className="text-red-500 mt-2">{errors.gpDetails.message}</p>}
              </div>

              {/* Conditional Rendering for Yes */}
              {gpDetails === "yes" && (
                <div>
                  <p className="text-gray-500 mt-6 sm:mt-8 text-sm sm:text-base">
                    Do you consent for us to inform your GP about the treatment we have provided?
                  </p>

                  {/* Options */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-3 sm:mt-4">
                    <label
                      className={
                        gepTreatMent === "yes"
                          ? "w-1/2 flex items-center gap-3 px-4 py-3 border rounded-lg transition-all cursor-pointer text-sm bg-green-50 border-black text-black font-medium"
                          : "w-1/2 flex items-center gap-3 px-4 py-3 border rounded-lg transition-all cursor-pointer text-sm border-gray-300 text-gray-900 hover:bg-gray-50"
                      }
                    >
                      <div
                        className={`w-5 h-5 rounded-sm flex items-center justify-center border transition
                        ${gepTreatMent === "yes" ? "bg-violet-700 border-violet-800 text-white" : "border-gray-400 bg-white"}`}
                      >
                        {gepTreatMent === "yes" && <FiCheck className="w-4 h-4" />}
                      </div>
                      Yes
                      <input type="radio" value="yes" {...register("gepTreatMent", { required: true })} className="hidden" />
                    </label>

                    <label
                      className={
                        gepTreatMent === "no"
                          ? "w-1/2 flex items-center gap-3 px-4 py-3 border rounded-lg transition-all cursor-pointer text-sm bg-green-50 border-black text-black font-medium"
                          : "w-1/2 flex items-center gap-3 px-4 py-3 border rounded-lg transition-all cursor-pointer text-sm border-gray-300 text-gray-900 hover:bg-gray-50"
                      }
                    >
                      <div
                        className={`w-5 h-5 rounded-sm flex items-center justify-center border transition
                        ${gepTreatMent === "no" ? "bg-violet-700 border-violet-800 text-white" : "border-gray-400 bg-white"}`}
                      >
                        {gepTreatMent === "no" && <FiCheck className="w-4 h-4" />}
                      </div>
                      No
                      <input type="radio" value="no" {...register("gepTreatMent", { required: true })} className="hidden" />
                    </label>
                  </div>

                  {/* Error Message */}
                  {errors.gepTreatMent && <p className="text-red-500 mt-2 text-sm sm:text-base">{errors.gepTreatMent.message}</p>}
                </div>
              )}

              {/* Conditional Rendering for No */}
              {gpDetails === "no" && (
                <div className="bg-[#FFF3CD] px-4 py-4 mt-6 text-gray-700 rounded shadow-md transform transition-all ease-in-out duration-500 hover:scale-105 hover:bg-[#FFEBB5]">
                  <p className="text-sm md:text-base">
                    You should inform your doctor of any medication you take. If you would like us to email you a letter to forward onto your doctor,
                    please contact us.
                  </p>
                </div>
              )}

              {/* Conditional Rendering for Additional Fields */}
              {gpDetails === "yes" && gepTreatMent === "yes" && (
                <div className="space-y-6 mt-6">
                  {/* Postal Code Field with Search Button inside */}
                  <div className="relative text-gray-700">
                    {/* Postal Code Field */}
                    <TextField
                      label="Postal Code"
                      className="text-gray-700"
                      name="postalCode"
                      placeholder="W1A 1AA"
                      register={register}
                      required
                      errors={errors}
                    />

                    {/* Search Button (Inside the Field) */}
                    <button
                      type="button"
                      onClick={() => console.log("Searching for postal code:", watch("postalCode"))}
                      className={`absolute right-3 transform -translate-y-1/2  cursor-pointer flex items-center bg-violet-700 text-white px-2 py-1 rounded ${
                        errors.postalCode ? "top-2/4" : "top-2/3"
                      }`}
                    >
                      <FaSearch className="w-4 h-4 me-2" /> Search
                    </button>
                  </div>

                  {/* Toggle Button */}
                  <div className="text-sm text-right">
                    <button type="button" onClick={() => setManual(!manual)} className="text-black font-bold underline transition cursor-pointer">
                      {manual ? "Hide manual address entry" : "Enter your address manually"}
                    </button>
                  </div>

                  {/* Manual Address Fields */}
                  {manual && (
                    <div className="space-y-4">
                      <TextField label="Address 1" name="address" placeholder="123 Main Street" register={register} required errors={errors} />
                      <TextField label="Address 2" name="address" placeholder="Flat 14" register={register} required errors={errors} />
                      <TextField label="City" name="city" placeholder="e.g., London" register={register} required errors={errors} />
                      <TextField label="State" name="state" placeholder="Essex" register={register} required errors={errors} />
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <NextButton label="Next" disabled={!isValid} onClick={onSubmit} className="mt-5" />
              <BackButton label="Back" className="mt-2" onClick={() => router.back()} />

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
