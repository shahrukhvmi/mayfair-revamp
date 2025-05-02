import React from "react";
import toast from "react-hot-toast";
import { FaMinus, FaPlus, FaRegCircle, FaDotCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import moment from "moment";
import ConfirmationModal from "../Modal/ConfirmationModal";

const AddOn = ({ addon, onAdd, onIncrement, onDecrement, isSelected, quantity }) => {
  const [showModal, setShowModal] = React.useState(false);

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
    onDecrement();
  };

  return (
    <>
      <div
        onClick={handleAdd}
        className={`flex items-center justify-between p-4 border cursor-pointer mt-3 transition-all duration-300 ease-in-out relative ${
          stockStatus === 0
            ? "opacity-70 cursor-not-allowed bg-white mt-8 border-1 border-black"
            : isSelected
            ? "border-violet-700 bg-violet-200 hover:bg-violet-200 rounded-lg"
            : "border-gray-300 bg-white hover:bg-gray-50 rounded-lg"
        }`}
      >
        {stockStatus === 0 && <div className="h-full w-full top-0 left-0 absolute cursor-not-allowed z-10"></div>}

        <div className="flex items-center space-x-3">
          {isSelected ? <FaDotCircle className="text-violet-700 w-4 h-4 mt-1" /> : <FaRegCircle className="text-gray-800 w-4 h-4 mt-1" />}
          <span className={`reg-font text-black text-sm sm:text-md ${isSelected ? "text-violet-700" : "text-gray-800"} text-lg`}>
            <span className="capitalize bold-font">{addon?.title}</span> <br />
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`font-bold ${isSelected ? "text-violet-700" : "text-gray-700"}`}>£{parseFloat(addon?.price).toFixed(2)}</span>

          {isSelected && (
            <>
              <div className="flex items-center space-x-1">
                <button type="button" onClick={handleDecrement} className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-2 py-2 rounded-full">
                  <FaMinus size={10} />
                </button>
                <span className="px-2 py-1 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg shadow-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className={`bg-gray-200 text-gray-700 hover:bg-gray-300 px-2 py-2 rounded-full ${
                    quantity >= allowed ? "cursor-not-allowed opacity-60" : ""
                  }`}
                  disabled={quantity >= allowed}
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

export default AddOn;
