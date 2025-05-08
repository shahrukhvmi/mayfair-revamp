import StepsHeader from "@/layout/stepsHeader";
import React, { useState } from "react";
import { Inter } from "next/font/google";
import { useForm } from "react-hook-form";
import NextButton from "@/Components/NextButton/NextButton";
import Dose from "@/Components/Dose/Dose";
import AddOn from "@/Components/AddOn/AddOn";
import { useRouter } from "next/router";
import useVariationStore from "@/store/useVariationStore";
import useCartStore from "@/store/useCartStore";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function DosageSelection() {
  const [shownDoseIds, setShownDoseIds] = useState([]);
  const router = useRouter();
  // const {  } = useCartStore();
  const { addToCart, increaseQuantity, decreaseQuantity, items, totalAmount } = useCartStore();

  console.log(items, "items");

  const { handleSubmit } = useForm({
    mode: "onChange",
  });

  // Variation From zustand
  const { variation } = useVariationStore();

  console.log(variation?.variations, "variation");

  const allowed = variation?.allowed;
  const [showDoseModal, setShowDoseModal] = useState(false);
  const [selectedDose, setSelectedDose] = useState(null);

  const onSubmit = () => {
    router.push("/checkout");
  };
  //Allowed checking here 🔥
  const totalSelectedQty = () => items?.doses.reduce((total, v) => total + v.qty, 0);

  // ✅ Put here → outside your component or at the top inside your component file
  const generateProductConcent = (variations, selectedDoseName) => {
    const sortedVariations = [...variations].sort((a, b) => {
      const aMg = parseFloat(a.name);
      const bMg = parseFloat(b.name);
      return aMg - bMg;
    });

    const lowestDose = sortedVariations[0]?.name;
    const selectedIndex = sortedVariations.findIndex((v) => v.name === selectedDoseName);
    const previousDose = selectedIndex > 0 ? sortedVariations[selectedIndex - 1]?.name : null;

    return `If you are taking for the first time, you will need to start the treatment on the ${lowestDose} dose. If you start on the higher doses, the risk of side effects (e.g., nausea) will be very high. Please confirm that you are currently taking either the ${previousDose} or ${selectedDoseName} dose from a different provider.`;
  };

  const handleAddDose = (dose) => {
    const totalQty = totalSelectedQty() + 1;

    if (allowed > 0 && totalQty > allowed) {
      toast.error(`You can select only ${allowed} units in total.`);
      return;
    }

    const stockQuantity = parseInt(dose?.stock?.quantity) || 0;
    const existingItem = items?.doses?.find((i) => i.id === dose.id);
    const currentQty = existingItem?.quantity || 0;

    if (currentQty + 1 > stockQuantity) {
      toast.error(`Only ${stockQuantity} units available in stock.`);
      return;
    }

    const firstTwoDoses = variation?.variations?.slice(0, 2).map((v) => v.name);
    const isFirstTwoDose = firstTwoDoses.includes(dose?.name);

    if (isFirstTwoDose) {
      addToCart({
        id: dose.id,
        type: "dose",
        name: dose.name,
        price: parseFloat(dose.price),
        allowed: parseInt(dose.allowed),
        item_id: dose.id,
        product: dose?.product_name || "Dose Product",
        product_concent: "",
        label: dose?.name,
        expiry: dose.expiry,
        isSelected: true,
      });
    } else {
      const productConcent = generateProductConcent(variation?.variations, dose?.name);

      addToCart({
        id: dose.id,
        type: "dose",
        name: dose.name,
        price: parseFloat(dose.price),
        allowed: parseInt(dose.allowed),
        item_id: dose.id,
        product: dose?.product_name || "Dose Product",
        product_concent: productConcent,
        label: dose?.name,
        expiry: dose.expiry,
        isSelected: true,
      });

      // ✅ ✅ ✅ Check if modal was already shown for this dose
      if (!shownDoseIds.includes(dose.id)) {
        setSelectedDose({
          ...dose,
          productConcent: productConcent,
        });
        setShowDoseModal(true);

        // ✅ ✅ ✅ Mark this dose as shown
        setShownDoseIds((prev) => [...prev, dose.id]);
      }
    }
  };

  //Add to cart Addons🔥
  const handleAddAddon = (addon) => {
    addToCart({
      id: addon.id,
      type: "addon",
      name: addon.name,
      price: parseFloat(addon.price),
      allowed: parseInt(addon.allowed),
      item_id: addon.id,
      product: addon?.title || "Addon Product",
      product_concent: "Addon",
      label: addon?.name,
      expiry: addon.expiry,
      isSelected: true,
    });
  };

  return (
    <>
      <AnimatePresence>
        {showDoseModal && selectedDose && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full"
            >
              <h2 className="text-xl bold-font mb-4 text-gray-800">Dosage Confirmation</h2>
              {selectedDose?.productConcent && (
                <p className="text-sm text-gray-500 border rounded-md p-3 bg-gray-50 mb-4">{selectedDose?.productConcent}</p>
              )}
              <button
                onClick={() => {
                  // addToCart({
                  //   id: selectedDose.id,
                  //   type: "dose",
                  //   name: selectedDose.name,
                  //   price: parseFloat(selectedDose.price),
                  //   allowed: parseInt(selectedDose.allowed),
                  //   item_id: selectedDose.id,
                  //   product: selectedDose?.product_name || "Dose Product",
                  //   product_concent: "Once Weekly",
                  //   label: selectedDose?.name,
                  //   expiry: selectedDose.expiry,
                  //   isSelected: true,
                  // });
                  setShowDoseModal(false);
                }}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded"
              >
                Confirm Add
              </button>
              {/* <button
                onClick={() => setShowDoseModal(false)}
                className="w-full mt-2 border border-gray-300 py-2 px-4 rounded text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button> */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <StepsHeader />

      <div className={`${inter.className} flex items-center justify-center bg-[#F2EEFF] px-4 sm:px-6 lg:px-8 `}>
        <div className="rounded-xl w-full max-w-2xl my-20">
          <div className="w-full mx-auto sm:px-8 my-6 rounded-md">
            <div className="flex justify-center">
              <h1 className="niba-reg-font heading text-center my-3">You’re ready to start your personal weight loss journey</h1>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 px-4">
                <div className="col-span-12 sm:col-span-6 md:px-4 py-10">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                    <div className="bg-violet-700 p-6">
                      <img src={variation?.img} alt={variation?.name} className="w-full h-40 object-contain" />
                    </div>
                    <div className="p-6">
                      <h2 className="text-2xl mb-4 bold-font text-gray-800">{variation?.name}</h2>
                      <span className="bold-font text-black">From £{variation?.price}</span>
                      {/* <div
                        className="reg-font text-gray-600 bg-red-50  p-3 rounded-md text-sm"
                        dangerouslySetInnerHTML={{ __html: variation?.description }}
                      ></div> */}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg  px-4 py-6">
                    <h1 className="my-4 bold-font text-2xl text-black text-center">Choose your dosage</h1>

                    {variation?.variations
                      ?.sort((a, b) => {
                        const aOutOfStock = a?.stock?.status === 0;
                        const bOutOfStock = b?.stock?.status === 0;

                        // Out of stock ko neeche le jao
                        if (aOutOfStock && !bOutOfStock) return 1;
                        if (!aOutOfStock && bOutOfStock) return -1;
                        return 0;
                      })
                      .map((dose, index) => {
                        const cartDose = items.doses.find((item) => item.id === dose.id);
                        const cartQty = cartDose?.qty || 0;

                        return (
                          <Dose
                            key={index}
                            doseData={dose}
                            allow={allowed}
                            qty={cartQty}
                            totalSelectedQty={totalSelectedQty}
                            isSelected={cartQty > 0}
                            onAdd={() => handleAddDose(dose)}
                            onIncrement={() => increaseQuantity(dose.id, "dose")}
                            onDecrement={() => decreaseQuantity(dose.id, "dose")}
                          />
                        );
                      })}
                  </div>

                  <div className="bg-white rounded-lg shadow-lg  px-4 py-6 my-4">
                    {Array.isArray(variation?.addons) && variation?.addons.length > 0 && (
                      <>
                        <h1 className="my-4 niba-reg-font text-2xl text-gray-800">
                          Select <span className="font-bold text-2xl">Addons</span>
                        </h1>
                        {variation?.addons.map((addon) => {
                          const cartAddon = items.addons.find((item) => item.id === addon.id);
                          const cartQty = cartAddon?.qty || 0;

                          return (
                            <AddOn
                              addon={addon}
                              quantity={cartQty} // ✅ yeh change krna hoga DosageSelection me
                              isSelected={cartQty > 0}
                              onAdd={() => handleAddAddon(addon)}
                              onIncrement={() => increaseQuantity(addon.id, "addon")}
                              onDecrement={() => decreaseQuantity(addon.id, "addon")}
                            />
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#ffffff] px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] ">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 me-5">
            <img src={variation?.img} alt={variation?.name} className="w-10 h-10 rounded-md object-contain" />
            <div className="text-black leading-tight">
              <div className="text-lg bold-font">{variation?.name}</div>
              <div className="text-lg bold-font">
                £{totalAmount}
                <span className="text-lg reg-font">.00</span>
              </div>
            </div>
          </div>
          <div>
            <NextButton onClick={handleSubmit(onSubmit)} disabled={totalSelectedQty() === 0} label="Proceed to Checkout" />
          </div>
        </div>
      </div>
    </>
  );
}
