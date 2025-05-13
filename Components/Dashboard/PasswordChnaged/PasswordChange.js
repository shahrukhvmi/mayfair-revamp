import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";

import TextField from "@/Components/TextField/TextField";
import NextButton from "@/Components/NextButton/NextButton";
import { ChangePassword } from "@/api/ChangePassword";
import PasswordStrengthBar from "react-password-strength-bar";

const PasswordChange = () => {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isValid },
    } = useForm({ mode: "onChange" });

    const newPassword = watch("newpassword");

    const changePasswordMutation = useMutation(ChangePassword, {
        onSuccess: () => {
            toast.success("Password changed successfully.");
            reset();
            setIsLoading(false);
        },
        onError: (error) => {
            const errorObj = error?.response?.data?.errors;
            const message =
                errorObj && typeof errorObj === "object"
                    ? Object.values(errorObj)?.[0]
                    : "Something went wrong.";
            toast.error(message);
            setIsLoading(false);
        },
    });

    const onSubmit = (data) => {
        setIsLoading(true);
        changePasswordMutation.mutate({
            old_password: data.old_password,
            newpassword: data.newpassword,
            newpassword_confirmation: data.newpassword_confirmation,
        });
    };

    return (
        <div className="p-6 sm:bg-[#F9FAFB] sm:min-h-screen sm:rounded-md sm:shadow-md my-5 sm:me-5">
            <div>
                <h1 className="text-3xl niba-bold-font heading mb-2">Update Password</h1>
                <p className="paragraph mb-6 reg-font">
                    Ensure your account is using a long, random password to stay secure.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-1/2">
                            <TextField
                                type="password"
                                label="Current Password"
                                name="old_password"
                                register={register}
                                validation={{ required: "Current password is required" }}
                                errors={errors}
                            />
                        </div>
                        <div className="w-full md:w-1/2">
                            <TextField
                                type="password"
                                label="New Password"
                                name="newpassword"
                                register={register}
                                validation={{
                                    required: "New password is required",
                                    minLength: {
                                        value: 10,
                                        message: "Password must be at least 10 characters",
                                    },
                                    // validate: (value) => {
                                    //     if (!/[A-Z]/.test(value)) return "Must include uppercase letter";
                                    //     if (!/[a-z]/.test(value)) return "Must include lowercase letter";
                                    //     if (!/[0-9]/.test(value)) return "Must include a number";
                                    //     if (!/[!@#$%^&*(),.?\":{}|<>]/.test(value))
                                    //         return "Must include special character";
                                    //     return true;
                                    // },
                                }}
                                errors={errors}
                            />

                            <div className="mt-2">
                                <PasswordStrengthBar password={newPassword || ""} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <div className="w-full md:w-1/2">
                            <TextField
                                type="password"
                                label="Confirm Password"
                                name="newpassword_confirmation"
                                register={register}
                                validation={{
                                    required: "Please confirm your password",
                                    validate: (v) => v === newPassword || "Passwords do not match",
                                }}
                                errors={errors}
                            />
                        </div>
                        <div className="w-full md:w-1/2 flex justify-start">
                            <NextButton
                                type="submit"
                                disabled={!isValid || isLoading}
                                label={isLoading ? "Saving..." : "Save"}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordChange;
