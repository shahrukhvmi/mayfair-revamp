import React from "react";
import { Loader2, PackageX, Pill } from "lucide-react";

const ProductGridCard = ({
  title,
  image,
  originalPrice,
  isOutOfStock,
  isLoading,
  buttonText,
  onClick,
}) => {
  return (
    <article
      className={`
        group relative flex h-full flex-col overflow-hidden rounded-2xl border
        bg-white transition-all duration-200
        ${isOutOfStock
          ? "border-slate-200/70 opacity-60 cursor-not-allowed"
          : "border-slate-200/70 shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.09)] cursor-pointer"
        }
      `}
    >
      {/* Image */}
      <div className="relative h-[160px] 2xl:h-[180px] overflow-hidden bg-slate-100">
        {isOutOfStock && (
          <span className="inter-medium-font absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-red-100 bg-white px-2.5 py-1 text-[10px] text-red-500 shadow-sm">
            <PackageX size={9} strokeWidth={2} />
            Out of stock
          </span>
        )}
        {image ? (
          <img
            src={image}
            alt={title || "Treatment"}
            loading="lazy"
            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Pill size={24} strokeWidth={1.5} className="text-slate-300" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4 2xl:p-5">
        <h3 className="inter-semibold-font text-[13.5px] lg:text-[14px] 2xl:text-[16px] leading-snug text-slate-900">
          {title}
        </h3>

        <div className="mt-3 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <p className="inter-reg-font text-[10px] uppercase tracking-[0.08em] text-slate-400">
              Starting from
            </p>
            <span className="inter-bold-font text-[16px] lg:text-[16px] 2xl:text-[19px] leading-none text-[#47317c]">
              £{originalPrice}
            </span>
          </div>

          <button
            type="button"
            onClick={onClick}
            disabled={isOutOfStock || isLoading}
            className={`inter-medium-font inline-flex min-h-[36px] lg:min-h-[36px] 2xl:min-h-[42px] w-full items-center
              justify-center gap-2 rounded-xl px-4
              text-[12.5px] lg:text-[12.5px] 2xl:text-[13.5px] transition-all duration-150
              ${isOutOfStock
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : "cursor-pointer bg-[#47317c] text-white hover:bg-[#392765] active:scale-[0.97]"
              }`}
          >
            {isLoading
              ? <><Loader2 size={12} strokeWidth={2.5} className="animate-spin" />Processing</>
              : buttonText
            }
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductGridCard;
