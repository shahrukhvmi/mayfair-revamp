import React from "react";
import { useWatch } from "react-hook-form";
import { FiCheck } from "react-icons/fi";
import SectionWrapper from "./SectionWrapper";
import SectionHeader from "./SectionHeader";

const ProductConsent = ({ register, errors, control, isCompleted }) => {
  const termsAccepted = useWatch({ control, name: "terms" }) || false;

  return (
    <SectionWrapper>
      <SectionHeader
        stepNumber={3}
        title="Product Consent"
        description="Please review the important information below regarding your treatment."
        completed={isCompleted}
      />

      <div className="px-3">


        {/* Consent List */}
        <ul className="list-disc list-inside space-y-3 text-gray-800 text-sm mb-8 leading-relaxed font-inter my-3">
          <li>If you are ordering a higher dose of Wegovy, you have started on the low doses and have titrated up to the higher dose.</li>
          <li>Wegovy once-weekly injections should be taken ONCE a week on the same day each week.</li>
          <li>Wegovy should be stored in the fridge when not in use (2°C to 8°C). It may be stored unrefrigerated for up to 30 days at a temperature not above 30°C and then the pen must be discarded.</li>
          <li>If you are a woman of childbearing age, you will take necessary precautions to avoid pregnancy while using this medication or for two months after stopping the treatment.</li>
          <li>If you are a woman with obesity or overweight and are using oral contraceptives, you should consider using a barrier method (e.g., condom) or switch to non-oral contraception for 4 weeks after starting Wegovy and after each dose increase.</li>
          <li>I confirm that I have read and understood the Patient Information Leaflet.</li>
          <li>I confirm that I have read, understood, and accept Mayfair Weight Loss Clinic’s Terms and Conditions.</li>
        </ul>

        {/* Terms Checkbox */}
        <div className="mt-8 font-inter">
          <label className="flex items-center gap-3 text-[15px] text-gray-900 font-semibold cursor-pointer select-none">
            {/* Custom Checkbox */}
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                {...register("terms", { required: true })}
                className="peer w-6 h-6 cursor-pointer appearance-none rounded-full border-2 border-gray-300 bg-white 
              checked:bg-violet-600 checked:border-violet-600 focus:outline-none transition-all duration-300
              checked:shadow-md checked:shadow-violet-300"
              />
              {/* Check Icon */}
              {termsAccepted && (
                <FiCheck size={16} className="text-white absolute" />
              )}
            </div>

            {/* Checkbox Label */}
            <span className="leading-snug">
              I confirm that I have read, understood and accept all of the above information.
            </span>
          </label>

          {/* Error Message */}
          {errors?.terms && (
            <p className="text-xs text-red-600 mt-2">
              You must accept the terms to continue.
            </p>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default ProductConsent;
