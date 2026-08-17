const FormWrapper = ({
  children,
  width = "",
  heading = "",
  description = "",
  percentage = 0,
  showLoader = false,
  cardClassName = "",
  headerClassName = "",
  bodyClassName = "",
}) => {
  return (
    <div className={`min-h-[calc(100vh-66px)] bg-[#FBFBFD] ${showLoader ? "cursor-not-allowed" : ""}`}>

      {/* Progress bar — sticky below header, full viewport width */}
      {percentage > 0 && (
        <div className="sticky top-[66px] z-30 h-[3px] w-full overflow-hidden bg-slate-100/80">
          <div
            className="h-full rounded-r-full bg-[#47317c] transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {/* Page content */}
      <div className="flex items-start justify-center px-4 py-8 sm:py-12 lg:py-14">
        <div className={`w-full max-w-[640px] overflow-hidden rounded-2xl border border-[#47317c]/10 bg-white shadow-[0_8px_28px_rgba(71,49,124,0.08)] ${width} ${cardClassName}`}>

          {/* Card header — purple tinted */}
          {heading && (
            <div className={`border-b border-[#47317c]/[0.08] bg-[#f5f2fc] px-5 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-7 ${headerClassName}`}>
              <h1 className="inter-semibold-font text-[21px] leading-snug tracking-[-0.02em] text-slate-900 sm:text-[23px]">
                {heading}
              </h1>
              {description && (
                <p className="inter-reg-font mt-2 max-w-[540px] text-[13px] leading-relaxed text-slate-500 sm:text-[13.5px]">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Card body — white */}
          <div className={`bg-white px-5 pb-7 sm:px-8 sm:pb-8 ${heading ? "pt-6 sm:pt-7" : "pt-7 sm:pt-8"} ${bodyClassName}`}>
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
