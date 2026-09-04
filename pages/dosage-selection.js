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
import PageLoader from "@/Components/PageLoader/PageLoader";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function DosageSelection() {
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [abandonData, setAbandonData] = useState([]);
  const router = useRouter();
  // const {  } = useCartStore();
  const {
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeItemCompletely,
    setConsentGiven,
    items,
    totalAmount,
  } = useCartStore();
  const { productId } = useProductId();
  const { reorder } = useReorder();


  const {
    register,
    handleSubmit,
    clearErrors,
    setValue,
    watch,
    formState: { isValid, errors },
  } = useForm({
    mode: "onChange",
    defaultValues: { terms: false },
  });

  const [isExpiryRequired, setIsExpiryRequired] = useState(false);
  // Variation From zustand
  const { variation } = useVariationStore();

  // ✅ useEffect to check if `product?.show_expiry` is `0` or `1`
  useEffect(() => {
    if (
      variation?.name === "Mounjaro (Tirzepatide)" ||
      variation?.show_expiry === 1
    ) {
      setIsExpiryRequired(true);
    } else {
      setIsExpiryRequired(false);
      clearErrors("terms");
      setValue("terms", false);
    }
  }, [variation?.name, variation?.show_expiry, clearErrors, setValue]);

  useEffect(() => {
    items.doses.forEach((dose) => {
      if (dose.product_concent && !dose.consentGiven) {
        removeItemCompletely(dose.id, "dose");
      }
    });
  }, []);

  const expiryConfirmed = watch("terms");

  const allowed = variation?.allowed;
  const [showDoseModal, setShowDoseModal] = useState(false);
  const [selectedDose, setSelectedDose] = useState(null);
  const [prevMedication, setPrevMedication] = useState("");
  const [prevDose, setPrevDose] = useState("");
  const [lastTakenDate, setLastTakenDate] = useState(null);
  const { abandonCard, extra } = useAbandonCardStore();
  const abandonCartMutation = useMutation(abandonCart, {
    onSuccess: (data) => {
      if (data) {
        // router.push("/checkout");
      }
    },
    onError: (error) => {
      if (error) {
        // router.push("/checkout");
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
      {isButtonLoading && <PageLoader />}
      <AnimatePresence>
        {showDoseModal && selectedDose && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="max-h-[calc(100dvh-48px)] w-full max-w-md overflow-y-auto rounded-[22px] border border-white/80 bg-white shadow-[0_28px_80px_rgba(30,20,60,0.22)]"
            >
              <div className="relative border-b border-slate-100 bg-white px-6 py-5 pr-16">
                <h2 className="inter-semibold-font text-[19px] tracking-[-0.01em] text-slate-900">
                  Dosage Confirmation
                </h2>
                <button
                  type="button"
                  aria-label="Close dosage confirmation"
                  onClick={() => {
                    removeItemCompletely(selectedDose?.id, "dose");
                    setPrevMedication("");
                    setPrevDose("");
                    setLastTakenDate(null);
                    setShowDoseModal(false);
                  }}
                  className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-all duration-150 hover:border-[#47317c]/20 hover:bg-[#f5f2fc] hover:text-[#47317c] active:scale-95"
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M1.5 1.5L12.5 12.5M12.5 1.5L1.5 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="px-6 py-5">
                {selectedDose?.productConcent && (
                  <p className="inter-reg-font text-[13.5px] leading-[1.65] text-slate-600">
                    {selectedDose?.productConcent}
                  </p>
                )}
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="inter-medium-font mb-1 block text-[13px] text-slate-700">
                      Previous medication name
                    </label>
                    <input
                      type="text"
                      value={prevMedication}
                      onChange={(e) => setPrevMedication(e.target.value)}
                      placeholder="e.g. Ozempic, Mounjaro, Wegovy"
                      className="inter-reg-font h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-[14px] text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-[#47317c] focus:bg-white focus:ring-4 focus:ring-[#47317c]/[0.08]"
                    />
                  </div>
                  <div>
                    <label className="inter-medium-font mb-1 block text-[13px] text-slate-700">
                      What dose were you on? (mg)
                    </label>
                    <input
                      type="text"
                      value={prevDose}
                      onChange={(e) => setPrevDose(e.target.value)}
                      placeholder="e.g. 2.5"
                      className="inter-reg-font h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-[14px] text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-[#47317c] focus:bg-white focus:ring-4 focus:ring-[#47317c]/[0.08]"
                    />
                  </div>
                  <div>
                    <label className="inter-medium-font mb-1 block text-[13px] text-slate-700">
                      When did you last take it?
                    </label>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        value={lastTakenDate}
                        onChange={(date) => setLastTakenDate(date)}
                        maxDate={new Date()}
                        format="dd/MM/yyyy"
                        slotProps={{
                          popper: {
                            sx: { zIndex: 10001 },
                          },
                          dialog: {
                            sx: { zIndex: 10001 },
                          },
                          textField: {
                            fullWidth: true,
                            placeholder: "DD/MM/YYYY",
                            sx: {
                              "& .MuiOutlinedInput-root": {
                                height: "48px",
                                borderRadius: "12px",
                                backgroundColor: "rgba(248, 250, 252, 0.5)",
                                fontFamily: "var(--font-inter)",
                                fontSize: "14px",
                                transition: "all 150ms ease",
                                "&:hover": { backgroundColor: "#fff" },
                                "&.Mui-focused": {
                                  backgroundColor: "#fff",
                                  boxShadow: "0 0 0 4px rgba(71, 49, 124, 0.08)",
                                },
                              },
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e2e8f0" },
                              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
                              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#47317c", borderWidth: "1px" },
                              "& .MuiIconButton-root": { color: "#64748b" },
                            },
                          },
                          desktopPaper: {
                            sx: {
                              borderRadius: "16px",
                              boxShadow: "0 20px 50px rgba(30, 20, 60, 0.18)",
                              "& .MuiPickersDay-root.Mui-selected": { backgroundColor: "#47317c" },
                            },
                          },
                          mobilePaper: { sx: { borderRadius: "16px" } },
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <button
                  type="button"
                  disabled={!prevMedication || !prevDose || !lastTakenDate}
                  onClick={() => {
                    setConsentGiven(selectedDose?.id, {
                      medication_name: prevMedication,
                      dosage: prevDose,
                      dosage_time: format(lastTakenDate, "dd/MM/yyyy"),
                    });
                    setPrevMedication("");
                    setPrevDose("");
                    setLastTakenDate(null);
                    setShowDoseModal(false);
                  }}
                  className="inter-semibold-font inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[#47317c] px-5 py-3 text-[14px] text-white shadow-[0_8px_20px_rgba(71,49,124,0.22)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#3d2a6b] hover:shadow-[0_10px_24px_rgba(71,49,124,0.28)] active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#c8c1da] disabled:shadow-none disabled:hover:translate-y-0"
                >
                  {productId == FoundayoProductId ||
                  productId == WegovyPillProductId
                    ? "I confirm this dose"
                    : "I Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <StepsHeader />

      <div className="min-h-screen bg-[#FBFBFD] px-4 pb-44 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-xl py-8">

          <h1 className="inter-semibold-font mb-6 text-center text-[26px] sm:text-[30px] text-slate-900">
            You’re ready to start your personal <br /> weight loss journey
          </h1>

          <form onSubmit={handleSubmit(onSubmit)}>

            {/* Product card */}
            <div className="mb-5 overflow-hidden rounded-2xl border border-[#47317c]/[0.08] bg-white shadow-[0_4px_20px_rgba(71,49,124,0.10)]">
              <div className="flex items-center justify-center bg-[#47317c] p-5">
                <div className="flex w-full max-w-[320px] items-center justify-center px-5 py-3 ">
                  <img src={variation?.img} alt={variation?.name} className="h-36 w-full object-contain" />
                </div>
              </div>
              <div className="px-5 py-4">
                <h2 className="inter-semibold-font text-[18px] text-slate-900">{variation?.name}</h2>
                {variation?.name === "Mounjaro (Tirzepatide)" && (
                  <span className="inter-medium-font mt-1.5 inline-block rounded-full bg-[#47317c]/10 px-3 py-1 text-[11px] text-[#47317c]">
                    Pack of 5 Needles is included with every dose
                  </span>
                )}
                <p className="inter-medium-font mt-2 text-[14px] text-slate-500">
                  From <span>
                    £
                    {parseFloat(variation?.price || 0).toFixed(2)}
                  </span>
                </p>
              </div>
            </div>

            {/* Dosage section */}
            <div className="overflow-hidden rounded-2xl border border-[#47317c]/[0.08] bg-white px-5 py-5 shadow-[0_4px_20px_rgba(71,49,124,0.10)]">
              <h2 className="inter-semibold-font mb-4 text-[16px] text-slate-900">
                Choose your dosage
              </h2>

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

            {isExpiryRequired && (
              <div className="mt-4 rounded-xl border border-slate-100 bg-[#FBFBFD] p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" className="hidden"
                    {...register("terms", {
                      required: isExpiryRequired
                        ? "Please confirm that you have read and acknowledged the expiry information."
                        : false,
                    })}
                  />
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-2 transition-all duration-150 ${expiryConfirmed ? "border-[#47317c] bg-[#47317c]" : "border-slate-300 bg-white"}`}>
                    {expiryConfirmed && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <p className="inter-medium-font text-[14px] leading-relaxed text-slate-700">
                    Please confirm that you have reviewed the expiry dates of the selected doses.
                  </p>
                </label>
                {errors.terms && (
                  <p className="inter-reg-font mt-1.5 text-[12px] text-red-500">{errors.terms.message}</p>
                )}
              </div>
            )}

            {Array.isArray(variation?.addons) && variation?.addons.length > 0 && productId != 7 && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-[#47317c]/[0.08] bg-white px-5 py-5 shadow-[0_4px_20px_rgba(71,49,124,0.10)]">
                <h2 className="inter-semibold-font mb-4 text-[16px] text-slate-900">
                  Select Add-ons
                </h2>
                {variation?.addons
                  .slice()
                  .sort((a, b) => {
                    const aOutOfStock = a?.stock?.status === 0 || a?.stock?.quantity === 0 ? 1 : 0;
                    const bOutOfStock = b?.stock?.status === 0 || b?.stock?.quantity === 0 ? 1 : 0;
                    return aOutOfStock - bOutOfStock;
                  })
                  .map((addon) => {
                    const cartAddon = items.addons.find((item) => item.id === addon.id);
                    const cartQty = cartAddon?.qty || 0;
                    return (
                      <AddOn key={addon.id} addon={addon} quantity={cartQty} isSelected={cartQty > 0}
                        onAdd={() => handleAddAddon(addon)}
                        onIncrement={() => increaseQuantity(addon.id, "addon")}
                        onDecrement={() => decreaseQuantity(addon.id, "addon")}
                      />
                    );
                  })}
              </div>
            )}

          </form>
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-xl px-4 py-3">
          {/* Order summary row */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#47317c]/10">
                <img src={variation?.img} alt={variation?.name} className="h-7 w-7 object-contain" />
              </div>
              <p className="inter-medium-font text-[13px] text-slate-600 truncate max-w-[160px]">{variation?.name}</p>
            </div>
            <div className="text-right">
              <p className="inter-medium-font text-[11px] uppercase tracking-wide text-slate-400">Order total</p>
              <p className="inter-semibold-font text-[16px] text-[#47317c]">£{parseFloat(totalAmount)?.toFixed(2)}</p>
            </div>
          </div>

          {/* Action row */}
          {(totalSelectedQty() === 0 || !isValid) && (
            <p className="inter-medium-font mb-2 text-center text-[12px] text-slate-500">
              {totalSelectedQty() === 0
                ? "Select at least one dose to continue."
                : "Confirm the expiry dates to continue."}
            </p>
          )}
          <div className="flex items-center gap-2">
            <button type="button" onClick={back}
              className="inter-medium-font flex h-11 shrink-0 items-center gap-1 text-[13px] text-slate-500 hover:text-[#47317c] transition-colors cursor-pointer px-1">
              <IoIosArrowBack size={15} />
              Back
            </button>

            <div className="flex-1">
              {isButtonLoading ? (
                <div className="flex w-full items-center justify-center rounded-lg bg-[#47317c] py-3">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-5 w-5 rounded-full border-2 border-white border-t-transparent" />
                </div>
              ) : (
                <NextButton onClick={handleSubmit(onSubmit)} disabled={totalSelectedQty() === 0 || !isValid} label="Proceed to Checkout" />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
