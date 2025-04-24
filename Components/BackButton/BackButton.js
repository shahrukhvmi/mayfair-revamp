import React from "react";

const BackButton = ({
  label = "Back",
  loading = false,
  disabled = false,
  type = "button",
  onClick,
  className = "",
}) => {
  return (
    <div className={`${className}`}>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`w-full py-3 px-12 rounded-xl border-2 border-violet-700 text-violet-700 text-sm font-medium transition-all duration-150
        hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center`}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-violet-700 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        ) : (
          <span>{label}</span>
        )}
      </button>
    </div>
  );
};


export default BackButton;
