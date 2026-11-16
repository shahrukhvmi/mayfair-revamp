import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import NextButton from "@/Components/NextButton/NextButton";
import TextField from "@/Components/TextField/TextField";
import { useRouter } from "next/navigation";
import StepsHeader from "@/layout/stepsHeader";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import PageLoader from "@/Components/PageLoader/PageLoader";
import BackButton from "@/Components/BackButton/BackButton";
import SwitchTabs from "@/Components/Tabs/SwitchTabs";
import useBmiStore from "@/store/bmiStore";
import BmiTextField from "@/Components/BmiTextField/BmiTextField";
import useReorder from "@/store/useReorderStore";
import useLastBmi from "@/store/useLastBmiStore";
import { BsInfoCircle } from "react-icons/bs";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useReorderBackProcessStore from "@/store/useReorderBackProcess";
import { isFemalePatient } from "@/utils/patientChecks";
import useReturning from "@/store/useReturningPatient";
import usePatientInfoStore from "@/store/patientInfoStore";
import { completeStep } from "@/library/mayfairAnalytics";
import BmiConsentModal from "@/Components/Modal/BmiConsentModal";
import useBmiConsentStore, { hasBmiConsent } from "@/store/bmiConsentStore";
import useSignupStore from "@/store/signupStore";
import { Ruler, Scale } from "lucide-react";

const MeasurementHeader = ({ id, icon: Icon, title, tabs, selectedTab, onTabChange }) => (
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f2fc] text-[#47317c]">
        <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
      </span>
      <h2
        id={id}
        className="inter-semibold-font text-[17px] leading-snug tracking-[-0.01em] text-slate-900 max-sm:text-[18px]"
      >
        {title}
      </h2>
    </div>
    <div className="w-full sm:w-[220px]">
      <SwitchTabs
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={onTabChange}
        ariaLabel={`Select ${title.toLowerCase()} unit`}
      />
    </div>
  </div>
);

const validateRange = (value, min, max, wholeOnly, message) => {
  const num = Number(value);
  if (isNaN(num)) return message;
  if (wholeOnly && !Number.isInteger(num)) return message;
  if (num < min || num > max) return message;
  return true;
};

