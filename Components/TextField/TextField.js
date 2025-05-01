import React from "react";

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
  disablePaste = false, // ⭐️ optional
}) => {
  // ⭐ Handle paste blocking only if disablePaste is true
  const handlePaste = (e) => {
    if (disablePaste) {
      e.preventDefault();
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="bold-font paragraph  mb-2">
          {label}
          {/* {required && <span className="text-red-500">*</span>} */}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        onPaste={handlePaste} // ⭐️ Attach paste event
        {...register(name, {
          required: required && "This field is required",
          ...validation,
        })}
        className={`w-full text-black px-3 py-4 border rounded-sm placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-800 
            ${errors[name] ? "border-red-500" : "border-black"}
          `}
      />
      {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]?.message || "This field is required"}</p>}
    </div>
  );
};

export default TextField;
