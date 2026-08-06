import React from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  PackageX,
  Pill,
} from "lucide-react";

const ProductListCard = ({
  title,
  image,
  price,
  originalPrice,
  isOutOfStock,
  isLoading,
  buttonText,
  onClick,
}) => {
  return (
    <article
      className={`
        group relative flex min-h-[140px] overflow-hidden rounded-[18px]
        border bg-white transition-all duration-200
        ${
          isOutOfStock
            ? "border-slate-200 opacity-75"
            : `
              border-[#47317c]/10
              hover:border-[#47317c]/20
              hover:shadow-[0_12px_30px_rgba(71,49,124,0.09)]
            `
        }
      `}
    >
      {/* Product image */}
      <div className="relative flex w-[112px] items-center justify-center  bg-[#f8f6fb] sm:w-[136px]">
        {isOutOfStock && (
          <span className="mont-semibold-font absolute left-2 top-2 z-20 inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-2 py-1 text-[8px] text-red-600 shadow-sm">
            <PackageX size={9} strokeWidth={2.4} />
            Out of stock
          </span>
        )}

        {image ? (
          <img
            src={image}
            alt={title || "Treatment"}
            loading="lazy"
            className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-[16px] border border-[#47317c]/10 bg-white text-[#47317c] shadow-sm">
            <Pill size={24} strokeWidth={1.6} />
          </div>
        )}
      </div>

      {/* Information */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-3.5 sm:flex-row sm:items-center sm:p-4">
        <div className="min-w-0 flex-1">
          <h3 className="mont-bold-font  text-[13px] leading-5 tracking-[-0.02em] text-slate-950 sm:text-[17px]">
            {title}
          </h3>
        </div>

        {/* Price and action */}
        {/* Price and action */}
        <div className="flex w-full shrink-0 flex-col items-stretch gap-3 pt-2 sm:w-[185px]  sm:pt-0">
          <div className="text-left sm:text-right">
            <p className="mont-medium-font text-[10px] lg:text-[12px] 2xl:text-[14px] uppercase tracking-[0.12em] text-slate-700">
              From
            </p>

            <span className="mont-bold-font text-[10px] lg:text-[18px] 2xl:text-[20px] leading-none text-[#47317c]">
              £{originalPrice}
            </span>
          </div>

          <button
            type="button"
            onClick={onClick}
            disabled={isOutOfStock || isLoading}
            aria-busy={isLoading}
            className={`
      mont-medium-font inline-flex min-h-[38px] w-full shrink-0
      cursor-pointer items-center justify-center gap-2 rounded-[11px]
      px-3.5 py-2 text-[12px] lg:text-[14px] 2xl:text-[16px] transition-all duration-200

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
              <>
                {buttonText}

                {/* {!isOutOfStock && <ArrowRight size={12} strokeWidth={2.4} />} */}
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductListCard;
