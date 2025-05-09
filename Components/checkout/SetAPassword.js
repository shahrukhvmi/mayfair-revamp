import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import SectionWrapper from "./SectionWrapper";
import SectionHeader from "./SectionHeader";
import { FiCheck, FiX, FiEye, FiEyeOff } from "react-icons/fi";
import useSignupStore from "@/store/signupStore";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UpdatePassword } from "@/api/updatePassword";
import usePasswordReset from "@/store/usePasswordReset";
import NextButton from "../NextButton/NextButton";

const SetAPassword = ({ isCompleted, onComplete }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isPasswordReset, setIsPasswordReset } = usePasswordReset();
  const { email } = useSignupStore();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
  });

  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";

  const validations = {
    length: password.length >= 10,
    case: /[a-z]/.test(password) && /[A-Z]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    number: /[0-9]/.test(password),
    match: password === confirmPassword && confirmPassword !== "",
  };

  const isPasswordStrongAndMatch = Object.values(validations).every(Boolean);

  const { mutate, isLoading } = useMutation(UpdatePassword, {
    onSuccess: (data) => {
      if (data?.status) {
        toast.success("Account created successfully!");
        if (onComplete) onComplete();
        setIsPasswordReset(true);
      }
    },
    onError: (error) => {
      const errorData = error?.response?.data?.errors;
      if (errorData && typeof errorData === "object") {
        Object.values(errorData).forEach((errArray) => {
          if (Array.isArray(errArray)) {
            errArray.forEach((errMsg) => toast.error(errMsg));
          } else {
            toast.error(errArray);
          }
        });
      } else {
        toast.error(error?.response?.statusText || "Something went wrong!");
      }
    },
  });

  const onSubmit = () => {
    if (!isPasswordStrongAndMatch) {
      toast.error("Please complete password requirements first.");
      return;
    }

    mutate({
      company_id: 1,
      email: email,
      password: password,
      password_confirmation: confirmPassword,
    });
  };

  return (
    <SectionWrapper>
      <SectionHeader
        stepNumber={1}
        title="Set a Password"
        description="Please create a strong password for your account."
        completed={isCompleted}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="relative mt-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            {...register("password", { required: true })}
            className={`reg-font w-full text-black px-3 py-4 border rounded-sm placeholder-gray-400 focus:outline-none ${password.length > 0 ? "border-violet-600" : "border-black"}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="cursor-pointer absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600"
          >
            {showPassword ? <FiEye /> : <FiEyeOff />}
          </button>
        </div>

        <div className="relative mt-4">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            {...register("confirmPassword", { required: true })}
            onPaste={(e) => e.preventDefault()}
            className={`reg-font w-full text-black px-3 py-4 border rounded-sm placeholder-gray-400 focus:outline-none ${confirmPassword.length > 0 ? "border-violet-600" : "border-black"}`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="cursor-pointer absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600"
          >
            {showConfirmPassword ? <FiEye /> : <FiEyeOff />}
          </button>
        </div>

        <div className="bg-gray-50 text-black thin-font border border-gray-200 rounded-lg p-4 mt-6 space-y-2">
          <PasswordCheck valid={validations.length} label="At least 10 characters." />
          <PasswordCheck valid={validations.case} label="Upper and lower case characters." />
          <PasswordCheck valid={validations.special} label="At least 1 special character." />
          <PasswordCheck valid={validations.number} label="At least 1 number." />
          <PasswordCheck valid={validations.match} label="Passwords must match." />
        </div>

        <div className="mt-6">
          <NextButton
            label="Continue"
            disabled={!isPasswordStrongAndMatch || isLoading || isPasswordReset}
            type="submit"
          />
        </div>
      </form>
    </SectionWrapper>
  );
};

const PasswordCheck = ({ valid, label }) => (
  <div className="flex items-center justify-between">
    <span>{label}</span>
    {valid ? <FiCheck className="text-green-600" /> : <FiX className="text-red-600" />}
  </div>
);

export default SetAPassword;
