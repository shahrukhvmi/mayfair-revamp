import React, { useEffect } from "react";
import { useRouter } from "next/router";
import useProductId from "@/store/useProductIdStore";
import usePatientStatus from "@/store/patientStatus";

const ProductCard = ({
  id,
  title,
  image,
  price,
  status,
  buttonText,
  reorder,
  lastOrderDate,
}) => {
  const router = useRouter();
  const { setProductId } = useProductId();
  const { setReorderPatient, setNewPatient } = usePatientStatus();

  const handleClick = () => {
    if (reorder) {
      setReorderPatient();
      router.push("re-order")
    } else {
      setNewPatient();
      router.push("acknowledgment")
    }
    setProductId(id);

  };

  // No need for this effect if setReorderPatient() is already called in handleClick
  useEffect(() => {
    if (reorder) {
      setReorderPatient();
    }
  }, [reorder]); // Make sure this only runs when `reorder` changes

  return (
    <>
      <div className="relative bg-white rounded-lg rounded-b-2xl overflow-hidden transition-transform shadow-md">
        {/* Out of Stock Overlay */}
        {!status && (
          <div className="h-full w-full left-0 absolute bg-[rgba(119,136,153,0.4)] cursor-not-allowed z-10 thin-font"></div>
        )}

        {/* Out of Stock Ribbon */}
        {!status && (
          <div className="absolute -left-8 top-7 bg-red-500 text-white px-[30px] text-xs py-1 rounded-tl -rotate-45 z-20 thin-font">
            Out of stock
          </div>
        )}

        {/* Price Ribbon */}
        {price && (
          <div className="absolute -right-8 top-7 bg-blue-500 text-white text-xs px-[30px] py-1 rounded-tr rotate-45 z-20 thin-font">
            From £{price}
          </div>
        )}

        {/* Product Image */}
        <div className="h-52 overflow-hidden bg-white">
          <img
            src={image}
            alt={title}
            className="w-full p-5 h-52 object-contain"
            // onError={(e) => (e.target.src = "/images/default.png")}
          />
        </div>

        {/* Product Details */}
        <div className="bg-[#EDE9FE] p-5 text-center rounded-2xl">
          <h2 className="text-lg bold-font mb-3 text-gray-900">{title}</h2>

          <p className="mb-3 text-sm font-semibold">
            {lastOrderDate && `Last Ordered: ${lastOrderDate}`}
          </p>

          <div className="w-full text-center">
            <button
              onClick={handleClick}
              type="button"
              className={
                status === false
                  ? "cursor-pointer reg-font bg-[#897bba] text-white py-2 px-6 rounded-full text-sm text-center"
                  : "cursor-pointer reg-font bg-[#5b45a7] text-white font-medium py-2 px-6 rounded-full text-sm text-center hover:bg-white hover:text-violet-700 transition-colors duration-200"
              }
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCard;
