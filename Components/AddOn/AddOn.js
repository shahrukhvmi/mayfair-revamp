import React from "react";
import toast from "react-hot-toast";
import { FaMinus, FaPlus, FaRegCircle, FaCheck, FaDotCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import moment from "moment";
import ConfirmationModal from "../Modal/ConfirmationModal";
import useCartStore from "@/store/useCartStore";

const AddOn = ({ addon, onAdd, onIncrement, onDecrement, isSelected, quantity }) => {
  const [showModal, setShowModal] = React.useState(false);
  const { removeItemCompletely } = useCartStore();

  const allowed = parseInt(addon?.allowed || 100);
  const stockStatus = addon?.stock?.status;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!isSelected) {
      onAdd();
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (quantity >= allowed) {
      toast.error(`You can only select up to ${allowed} addons.`);
      return;
    }
    onIncrement();
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (quantity > 1) {
      onDecrement();
    } else {
      setShowModal(true);
    }
  };

  // const isOutOfStock = addon?.stock?.status == 0;
  const isOutOfStock = stockStatus === 0 || addon?.stock?.quantity === 0;

  const handleDelete = () => {
    setShowModal(false);
    removeItemCompletely(addon?.id, "addon");
  };

  return (
    <>
      <div
        onClick={!isOutOfStock && !isSelected ? handleAdd : undefined}
        className={`relative mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-[14px] border p-3 transition-all duration-200 sm:flex-nowrap sm:gap-y-0 sm:p-4
          ${isOutOfStock
            ? "cursor-not-allowed border-slate-200 bg-slate-50/80"
            : isSelected
              ? "cursor-pointer border-[#47317c] bg-[#47317c]/[0.04]"
              : "cursor-pointer border-slate-200 bg-white hover:border-[#47317c]/40 hover:bg-[#47317c]/[0.02]"
          }`}
      >
        {isOutOfStock && (
          <>
            <div className="absolute inset-0 z-10 cursor-not-allowed rounded-[14px] bg-slate-100/20" />
            <div className="inter-semibold-font absolute -top-3 sm:-top-3.5 left-3 z-20 inline-flex h-6 sm:h-7 items-center rounded-lg border border-rose-200 bg-rose-50 px-2 sm:px-3 text-[11.5px] max-sm:text-[12px] text-rose-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              Out of stock
            </div>
          </>
        )}

        {/* Left Content */}
        <div className={`flex min-w-0 flex-1 items-start gap-2.5 transition-opacity sm:items-center sm:gap-3 ${isOutOfStock ? "opacity-60 grayscale" : ""}`}>
          <div className={`mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[6px] border-2 transition-all duration-150 sm:h-5 sm:w-5
            ${isSelected ? "border-[#47317c] bg-[#47317c]" : "border-slate-300 bg-white"}`}>
            {isSelected && (
              <svg width="13" height="10" viewBox="0 0 10 8" fill="none" aria-hidden="true" className="block">
                <path d="M1 4L3.5 6.5L9 1" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="inter-semibold-font break-words text-[15px] max-sm:text-[16px] capitalize text-slate-900">{addon?.product_name}</p>
            <p className={`inter-medium-font text-[13px] max-sm:text-[16px] ${isSelected ? "text-[#47317c]" : "text-slate-900"}`}>{addon.name}</p>
          </div>
        </div>

        {/* Right Content */}
        <div className="contents sm:flex sm:items-center sm:gap-3">
          <span className={`inter-semibold-font shrink-0 text-[16px] max-sm:text-[16px] transition-opacity ${isSelected ? "text-[#47317c]" : "text-slate-900"} ${isOutOfStock ? "opacity-60 grayscale" : ""}`}>
            £{parseFloat(addon?.price).toFixed(2)}
          </span>

          {isSelected && (
            <div className="flex w-full basis-full items-center justify-between gap-2 sm:w-auto sm:basis-auto sm:gap-3">
              <div className="flex items-center gap-0.5 rounded-full border border-slate-200 bg-white p-0.5 shadow-sm sm:gap-1">
                <button type="button" onClick={handleDecrement}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors">
                  <FaMinus size={9} className="text-slate-600" />
                </button>
                <span className="inter-semibold-font w-6 text-center text-[13px] max-sm:text-[16px] text-slate-900">{quantity}</span>
                <button type="button" onClick={handleIncrement}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors
                    ${quantity >= allowed ? "cursor-not-allowed bg-slate-100 opacity-40" : "bg-slate-100 hover:bg-slate-200 cursor-pointer"}`}>
                  <FaPlus size={9} className="text-slate-600" />
                </button>
              </div>

              <button type="button"
                onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-500 transition-colors hover:border-red-200 hover:bg-red-100">
                <MdDelete size={17} />
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal showModal={showModal} onConfirm={handleDelete} onCancel={() => setShowModal(false)} />
    </>
  );
};

export default AddOn;
