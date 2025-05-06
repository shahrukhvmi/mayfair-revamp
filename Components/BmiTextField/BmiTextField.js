const BmiTextField = ({ label, name, type = "text", fieldProps = {}, errors = {}, onBlur }) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="bold-font paragraph mb-2">
          {label}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        {...fieldProps}
        onBlur={onBlur}
        className={`w-full text-black px-3 py-4 border rounded-sm placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-800
            ${errors[name] ? "border-red-500" : "border-black"}
          `}
      />

      {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]?.message || "This field is required"}</p>}
    </div>
  );
};

export default BmiTextField;
