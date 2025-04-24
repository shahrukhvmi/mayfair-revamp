import { useForm } from "react-hook-form";
import { Inter } from "next/font/google";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import ProgressBar from "@/Components/ProgressBar/ProgressBar";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/navigation";
import { FaRegCheckCircle } from "react-icons/fa";
import TextField from "@/Components/TextField/TextField";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function Step1() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isValid },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            dob: "",
            gender: "",
        },
    });

    const router = useRouter();

    const onSubmit = (data) => {
        console.log("Form Data:", data);
        router.push("step2"); // next step
    };

    return (
        <div
            className={`${inter.className} min-h-screen flex items-center justify-center bg-[#FAFAF0] p-6 sm:p-12`}
        >
            <FormWrapper>
                <ProgressBar percentage={15} />
                <div className="p-6">
                    <h1 className="text-xl font-semibold text-center mb-2 text-black">
                        What is your date of birth?
                    </h1>
                    <p className="text-sm text-green-900 text-center mb-6">
                        Please ensure that this matches your ID.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>

                            <TextField
                                label="date of birth"
                                name="dob"
                                type="date"
                                placeholder="DD/MM/YYYY"
                                register={register}
                                required
                                errors={errors}
                            />
                          
                            {errors.dob && (
                                <p className="text-red-500 text-sm mt-1">Date of birth is required</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-lg font-semibold text-center mb-2 text-green-900">
                                What sex were you assigned at birth?
                            </h1>
                            {/* <p className="text-sm text-green-900 text-center mb-6">
                                Why do we ask about your sex at birth?
                            </p> */}

                            <div className="space-y-3">
                                {["Female", "Male"].map((option) => {
                                    const selected = watch("gender") === option;
                                    return (
                                        <label
                                            key={option}
                                            className={`relative block w-full border text-center py-3 rounded-md cursor-pointer transition-all duration-150 font-medium
            ${selected
                                                    ? "bg-green-100 border-green-800 text-green-900 scale-[1.01] shadow-sm"
                                                    : "bg-white border-green-800 text-green-800 hover:bg-green-50"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                value={option}
                                                {...register("gender", { required: true })}
                                                className="hidden"
                                            />
                                            
                                            {option}
                                            {selected && (
                                                <span className="absolute top-1/2 right-4 -translate-y-1/2 text-green-800 text-lg">
                                                    <FaRegCheckCircle />

                                                </span>
                                            )}
                                        </label>
                                    );
                                })}
                            </div>

                            {errors.gender && (
                                <p className="text-red-500 text-sm mt-1 text-center">Please select your gender</p>
                            )}
                        </div>



                        <NextButton label="Next" disabled={!isValid} />
                    </form>
                </div>
            </FormWrapper>
        </div>
    );
}
