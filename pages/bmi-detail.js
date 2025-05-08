import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Box, Checkbox, FormControlLabel } from "@mui/material";
import useBmiStore from "@/store/bmiStore";
import usePatientInfoStore from "@/store/patientInfoStore";
import { useRouter } from "next/navigation";
import PageLoader from "@/Components/PageLoader/PageLoader";
import StepsHeader from "@/layout/stepsHeader";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import TextField from "@/Components/TextField/TextField";
import NextButton from "@/Components/NextButton/NextButton";
import BackButton from "@/Components/BackButton/BackButton";

export default function BmiDetail() {
  const [showLoader, setShowLoader] = useState(false);
  const { bmi, setBmi } = useBmiStore();
  const { patientInfo } = usePatientInfoStore();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      checkbox1: false,
      checkbox2: false,
      noneOfTheAbove: false,
      weight_related_comorbidity_explanation: "",
    },
  });

  const checkbox1 = watch("checkbox1");
  const checkbox2 = watch("checkbox2");
  const noneOfTheAbove = watch("noneOfTheAbove");
  const explanation = watch("weight_related_comorbidity_explanation");

  const bmiValue = parseFloat(Number(bmi?.bmi).toFixed(2));
  const shouldShowCheckboxes = patientInfo?.ethnicity === "Yes" ? bmiValue >= 25.5 && bmiValue <= 27.4 : bmiValue >= 27.5 && bmiValue <= 29.9;
  const shouldShowInfoMessage = patientInfo?.ethnicity === "Yes" && bmiValue >= 27.5 && bmiValue <= 29.9;

  const isNextDisabled = shouldShowCheckboxes && (noneOfTheAbove || (!checkbox1 && !checkbox2) || (checkbox2 && !explanation?.trim()));

  const getCheckbox1Label = () => {
    return patientInfo?.ethnicity === "Yes" && bmiValue >= 25.5 && bmiValue <= 27.4
      ? "You have previously taken weight loss medication your starting (baseline) BMI was above 27.5"
      : "You have previously taken weight loss medication your starting (baseline) BMI was above 30";
  };

  // Pre-fill from bmiStore
  useEffect(() => {
    const consent = bmi?.bmiConsent;

    if (consent) {
      if (consent.previously_taking_medicine?.length) {
        setValue("checkbox1", true);
      }
      if (consent.weight_related_comorbidity?.length) {
        setValue("checkbox2", true);
      }
      if (consent.weight_related_comorbidity_explanation) {
        setValue("weight_related_comorbidity_explanation", consent.weight_related_comorbidity_explanation);
      }
      if (consent.assian_message) {
        setValue("noneOfTheAbove", true);
      }
    }
  }, [bmi, setValue]);

  // Checkbox 1 or 2 → Uncheck none of the above
  useEffect(() => {
    if ((checkbox1 || checkbox2) && noneOfTheAbove) {
      setValue("noneOfTheAbove", false);
    }
  }, [checkbox1, checkbox2, noneOfTheAbove, setValue]);

  // Checkbox 2 → Uncheck → Clear textarea
  useEffect(() => {
    if (!checkbox2) {
      setValue("weight_related_comorbidity_explanation", "");
    }
  }, [checkbox2, setValue]);

  const onSubmit = (data) => {
    const consent = {
      previously_taking_medicine: [],
      weight_related_comorbidity: [],
      weight_related_comorbidity_explanation: "",
      assian_message: shouldShowInfoMessage
        ? "As you have confirmed that you are from one of the following family backgrounds: South Asian, Chinese, Other Asian, Middle Eastern, Black African or African-Caribbean, your cardiometabolic risk occurs at a lower BMI. You are, therefore, able to proceed with a lower BMI."
        : "",
    };

    // Check if checkboxes are visible
    if (shouldShowCheckboxes) {
      // Checkbox 1 (medicine)
      if (data.checkbox1) {
        consent.previously_taking_medicine.push(getCheckbox1Label());
      }

      // Checkbox 2 (comorbidity)
      if (data.checkbox2) {
        consent.weight_related_comorbidity.push("You have at least one weight-related comorbidity (e.g. PCOS, diabetes, etc.)");

        if (data.weight_related_comorbidity_explanation) {
          consent.weight_related_comorbidity_explanation = data.weight_related_comorbidity_explanation;
        }
      }
    }

    // ✅ Save final consent state
    setBmi({
      ...bmi,
      bmiConsent: consent,
    });

    console.log("Form Submitted:", consent);

    setShowLoader(true);
    setTimeout(() => {
      router.push("/medical-questions");
    }, 500);
  };

  return (
    <>
      <StepsHeader />
      <FormWrapper heading={"Your BMI details"} percentage={"70"}>
        <PageAnimationWrapper>
          <div className="py-12 mb-5 border text-center bg-violet-100 rounded-2xl shadow">
            <h1 className="text-black text-3xl bold-font">BMI: {bmi?.bmi}</h1>
          </div>

          {shouldShowInfoMessage && (
            <div className="bg-[#FFF3CD] px-4 py-4 mt-6 mb-6 text-gray-700 rounded shadow-md">
              <p>
                As you have confirmed that you are from one of the following family backgrounds: South Asian, Chinese, Other Asian, Middle Eastern,
                Black African or African-Caribbean, your cardiometabolic risk occurs at a lower BMI. You are, therefore, able to proceed with a lower
                BMI.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative">
            {shouldShowCheckboxes && (
              <>
                {patientInfo?.ethnicity === "No" || patientInfo?.ethnicity === "Prefer not to say" ? (
                  <p className="text-gray-800 font-normal">Your BMI is between 27-29.9 which indicates you are overweight.</p>
                ) : null}
                <p className="text-gray-800 font-normal">
                  You should only continue with the consultation if you have tried losing weight through a reduced-calorie diet and increased physical
                  activity but are still struggling to lose weight and confirm that either:
                </p>

                <Box mb={1}>
                  <Controller
                    name="checkbox1"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label={getCheckbox1Label()}
                        classes={{ label: "font-medium text-gray-800" }}
                      />
                    )}
                  />
                </Box>

                <Box mb={1}>
                  <Controller
                    name="checkbox2"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label="You have at least one weight-related comorbidity (e.g. PCOS, diabetes, etc.)"
                        classes={{ label: "font-medium text-gray-800" }}
                      />
                    )}
                  />
                </Box>

                {checkbox2 && (
                  <Box mb={1}>
                    <Controller
                      name="weight_related_comorbidity_explanation"
                      control={control}
                      rules={{ required: "Explanation is required" }}
                      render={({ field }) => (
                        <TextField {...field} label="Explanation" name="weight_related_comorbidity_explanation" errors={errors} multiline rows={4} />
                      )}
                    />
                  </Box>
                )}

                <Box mb={3}>
                  <Controller
                    name="noneOfTheAbove"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              field.onChange(checked);
                              if (checked) {
                                setValue("checkbox1", false);
                                setValue("checkbox2", false);
                                setValue("weight_related_comorbidity_explanation", "");
                              }
                            }}
                          />
                        }
                        label="None of the above"
                        classes={{ label: "font-medium text-gray-800" }}
                      />
                    )}
                  />
                  {noneOfTheAbove && (
                    <p className="text-red-600 font-normal mt-2">
                      Your BMI in this range, weight loss treatment can only be prescribed if you have either previously taken weight loss medication,
                      or you have at least one weight-related medical condition.
                    </p>
                  )}
                </Box>
              </>
            )}

            <NextButton label="Next" type="submit" disabled={isNextDisabled} />
            <BackButton label="Back" className="mt-3" onClick={() => router.back()} />

            {showLoader && (
              <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg">
                <PageLoader />
              </div>
            )}
          </form>
        </PageAnimationWrapper>
      </FormWrapper>
    </>
  );
}
