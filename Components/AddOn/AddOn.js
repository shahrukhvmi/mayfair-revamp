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
        className={`relative mt-3 flex flex-col items-start justify-between gap-3 rounded-xl border-2 p-4 transition-all duration-200 sm:flex-row sm:items-center sm:gap-0
          ${isOutOfStock
            ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-50"
            : isSelected
              ? "cursor-pointer border-[#47317c] bg-[#47317c]/[0.04]"
              : "cursor-pointer border-slate-200 bg-white hover:border-[#47317c]/40 hover:bg-[#47317c]/[0.02]"
          }`}
      >
        {isOutOfStock && (
          <>
            <div className="absolute inset-0 z-10 cursor-not-allowed rounded-xl" />
            <div className="absolute left-3 top-[-10px] z-20 rounded-full bg-slate-500 px-3 py-0.5 text-[11px] font-semibold text-white">Out of stock</div>
          </>
        )}

        {/* Left Content */}
        <div className="flex items-start gap-3 sm:items-center">
          <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150
            ${isSelected ? "border-[#47317c] bg-[#47317c]" : "border-slate-300 bg-white"}`}>
            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
          </div>
          <div>
            <p className="inter-semibold-font text-[15px] capitalize text-slate-900">{addon?.product_name}</p>
            <p className={`inter-medium-font text-[13px] ${isSelected ? "text-[#47317c]" : "text-slate-500"}`}>{addon.name}</p>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
          <span className={`inter-semibold-font text-[16px] ${isSelected ? "text-[#47317c]" : "text-slate-700"}`}>
            £{parseFloat(addon?.price).toFixed(2)}
          </span>

          {isSelected && (
            <>
              <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-1 py-1 shadow-sm">
                <button type="button" onClick={handleDecrement}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors">
                  <FaMinus size={9} className="text-slate-600" />
                </button>
                <span className="inter-semibold-font w-6 text-center text-[13px] text-slate-900">{quantity}</span>
                <button type="button" onClick={handleIncrement}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors
                    ${quantity >= allowed ? "cursor-not-allowed bg-slate-100 opacity-40" : "bg-slate-100 hover:bg-slate-200 cursor-pointer"}`}>
                  <FaPlus size={9} className="text-slate-600" />
                </button>
              </div>

              <button type="button"
                onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 cursor-pointer transition-colors">
                <MdDelete size={15} />
              </button>
            </>
          )}
        </div>
      </div>

      <ConfirmationModal showModal={showModal} onConfirm={handleDelete} onCancel={() => setShowModal(false)} />
    </>
  );
};

export default AddOn;
