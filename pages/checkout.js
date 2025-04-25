import { useForm } from "react-hook-form";

import { useState } from "react";
import StepsHeader from "@/layout/stepsHeader";
import NextButton from "@/Components/NextButton/NextButton";
import StepPersonalDetails from "@/Components/checkout/StepPersonalDetails";
import StepAddress from "@/Components/checkout/StepAddress";
import StepPayment from "@/Components/checkout/StepPayment";

const Checkout = () => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isValid },
    } = useForm({ mode: "onChange" });

    const [step, setStep] = useState(1);

    const personalDetailsFilled = watch("firstName") && watch("lastName") && watch("email") && watch("mobile") && watch("password") && watch("confirmPassword");
    const addressFilled = watch("address");

    const handleNextStep = () => {
        if (step === 1 && personalDetailsFilled) setStep(2);
        else if (step === 2 && addressFilled) setStep(3);
    };

    const handleCheckOut = () => {
        alert("Thank You ✔");
    };

    const onSubmit = (data) => {
        console.log("Collected Data:", data);
    };

    return (
        <>
            <StepsHeader />

            <form onSubmit={handleSubmit(onSubmit)} className="bg-[#fdfcf5] w-full">
                <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">
                    {step >= 1 && (
                        <StepPersonalDetails register={register} errors={errors} />
                    )}
                    {step >= 2 && (
                        <StepAddress register={register} errors={errors} />
                    )}
                    {step >= 3 && (
                        <StepPayment register={register} errors={errors} />
                    )}

                    {step < 3 ? (
                        <NextButton
                            onClick={handleNextStep}
                            disabled={(step === 1 && !personalDetailsFilled) || (step === 2 && !addressFilled)}
                            label="Continue"
                        />
                    ) : (
                        <NextButton onClick={handleCheckOut} label="Confirm payment" />
                    )}
                </div>
            </form>
        </>
    );
};

export default Checkout;