export default function CalculateBmi() {
  
  const { isReturningPatient } = useReturning();
  const [heightUnit, setHeightUnit] = useState("metrics");
  const [weightUnit, setWeightUnit] = useState("metrics");
  const [showLoader, setShowLoader] = useState(false);
  const [heightUnitKey, setHeightUnitKey] = useState(""); // Will be "imperial" or "metrics"
  const [weightUnitKey, setWeightUnitKey] = useState("");
  const { reorder, reorderStatus } = useReorder();
  const { lastBmi } = useLastBmi();
  const { reorderBackProcess } = useReorderBackProcessStore();
  const { patientInfo } = usePatientInfoStore();

  const { bmi, setBmi } = useBmiStore();
  const router = useRouter();
  const { consent, setConsent } = useBmiConsentStore();
  const { email } = useSignupStore();
  const showConsent = !hasBmiConsent(consent, email);

  const handleConsentAccept = (consentContent) => {
    setConsent({
      ...consentContent,
      accepted: true,
      acceptedAt: new Date().toISOString(),
      email: email || "",
    });
  };

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      heightFt: "",
      heightIn: "",
      heightCm: "",
      weightSt: "",
      weightLbs: "",
      weightKg: "",
    },
  });

  const heightFt = watch("heightFt");
  const heightIn = watch("heightIn");
  const heightCm = watch("heightCm");

  const weightSt = watch("weightSt");
  const weightLbs = watch("weightLbs");
  const weightKg = watch("weightKg");

  // Load values from store
  useEffect(() => {
    setValue("heightFt", bmi?.ft);
    setValue("heightIn", bmi?.inch);
    setValue("heightCm", bmi?.cm);
    // setValue("weightSt", bmi?.stones);
    // setValue("weightLbs", bmi?.pound);
    // setValue("weightKg", bmi?.kg);

    // Detect units based on which fields are filled
    if (bmi?.cm) {
      setHeightUnit("metrics");
      setHeightUnitKey("metrics");
    } else if (bmi?.ft || bmi?.inch) {
      setHeightUnit("imperial");
      setHeightUnitKey("imperial");
    }

    if (bmi?.kg) {
      setWeightUnit("metrics");
      setWeightUnitKey("metrics");
    } else if (bmi?.stones || bmi?.pound) {
      setWeightUnit("imperial");
      setWeightUnitKey("imperial");
    }

    if (
      bmi?.ft ||
      bmi?.inch ||
      bmi?.cm ||
      bmi?.stones ||
      bmi?.pound ||
      bmi?.kg
    ) {
      // Weight is never prefilled, so it is left out: validating it here would
      // show "required" errors before the patient has typed anything.
      trigger(["heightFt", "heightIn", "heightCm"]);
    }
  }, [bmi, setValue, trigger]);

  const isFormValid = () => {
    const heightValid =
      heightUnit === "imperial"
        ? !errors.heightFt && !errors.heightIn
        : !errors.heightCm;
    const weightValid =
      weightUnit === "metrics"
        ? !errors.weightKg
        : !errors.weightSt && !errors.weightLbs;

    return heightValid && weightValid;
  };

  const handleNext = async () => {
    const fields = [
      ...(heightUnit === "imperial" ? ["heightFt", "heightIn"] : ["heightCm"]),
      ...(weightUnit === "imperial" ? ["weightSt", "weightLbs"] : ["weightKg"]),
    ];

    // Validate
    const isValid = await trigger(fields);
    if (!isValid) return;

    // ⭐ Convert before calculating
    if (heightUnit === "metrics") {
      // cm to ft/in
      const cm = parseFloat(watch("heightCm")) || 0;
      const totalInches = cm / 2.54;
      const ft = Math.floor(totalInches / 12);
      const inch = totalInches % 12;

      setValue("hiddenCm", cm);
      setValue("heightFt", ft ? Math.round(ft) : "");
      setValue("heightIn", inch ? Math.round(inch) : "");
    } else {
      // ft/in to cm
      const ft = parseFloat(watch("heightFt")) || 0;
      const inch = parseFloat(watch("heightIn")) || 0;
      const cm = ft * 30.48 + inch * 2.54;

      setValue("hiddenCm", cm);
      setValue("heightCm", cm ? Math.round(cm) : "");
    }

    if (weightUnit === "metrics") {
      // kg to st/lbs
      const kg = parseFloat(watch("weightKg")) || 0;
      const totalLbs = kg / 0.453592;
      const st = Math.floor(totalLbs / 14);
      const lbs = totalLbs % 14;

      setValue("hiddenKg", kg);
      setValue("weightSt", st ? Math.round(st) : "");
      setValue("weightLbs", lbs ? Math.round(lbs) : "");
    } else {
      // st/lbs to kg
      const st = parseFloat(watch("weightSt")) || 0;
      const lbs = parseFloat(watch("weightLbs")) || 0;
      const kg = st * 6.35029 + lbs * 0.453592;

      setValue("hiddenKg", kg);
      setValue("weightKg", kg ? Math.round(kg) : "");
    }

    // After conversion → calculate
    handleSubmit(async (data) => {
      const formValues = getValues();

      const ft = parseFloat(formValues.heightFt) || 0;
      const inch = parseFloat(formValues.heightIn) || 0;
      const cm = ft * 30.48 + inch * 2.54;

      const st = parseFloat(formValues.weightSt) || 0;
      const lbs = parseFloat(formValues.weightLbs) || 0;
      const kg = st * 6.35029 + lbs * 0.453592;

      const heightCm = parseFloat(data?.hiddenCm) || cm;
      const weightKg = parseFloat(data?.hiddenKg) || kg;

      const heightInMeters = heightCm / 100;

      let calculatedBmi = 0;
      let bmiLevel = "";

      if (heightInMeters > 0 && weightKg > 0) {
        calculatedBmi = weightKg / (heightInMeters * heightInMeters);
        calculatedBmi = +calculatedBmi.toFixed(1);

        if (calculatedBmi < 18.5) {
          bmiLevel = "Underweight";
        } else if (calculatedBmi >= 18.5 && calculatedBmi < 25) {
          bmiLevel = "Normal";
        } else if (calculatedBmi >= 25 && calculatedBmi < 30) {
          bmiLevel = "Overweight";
        } else {
          bmiLevel = "Obese";
        }
      }

      setBmi({
        ...bmi,
        ft: data?.heightFt,
        inch: data?.heightIn,
        cm: data?.heightCm,
        stones: data?.weightSt,
        pound: data?.weightLbs,
        kg: data?.weightKg,
        bmi: calculatedBmi,
        hiddenInch: data?.heightIn,
        hiddenLb: data?.weightLbs,
        hiddenCm: data?.hiddenCm || cm,
        hiddenKg: data?.hiddenKg || kg,
        height_unit: heightUnitKey || bmi?.height_unit, // default to metrics if blank
        weight_unit: weightUnitKey || bmi?.weight_unit, // default to metrics if blank
      });

      completeStep();
      setShowLoader(true);

      router.push("/bmi-detail");
    })();
  };

  const handleHeightTabChange = (value) => {
    if (value === "metrics") {
      const ft = parseFloat(watch("heightFt")) || 0;
      const inch = parseFloat(watch("heightIn")) || 0;
      const cm = ft * 30.48 + inch * 2.54;
      setValue("hiddenCm", cm);
      setValue("heightCm", cm ? Math.round(cm) : "");
    } else {
      const cm = parseFloat(watch("heightCm")) || 0;
      const totalInches = cm / 2.54;
      const ft = Math.floor(totalInches / 12);
      const inch = totalInches % 12;
      setValue("hiddenCm", cm);
      setValue("heightFt", ft ? Math.round(ft) : "");
      setValue("heightIn", inch ? Math.round(inch) : "");
    }
    setHeightUnit(value);
    setHeightUnitKey(value);
    setTimeout(() => {
      void trigger(
        value === "imperial" ? ["heightFt", "heightIn"] : ["heightCm"],
      );
    }, 0);
  };

  const handleWeightTabChange = (value) => {
    if (value === "metrics") {
      const st = parseFloat(watch("weightSt")) || 0;
      const lbs = parseFloat(watch("weightLbs")) || 0;
      const kg = st * 6.35029 + lbs * 0.453592;
      setValue("hiddenKg", kg);
      setValue("weightKg", kg ? Math.round(kg) : "");
    } else {
      const kg = parseFloat(watch("weightKg")) || 0;
      const totalLbs = kg / 0.453592;
      const st = Math.floor(totalLbs / 14);
      const lbs = totalLbs % 14;
      setValue("hiddenKg", kg);
      setValue("weightSt", st ? Math.round(st) : "");
      setValue("weightLbs", lbs ? Math.round(lbs) : "");
    }
    setWeightUnit(value);
    setWeightUnitKey(value);
    setTimeout(() => {
      void trigger(
        value === "imperial" ? ["weightSt", "weightLbs"] : ["weightKg"],
      );
    }, 0);
  };

  // On Blur → Convert and sync hidden values
  const handleHeightBlur = () => {
    const ft = parseFloat(watch("heightFt")) || 0;
    const inch = parseFloat(watch("heightIn")) || 0;
    const cm = ft * 30.48 + inch * 2.54;

    setValue("hiddenCm", cm);
    setValue("heightCm", cm ? Math.round(cm) : "");
  };

  const handleCmBlur = () => {
    const cm = parseFloat(watch("heightCm")) || 0;
    const totalInches = cm / 2.54;
    const ft = Math.floor(totalInches / 12);
    const inch = totalInches % 12;

    setValue("hiddenCm", cm);
    setValue("heightFt", ft ? Math.round(ft) : "");
    setValue("heightIn", inch ? Math.round(inch) : "");
  };

  const handleWeightBlur = () => {
    const st = parseFloat(watch("weightSt")) || 0;
    const lbs = parseFloat(watch("weightLbs")) || 0;
    const kg = st * 6.35029 + lbs * 0.453592;

    setValue("hiddenKg", kg);
    setValue("weightKg", kg ? Math.round(kg) : "");
  };

  const handleKgBlur = () => {
    const kg = parseFloat(watch("weightKg")) || 0;
    const totalLbs = kg / 0.453592;
    const st = Math.floor(totalLbs / 14);
    const lbs = totalLbs % 14;

    setValue("hiddenKg", kg);
    setValue("weightSt", st ? Math.round(st) : "");
    setValue("weightLbs", lbs ? Math.round(lbs) : "");
  };

  const back = () => {
    if (reorderBackProcess == true) {
      router.push(isFemalePatient(patientInfo) ? "/pregnancy-check" : "/re-order");
    } else if (isReturningPatient) {
      router.push("/preferred-phone-number");
    } else {
      router.push("/confirm-ethnicity");
    }
  };

  return (
    <>
      <MetaLayout canonical={`${meta_url}calculate-bmi/`} />
      <div inert={showConsent ? "" : undefined}>
      <StepsHeader />
      <FormWrapper
        heading="What is your height and weight?"
        description="Your Body Mass Index (BMI) is an important factor in assessing your eligibility for treatment. Please enter your height and weight below to allow us to calculate your BMI."
        percentage="70"
        headerClassName="max-sm:!px-3.5"
        headingClassName="max-sm:!tracking-[-0.035em]"
      >
        <PageAnimationWrapper>
          <div>
            <div
              className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""
                }`}
            >
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                <section aria-labelledby="height-heading">
                  <MeasurementHeader
                    id="height-heading"
                    icon={Ruler}
                    title="Height"
                    tabs={[
                      { label: "cm", value: "metrics" },
                      { label: "ft/inch", value: "imperial" },
                    ]}
                    selectedTab={heightUnit}
                    onTabChange={handleHeightTabChange}
                  />
                  {heightUnit === "imperial" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <BmiTextField
                        required
                        label="Feet (ft)"
                        name="heightFt"
                        disabled={isReturningPatient}
                        readOnly={isReturningPatient}
                        fieldProps={register("heightFt", {
                          required: "This field is required",
                          validate: (value) =>
                            validateRange(
                              value,
                              4,
                              10,
                              true,
                              "Only numbers from 4 to 10 are allowed"
                            ),
                          onChange: (e) => {
                            if (e.target.value !== "")
                              setHeightUnitKey("imperial");
                            void trigger("heightFt");
                          },
                        })}
                        errors={errors}
                        onBlur={handleHeightBlur}
                      />
                      <BmiTextField
                        required
                        label="Inches (in)"
                        name="heightIn"
                        disabled={isReturningPatient}
                        readOnly={isReturningPatient}
                        fieldProps={register("heightIn", {
                          required: "This field is required",
                          validate: (value) =>
                            validateRange(
                              value,
                              0,
                              11,
                              true,
                              "Only valid numbers (0–11) are allowed"
                            ),
                          onChange: (e) => {
                            if (e.target.value !== "")
                              setHeightUnitKey("imperial");
                            void trigger("heightIn");
                          },
                        })}
                        errors={errors}
                        onBlur={handleHeightBlur}
                      />
                    </div>
                  ) : (
                    <BmiTextField
                      required
                      label="Centimetres (cm)"
                      name="heightCm"
                      disabled={isReturningPatient}
                      readOnly={isReturningPatient}
                      fieldProps={register("heightCm", {
                        required: "This field is required",
                        validate: (value) => {
                          const num = Number(value);
                          if (!Number.isInteger(num))
                            return "Only whole numbers from 122 to 300 are allowed";
                          if (num < 122 || num > 300)
                            return "Only whole numbers from 122 to 300 are allowed";
                          return true;
                        },
                        onChange: (e) => {
                          if (e.target.value !== "")
                            setHeightUnitKey("metrics");
                          void trigger("heightCm");
                        },
                      })}
                      errors={errors}
                      onBlur={handleCmBlur}
                    />
                  )}
                </section>

                <section
                  aria-labelledby="weight-heading"
                  className="border-t border-slate-100 pt-6"
                >
                  <MeasurementHeader
                    id="weight-heading"
                    icon={Scale}
                    title="Current weight"
                    tabs={[
                      { label: "kg", value: "metrics" },
                      { label: "st/lb", value: "imperial" },
                    ]}
                    selectedTab={weightUnit}
                    onTabChange={handleWeightTabChange}
                  />
                  <>
                    {weightUnit === "imperial" ? (
                      <div className="grid grid-cols-2 gap-4">
                        <BmiTextField
                          required
                          label="Stone (st)"
                          name="weightSt"
                          fieldProps={register("weightSt", {
                            required: "This field is required",
                            validate: (value) =>
                              validateRange(
                                value,
                                4,
                                80,
                                false,
                                "Only valid numbers (4–80) are allowed"
                              ),
                            onChange: (e) => {
                              if (e.target.value !== "")
                                setWeightUnitKey("imperial");
                              void trigger("weightSt");
                            },
                          })}
                          errors={errors}
                          onBlur={handleWeightBlur}
                        />
                        <BmiTextField
                          required
                          label="Pounds (lb)"
                          name="weightLbs"
                          fieldProps={register("weightLbs", {
                            required: "This field is required",
                            validate: (value) =>
                              validateRange(
                                value,
                                0,
                                20,
                                false,
                                "Only valid numbers (0–20) are allowed"
                              ),
                            onChange: (e) => {
                              if (e.target.value !== "")
                                setWeightUnitKey("imperial");
                              void trigger("weightLbs");
                            },
                          })}
                          errors={errors}
                          onBlur={handleWeightBlur}
                        />
                      </div>
                    ) : (
                      <BmiTextField
                        required
                        label="Kilograms (kg)"
                        name="weightKg"
                        fieldProps={register("weightKg", {
                          required: "This field is required",
                          validate: (value) =>
                            validateRange(
                              value,
                              40,
                              500,
                              true,
                              "Only whole numbers from 40 to 500 are allowed"
                            ),
                          onChange: (e) => {
                            if (e.target.value !== "")
                              setWeightUnitKey("metrics");
                            void trigger("weightKg");
                          },
                        })}
                        errors={errors}
                        onBlur={handleKgBlur}
                      />
                    )}

                    {lastBmi ? (
                      lastBmi?.weight_unit == "metrics" ||
                        lastBmi?.weight_unit == "metric" ? (
                        <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 px-3.5 py-3">
                          <p className="inter-reg-font flex items-center gap-2 whitespace-nowrap text-[13px] max-sm:text-[clamp(12px,3.7vw,14px)] text-amber-800">
                            <BsInfoCircle className="shrink-0" />
                            <span>
                              Your previous recorded weight was{" "}
                              <span className="inter-semibold-font whitespace-nowrap">
                                {lastBmi?.kg} kg
                              </span>
                            </span>
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 px-3.5 py-3">
                          <p className="inter-reg-font flex items-center gap-2 whitespace-nowrap text-[13px] max-sm:text-[clamp(12px,3.7vw,14px)] text-amber-800">
                            <BsInfoCircle className="shrink-0" />
                            <span>
                              Your previous recorded weight was{" "}
                              <span className="inter-semibold-font whitespace-nowrap">
                                {lastBmi?.stones} st & {lastBmi?.pound} lbs
                              </span>
                            </span>
                          </p>
                        </div>
                      )
                    ) : (
                      ""
                    )}
                  </>
                </section>

                <NextButton loading={showLoader}
                  label="Next"
                  onClick={handleNext}
                  type="button"
                  disabled={!isFormValid()}
                />

                <BackButton label="Back" className="mt-2" onClick={back} />
              </form>
{/* 
              {showLoader && (
                <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">
                  <PageLoader />
                </div>
              )} */}
            </div>
          </div>
        </PageAnimationWrapper>
      </FormWrapper>
      </div>
      <BmiConsentModal isOpen={showConsent} onAccept={handleConsentAccept} onBack={back} />
    </>
  );
}
