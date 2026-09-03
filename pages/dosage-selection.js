import StepsHeader from "@/layout/stepsHeader";
import React, { Fragment, useEffect, useState } from "react";
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
import BackButton from "@/Components/BackButton/BackButton";
import { IoIosArrowBack } from "react-icons/io";
import useReorder from "@/store/useReorderStore";
import { abandonCart } from "@/api/abandonCartApi";
import { useMutation } from "@tanstack/react-query";
import useProductId from "@/store/useProductIdStore";
import MetaLayout from "@/Meta/MetaLayout";
import { FoundayoProductId, meta_url, WegovyPillProductId } from "@/config/constants";
import { Checkbox, FormControlLabel } from "@mui/material";
import {
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import useAbandonCardStore from "@/store/abandonCardStore";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function DosageSelection() {
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [abandonData, setAbandonData] = useState([]);
  const router = useRouter();
  // const {  } = useCartStore();
  const { addToCart, increaseQuantity, decreaseQuantity, removeItemCompletely, setConsentGiven, items, totalAmount } =
    useCartStore();
  const { productId } = useProductId();
  console.log(productId, "productId in dosage selection");
  const { reorder } = useReorder();

  console.log(items, "items");

  const {
    register,
    handleSubmit,
    clearErrors,
    setValue,
    formState: { isValid, errors },
  } = useForm({
    mode: "onChange",
  });

  const [isExpiryRequired, setIsExpiryRequired] = useState(false);
  // Variation From zustand
  const { variation } = useVariationStore();

  // ✅ useEffect to check if `product?.show_expiry` is `0` or `1`
  useEffect(() => {
    if (variation?.show_expiry === 1) {
      setIsExpiryRequired(true);
    } else {
      setIsExpiryRequired(false);
      clearErrors("terms");
      setValue("terms", false);
    }
  }, [variation?.show_expiry, clearErrors, setValue]);

  useEffect(() => {
    items.doses.forEach((dose) => {
      if (dose.product_concent && !dose.consentGiven) {
        removeItemCompletely(dose.id, "dose");
      }
    });
  }, []);

  const allowed = variation?.allowed;
  const [showDoseModal, setShowDoseModal] = useState(false);
  const [selectedDose, setSelectedDose] = useState(null);
  const [prevMedication, setPrevMedication] = useState("");
  const [prevDose, setPrevDose] = useState("");
  const [lastTakenDate, setLastTakenDate] = useState("");
  const { abandonCard, extra } = useAbandonCardStore();
  const abandonCartMutation = useMutation(abandonCart, {
    onSuccess: (data) => {
      if (data) {
        // router.push("/checkout");
        console.log(data, "This is Abandon Cart Data");
      }
    },
    onError: (error) => {
      if (error) {
        // router.push("/checkout");
        console.log(error, "This is error");
      }
    },
  });

  //Handle Submit Button
  const onSubmit = () => {
    setIsButtonLoading(true);
    router.push("/checkout");

    //⚠️ commit krdia h yaha sy q k ab har dose k click k api direct chaly gi⚠️
    // abandonCartMutation.mutate(abandonData);
  };

  //Allowed checking here 🔥
  const totalSelectedQty = () =>
    items?.doses.reduce((total, v) => total + v.qty, 0);

  // ✅ Put here → outside your component or at the top inside your component file
  const generateProductConcent = (variations, selectedDoseName) => {
    if (productId == WegovyPillProductId) {
      return `If this is your first time taking Wegovy Tablets, you should start with the 1.5mg dose. Starting on a higher dose may increase the risk of side effects.\n\nPlease confirm that you are currently taking Wegovy Tablets from another provider, or have previously used, or currently use, a GLP-1 treatment such as Wegovy or Mounjaro.`;
    }

    if (productId == FoundayoProductId) {
      return `If this is your first time taking Foundayo Tablets or a GLP-1 medication, you should start with the 0.8mg dose. Starting on a higher dose may increase the risk of side effects.\n\nPlease confirm that you are currently taking Foundayo Tablets from another provider, or have previously used, or currently use, a GLP-1 treatment such as Wegovy or Mounjaro.`;
    }

    const sortedVariations = [...variations].sort((a, b) => {
      console.log(a, b, "sfkjefjfsj");
      const aMg = parseFloat(a.name);
      const bMg = parseFloat(b.name);
      return aMg - bMg;
    });

    const lowestDose = sortedVariations[0]?.name;
    const selectedIndex = sortedVariations.findIndex(
      (v) => v.name === selectedDoseName,
    );
    const previousDose =
      selectedIndex > 0 ? sortedVariations[selectedIndex - 1]?.name : null;

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

    //Start  :::::: new weegovy pill pre launch price added price ⚠️⚠️⚠️⚠️⚠️

    // START 9 MG WEGOOVY PILL PRE LAUNCH PRICE LOGIC ⚠️⚠️⚠️⚠️⚠️

    // const isWegovyPill =
    //   dose?.product_name?.trim().toLowerCase() === "wegovy pill";

    // const isNineMg =
    //   dose?.name?.replace(/\s+/g, "").trim().toLowerCase() === "25mg";

    // const regularPrice = Number(dose?.price || 0);
    // const preLaunchPrice = Number(dose?.pre_launch_price || 0);

    // const shouldUsePreLaunchPrice =
    //   isWegovyPill &&
    //   isNineMg &&
    //   dose?.pre_launch_price != null &&
    //   Number.isFinite(preLaunchPrice) &&
    //   preLaunchPrice > 0;

    // const finalPrice = shouldUsePreLaunchPrice ? preLaunchPrice : regularPrice;

    // end 9 MG WEGOOVY PILL PRE LAUNCH PRICE LOGIC ⚠️⚠️⚠️⚠️⚠️

    // const isWegovyPill =
    //   dose?.product_name?.toLowerCase().trim() === "wegovy pill";

    // const hasPreLaunchPrice =
    //   dose?.pre_launch_price !== null &&
    //   dose?.pre_launch_price !== undefined &&
    //   dose?.pre_launch_price !== "";

    // const finalPrice =
    //   isWegovyPill && hasPreLaunchPrice
    //     ? parseFloat(dose.pre_launch_price)
    //     : parseFloat(dose.price);

    // new weegovy pill pre launch price added price End⚠️⚠️⚠️⚠️⚠️


    // START FOUNDAYO PRE-LAUNCH PRICE LOGIC ⚠️⚠️⚠️

    // const productName = String(dose?.product_name || "")
    //   .trim()
    //   .toLowerCase();

    // const doseName = String(dose?.name || "")
    //   .trim()
    //   .toLowerCase()
    //   .replace(/\s+/g, "");

    // const isFoundayo =
    //   Number(productId) === FoundayoProductId ||
    //   productName === "foundayo (orforglipron)";

    // const preLaunchDoses = ["0.8mg", "2.5mg"];

    // const isPreLaunchDose = preLaunchDoses.includes(doseName);

    // const regularPrice = Number(dose?.price || 0);
    // const preLaunchPrice = Number(dose?.pre_launch_price || 0);

    // const shouldUsePreLaunchPrice =
    //   isFoundayo &&
    //   isPreLaunchDose &&
    //   Number.isFinite(preLaunchPrice) &&
    //   preLaunchPrice > 0;

    // const finalPrice = shouldUsePreLaunchPrice
    //   ? preLaunchPrice
    //   : regularPrice;

    // END FOUNDAYO PRE-LAUNCH PRICE LOGIC ⚠️⚠️⚠️

    const isFiveMg = dose?.name === "5 mg";
    const firstTwoDoses = variation?.variations?.slice(0, 1).map((v) => v.name);
    const isFirstTwoDose = firstTwoDoses?.includes(dose?.name);

    if ((isFirstTwoDose && !isFiveMg) || reorder == true) {
      addToCart({
        id: dose.id,
        type: "dose",
        name: dose.name,
        price: parseInt(dose?.price),
        allowed: parseInt(dose.allowed),
        item_id: dose.id,
        product: dose?.product_name || "Dose Product",
        product_concent: null,
        label: `${dose?.product_name} ${dose?.name}`,
        expiry: dose.expiry,
        isSelected: true,
      });
      // setAbandonData([
      //   ...abandonData,
      //   {
      //     eid: dose.id,
      //     pid: productId,
      //   },
      // ]);

      // ✅ Run abandonCartMutation right after adding
      abandonCartMutation.mutate({
        eid: dose.id,
        pid: productId || abandonCard?.productId,
      });
    } else {
      addToCart({
        id: dose.id,
        type: "dose",
        name: dose.name,
        price: parseInt(dose?.price),
        allowed: parseInt(dose.allowed),
        item_id: dose.id,
        product: dose?.product_name || "Dose Product",
        product_concent:
          isFirstTwoDose && !isFiveMg
            ? null
            : generateProductConcent(variation?.variations, dose?.name),
        label: `${dose?.product_name} ${dose?.name}`,
        expiry: dose.expiry,
        isSelected: true,
      });

      // setAbandonData([
      //   ...abandonData,
      //   {
      //     eid: dose.id,
      //     pid: productId,
      //   },
      // ]);
      abandonCartMutation.mutate({
        eid: dose.id,
        pid: productId || abandonCard?.productId,
      });
      setSelectedDose({
        ...dose,
        productConcent: generateProductConcent(
          variation?.variations,
          dose?.name,
        ),
      });
      setShowDoseModal(true);
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
      product_concent: null,
      label: addon?.name,
      expiry: addon.expiry,
      isSelected: true,
    });
  };

  // 🔥⚠️⚠️⚠️⚠️⚠️Abandone card selected dose auto add krne k liye useEffect ⚠️⚠️⚠️⚠️⚠️
  useEffect(() => {
    if (!abandonCard || !extra) return;
    if (!variation?.variations) return;

    if (abandonCard?.type === "abandoned-cart") {
      handleAddDose(extra);
    }
  }, [abandonCard, extra]);

  const back = () => {
    router.push("/confirmation-summary");
  };
  return (
    <>
      <MetaLayout canonical={`${meta_url}dosage-selection/`} />
      <div className="bottom-[100px] fixed left-10 cursor-pointer py-2 rounded-full border-2 border-violet-700 sm:block hidden">
        {/* <BackButton label="Back" onClick={back} className="mt-2 sm:block hidden " /> */}
        <button
          label="Back"
          onClick={back}
          className="text-violet-700 reg-font px-6 cursor-pointer"
        >
          <span>Back</span>
        </button>
      </div>
      <AnimatePresence>
        {showDoseModal && selectedDose && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative"
            >
              <button
                type="button"
                onClick={() => {
                  removeItemCompletely(selectedDose?.id, "dose");
                  setPrevMedication("");
                  setPrevDose("");
                  setLastTakenDate("");
                  setShowDoseModal(false);
                }}
                className="absolute -top-3 -right-3 flex items-center justify-center w-7 h-7 rounded-full bg-black cursor-pointer shadow-md"
              >
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M13 1L1 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
              <h2 className="text-xl bold-font mb-4 text-gray-800">
                Dosage Confirmation
              </h2>
              {selectedDose?.productConcent && (
                <p className="text-md paragraph rounded-md p-3 reg-font mb-4">
                  {selectedDose?.productConcent}
                </p>
              )}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Previous medication name
                  </label>
                  <input
                    type="text"
                    value={prevMedication}
                    onChange={(e) => setPrevMedication(e.target.value)}
                    placeholder="e.g. Ozempic, Mounjaro, Wegovy"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-[#47317c] focus:ring-1 focus:ring-[#47317c]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What dose were you on? (mg)
                  </label>
                  <input
                    type="text"
                    value={prevDose}
                    onChange={(e) => setPrevDose(e.target.value)}
                    placeholder="e.g. 2.5"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-[#47317c] focus:ring-1 focus:ring-[#47317c]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    When did you last take it?
                  </label>
                  <input
                    type="date"
                    value={lastTakenDate}
                    onChange={(e) => setLastTakenDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-[#47317c] focus:ring-1 focus:ring-[#47317c]/20"
                  />
                </div>
              </div>
              <NextButton
                label={productId == FoundayoProductId || productId == WegovyPillProductId ? "I confirm this dose" : " I Confirm"}
                disabled={!prevMedication || !prevDose || !lastTakenDate}
                onClick={() => {
                  console.log({
                    medication_name: prevMedication,
                    dosage: prevDose,
                    dosage_time: lastTakenDate,
                    selectedDose: selectedDose?.name,
                  });
                  setConsentGiven(selectedDose?.id, {
                    medication_name: prevMedication,
                    dosage: prevDose,
                    dosage_time: lastTakenDate,
                  });
                  setPrevMedication("");
                  setPrevDose("");
                  setLastTakenDate("");
                  setShowDoseModal(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <StepsHeader />

      <div
        className={`${inter.className} flex items-center justify-center bg-[#F2EEFF] px-4 sm:px-6 lg:px-8 mb-40 sm:mb-0`}
      >
        <div className="rounded-xl w-full max-w-2xl sm:my-10">
          <div className="w-full mx-auto sm:px-8 my-6 rounded-md">
            <div className="flex justify-center">
              <h1 className="niba-reg-font heading text-center my-3">
                You’re ready to start your personal weight loss journey
              </h1>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="">
                <div className="col-span-12 sm:col-span-6 md:px-4 py-10">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                    <div className="bg-primary p-6">
                      <img
                        src={variation?.img}
                        alt={variation?.name}
                        className="w-full h-40 object-contain"
                      />
                    </div>
                    <div className="sm:p-6 p-3">
                      <h2 className="text-2xl mb-2 bold-font text-gray-800">
                        {variation?.name}
                      </h2>
                      {variation?.name === "Mounjaro (Tirzepatide)" && (
                        <p className="inline-block px-3 py-1 text-xs font-semibold text-white bg-violet-500 rounded-full mb-2">
                          Pack of 5 Needles is included with every dose
                        </p>
                      )}

                      <br />

                      <span className="bold-font text-black">
                        From{" "}
                        <span>
                          £
                          {parseFloat(
                          variation?.price || 0
                          ).toFixed(2)}
                        </span>
                      </span>
                      {/* <div
                        className="reg-font text-gray-600 bg-red-50  p-3 rounded-md text-sm"
                        dangerouslySetInnerHTML={{ __html: variation?.description }}
                      ></div> */}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-lg  px-4 py-6">
                    <h1 className="my-4 niba-bold-font text-2xl text-black text-start">
                      <span className="niba-reg-font">Choose your </span> Dosage
                    </h1>

                    {variation?.variations
                      ?.sort((a, b) => {
                        const aOutOfStock = a?.stock?.status === 0;
                        const bOutOfStock = b?.stock?.status === 0;
                        const qOutOfStock = b?.stock?.quantity === 0;
                        const qaOutOfStock = a?.stock?.quantity === 0;

                        // Out of stock ko neeche le jao
                        if (qaOutOfStock && !qOutOfStock) return 1;
                        if (!qaOutOfStock && qOutOfStock) return -1;
                        if (aOutOfStock && !bOutOfStock) return 1;
                        if (!aOutOfStock && bOutOfStock) return -1;
                        return 0;
                      })
                      .map((dose, index) => {
                        const cartDose = items.doses.find(
                          (item) => item.id === dose.id,
                        );
                        const cartQty = cartDose?.qty || 0;

                        const is72mgWegovy =
                          dose?.name === "7.2mg" && productId == 1;
                        const is72mgSelected = is72mgWegovy && cartQty > 0;

                        return (
                          <React.Fragment key={index}>
                            <Dose
                              doseData={dose}
                              allow={allowed}
                              qty={cartQty}
                              totalSelectedQty={totalSelectedQty}
                              isSelected={cartQty > 0}
                              onAdd={() => handleAddDose(dose)}
                              onIncrement={() =>
                                increaseQuantity(dose.id, "dose")
                              }
                              onDecrement={() =>
                                decreaseQuantity(dose.id, "dose")
                              }
                            />

                            {is72mgSelected && (
                              <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3"
                              >
                                <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-3">
                                  <div className="flex gap-3">
                                    <HiOutlineInformationCircle className="mt-0.5 h-5 w-5 text-amber-600" />

                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">
                                        7.2mg Pack Information
                                      </p>

                                      <p className="mt-1 text-sm text-gray-600">
                                        Includes 4 single-dose pens. Other
                                        strengths are supplied as 1 pen
                                        containing 4 doses.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </div>

                  {variation?.show_expiry === 1 && (
                    <div className="flex flex-col space-y-2 text-sm py-6">
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...register("terms", {
                              required: isExpiryRequired
                                ? "Please confirm that you have read and acknowledged the expiry information."
                                : false,
                            })}
                            icon={
                              <span className="w-5 h-5 border-2 border-gray-400 rounded-full flex items-center justify-center" />
                            }
                            checkedIcon={
                              <span className="w-5 h-5 border-2 border-[#4565BF] rounded-full flex items-center justify-center">
                                <span className="w-2.5 h-2.5 bg-[#4565BF] rounded-full" />
                              </span>
                            }
                            sx={{
                              "& .MuiSvgIcon-root": {
                                display: "none",
                              },
                            }}
                          />
                        }
                        label={
                          <p className="font-sans font-bold text-sm italic text-black">
                            Please confirm that you have reviewed the expiry
                            dates of the selected doses.
                          </p>
                        }
                      />
                      {errors.terms && (
                        <p className="text-red-600 text-xs font-semibold">
                          {errors.terms.message}
                        </p>
                      )}
                    </div>
                  )}

                  {Array.isArray(variation?.addons) &&
                    variation?.addons.length > 0 &&
                    productId != FoundayoProductId && productId != WegovyPillProductId && (
                      <div className="bg-white rounded-lg shadow-lg  px-4 py-6 my-4">
                        <>
                          <h1 className="my-4 niba-reg-font text-2xl text-gray-800">
                            Select{" "}
                            <span className="font-bold text-2xl">Add-ons</span>
                          </h1>

                          {variation?.addons
                            .slice()
                            .sort((a, b) => {
                              const aOutOfStock =
                                a?.stock?.status === 0 ||
                                  a?.stock?.quantity === 0
                                  ? 1
                                  : 0;
                              const bOutOfStock =
                                b?.stock?.status === 0 ||
                                  b?.stock?.quantity === 0
                                  ? 1
                                  : 0;

                              return aOutOfStock - bOutOfStock;
                            })
                            .map((addon) => {
                              const cartAddon = items.addons.find(
                                (item) => item.id === addon.id,
                              );
                              const cartQty = cartAddon?.qty || 0;

                              return (
                                <AddOn
                                  key={addon.id}
                                  addon={addon}
                                  quantity={cartQty}
                                  isSelected={cartQty > 0}
                                  onAdd={() => handleAddAddon(addon)}
                                  onIncrement={() =>
                                    increaseQuantity(addon.id, "addon")
                                  }
                                  onDecrement={() =>
                                    decreaseQuantity(addon.id, "addon")
                                  }
                                />
                              );
                            })}
                        </>
                      </div>
                    )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#ffffff] px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Product Info */}
          <div className="flex items-start sm:items-center space-x-3 me-5">
            <img
              src={variation?.img}
              alt={variation?.name}
              className="w-10 h-10 rounded-md object-contain"
            />
            <div className="text-black leading-tight">
              <div className="text-lg bold-font">{variation?.name}</div>
              <div className="text-lg bold-font">
                <span className="me-2 sm:text-lg text-md reg-font paragraph">
                  Order total
                </span>
                £{parseFloat(totalAmount)?.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Button */}
          <div className="w-full sm:w-auto">
            {isButtonLoading === true ? (
              <div className="w-full px-28 py-3 rounded-full text-white bg-primary flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: "linear",
                  }}
                  className="w-5 h-5 border-4 border-t-transparent rounded-full text-white"
                />
              </div>
            ) : (
              <NextButton
                onClick={handleSubmit(onSubmit)}
                disabled={totalSelectedQty() === 0 || !isValid}
                label="Proceed to Checkout"
                className="w-full sm:w-auto"
              />
            )}

            <BackButton
              label="Back"
              className="mt-2 sm:hidden block"
              onClick={back}
            />
          </div>
        </div>
      </div>
    </>
  );
}
