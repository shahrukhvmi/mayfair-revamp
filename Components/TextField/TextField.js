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
  registerOptions = {},
  errors = {},
  disabled = false,
  disablePaste = false,
  value, // <-- Controlled input
  onChange, // <-- Controlled input
  multiline = false,
  rows = 4,
  readOnly = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const handlePaste = (e) => {
    if (disablePaste) {
      e.preventDefault();
    }
  };

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;


  // 🔥 Build validation rules (for RHF)
  const baseRules = {
    ...(required ? { required: "This field is required" } : {}),
    ...validation,
  };
  if (name === "city") {
    const existingValidate = baseRules.validate;

    baseRules.validate = (val) => {
      // pehle agar user ne custom validate diya hai to usko respect karo
      if (existingValidate) {
        const result = existingValidate(val);
        if (result !== true) return result;
      }

      // ab whitespace-only check
      if (!val || val.trim() === "") {
        return "Town / City cannot be empty or spaces only";
      }

      return true;
    };
  }
  return (
    <div className="mb-4 relative">
      {label && (
        <label htmlFor={name} className="bold-font paragraph mb-2">
          {label}
          {required ? (
            <span className="text-red-500 absolute top-1 ms-1 niba-semibold-font"> *</span>
          ) : (
            <span className="text-gray-500 text-sm font-normal ml-1">(optional)</span>
          )}
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
          className={`reg-font w-full text-black px-3 py-4 border rounded-sm placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-primary
            ${errors[name] ? "border-red-500" : "border-black"}
          `}
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
              ? register(name, {
                ...baseRules,
                ...registerOptions,
              })
              : { value, onChange })}
            className={`reg-font w-full text-black px-3 py-4 border rounded-sm placeholder-gray-400 
              focus:outline-none focus:ring-violet-300 focus:border-primary
              ${errors[name] ? "border-red-500" : "border-black"}
              ${isPassword ? "pr-12" : ""}
               ${readOnly ? "bg-gray-100 text-gray-800 cursor-not-allowed select-none" : "text-black"}
            `}
          />

          {isPassword && (
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
            >
              {showPassword ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
            </span>
          )}
        </div>
      )}

      {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]?.message || "This field is required"}</p>}
    </div>
  );
};

export default TextField;
