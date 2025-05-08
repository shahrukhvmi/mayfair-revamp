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
  value, // <-- Controlled input
  onChange, // <-- Controlled input
  multiline = false,
  rows = 4,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const handlePaste = (e) => {
    if (disablePaste) {
      e.preventDefault();
    }
  };

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="mb-4 relative">
      {label && (
        <label htmlFor={name} className="bold-font paragraph mb-2">
          {label}
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
          className={`w-full text-black px-3 py-4 border rounded-sm placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-800
            ${errors[name] ? "border-red-500" : "border-black"}
          `}
        />
      ) : (
        <div className="relative">
          <input
            id={name}
            type={inputType}
            placeholder={placeholder}
            disabled={disabled}
            onPaste={handlePaste}
            {...(register
              ? register(name, {
                  required: required && "This field is required",
                  ...validation,
                })
              : { value, onChange })}
            className={`w-full text-black px-3 py-4 border rounded-sm placeholder-gray-400 
              focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-800
              ${errors[name] ? "border-red-500" : "border-black"}
              ${isPassword ? "pr-12" : ""}
            `}
          />

          {isPassword && (
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </span>
          )}
        </div>
      )}

      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">
          {errors[name]?.message || "This field is required"}
        </p>
      )}
    </div>
  );
};

export default TextField;
