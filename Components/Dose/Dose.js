import React from "react";
import toast from "react-hot-toast";
import { FaMinus, FaPlus, FaRegCircle, FaDotCircle, FaCheck, FaInfoCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import moment from "moment/moment";
import ConfirmationModal from "../Modal/ConfirmationModal";
import useCartStore from "@/store/useCartStore";
import { getNotified } from "@/api/GetNotified";

const Dose = ({ doseData, onAdd, onIncrement, onDecrement, isSelected, qty, allow, totalSelectedQty }) => {
  const [showModal, setShowModal] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { removeItemCompletely } = useCartStore();

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
      toast.error(`You cannot select more than ${allowed} units for this option.`);
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
      toast.error(err?.response?.data?.errors?.Notification || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="relative">
        {doseStatus === 0 && (
          <div className="absolute group inline-block z-50  right-[0px] top-[-26px]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNotifiedClick(doseData);
              }}
              className="mt-2 px-2 py-2"
            >
              <span className="inline-flex items-center justify-center px-3 py-0.5 text-xs text-green-600 cursor-pointer shadow-sm bg-green-200 hover:bg-green-200 rounded">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span className="font-semibold px-2">Loading...</span>
                  </>
                ) : (
                  <>
                    <FaInfoCircle />
                    <span className="font-semibold px-1">Get Notified</span>
                  </>
                )}
              </span>
            </button>

            <div className="absolute left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
              You'll be notified when this item is back in stock.
            </div>
          </div>
        )}
        <div
          onClick={isOutOfStock || isAllowExceeded ? undefined : handleAdd}
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between w-full p-4 border-2 mt-3 transition-all duration-300 ease-in-out relative rounded-md border-primary gap-4 sm:gap-0
    ${
      isOutOfStock
        ? "opacity-50 cursor-not-allowed bg-white border-gray-400"
        : isSelected
        ? "border-primary bg-violet-100 cursor-pointer"
        : isAllowExceeded
        ? "border-primary bg-white cursor-not-allowed opacity-60"
        : "border-primary bg-white hover:bg-gray-50 cursor-pointer"
    }`}
        >
          {/* Overlay when out of stock */}
          {isOutOfStock && (
            <>
              {/* Overlay to disable interaction */}
              <div className="absolute inset-0 z-10 bg-white/10  cursor-not-allowed rounded-md"></div>

              {/* Out of stock badge */}
              <div className="absolute left-[14px] top-[-10px] bg-primary text-white px-3 py-0.5 text-xs font-semibold rounded z-20">
                Out of stock
              </div>
            </>
          )}

          {/* Tick if selected */}
          {isSelected && (
            <div
              className={`absolute -top-3 -right-3 bg-primary text-white rounded-full p-2 shadow-lg
             ${isSelected ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              <FaCheck size={12} />
            </div>
          )}

          {/* Left Side - Product Details */}
          <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
            {isSelected ? <FaDotCircle className="text-primary w-4 h-4 mt-1" /> : <FaRegCircle className="text-gray-800 w-4 h-4 mt-1" />}

            <div className="text-sm sm:text-base text-gray-800">
              <div className="capitalize font-semibold text-md sm:text-lg text-black">{doseData?.product_name}</div>
              <div className="text-sm text-gray-700">{doseData.name}</div>
              {doseData?.expiry && <div className="text-xs text-gray-500 mt-1">Expiry: {moment(doseData?.expiry).format("DD/MM/YYYY")}</div>}
            </div>
          </div>

          {/* Right Side - Price and Quantity */}
          <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
            <span className={`font-semibold text-md sm:text-lg ${isSelected ? "text-primary" : "text-gray-700"}`}>
              £{parseFloat(doseData?.price).toFixed(2)}
            </span>

            {isSelected && (
              <>
                <div className="flex items-center space-x-2 bg-white rounded-full px-2 py-1 shadow-md">
                  <button type="button" onClick={handleDecrement} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full cursor-pointer">
                    <FaMinus size={10} className="text-black" />
                  </button>

                  <span className="px-2 text-sm font-bold text-black">{qty}</span>

                  <button
                    type="button"
                    onClick={handleIncrement}
                    className={`p-2 rounded-full ${
                      qty >= allowed ? "cursor-not-allowed bg-gray-100 opacity-50" : "bg-gray-100 hover:bg-gray-200 cursor-pointer"
                    }`}
                  >
                    <FaPlus size={10} className="text-black" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModal(true);
                  }}
                  className="bg-red-100 hover:bg-red-200 text-red-500 rounded-full p-2 cursor-pointer"
                >
                  <MdDelete />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <ConfirmationModal showModal={showModal} onConfirm={handleDelete} onCancel={() => setShowModal(false)} />
    </>
  );
};

export default Dose;
