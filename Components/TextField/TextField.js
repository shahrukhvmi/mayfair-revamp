import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const TextField = ({
  label,
  name,
  placeholder = "",
  type = "text",
  register,
  required = false,
  validation = {},
  errors = {},
  disabled = false,
  disablePaste = false,
  value,
  onChange,
  multiline = false,
  rows = 4,
  readOnly = false,
  boxed = false,
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const handlePaste = (e) => { if (disablePaste) e.preventDefault(); };

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const baseRules = {
    ...(required ? { required: "This field is required" } : {}),
    ...validation,
  };

  if (name === "city") {
    const existingValidate = baseRules.validate;
    baseRules.validate = (val) => {
      if (existingValidate) {
        const result = existingValidate(val);
        if (result !== true) return result;
      }
      if (!val || val.trim() === "") return "Town / City cannot be empty or spaces only";
      return true;
    };
  }

  const hasError = !!errors[name];

  const baseInputClass = `
    inter-reg-font w-full text-[15px] text-slate-800 placeholder:text-slate-400
    focus:outline-none transition-all duration-200
    ${boxed
      ? "rounded-xl border bg-white px-4 py-3 leading-relaxed shadow-[0_1px_3px_rgba(15,23,42,0.03)] focus:ring-[3px]"
      : "border-0 border-b-2 bg-transparent px-0 py-3"
    }
    ${hasError
      ? `border-red-300 focus:border-red-400 ${boxed ? "focus:ring-red-100" : ""}`
      : `border-slate-200 focus:border-[#47317c] ${boxed ? "focus:ring-[#47317c]/10" : ""}`
    }
    ${disabled || readOnly ? "text-slate-400 cursor-not-allowed" : ""}
    ${isPassword ? "pr-10" : ""}
    ${className}
  `;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="inter-medium-font mb-1.5 flex items-center gap-1 text-[13px] text-slate-700">
          {label}
          {required
            ? <span className="text-red-400 text-[14px] leading-none">*</span>
            : <span className="inter-reg-font text-[12px] text-slate-400">(optional)</span>
          }
        </label>
      )}

      {multiline ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          onPaste={handlePaste}
          value={value}
          onChange={onChange}
          rows={rows}
          className={`${baseInputClass} resize-none`}
        />
      ) : (
        <div className="relative">
          <input
            readOnly={readOnly}
            id={name}
            type={inputType}
            placeholder={placeholder}
            disabled={disabled}
            onPaste={handlePaste}
            {...(register
              ? register(name, { ...baseRules })
              : { value, onChange }
            )}
            className={baseInputClass}
          />
          {isPassword && (
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors"
            >
              {showPassword ? <AiOutlineEye size={18} /> : <AiOutlineEyeInvisible size={18} />}
            </span>
          )}
        </div>
      )}

      {hasError && (
        <p className="inter-reg-font mt-1.5 text-[12px] text-red-500">
          {errors[name]?.message || "This field is required"}
        </p>
      )}
    </div>
  );
};

export default TextField;
