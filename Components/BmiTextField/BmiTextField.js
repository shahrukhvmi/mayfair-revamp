const BmiTextField = ({ required, label, name, type = "text", fieldProps = {}, errors = {}, onBlur }) => {
  return (
    <div className="mb-4">
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
