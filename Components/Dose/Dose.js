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

  const isWegovyPill =
    doseData?.product_name?.toLowerCase().trim() === "wegovy pill" ||
    doseData?.name?.toLowerCase().trim() === "wegovy pill";

  const price = Number(doseData?.price || 0);
  const preLaunchPrice = Number(doseData?.pre_launch_price || 0);

  const hasPreLaunchPrice =
    isWegovyPill &&
    doseData?.pre_launch_price !== null &&
    doseData?.pre_launch_price !== undefined &&
    String(doseData?.pre_launch_price).trim() !== "" &&
    preLaunchPrice > 0;

  const isPriceComingSoon =
    isWegovyPill &&
    price === 0 &&
    (doseData?.pre_launch_price === null ||
      doseData?.pre_launch_price === undefined ||
      String(doseData?.pre_launch_price).trim() === "" ||
      preLaunchPrice === 0);

  return (
    <>
      <div className="relative">
        {/* <div className="absolute right-2 top-0 z-[60] flex items-center gap-2 flex-wrap justify-end"> */}
        {doseData?.pre_launch_price != null &&
          Number(productId) === 7 &&
          !isOutOfStock && (
            <div className="absolute right-[20px] top-[-10px] bg-green-100 border border-green-300 text-green-700 px-3 py-0.5 text-xs font-semibold rounded z-30 inline-flex items-center gap-1">
              <FaInfoCircle className="text-[10px]" />
              <span>Pre Launch Price</span>
            </div>
          )}

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
                {Number(productId) == 7 ? "Coming Soon" : "Out of stock"}
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
            {isSelected ? (
              <FaDotCircle className="text-primary w-4 h-4 mt-1" />
            ) : (
              <FaRegCircle className="text-gray-800 w-4 h-4 mt-1" />
            )}

            <div className="text-sm sm:text-base text-gray-800">
              <div className="capitalize font-semibold text-md sm:text-lg text-black">
                {doseData?.product_name}
              </div>
              <div className="text-sm text-gray-700">{doseData.name}</div>
              {doseData?.expiry && (
                <div className="text-xs text-gray-500 mt-1">
                  Expiry: {moment(doseData?.expiry).format("DD/MM/YYYY")}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Price and Quantity */}
          <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
            {/* <span
              className={`font-semibold text-md sm:text-lg ${isSelected ? "text-primary" : "text-gray-700"}`}
            >
              £{parseFloat(doseData?.price).toFixed(2)}
            </span> */}

            <span
              className={`font-semibold text-md sm:text-lg ${
                isSelected ? "text-primary" : "text-gray-700"
              }`}
            >
              {isPriceComingSoon ? (
                <span className="text-primary text-sm font-semibold">
                  Price coming soon
                </span>
              ) : hasPreLaunchPrice ? (
                <div className="flex items-center gap-1">
                  <span className="line-through text-gray-500 mont-medium-font text-sm">
                    £{price.toFixed(2)}
                  </span>

                  <span className="text-primary mont-bold-font">
                    £{preLaunchPrice.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-primary font-bold">
                  £{price.toFixed(2)}
                </span>
              )}
            </span>

            {isSelected && (
              <>
                <div className="flex items-center space-x-2 bg-white rounded-full px-2 py-1 shadow-md">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full cursor-pointer"
                  >
                    <FaMinus size={10} className="text-black" />
                  </button>

                  <span className="px-2 text-sm font-bold text-black">
                    {qty}
                  </span>

                  <button
                    type="button"
                    onClick={handleIncrement}
                    className={`p-2 rounded-full ${
                      qty >= allowed
                        ? "cursor-not-allowed bg-gray-100 opacity-50"
                        : "bg-gray-100 hover:bg-gray-200 cursor-pointer"
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
      <ConfirmationModal
        showModal={showModal}
        onConfirm={handleDelete}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
};

export default Dose;
