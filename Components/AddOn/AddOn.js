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


  const handleDelete = () => {
    setShowModal(false);
    removeItemCompletely(addon?.id, "addon");
  };
  

  return (
    <>
      <div
        onClick={handleAdd}
        className={`relative flex items-center justify-between p-5 border-2 cursor-pointer mt-3 transition-all duration-300 ease-in-out rounded-md ${stockStatus === 0
          ? "opacity-70 cursor-not-allowed bg-white border-black"
          : isSelected
            ? "border-primary bg-violet-100 hover:bg-violet-100"
            : "border-gray-300 bg-white hover:bg-gray-50"
          }`}
      >
        {/* Check badge */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
            <FaCheck size={12} />
          </div>
        )}

        {/* Left Content */}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            {isSelected ? (
              <FaDotCircle className="text-primary w-4 h-4 mt-1" />
            ) : (
              <FaRegCircle className="text-gray-800 w-4 h-4 mt-1" />
            )}
            <span className={`font-semibold ${isSelected ? "text-primary" : "text-gray-800"}`}>
              {addon?.title}
            </span>
          </div>


        </div>

        {/* Right Content */}
        <div className="flex items-center space-x-3">
          <span className={`font-bold text-lg ${isSelected ? "text-primary" : "text-gray-700"}`}>
            £{parseFloat(addon?.price).toFixed(2)}
          </span>

          {isSelected && (
            <>
              <div className="flex items-center space-x-2 bg-white rounded-full p-1 shadow-sm">
                <button type="button" onClick={handleDecrement} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full cursor-pointer">
                  <FaMinus size={10} className="text-black" />
                </button>
                <span className="px-3 py-1 text-black text-sm font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className={`bg-gray-100 hover:bg-gray-200 p-2 rounded-full ${quantity >= allowed ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                  disabled={quantity >= allowed}
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
                className="bg-red-100 hover:bg-red-200 text-red-500 rounded-md p-2 cursor-pointer"
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

export default AddOn;
