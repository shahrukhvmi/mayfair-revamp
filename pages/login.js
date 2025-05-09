import useSignupStore from "@/store/signupStore";
import TextField from "@/Components/TextField/TextField";
import { useForm } from "react-hook-form";
import NextButton from "@/Components/NextButton/NextButton";
import { useRouter } from "next/navigation";
import PageLoader from "@/Components/PageLoader/PageLoader";
import { useEffect, useState } from "react";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import PageAnimationWrapper from "@/Components/PageAnimationWrapper/PageAnimationWrapper";
import StepsHeader from "@/layout/stepsHeader";
import BackButton from "@/Components/BackButton/BackButton";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useUserDataStore from "@/store/userDataStore";
import useAuthStore from "@/store/authStore";
import Fetcher from "@/library/Fetcher";
import { Login } from "@/api/loginApi";

export default function LoginScreen() {
    const [showLoader, setShowLoader] = useState(false);
    const { userData, setUserData } = useUserDataStore();
    const { token, setToken } = useAuthStore();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        trigger,
        formState: { errors, isValid },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const { setEmail } = useSignupStore();

    const loginMutation = useMutation(Login, {
        onSuccess: (data) => {
            const user = data?.data?.data;
            if (user) {

                setUserData(user);
                setToken(user.token);
                toast.success("Login Successfully");
                Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user.token}`;
                setShowLoader(false);
                router.push("/dashboard");
            }
        },
        onError: (error) => {
            console.log(error?.response?.data?.errors, "sdseds");

            const errorObj = error?.response?.data?.errors;

            if (errorObj && typeof errorObj === "object") {
                const firstErrorKey = Object.keys(errorObj);
                const firstErrorMessage = errorObj[firstErrorKey]; // Get first message of first key

                toast.error(firstErrorMessage);
            } else {
                toast.error("Something went wrong.");
            }

            setShowLoader(false);
        },

    });

    useEffect(() => {
        const storedEmail = getValues("email");
        const storedPassword = getValues("password");

        if (storedEmail || storedPassword) {
            trigger(["email", "password"]);
        }
    }, [getValues, trigger]);

    const onSubmit = (data) => {
        setShowLoader(true);
        const formData = {
            email: data.email,
            password: data.password,
            company_id: 1,
        };
        setEmail(data?.email);
        loginMutation.mutate(formData);
    };

    return (
        <>
            <StepsHeader />
            <FormWrapper
                heading="Login"
                description="In order for our doctors to assess your suitability for treatment, you will be asked to complete a short medical questionnaire at the next step."
                percentage="0"
            >
                <PageAnimationWrapper>
                    <div className={`relative ${showLoader ? "pointer-events-none cursor-not-allowed" : ""}`}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <TextField
                                label="Email Address"
                                name="email"
                                placeholder="Email Address"
                                type="email"
                                register={register}
                                required
                                errors={errors}

                            />

                            <TextField
                                label="Password"
                                name="password"
                                placeholder="Password"
                                type="password"
                                register={register}
                                required
                                errors={errors}

                            />

                            <NextButton label="Login" disabled={!isValid} type="submit" />
                            <BackButton label="Back" className="mt-2" onClick={() => router.back()} />
                        </form>

                        {showLoader && (
                            <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">
                                <PageLoader />
                            </div>
                        )}
                    </div>
                </PageAnimationWrapper>
            </FormWrapper>
        </>
    );
}
