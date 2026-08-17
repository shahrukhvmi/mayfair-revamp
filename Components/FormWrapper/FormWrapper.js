const FormWrapper = ({ children, width = "", heading = "", description = "", percentage = 0, showLoader = false }) => {
  return (
    <div className={`min-h-[calc(100vh-66px)] bg-[#edeaf5] ${showLoader ? "cursor-not-allowed" : ""}`}>

      {/* Progress bar — sticky below header, full viewport width */}
      {percentage > 0 && (
        <div className="sticky top-[66px] z-30 w-full h-[3px] bg-slate-100">
          <div
            className="h-full bg-[#47317c] transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {/* Page content */}
      <div className="flex items-start justify-center px-4 py-10 sm:py-14">
        <div className={`w-full max-w-[640px] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(71,49,124,0.13)] border border-[#47317c]/[0.08] ${width}`}>

          {/* Card header — purple tinted */}
          {heading && (
            <div className="bg-[#f5f2fc] px-6 sm:px-8 pt-6 pb-5 border-b border-[#47317c]/[0.07]">
              <h1 className="inter-semibold-font text-[21px] sm:text-[23px] text-slate-900 leading-snug">
                {heading}
              </h1>
              {description && (
                <p className="inter-reg-font mt-1.5 text-[13.5px] text-slate-500 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Card body — white */}
          <div className="bg-white px-6 sm:px-8 py-7">
            <div className={`${showLoader ? "pointer-events-none opacity-50" : ""}`}>
              {children}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FormWrapper;
