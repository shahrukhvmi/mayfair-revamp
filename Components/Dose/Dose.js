import React from "react";
import toast from "react-hot-toast";
import { FaMinus, FaPlus, FaRegCircle, FaDotCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import moment from "moment/moment";
import ConfirmationModal from "../Modal/ConfirmationModal";
import useCartStore from "@/store/useCartStore";

const Dose = ({ doseData, onAdd, onIncrement, onDecrement, isSelected, qty, allow, totalSelectedQty }) => {
  const [showModal, setShowModal] = React.useState(false);
  const {
    removeItemCompletely,

  } = useCartStore();
  const allowed = parseInt(allow || 100);
  const doseStatus = doseData?.stock?.status;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!isSelected) {
      onAdd();
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    const totalQty = totalSelectedQty() + 1;

    if (totalQty > allowed) {
      toast.error(`You can only select up to ${allowed} units in total.`);
    } else if (doseData.qty >= doseData.stock.quantity) {
      toast.error(`Only ${doseData.stock.quantity} units are available.`);
    } else {
      onIncrement(doseData?.id);
    }
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
    removeItemCompletely(doseData?.id);
  };

  return (
    <>
      <div
        onClick={handleAdd}
        className={`flex items-center justify-between p-4 border cursor-pointer mt-3 transition-all duration-300 ease-in-out relative ${doseStatus === 0
          ? "opacity-70 cursor-not-allowed bg-white mt-8 border-1 border-black"
          : isSelected
            ? "border-violet-700 bg-violet-200 hover:bg-violet-200 rounded-lg"
            : "border-gray-300 bg-white hover:bg-gray-50 rounded-lg"
          }`}
      >
        {doseStatus === 0 && <div className="h-full w-full top-0 left-0 absolute cursor-not-allowed z-10"></div>}

        {doseStatus === 0 && (
          <div className="absolute -left-[1px] top-[-25px] bg-black text-white px-[10px] text-xs py-1 rounded-t z-20">Out of stock</div>
        )}

        <div className="flex items-center space-x-3">
          {isSelected ? <FaDotCircle className="text-violet-700 w-4 h-4 mt-1" /> : <FaRegCircle className="text-gray-800 w-4 h-4 mt-1" />}
          <span className={`reg-font text-black text-sm sm:text-md ${isSelected ? "text-violet-700" : "text-gray-800"} text-lg`}>
            <span className="capitalize bold-font">{doseData?.product_name}</span> <br />
            <span>{doseData.name}</span>
            <br />
            <h5 className="text-gray-800 text-sm mt-0">
              {doseData?.expiry ? `Expiry: ${moment(doseData?.expiry).format("DD/MM/YYYY")}` : ""}
            </h5>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`font-bold ${isSelected ? "text-violet-700" : "text-gray-700"}`}>£{parseFloat(doseData?.price).toFixed(2)}</span>

          {isSelected && (
            <>
              <div className="flex items-center space-x-1">
                <button type="button" onClick={handleDecrement} className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-2 py-2 rounded-full">
                  <FaMinus size={10} />
                </button>
                <span className="px-2 py-1 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg shadow-sm">{qty}</span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className={`bg-gray-200 text-gray-700 hover:bg-gray-300 px-2 py-2 rounded-full ${qty >= allowed ? "cursor-not-allowed opacity-60" : ""
                    }`}
                  disabled={qty >= allowed}
                >
                  <FaPlus size={10} />
                </button>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(true);
                }}
                className="bg-red-100 hover:bg-red-200 text-red-500 rounded-md p-2 ml-3"
              >
                <MdDelete />
              </button>
            </>
          )}
        </div>
      </div>

      <ConfirmationModal showModal={showModal} onConfirm={handleDelete} onCancel={() => setShowModal(false)} />
    </>
  );
};

export default Dose;
