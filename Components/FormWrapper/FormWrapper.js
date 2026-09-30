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
  headingClassName = "",
}) => {
  return (
    <div className={`min-h-[calc(100dvh-66px)] bg-[#FBFBFD] ${showLoader ? "cursor-not-allowed" : ""}`}>

      {/* Progress bar — sticky below header, full viewport width */}
      {percentage > 0 && (
        <div className="sticky top-[66px] z-30 w-full">
          <div
            className="h-[3px] w-full overflow-hidden bg-[#47317c]/[0.08]"
            role="progressbar"
            aria-label="Consultation progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Number(percentage)}
          >
            <div
              className="form-progress-fill relative h-full origin-left overflow-hidden rounded-r-full bg-[#47317c] shadow-[0_0_8px_rgba(71,49,124,0.28)] transition-[width] duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            >
              <span className="form-progress-shimmer absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/55 to-transparent" />
            </div>
          </div>

          {/* Percentage badge riding the end of the bar */}
          <span
            aria-hidden="true"
            className="inter-semibold-font pointer-events-none absolute top-[7px] -translate-x-full rounded-full bg-[#47317c] px-2.5 py-0.5 text-[12px] max-sm:text-[12px] leading-4 text-white shadow-[0_2px_8px_rgba(71,49,124,0.25)] transition-[left] duration-500 ease-out"
            style={{ left: `max(${Number(percentage)}%, 58px)`, marginLeft: "-6px" }}
          >
            {Math.round(Number(percentage))}%
          </span>
        </div>
      )}

      <style jsx>{`
        .form-progress-fill {
          animation: progress-grow 650ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .form-progress-shimmer {
          animation: progress-shimmer 1.8s ease-in-out infinite;
        }

        @keyframes progress-grow {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        @keyframes progress-shimmer {
          from {
            transform: translateX(-110%);
          }
          to {
            transform: translateX(410%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .form-progress-fill,
          .form-progress-shimmer {
            animation: none;
          }
        }
      `}</style>

      {/* Page content */}
      <div className="flex items-start justify-center px-4 py-8 max-sm:pb-[calc(env(safe-area-inset-bottom,0px)+48px)] sm:py-12 lg:py-14">
        <div className={`w-full max-w-[640px] overflow-hidden rounded-2xl border border-[#47317c]/10 bg-white shadow-[0_8px_28px_rgba(71,49,124,0.08)] ${width} ${cardClassName}`}>

          {/* Card header — purple tinted */}
          {heading && (
            <div className={`border-b border-[#47317c]/[0.08] bg-[#f5f2fc] px-5 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-7 ${headerClassName}`}>
              <h1 className={`max-sm:text-[24px] inter-semibold-font text-[21px] leading-snug tracking-[-0.02em] text-slate-900 sm:text-[23px] ${headingClassName}`}>
                {heading}
              </h1>
              {description && (
                <p className="inter-reg-font mt-2 max-w-[540px] text-[13px] max-sm:text-[16px] leading-relaxed text-slate-500 sm:text-[13.5px]">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Card body — white */}
          <div className={`bg-white px-5 pb-9 sm:px-8 sm:pb-8 ${heading ? "pt-6 sm:pt-9" : "pt-7 sm:pt-8"} ${bodyClassName}`}>
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
