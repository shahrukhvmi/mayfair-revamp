import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaMinus, FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import ConfirmationModal from "../Modal/ConfirmationModal";

const AddOn = ({ addon }) => {
  const [showModal, setShowModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  const [qty, setQty] = useState(1); // initialize quantity
  const allowed = 100;

  const handleSelected = (e) => {
    e.stopPropagation();
    setIsSelected(!isSelected);
    if (!isSelected) setQty(1); // reset to 1 when selecting
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (qty < allowed) {
      setQty((prev) => prev + 1);
    } else {
      toast.error(`You can only select up to ${allowed} doses.`);
    }
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (qty > 1) {
      setQty((prev) => prev - 1);
    }
  };

  const handleDelete = () => {
    setShowModal(false);
    setQty(0);
    setIsSelected(false);
  };

  return (
    <>
      <div
        onClick={handleSelected}
        checked={isSelected}
        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer mb-3 transition-all duration-300 ease-in-out
            ${isSelected || addon.isSelected ? "bg-violet-200 bg-blue-100 hover:bg-violet-200" : "border-gray-300 bg-white hover:bg-gray-50"}`}
      >
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            onChange={handleSelected}
            checked={isSelected}
            className="appearance-none w-5 h-5 border-2 border-gray-300 rounded-full bg-white checked:border-violet-700 checked:bg-violet-700 transition-all duration-300 cursor-pointer"
          />
          <span className={`font-med text-sm sm:text-md capitalize ${isSelected || addon?.isSelected ? "text-violet-700" : "text-gray-800"} text-lg`}>
            {addon?.name}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`font-bold text-sm sm:text-md ${
              isSelected || addon?.isSelected ? "text-violet-700" : "text-gray-700"
            } font-bold text-sm sm:text-md`}
          >
            £{parseFloat(addon?.price).toFixed(2)}
          </span>

          {isSelected && (
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handleDecrement}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-2 py-2 rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-700 transition-all duration-300"
              >
                <FaMinus size={10} />
              </button>
              <span className="px-2 py-1 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg shadow-sm">{qty}</span>
              <button
                type="button"
                onClick={handleIncrement}
                className={`bg-gray-200 text-gray-700 hover:bg-gray-300 px-2 py-2 rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-700 transition-all duration-300 ${
                  qty >= allowed ? "cursor-not-allowed opacity-60" : ""
                }`}
                disabled={qty >= allowed}
              >
                <FaPlus size={10} />
              </button>
            </div>
          )}

          {isSelected && (
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
          )}
        </div>
      </div>
      <ConfirmationModal showModal={showModal} onConfirm={() => handleDelete()} onCancel={() => setShowModal(false)} />
    </>
  );
};

export default AddOn;
