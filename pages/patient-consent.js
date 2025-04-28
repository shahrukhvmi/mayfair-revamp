import { useForm } from "react-hook-form";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import ProgressBar from "@/Components/ProgressBar/ProgressBar";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/navigation";
import { FaRegCheckCircle } from "react-icons/fa";
import TextField from "@/Components/TextField/TextField";
import StepsHeader from "@/layout/stepsHeader";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import { useState } from "react";
import PageLoader from "@/Components/PageLoader/PageLoader";
import { FiCheck } from "react-icons/fi";
import { FaRegCircle } from "react-icons/fa";
import { FaDotCircle } from "react-icons/fa";
import BackButton from "@/Components/BackButton/BackButton";

export default function PatientConsent() {
  const [showLoader, setShowLoader] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      consent: "",
    },
  });

  const router = useRouter();

  const onSubmit = async (data) => {
    console.log("Form Data:", data);
    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 2s
    router.push("/gp-detail");
  };

  return (
    <>
      <StepsHeader />

      <FormWrapper heading={"Patient Consent"} percentage={"85"}>
        <PageAnimationWrapper>
          <div className="pt-2 pb-6 px-2">
            <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  {/* Top Consent with Custom Circle */}
                  <div className="flex items-start">
                    {/* Hidden Checkbox */}
                    <input type="checkbox" id="consent" value="confirmed" {...register("consent", { required: true })} className="hidden" />

                    {/* Custom Circle + Text */}
                    <label htmlFor="consent" className="flex items-start gap-2 cursor-pointer">
                      {/* Circle Icon */}
                      {watch("consent") ? (
                        <FaDotCircle className="text-violet-700 w-9 h-9 mt-1" />
                      ) : (
                        <FaRegCircle className="text-violet-700 w-9 h-9 mt-1" />
                      )}

                      {/* Text */}
                      <span className="text-sm font-semibold text-gray-700">
                        Please confirm you have read and understand the below information related to the treatment prescribed. I confirm and
                        understand that:
                      </span>
                    </label>
                  </div>

                  {/* Consent Bullet Points */}
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 mt-4">
                    <li>Treatments are sub-cutaneous injections and I feel comfortable administering this medication myself.</li>
                    <li>
                      Treatments are prescription-only medication and therefore you must inform your GP/doctor that you have been prescribed this and
                      that you are taking it.
                    </li>
                    <li>I confirm that I understand how to store the medication and dispose of the needles responsibly.</li>
                    <li>
                      I confirm that I have tried to lose weight by diet, exercise and lifestyle changes. I understand that the weight loss injections
                      must be used with a healthy diet and exercise regime.
                    </li>
                    <li>
                      I confirm that I will seek medical attention and/or inform my GP if I develop any adverse reactions or symptoms, including but
                      not limited to the following: abdominal pain, swelling or a lump in the throat, difficulty swallowing, symptoms of low blood
                      sugar (such as sweating, shakiness, feeling weak), nausea and vomiting which does not settle, an allergic reaction, palpitations
                      or changes to my mood.
                    </li>
                    <li>
                      I confirm I understand that Prescription Only Medication cannot be returned, unless there is a manufacturer recall on the
                      product or if you have received it faulty. I agree that a faulty product, as per our terms and conditions, will be returned to
                      Mayfair Weight Loss Clinic’s pharmacy in its received form for manufacturer testing.
                    </li>
                    <li>
                      I confirm that no guarantees have been given for weight loss and I understand that results will vary from individual to
                      individual.
                    </li>
                    <li>
                      I confirm that I understand that prescribed medication may cause side effects such as, but not limited to nausea, diarrhoea,
                      headaches, lack of appetite, bloating, constipation, and abdominal pain.
                    </li>
                    <li>
                      I understand that if the weight loss injections are ever frozen or stored in temperatures above 30 °C then they must be
                      discarded.
                    </li>
                    <li>
                      I confirm that I have read, understood and accept Mayfair Weight Loss Clinic’s{" "}
                      <a href="#" className="text-blue-600 underline">
                        Terms and Conditions
                      </a>
                      .
                    </li>
                  </ul>

                  {/* Show error if not accepted */}
                  {errors.consent && <p className="text-sm text-red-500 mt-2">You must confirm before proceeding.</p>}
                </div>

                {/* Submit Button */}
                <NextButton label="Next" disabled={!isValid} />
                <BackButton label="Back" className="mt-2" onClick={() => router.back()} />
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
