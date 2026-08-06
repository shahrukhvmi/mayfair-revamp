import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Check,
  Info,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";

import TextField from "@/Components/TextField/TextField";
import NextButton from "@/Components/NextButton/NextButton";
import { ChangePassword } from "@/api/ChangePassword";
import useSignupStore from "@/store/signupStore";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";

const PasswordRequirement = ({ valid, label }) => {
  return (
    <div
      className={`flex items-center gap-3 rounded-[12px] border px-3.5 py-3 transition-all duration-200 ${
        valid
          ? "border-emerald-200 bg-emerald-50/70"
          : "border-slate-200 bg-white"
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          valid
            ? "bg-emerald-100 text-emerald-600"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {valid ? (
          <Check size={15} strokeWidth={2.5} />
        ) : (
          <X size={14} strokeWidth={2.3} />
        )}
      </span>

      <span
        className={`mont-medium-font text-[12px] leading-5 ${
          valid ? "text-emerald-700" : "text-slate-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
};

const PasswordChange = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { email } = useSignupStore();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
  });
  const { authUserDetail } = useAuthUserDetailStore();

  const newPassword = watch("newpassword") || "";
  const displayName = authUserDetail?.fname?.trim() || "Patient";
  const displayEmail = authUserDetail?.email?.trim() || "Not available";
  const confirmPassword = watch("newpassword_confirmation") || "";

  const passwordValidations = useMemo(
    () => ({
      length: newPassword.length >= 8,

      case: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),

      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),

      number: /[0-9]/.test(newPassword),

      match: newPassword === confirmPassword && confirmPassword !== "",
    }),
    [newPassword, confirmPassword],
  );

  const completedRequirements =
    Object.values(passwordValidations).filter(Boolean).length;

  const passwordProgress = (completedRequirements / 5) * 100;

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
    const validations = {
      length: data.newpassword.length >= 8,

      case: /[a-z]/.test(data.newpassword) && /[A-Z]/.test(data.newpassword),

      special: /[!@#$%^&*(),.?":{}|<>]/.test(data.newpassword),

      number: /[0-9]/.test(data.newpassword),

      match: data.newpassword === data.newpassword_confirmation,
    };

    const isPasswordStrongAndMatch = Object.values(validations).every(Boolean);

    if (!isPasswordStrongAndMatch) {
      toast.error("Please complete all password requirements.");

      return;
    }

    setIsLoading(true);

    changePasswordMutation.mutate({
      old_password: data.old_password,
      newpassword: data.newpassword,
      newpassword_confirmation: data.newpassword_confirmation,
    });
  };

  return (
    <main className="mont-reg-font min-w-0 flex-1 bg-[#f4f5fb] p-3 sm:p-4 lg:p-5 xl:p-6">
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-4">
        {/* Page header */}
        <section className="relative overflow-hidden rounded-[26px] border border-[#47317c]/[0.09] bg-white px-5 py-6 shadow-[0_16px_42px_rgba(71,49,124,0.075)] sm:px-6 lg:px-7">
          <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-[#47317c]/[0.06] blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="mont-bold-font mb-2 text-[11px] uppercase tracking-[0.16em] text-[#47317c]">
                Account security
              </p>

              <h1 className="mont-bold-font text-[28px] leading-tight tracking-[-0.04em] text-slate-950 sm:text-[32px]">
                Change Password
              </h1>

              <p className="mont-reg-font mt-2.5 max-w-2xl text-[13px] leading-[1.7] text-slate-500 sm:text-[14px]">
                Create a strong and secure password to protect your account and
                personal information.
              </p>
            </div>

            {/* Account information */}
            <div className="flex w-full min-w-0 items-center gap-3.5 rounded-[18px] border border-[#47317c]/10 bg-[#faf8fd] px-4 py-3.5 lg:w-[320px]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#47317c] text-white shadow-[0_8px_18px_rgba(71,49,124,0.2)]">
                <ShieldCheck size={20} strokeWidth={2} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="mont-medium-font text-[10px] uppercase tracking-[0.12em] text-[#47317c]/55">
                  Logged in as
                </p>

                <p
                  title={displayEmail}
                  className="mont-reg-font mt-0.5 truncate text-[11px] leading-4 text-slate-500"
                >
                  {displayEmail}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Password content */}
        <section className="relative overflow-hidden rounded-[26px] border border-[#47317c]/[0.09] bg-white p-4 shadow-[0_16px_42px_rgba(71,49,124,0.075)] sm:p-5 lg:p-6">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            {/* Password form */}
            <div className="overflow-hidden rounded-[22px] border border-[#47317c]/10 bg-white">
              <div className="flex items-start gap-3.5 border-b border-[#47317c]/[0.07] bg-[#faf9fc] px-5 py-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#47317c]/[0.08] text-[#47317c]">
                  <LockKeyhole size={20} strokeWidth={2} />
                </span>

                <div className="min-w-0">
                  <h2 className="mont-bold-font text-[20px] leading-7 text-slate-950 sm:text-[23px]">
                    Update your password
                  </h2>

                  <p className="mont-reg-font mt-1 text-[12.5px] leading-[1.7] text-slate-500 sm:text-[13px]">
                    Enter your current password and choose a new secure
                    password.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="password-form space-y-5 p-4 sm:p-5 lg:p-6"
              >
                <TextField
                  type="password"
                  label="Current Password"
                  name="old_password"
                  register={register}
                  validation={{
                    required: "Current password is required",
                  }}
                  errors={errors}
                  required
                />

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <TextField
                    type="password"
                    label="New Password"
                    name="newpassword"
                    register={register}
                    required
                    validation={{
                      required: "New password is required",

                      minLength: {
                        value: 8,

                        message: "Password must be at least 8 characters",
                      },
                    }}
                    errors={errors}
                  />

                  <TextField
                    type="password"
                    label="Confirm Password"
                    name="newpassword_confirmation"
                    required
                    register={register}
                    validation={{
                      required: "Please confirm your password",

                      validate: (value) =>
                        value === newPassword || "Passwords do not match",
                    }}
                    errors={errors}
                  />
                </div>

                {/* Mobile requirements */}
                <div className="xl:hidden">
                  <PasswordRequirements
                    validations={passwordValidations}
                    progress={passwordProgress}
                    completed={completedRequirements}
                  />
                </div>

                <div className="flex flex-col gap-4 border-t border-[#47317c]/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-2.5">
                    <Info
                      size={16}
                      strokeWidth={2}
                      className="mt-0.5 shrink-0 text-[#47317c]"
                    />

                    <p className="mont-reg-font max-w-md text-[11.5px] leading-[1.7] text-slate-500">
                      After updating your password, use the new password the
                      next time you sign in.
                    </p>
                  </div>

                  <div className="password-save-button w-full shrink-0 sm:w-[190px]">
                    <NextButton
                      type="submit"
                      disabled={!isValid || isLoading}
                      label={isLoading ? "Saving..." : "Save password"}
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Desktop requirements */}
            <aside className="hidden xl:block">
              <PasswordRequirements
                validations={passwordValidations}
                progress={passwordProgress}
                completed={completedRequirements}
              />

              {/* Email */}
              {/* <div className="mt-4 rounded-[20px] border border-[#47317c]/10 bg-[#faf9fc] p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-[#47317c] shadow-sm">
                    <Mail size={18} strokeWidth={2} />
                  </span>

                  <div className="min-w-0">
                    <p className="mont-bold-font text-[14px] text-slate-950">
                      Account email
                    </p>

                    <p className="mont-reg-font mt-0.5 text-[11px] text-slate-500">
                      Associated with this account
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-[13px] border border-[#47317c]/10 bg-white px-4 py-3">
                  <p
                    title={email}
                    className="mont-medium-font truncate text-[12px] text-slate-700"
                  >
                    {email || "Not available"}
                  </p>
                </div>

                <p className="mont-reg-font mt-3 text-[10.5px] leading-[1.7] text-slate-500">
                  This email is linked to your account and cannot be changed
                  from this page.
                </p>
              </div> */}
            </aside>
          </div>

          <style jsx global>{`
            .password-form .MuiFormControl-root {
              width: 100%;
            }

            .password-form .MuiInputLabel-root {
              font-family: var(--mont-medium) !important;
              font-size: 13px !important;
              color: #64748b;
            }

            .password-form .MuiInputBase-root {
              min-height: 52px;
              border-radius: 14px !important;
              background: #ffffff;
              font-family: var(--mont-reg) !important;
              font-size: 13px !important;
            }

            .password-form .MuiOutlinedInput-notchedOutline {
              border-color: rgba(71, 49, 124, 0.13) !important;
            }

            .password-form
              .MuiInputBase-root:hover
              .MuiOutlinedInput-notchedOutline {
              border-color: rgba(71, 49, 124, 0.28) !important;
            }

            .password-form .Mui-focused .MuiOutlinedInput-notchedOutline {
              border-color: #47317c !important;
              border-width: 1px !important;
            }

            .password-form input {
              font-family: var(--mont-reg) !important;
              font-size: 13px !important;
              color: #0f172a !important;
            }

            .password-form label {
              font-family: var(--mont-medium) !important;
            }

            .password-save-button button {
              min-height: 46px !important;
              width: 100% !important;
              border-radius: 13px !important;
              border-color: #47317c !important;
              background: #47317c !important;
              padding: 12px 22px !important;
              font-family: var(--mont-medium) !important;
              font-size: 12px !important;
              color: #ffffff !important;
              transition: all 0.2s ease !important;
            }

            .password-save-button button:not(:disabled):hover {
              background: #392765 !important;
            }

            .password-save-button button:disabled {
              cursor: not-allowed !important;
              border-color: #cbd5e1 !important;
              background: #cbd5e1 !important;
              box-shadow: none !important;
            }
          `}</style>
        </section>
      </div>
    </main>
  );
};

const PasswordRequirements = ({ validations, progress, completed }) => {
  return (
    <div className="rounded-[20px] border border-[#47317c]/10 bg-[#faf9fc] p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#47317c] text-white shadow-[0_7px_16px_rgba(71,49,124,0.18)]">
          <KeyRound size={18} strokeWidth={2} />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="mont-bold-font text-[15px] text-slate-950">
            Password requirements
          </h3>

          <p className="mont-reg-font mt-0.5 text-[11px] text-slate-500">
            {completed} of 5 completed
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-[#47317c]/[0.08]">
          <div
            className="h-full rounded-full bg-[#47317c] transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        <PasswordRequirement
          valid={validations.length}
          label="At least 8 characters"
        />

        <PasswordRequirement
          valid={validations.case}
          label="Upper and lower case letters"
        />

        <PasswordRequirement
          valid={validations.special}
          label="At least 1 special character"
        />

        <PasswordRequirement
          valid={validations.number}
          label="At least 1 number"
        />

        <PasswordRequirement
          valid={validations.match}
          label="Both passwords must match"
        />
      </div>
    </div>
  );
};

export default PasswordChange;
