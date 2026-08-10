import React from "react";
import { Loader2, PackageX, Pill } from "lucide-react";

const ProductListCard = ({
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
        group flex items-center gap-4 rounded-2xl border bg-white
        px-4 py-3.5 2xl:px-5 2xl:py-4 transition-all duration-200
        ${isOutOfStock
          ? "border-slate-200/70 opacity-60 cursor-not-allowed"
          : "border-slate-200/70 shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] cursor-pointer"
        }
      `}
    >
      {/* Image box */}
      <div className="relative flex h-[64px] w-[64px] 2xl:h-[76px] 2xl:w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
        {isOutOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70">
            <PackageX size={16} strokeWidth={1.8} className="text-red-400" />
          </span>
        )}
        {image ? (
          <img
            src={image}
            alt={title || "Treatment"}
            loading="lazy"
            className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <Pill size={20} strokeWidth={1.5} className="text-slate-300" />
        )}
      </div>

      {/* Title */}
      <div className="min-w-0 flex-1">
        {isOutOfStock && (
          <span className="inter-medium-font mb-1 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] text-red-500">
            Out of stock
          </span>
        )}
        <h3 className="inter-semibold-font truncate text-[14px] lg:text-[14px] 2xl:text-[16px] leading-snug text-slate-900">
          {title}
        </h3>
      </div>

      {/* Price + Button */}
      <div className="flex shrink-0 items-center gap-4 2xl:gap-5">
        <div className="text-right">
          <p className="inter-reg-font text-[10px] uppercase tracking-[0.1em] text-slate-400">From</p>
          <span className="inter-bold-font text-[16px] lg:text-[16px] 2xl:text-[20px] leading-tight text-[#47317c]">
            £{originalPrice}
          </span>
        </div>

        <button
          type="button"
          onClick={onClick}
          disabled={isOutOfStock || isLoading}
          className={`inter-medium-font inline-flex min-h-[36px] lg:min-h-[36px] 2xl:min-h-[42px] items-center justify-center gap-1.5
            rounded-xl px-4 lg:px-4 2xl:px-6 text-[12.5px] lg:text-[12.5px] 2xl:text-[13.5px]
            whitespace-nowrap transition-all duration-150
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
    </article>
  );
};

export default ProductListCard;
