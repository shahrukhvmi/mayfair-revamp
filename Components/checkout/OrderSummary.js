import React, { useState } from 'react';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import SectionHeader from './SectionHeader';

const OrderSummary = () => {
  const [discountCode, setDiscountCode] = useState("");

  const isApplyEnabled = discountCode.trim().length > 0;

  return (
    <div className="col-span-12 sm:col-span-4 mb-3">
      <div className="mb-24 sm:mb-0">
        <div className="bg-white p-6 rounded-2xl shadow-lg mt-6 sm:mt-[110px] font-inter">
          <div className="overflow-y-auto">
            <SectionHeader
              stepNumber={4}
              title="Order Summary"
              description=""
              completed={true}
            />

            {/* Scrollable Items */}
            <ul className="space-y-4 overflow-y-auto max-h-[250px] pr-1 pb-4">


              <li className="flex items-center justify-between bg-violet-100 rounded-xl p-3 shadow-sm hover:shadow-md transition">
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-sm font-semibold truncate text-gray-800">
                    Mounjaro (Tirzepatide) 5mg
                  </span>
                  <div className="flex items-center text-xs text-gray-600 mt-1 gap-2">
                    <span>(x1)</span>
                    <span>£250.00</span>
                  </div>
                </div>
                <button className="ml-2 p-2 rounded-full bg-white hover:bg-gray-100 text-violet-700 shadow transition">
                  <HiOutlinePencilAlt className="w-4 h-4" />
                </button>
              </li>

              {/* Needle Pack Static */}
              <li className="flex items-center justify-between bg-violet-100 rounded-xl p-3 shadow-sm">
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-sm font-semibold truncate text-gray-800">
                    Pack of 5 Needle
                  </span>
                  <div className="flex items-center text-xs text-gray-600 mt-1">
                    <span>(x1)</span>
                    <span className="ml-2">£0.00</span>
                  </div>
                </div>
              </li>

              {/* Addon Item */}
              <li className="flex items-center justify-between bg-violet-100 rounded-xl p-3 shadow-sm hover:shadow-md transition">
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-sm font-semibold truncate text-gray-800">
                    Sharps Bin
                  </span>
                  <div className="flex items-center text-xs text-gray-600 mt-1 gap-2">
                    <span>(x1)</span>
                    <span>£5.00</span>
                  </div>
                </div>
                <button className="ml-2 p-2 rounded-full bg-white hover:bg-gray-100 text-violet-700 shadow transition">
                  <HiOutlinePencilAlt className="w-4 h-4" />
                </button>
              </li>

              {/* Shipping */}
              <li className="flex items-center justify-between bg-violet-100 rounded-xl p-3 shadow-sm">
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-sm font-semibold truncate text-gray-800">
                    Shipping
                  </span>
                  <div className="flex items-center text-xs text-gray-600 mt-1">
                    <span>£9.99</span>
                  </div>
                </div>
              </li>


            </ul>

            {/* Subtotal */}
            <div className="flex justify-between items-center mt-8">
              <p className="text-sm text-gray-600 font-medium">Subtotal</p>
              <p className="text-sm text-gray-800 font-semibold">£264.99</p>
            </div>

            <hr className="my-4 border-gray-200" />

            {/* Total */}
            <div className="flex justify-between items-center">
              <p className="text-lg text-gray-900 font-bold">Total</p>
              <p className="text-lg text-gray-900 font-bold">£264.99</p>
            </div>

            <hr className="my-4 border-gray-200" />

            {/* Discount Section */}
            <div className="pt-4 flex flex-col space-y-4">
              {/* Discount Input */}
              <div className="flex">
                <input
                  type="text"
                  placeholder="Discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-1 text-sm text-black bg-gray-100 placeholder-gray-400 rounded-l-lg p-4 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={!isApplyEnabled}
                  className={`text-white font-semibold text-sm px-4 rounded-r-lg transition-all duration-200
                  ${isApplyEnabled
                      ? "bg-violet-700 hover:bg-violet-800 cursor-pointer"
                      : "bg-gray-300 cursor-not-allowed"
                    }`}
                >
                  Apply
                </button>
              </div>

              {/* Coupon Applied Static */}
              <div className="flex justify-between items-center bg-green-50 border border-green-400 rounded-xl p-4 shadow-sm">
                <div>
                  <p className="text-green-800 font-semibold">
                    WELCOME10 applied
                  </p>
                  <p className="text-green-600 text-xs">10% discount applied</p>
                </div>
                <button
                  type="button"
                  disabled
                  className="text-green-700 font-bold text-xl cursor-not-allowed"
                >
                  ×
                </button>
              </div>

              {/* Discount Row */}
              <div className="flex justify-between items-center text-green-700 font-semibold">
                <p>Discount</p>
                <p>-£26.50</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
