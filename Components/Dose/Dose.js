import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaMinus, FaPlus, FaInfoCircle, FaDotCircle, FaRegCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import moment from "moment/moment";
import ConfirmationModal from "../Modal/ConfirmationModal";

const Dose = ({ dose }) => {
  const [showModal, setShowModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  const [qty, setQty] = useState(1); // initialize quantity
  const allowed = 100;
  const doseStatus = dose?.stock?.status;

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
        onClick={(e) => {
          if (doseStatus === 0) return;
          handleSelected(e);
        }}
        className={`flex items-center justify-between p-4 border cursor-pointer mt-3 transition-all duration-300 ease-in-out relative ${
          doseStatus === 0
            ? "opacity-70 cursor-not-allowed bg-white mt-8 border-1 border-black"
            : isSelected || dose?.isSelected
            ? "border-violet-700 bg-violet-200 hover:bg-violet-200 rounded-lg"
            : "border-gray-300 bg-white hover:bg-gray-50 rounded-lg"
        }`}
      >
        {/* Out of Stock Overlay */}
        {doseStatus === 0 && <div className="h-full w-full top-0 left-0 absolute cursor-not-allowed z-10"></div>}

        {/* Out of Stock Ribbon */}
        {doseStatus === 0 && (
          <div className="absolute -left-[1px] top-[-25px] bg-black text-white px-[10px] text-xs py-1 rounded-t z-20">Out of stock</div>
        )}

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelected}
            className="appearance-none w-5 h-5 border-2 border-gray-300 rounded-full bg-white checked:border-violet-700 checked:bg-violet-700 transition-all duration-300 cursor-pointer hidden"
          />{" "}
          {isSelected ? <FaDotCircle className="text-violet-700 w-4 h-4 mt-1" /> : <FaRegCircle className="text-gray-800 w-4 h-4 mt-1" />}
          <span className={`font-med text-sm sm:text-md  ${isSelected ? "text-violet-700" : "text-gray-800"} text-lg`}>
            <span className="capitalize font-bold">{dose?.mediName}</span> <br />
            <span className="">{dose.name}</span>
            <br />
            <h5 className="text-gray-800 text-sm mt-0">{dose?.expiry ? `Expiry: ${moment(dose?.expiry).format("DD/MM/YYYY")}` : ""}</h5>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`font-bold ${isSelected ? "text-violet-700" : "text-gray-700"}`}>£{parseFloat(dose?.price).toFixed(2)}</span>

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
                  className={`bg-gray-200 text-gray-700 hover:bg-gray-300 px-2 py-2 rounded-full ${
                    qty >= allowed ? "cursor-not-allowed opacity-60" : ""
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

      <ConfirmationModal showModal={showModal} onConfirm={() => handleDelete()} onCancel={() => setShowModal(false)} />
    </>
  );
};

export default Dose;
