import React from "react";
import { useForm } from "react-hook-form";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import NextButton from "@/Components/NextButton/NextButton";
import ProgressBar from "@/Components/ProgressBar/ProgressBar";
import { FiCheck } from "react-icons/fi";
import { useRouter } from "next/navigation";

const options = ["Yes", "No", "None of the above"];

export default function Step3() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        formState: { isValid },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            ethnicity: "",
        },
    });

    const selectedOption = watch("ethnicity");

    const onSubmit = (data) => {
        console.log("Form Data:", data);
        router.push("/step4");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAF0] px-4 sm:px-6 lg:px-8">
            <FormWrapper width="my-32">
                <ProgressBar percentage={35} />
                <div className="p-6 sm:p-10">
                    <h2 className="text-xl font-semibold text-center text-black mb-3">
                        Confirm Ethnicity for BMI

                    </h2>
                    <p className="text-sm text-center text-gray-700 mb-6">
                        People of certain ethnicities may be suitable for treatment at a lower BMI than others, if appropriate. Does one of the following options describe your ethnic group or background?                    </p>


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {[
                            "South Asian",
                            "Chinese",
                            "Other Asian",
                            "Middle Eastern",
                            "Black African",
                            "African-Caribbean",
                        ].map((ethnicity, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 bg-white shadow-sm border border-gray-200 rounded-xl px-4 py-3
                                 hover:shadow-md transition"
                            >
                                {/* w-2.5 h-2.5 */}
                                <div className=" mt-2 bg-violet-700 rounded-full"></div>
                                <p className="text-sm text-gray-800">{ethnicity}</p>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            {options.map((option) => {
                                const isSelected = selectedOption === option;
                                return (
                                    <label
                                        key={option}
                                        className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition-all cursor-pointer text-sm sm:text-base
                      ${isSelected
                                                ? "bg-green-50 border-black text-black font-medium"
                                                : "border-gray-300 text-gray-900 hover:bg-gray-50"
                                            }`}
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-sm flex items-center justify-center border transition
                        ${isSelected
                                                    ? "bg-violet-700 border-violet-800 text-white"
                                                    : "border-gray-400 bg-white"
                                                }`}
                                        >
                                            {isSelected && <FiCheck className="w-4 h-4" />}
                                        </div>
                                        <input
                                            type="radio"
                                            value={option}
                                            {...register("ethnicity", { required: true })}
                                            className="hidden"
                                        />
                                        {option}
                                    </label>
                                );
                            })}
                        </div>

                        <NextButton disabled={!isValid} label="Next" />
                    </form>
                </div>
            </FormWrapper>
        </div>
    );
}
