import React from "react";

const NextButton = ({
  label = "Next",
  loading = false,
  disabled = false,
  type = "submit",
  onClick,
  className,
  subHeading,
}) => {
  return (
    <div className="mb-0">
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`${className} w-full inter-medium-font text-[14px] tracking-wide transition-all duration-150 ease-in-out
          flex justify-center items-center cursor-pointer rounded-lg py-3 px-6
          ${
            disabled || loading
              ? "bg-slate-200 text-slate-500 !cursor-not-allowed"
              : "bg-[#47317c] hover:bg-[#3d2a6b] text-white"
          }`}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div>{label}</div>
            {subHeading && (
              <div className="text-[12px] inter-reg-font pt-1 normal-case opacity-80">
                {subHeading}
              </div>
            )}
          </div>
        )}
      </button>
    </div>
  );
};

export default NextButton;
