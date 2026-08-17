import React from "react";
import toast from "react-hot-toast";
import {
  FaMinus,
  FaPlus,
  FaRegCircle,
  FaDotCircle,
  FaCheck,
  FaInfoCircle,
} from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import moment from "moment/moment";
import ConfirmationModal from "../Modal/ConfirmationModal";
import useCartStore from "@/store/useCartStore";
import { getNotified } from "@/api/GetNotified";
import RemoveAbandonCartApi from "@/api/RemoveAbandonCartApi";
import { useMutation } from "@tanstack/react-query";
import useProductId from "@/store/useProductIdStore";

const Dose = ({
  doseData,
  onAdd,
  onIncrement,
  onDecrement,
  isSelected,
  qty,
  allow,
  totalSelectedQty,
  abandonCartId,
  onDoseRemoved,
}) => {
  const [showModal, setShowModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { removeItemCompletely } = useCartStore();

  const RemoveAbandonCartMutation = useMutation(RemoveAbandonCartApi, {
    onSuccess: (data) => {
      // if (data) {
      //   toast.success(data?.message || "Item removed successfully");
      // }
    },
    onError: (error) => {
      console.log(error, "This is error");
    },
  });
  const { productId } = useProductId();
  const allowed = parseInt(allow || 100);
  const doseStatus = doseData?.stock?.status;
  const isOutOfStock = doseStatus === 0 || doseData?.stock?.quantity === 0;
  const isAllowExceeded = totalSelectedQty() >= allowed;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!isSelected) {
      onAdd();
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();

    const totalQty = totalSelectedQty() + 1;

    // Check if global total quantity exceeded
    if (totalQty > allowed) {
      toast.error(`You can only select up to ${allowed} units in total.`);
      return;
    }

    // Check if this product's own qty exceeded its stock
    if (doseData.qty >= doseData.stock.quantity) {
      toast.error(`Only ${doseData.stock.quantity} units are available.`);
      return;
    }

    // Check if this product's qty exceeded allowed
    if (qty >= allowed) {
      toast.error(
        `You cannot select more than ${allowed} units for this option.`,
      );
      return;
    }

    // All okay, increment
    onIncrement(doseData?.id);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (qty > 1) {
      onDecrement();
    } else {
      setShowModal(true);
    }
  };

  const handleDelete = () => {
    setShowModal(false);
    removeItemCompletely(doseData?.id, "doses");

    if (onDoseRemoved) {
      onDoseRemoved(doseData?.id);
    }

    console.log(abandonCartId, "aasasa");
    // RemoveAbandonCartMutation.mutate({ notification_id: abandonCartId });
  };

  const handleNotifiedClick = async (dose) => {
    setIsLoading(true);
    try {
      // ✅ Replace in your Dose.js:
      const response = await getNotified({
        eid: dose.pivot?.eid,
        pid: dose.pivot?.pid,
      });

      console.log(response, "response from get notified");

      if (response?.data?.status === true) {
        toast.success(response?.data?.message);
      } else {
        toast.error(response?.errors);
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.errors?.Notification ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // const price = Number(doseData?.price || 0);
  // const preLaunchPrice = Number(doseData?.pre_launch_price || 0);
  // const productName = String(doseData?.product_name || "")
  //   .trim()
  //   .toLowerCase();

  // const doseName = String(doseData?.name || "")
  //   .trim()
  //   .toLowerCase()
  //   .replace(/\s+/g, "");

  // const isWegovyPill = productName === "wegovy pill";
  // const isTwentyFiveMg = doseName === "25mg";

  // const price = Number(doseData?.price || 0);
  // const preLaunchPrice = Number(doseData?.pre_launch_price || 0);

  // const shouldUsePreLaunchPrice =
  //   isWegovyPill && isTwentyFiveMg && preLaunchPrice > 0;

  // const isPriceComingSoon =
  //   isWegovyPill && price <= 0 && !shouldUsePreLaunchPrice;

  return (
    <>
      <div className="relative">
        {/* <div className="absolute right-2 top-0 z-[60] flex items-center gap-2 flex-wrap justify-end"> */}

        

        {doseStatus === 0 && Number(productId) !== 7 && (
          <div className="absolute right-4 top-[-10px] group inline-block z-50">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNotifiedClick(doseData);
              }}
              disabled={isLoading}
              className="inline-flex items-end justify-end gap-1 px-3 py-1 text-xs text-green-700 cursor-pointer shadow-sm bg-green-100 hover:bg-green-200 border border-green-300 rounded"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-green-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  <span className="font-semibold whitespace-nowrap">
                    Loading...
                  </span>
                </>
              ) : (
                <>
                  <FaInfoCircle />
                  <span className="font-semibold whitespace-nowrap">
                    Get Notified
                  </span>
                </>
              )}
            </button>

            <div className="absolute right-20 bottom-5 mt-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-[70]">
              You'll be notified when this item is back in stock.
            </div>
          </div>
        )}
        {/* </div> */}
        <div
          onClick={isOutOfStock || isAllowExceeded ? undefined : handleAdd}
          className={`relative mt-3 flex flex-col items-start justify-between gap-3 rounded-xl border-2 p-3.5 transition-all duration-200 sm:flex-row sm:items-center sm:gap-0 sm:p-4
            ${isOutOfStock
              ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-50"
              : isSelected
                ? "cursor-pointer border-[#47317c] bg-[#47317c]/[0.04]"
                : isAllowExceeded
                  ? "cursor-not-allowed border-slate-200 bg-white opacity-60"
                  : "cursor-pointer border-slate-200 bg-white hover:border-[#47317c]/40 hover:bg-[#47317c]/[0.02]"
            }`}
        >
          {isOutOfStock && (
            <>
              <div className="absolute inset-0 z-10 cursor-not-allowed rounded-xl" />
              <div className="absolute left-3 top-[-10px] z-20 rounded-full bg-slate-500 px-3 py-0.5 text-[11px] font-semibold text-white">
                {Number(productId) == 7 ? "Coming Soon" : "Out of stock"}
              </div>
            </>
          )}

          {/* Left Side */}
          <div className="flex w-full min-w-0 items-start gap-2.5 sm:w-auto sm:items-center sm:gap-3">
            <div className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150 sm:h-5 sm:w-5
              ${isSelected ? "border-[#47317c] bg-[#47317c]" : "border-slate-300 bg-white"}`}>
              {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white sm:h-2 sm:w-2" />}
            </div>

            <div className="min-w-0 flex-1">
              <p className="inter-semibold-font break-words text-[14px] capitalize leading-snug text-slate-900 sm:text-[15px]">
                {doseData?.product_name}
              </p>
              <p className={`inter-medium-font text-[13px] ${isSelected ? "text-[#47317c]" : "text-slate-500"}`}>
                {doseData.name}
              </p>
              {doseData?.expiry && (
                <p className="inter-reg-font mt-0.5 text-[12px] text-slate-400">
                  Expiry: {moment(doseData?.expiry).format("DD/MM/YYYY")}
                </p>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className={`flex w-full items-center gap-2 border-t border-slate-100 pt-3 sm:w-auto sm:gap-3 sm:border-t-0 sm:pt-0 ${isSelected ? "justify-between" : "justify-end"}`}>
            <span className={`inter-semibold-font shrink-0 text-[16px] ${isSelected ? "text-[#47317c]" : "text-slate-700"}`}>
              £{parseFloat(doseData?.price).toFixed(2)}
            </span>

            {isSelected && (
              <>
                <div className="ml-auto flex items-center gap-0.5 rounded-full border border-slate-200 bg-white p-1 shadow-sm sm:ml-0 sm:gap-1">
                  <button type="button" onClick={handleDecrement}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors">
                    <FaMinus size={9} className="text-slate-600" />
                  </button>
                  <span className="inter-semibold-font w-6 text-center text-[13px] text-slate-900">{qty}</span>
                  <button type="button" onClick={handleIncrement}
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors
                      ${qty >= allowed ? "cursor-not-allowed bg-slate-100 opacity-40" : "bg-slate-100 hover:bg-slate-200 cursor-pointer"}`}>
                    <FaPlus size={9} className="text-slate-600" />
                  </button>
                </div>

                <button type="button"
                  onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-400 hover:bg-red-100 cursor-pointer transition-colors">
                  <MdDelete size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <ConfirmationModal
        showModal={showModal}
        onConfirm={handleDelete}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
};

export default Dose;
