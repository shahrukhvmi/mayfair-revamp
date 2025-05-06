import { useState, useEffect } from "react";
import { useWatch } from "react-hook-form";
import SectionWrapper from "./SectionWrapper";
import SectionHeader from "./SectionHeader";
import { FiCheck, FiX, FiEye, FiEyeOff } from "react-icons/fi";
import useSignupStore from "@/store/signupStore";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { UpdatePassword } from "@/api/updatePassword";

const SetAPassword = ({ register, control, setIsPasswordValid, isCompleted, onComplete }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const { email } = useSignupStore();

  const password = useWatch({ control, name: "password" }) || "";
  const confirmPassword = useWatch({ control, name: "confirmPassword" }) || "";

  const validations = {
    length: password.length >= 10,
    case: /[a-z]/.test(password) && /[A-Z]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    number: /[0-9]/.test(password),
    match: password === confirmPassword && confirmPassword !== "",
  };

  const isPasswordStrongAndMatch = Object.values(validations).every(Boolean);

  useEffect(() => {
    setIsPasswordValid(isPasswordStrongAndMatch);
  }, [isPasswordStrongAndMatch, setIsPasswordValid]);

  // ✅ Register API Mutation
  const { mutate, isLoading } = useMutation(UpdatePassword, {
    onSuccess: (data) => {
      toast.success("Account created successfully!");
      if (onComplete) onComplete();
  
    },
    onError: (error) => {
      const errorMsg = error?.response?.data?.message || "Something went wrong!";
      toast.error(errorMsg);
    },
  });

  const handleRegister = () => {
    if (!isPasswordStrongAndMatch) {
      toast.error("Please complete password requirements first.");
      return;
    }

    // ✅ Call API
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

      <div className="relative mt-4">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          {...register("password", { required: true })}
          className={`w-full text-black px-3 py-4 border rounded-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-800 ${password.length > 0 ? "border-violet-600" : "border-black"
            }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 cursor-pointer"
        >
          {showPassword ? <FiEye className="w-5 h-5" /> : <FiEyeOff className="w-5 h-5" />}
        </button>
      </div>

      <div className="relative mt-4">
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          {...register("confirmPassword", { required: true })}
          onPaste={(e) => e.preventDefault()}
          className={`w-full text-black px-3 py-4 border rounded-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-800 ${confirmPassword.length > 0 ? "border-violet-600" : "border-black"
            }`}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600 cursor-pointer"
        >
          {showConfirmPassword ? <FiEye className="w-5 h-5" /> : <FiEyeOff className="w-5 h-5" />}
        </button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6 space-y-2">
        <PasswordCheck valid={validations.length} label="At least 10 characters." />
        <PasswordCheck valid={validations.case} label="Upper and lower case characters." />
        <PasswordCheck valid={validations.special} label="At least 1 special character." />
        <PasswordCheck valid={validations.number} label="At least 1 number." />
        <PasswordCheck valid={validations.match} label="Passwords must match." />
      </div>

      <div className="mt-6">
        <button
          onClick={handleRegister}
          disabled={!isPasswordStrongAndMatch || isLoading}
          className={`w-full px-4 py-3 text-white font-bold rounded ${!isPasswordStrongAndMatch || isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-violet-700 hover:bg-violet-800"}`}
        >
          {isLoading ? "Creating Account..." : "Continue"}
        </button>
      </div>
    </SectionWrapper>
  );
};

const PasswordCheck = ({ valid, label }) => (
  <div className="flex items-center justify-between reg-font paragraph">
    <span>{label}</span>
    {valid ? (
      <FiCheck className="text-green-600 w-4 h-4" />
    ) : (
      <FiX className="text-red-600 w-4 h-4" />
    )}
  </div>
);

export default SetAPassword;
