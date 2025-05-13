import React, { useState } from "react";
import { useForm } from "react-hook-form";
import PasswordStrengthBar from "react-password-strength-bar";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import toast from "react-hot-toast";
import TextField from "@/Components/TextField/TextField";
import { ChangePassword } from "@/api/ChangePassword";
import { useMutation } from "@tanstack/react-query";

const PasswordChange = () => {
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isValid },
    } = useForm({ mode: "onChange" });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const currentPassword = watch("currentPassword");
    const newPassword = watch("newPassword");
    const confirmPassword = watch("confirmPassword");

    const togglePasswordVisible = (field) => {
        if (field === "currentPassword") setShowCurrentPassword((prev) => !prev);
        if (field === "newPassword") setShowNewPassword((prev) => !prev);
        if (field === "confirmPassword") setShowConfirmPassword((prev) => !prev);
    };

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
            old_password: data.currentPassword,
            newpassword: data.newPassword,
            newpassword_confirmation: data.confirmPassword,
        });
    };

    return (
        <div className="p-6 sm:bg-[#F9FAFB] sm:min-h-screen sm:rounded-md sm:shadow-md my-5 sm:me-5">
            <h1 className="text-2xl mb-2 niba-bold-font heading">Update Password</h1>
            <p className="reg-font text-gray-600 text-sm xl:w-3/4 mb-4 sm:mb-0 sm:mt-2">
                Ensure your account is using a long, random password to stay secure.
            </p>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-row flex-wrap w-full">
                    {/* Current Password */}
                    <div className="md:w-1/2 w-full relative">
                        <div className="relative">
                            <TextField
                                type={showCurrentPassword ? "text" : "password"}
                                id="currentPassword"
                                label="Current Password"
                                variant="outlined"
                                sx={{ width: "90%" }}
                                className={`u-update-password ${errors.currentPassword ? "u-update-password-error" : ""}`}
                                {...register("currentPassword", {
                                    required: "Current password is required",
                                })}
                                error={!!errors.currentPassword}
                                helperText={errors.currentPassword?.message}
                            />
                            <div
                                className="u-update-password-icon"
                                onClick={() => togglePasswordVisible("currentPassword")}
                            >
                                {showCurrentPassword ? <VscEye /> : <VscEyeClosed />}
                            </div>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="md:w-1/2 w-full relative mt-8">
                        <div className="relative">
                            <TextField
                                type={showNewPassword ? "text" : "password"}
                                id="newPassword"
                                label="New Password"
                                variant="outlined"
                                sx={{ width: "90%" }}
                                className={`u-update-password ${errors.newPassword ? "u-update-password-error" : ""}`}
                                {...register("newPassword", {
                                    required: "New password is required",
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least 8 characters long",
                                    },
                                    validate: {
                                        hasUpperCase: (v) => /[A-Z]/.test(v) || "Must include an uppercase letter",
                                        hasLowerCase: (v) => /[a-z]/.test(v) || "Must include a lowercase letter",
                                        hasNumber: (v) => /[0-9]/.test(v) || "Must include a number",
                                        hasSpecialChar: (v) =>
                                            /[!@#$%^&*(),.?":{}|<>]/.test(v) || "Must include a special character",
                                    },
                                })}
                                error={!!errors.newPassword}
                                helperText={errors.newPassword?.message}
                            />
                            <div
                                className="u-update-password-icon"
                                onClick={() => togglePasswordVisible("newPassword")}
                            >
                                {showNewPassword ? <VscEye /> : <VscEyeClosed />}
                            </div>
                        </div>
                        <PasswordStrengthBar
                            password={newPassword}
                            className="w-[90%] mt-2 rounded-2xl absolute"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="md:w-1/2 w-full relative mt-8">
                        <div className="relative">
                            <TextField
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                label="Confirm Password"
                                variant="outlined"
                                sx={{ width: "90%" }}
                                className={`u-update-password ${errors.confirmPassword ? "u-update-password-error" : ""}`}
                                {...register("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: (v) => v === newPassword || "Passwords do not match",
                                })}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword?.message}
                            />
                            <div
                                className="u-update-password-icon"
                                onClick={() => togglePasswordVisible("confirmPassword")}
                            >
                                {showConfirmPassword ? <VscEye /> : <VscEyeClosed />}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-4 w-full md:w-1/2">
                        <div className="text-center my-3">
                            <button
                                disabled={isLoading}
                                type="submit"
                                className="w-full px-6 py-2 bg-violet-700 text-white text-xs uppercase rounded-md tracking-widest border border-transparent disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-700 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                {isLoading ? (
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                                        </div>
                                        <span className="opacity-0">Saving...</span>
                                    </div>
                                ) : (
                                    "Save"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PasswordChange;
