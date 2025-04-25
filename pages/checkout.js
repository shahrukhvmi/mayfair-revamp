import { useForm } from "react-hook-form";
import StepPersonalDetails from "@/components/checkout/StepPersonalDetails";
import StepPayment from "@/components/checkout/StepPayment";
import StepAddress from "@/Components/checkout/StepAddress";

export default function Checkout() {
    const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onChange" });

    const onSubmit = (data) => {
        console.log("Collected Data:", data);
    };

    return (
        <>
        <


            <form onSubmit={handleSubmit(onSubmit)} className="bg-[#fdfcf5]">
                <div className="max-w-2xl mx-auto px-4 py-10">


                    <StepPersonalDetails register={register} errors={errors} />
                    <StepAddress register={register} errors={errors} />
                    <StepPayment register={register} errors={errors} />

                    <button type="submit" className="mt-4 bg-green-700 text-white w-full py-3 rounded-md font-semibold">
                        Confirm £189 payment
                    </button>
                </div>
            </form>

        </>
    );
}
