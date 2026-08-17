const BmiTextField = ({
  required,
  label,
  name,
  type = "text",
  fieldProps = {},
  errors = {},
  onBlur,
  readOnly = false,
  disabled = false,
}) => {
  return (
    <div className="mb-5">
      {label && (
        <label htmlFor={name} className="inter-medium-font mb-1.5 block text-[13px] text-slate-700">
          {label}
          {required ? (
            <span className="text-red-500 ml-0.5">*</span>
          ) : (
            <span className="inter-reg-font ml-1 text-[12px] text-slate-400">(optional)</span>
          )}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        readOnly={readOnly}
        disabled={disabled}
        {...fieldProps}
        onBlur={onBlur}
        className={`inter-reg-font w-full rounded-xl border bg-slate-50/70 px-4 py-3.5 text-[15px] text-slate-900 placeholder:text-slate-300 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-[3px]
          ${errors[name] ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-slate-200 focus:border-[#47317c]/40 focus:ring-[#47317c]/10"}
          ${(readOnly || disabled) ? "cursor-not-allowed opacity-50" : ""}
        `}
      />
      {errors[name] && (
        <p className="inter-reg-font mt-1.5 text-[12px] text-red-500">
          {errors[name]?.message || "This field is required"}
        </p>
      )}
    </div>
  );
};

export default BmiTextField;
