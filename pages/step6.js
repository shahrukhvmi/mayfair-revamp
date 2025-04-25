import React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FiCheck } from "react-icons/fi";

import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import NextButton from "@/Components/NextButton/NextButton";
import ProgressBar from "@/Components/ProgressBar/ProgressBar";
import StepsHeader from "@/layout/stepsHeader";
import BackButton from "@/Components/BackButton/BackButton";

const Step6 = () => {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        formState: { isValid },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            personalUse: "",
            decisionCapacity: "",
            confirmConsent: "",
        },
    });

    const personalUse = watch("personalUse");
    const decisionCapacity = watch("decisionCapacity");
    const showConsentBox = personalUse === "yes" && decisionCapacity === "yes";

    const onSubmit = (data) => {
        console.log("Form Data:", data);
        router.push("/step7");
    };

    return (
        <>
            <StepsHeader />
            <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
                <FormWrapper width="max-w-2xl">
                    <ProgressBar percentage={35} />

                    <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl mt-6">
                        <h2 className="text-xl font-semibold text-center text-gray-900 mb-6">
                            Patient Acknowledgment
                        </h2>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            {/* Question 1 */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-800">
                                    Are you purchasing this medication for yourself, of your own free will and the medicine is for your personal use only?
                                </p>
                                <div className="flex gap-4">
                                    {["yes", "no"].map((value) => (
                                        <label
                                            key={value}
                                            className={`flex items-center justify-center gap-2 w-20 py-2 px-3 rounded-lg border text-sm font-semibold transition-all duration-200
                        ${personalUse === value
                                                    ? value === "yes"
                                                        ? "bg-green-50 border-green-600 text-green-800 shadow"
                                                        : "bg-gray-100 border-violet-600 text-violet-700 shadow"
                                                    : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                value={value}
                                                {...register("personalUse", { required: true })}
                                                className="hidden"
                                            />
                                            {value.toUpperCase()}
                                            {personalUse === value && <FiCheck className="ml-1" />}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Question 2 */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-800">
                                    Do you believe you have the ability to make healthcare decisions for yourself?
                                </p>
                                <div className="flex gap-4">
                                    {["yes", "no"].map((value) => (
                                        <label
                                            key={value}
                                            className={`flex items-center justify-center gap-2 w-20 py-2 px-3 rounded-lg border text-sm font-semibold transition-all duration-200
                        ${decisionCapacity === value
                                                    ? value === "yes"
                                                        ? "bg-green-50 border-green-600 text-green-800 shadow"
                                                        : "bg-gray-100 border-violet-600 text-violet-700 shadow"
                                                    : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                value={value}
                                                {...register("decisionCapacity", { required: true })}
                                                className="hidden"
                                            />
                                            {value.toUpperCase()}
                                            {decisionCapacity === value && <FiCheck className="ml-1" />}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Consent Box */}
                            {showConsentBox && (
                                <div className=" bg-white space-y-4">
                                    <label className="flex items-start gap-2 text-sm font-semibold text-gray-800 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            value="confirmed"
                                            {...register("confirmConsent", { required: true })}
                                            className="mt-1 accent-violet-600"
                                        />
                                        <span>Do you confirm that:</span>
                                    </label>

                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                                        <li>
                                            You consent for your medical information to be assessed by the clinical team at Mayfair Weight Loss Clinic and its pharmacy and to be prescribed medication.
                                        </li>
                                        <li>
                                            You consent to an age and ID check when placing your first order.
                                        </li>
                                        <li>
                                            You will answer all questions honestly and accurately, and understand that it is an offence to provide false information.
                                        </li>
                                        <li>
                                            You have capacity to understand all about the condition and medication information we have provided and that you give fully informed consent to the treatment option provided.
                                        </li>
                                        <li>
                                            You understand that the treatment or medical advice provided is based on the information you have provided.
                                        </li>
                                    </ul>
                                </div>
                            )}


                            <div className="my-5 flex justify-between mx-3">
                                <BackButton label="Back" onClick={() => router.back()} />
                                <NextButton disabled={!isValid} label="I Confirm" />
                            </div>
                        </form>
                    </div>
                </FormWrapper>
            </div>
        </>
    );
};

export default Step6;
