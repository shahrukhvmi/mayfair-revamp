import React from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  PackageX,
  Pill,
} from "lucide-react";

const ProductGridCard = ({
  title,
  image,
  description,
  displayPrice,
  originalPrice,
  hasPreLaunchPrice,
  isOutOfStock,
  isLoading,
  buttonText,
  onClick,
}) => {
  return (
    <article
      className={`
        group relative flex h-full flex-col overflow-hidden rounded-[20px]
        border bg-white transition-all duration-200
        ${
          isOutOfStock
            ? "border-slate-200 opacity-75"
            : `
              border-[#47317c]/10
              hover:-translate-y-0.5
              hover:border-[#47317c]/20
              hover:shadow-[0_14px_34px_rgba(71,49,124,0.1)]
            `
        }
      `}
    >
      {/* Image */}
      <div className="relative flex h-[200px] items-center justify-center overflow-hidden border-b border-[#47317c]/[0.07] bg-[#f8f6fb]">
        <div className="absolute inset-x-3 top-3 z-20 flex items-center justify-between gap-2">
          {isOutOfStock && (
            <span className="mont-semibold-font inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-2.5 py-1.5 text-[8px] text-red-600 shadow-sm">
              <PackageX size={9} strokeWidth={2.4} />
              Out of stock
            </span>
          )}
        </div>

        {image ? (
          <img
            src={image}
            alt={title || "Treatment"}
            loading="lazy"
            className="h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px] border border-[#47317c]/10 bg-white text-[#47317c] shadow-sm">
            <Pill size={29} strokeWidth={1.6} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="mont-bold-font  text-[13px] leading-5 tracking-[-0.02em] text-slate-950 sm:text-[17px]">
          {title}
        </h3>

        <div className="mt-auto pt-4">
          {/* Price */}
          <div className="mb-3 flex min-h-[34px] items-end justify-between gap-3 border-t border-[#47317c]/[0.07]">
            <p className="mont-medium-font text-[13px]  tracking-[0.12em] text-slate-700">
              Starting From
            </p>

            <div className="text-right">
              <span className="mont-bold-font text-[18px] leading-none text-[#47317c]">
                £{originalPrice}
              </span>
            </div>
          </div>

          {/* Button */}
          <button
            type="button"
            onClick={onClick}
            disabled={isOutOfStock || isLoading}
            aria-busy={isLoading}
            className={`
              mont-medium-font inline-flex min-h-[40px] w-full items-center
              justify-center gap-2 rounded-[11px] px-4 py-2.5
              text-[14px] transition-all duration-200
              ${
                isOutOfStock
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : `
                    bg-[#47317c] text-white
                    shadow-[0_6px_16px_rgba(71,49,124,0.2)]
                    hover:bg-[#392765] active:scale-[0.98]
                  `
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 size={13} strokeWidth={2.5} className="animate-spin" />
                Processing
              </>
            ) : (
              <>{buttonText}</>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductGridCard;
