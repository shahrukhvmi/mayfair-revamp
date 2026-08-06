import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import { Skeleton } from "@mui/material";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  Grid2X2,
  List,
  Pill,
  RefreshCcw,
  UploadCloud,
} from "lucide-react";

import { GetIdVerification } from "@/api/IdVerificationApi";
import GetProductsApi from "@/api/getProducts";
import ProductCard from "@/Components/ProductCard/ProdcutCard";
import GetImageIsUplaod from "@/api/GetImageIsUplaod";
import { GetPrescriptionEvidence } from "@/api/PrescriptionEvidenceApi";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useReorderBackProcessStore from "@/store/useReorderBackProcess";
import useProductId from "@/store/useProductIdStore";
import useReorder from "@/store/useReorderStore";
import useCouponStore from "@/store/couponStore";
import useImageUploadStore from "@/store/useImageUploadStore ";
import useIdVerificationUploadStore from "@/store/useIdVerificationUploadStore";
import useExplanationEvidenceStore from "@/store/useExplanationEvidenceStore";
import { usePathname } from "next/navigation";
import useAuthStore from "@/store/authStore";
import UploadTopPrompt from "@/Components/UploadTopPrompt/UploadTopPrompt";

/* =========================================================
   Skeleton Card
========================================================= */

const SkeletonCard = ({ viewMode = "list" }) => {
  const isListView = viewMode === "list";

  if (isListView) {
    return (
      <div className="flex min-h-[140px] overflow-hidden rounded-[18px] border border-[#47317c]/10 bg-white">
        <div className="w-[112px] shrink-0 p-3 sm:w-[136px]">
          <Skeleton
            variant="rectangular"
            height="100%"
            sx={{
              minHeight: 116,
              borderRadius: "14px",
              bgcolor: "rgba(71, 49, 124, 0.07)",
            }}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center p-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="min-w-0 flex-1">
            <Skeleton
              variant="text"
              width="25%"
              sx={{
                bgcolor: "rgba(71, 49, 124, 0.07)",
              }}
            />

            <Skeleton
              variant="text"
              width="58%"
              height={28}
              sx={{
                bgcolor: "rgba(71, 49, 124, 0.07)",
              }}
            />

            <Skeleton
              variant="text"
              width="82%"
              sx={{
                bgcolor: "rgba(71, 49, 124, 0.07)",
              }}
            />

            <Skeleton
              variant="text"
              width="55%"
              sx={{
                bgcolor: "rgba(71, 49, 124, 0.07)",
              }}
            />
          </div>

          <div className="mt-3 w-full sm:mt-0 sm:w-[175px]">
            <Skeleton
              variant="rectangular"
              height={78}
              sx={{
                borderRadius: "12px",
                bgcolor: "rgba(71, 49, 124, 0.07)",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[20px] border border-[#47317c]/10 bg-white">
      <Skeleton
        variant="rectangular"
        height={200}
        sx={{
          bgcolor: "rgba(71, 49, 124, 0.07)",
        }}
      />

      <div className="p-5">
        <Skeleton
          variant="text"
          width="70%"
          height={30}
          sx={{
            bgcolor: "rgba(71, 49, 124, 0.07)",
          }}
        />

        <Skeleton
          variant="text"
          width="92%"
          sx={{
            bgcolor: "rgba(71, 49, 124, 0.07)",
          }}
        />

        <Skeleton
          variant="text"
          width="60%"
          sx={{
            bgcolor: "rgba(71, 49, 124, 0.07)",
          }}
        />

        <Skeleton
          variant="rectangular"
          height={42}
          sx={{
            mt: 2,
            borderRadius: "11px",
            bgcolor: "rgba(71, 49, 124, 0.07)",
          }}
        />
      </div>
    </div>
  );
};

/* =========================================================
   Alert Banner
========================================================= */

// const AlertBanner = ({ title, description, buttonText }) => (
//   <div className="relative overflow-hidden rounded-[20px] border border-amber-200/80 bg-gradient-to-r from-[#fff9ef] via-white to-white px-4 py-4 shadow-[0_8px_24px_rgba(146,64,14,0.05)] sm:px-5">
//     <div className="pointer-events-none absolute -right-12 -top-14 h-28 w-28 rounded-full bg-amber-200/30 blur-3xl" />

//     <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
//       <div className="flex min-w-0 flex-1 items-start gap-3">
//         <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#e48300] text-white shadow-[0_7px_16px_rgba(228,131,0,0.2)]">
//           <AlertTriangle size={17} strokeWidth={2.5} />
//         </span>

//         <div className="min-w-0">
//           <p className="mont-semibold-font text-[13px] leading-5 text-slate-950">
//             {title}
//           </p>

//           <p className="mont-reg-font mt-0.5 text-[10.5px] leading-[1.65] text-slate-500 sm:text-[11px]">
//             {description}
//           </p>
//         </div>
//       </div>

//       <button
//         type="button"
//         className="mont-semibold-font inline-flex min-h-[40px] w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-[#47317c] px-4 py-2.5 text-[10.5px] text-white shadow-[0_7px_18px_rgba(71,49,124,0.2)] transition-all duration-200 hover:bg-[#392765] active:scale-[0.98] sm:w-auto"
//       >
//         <UploadCloud size={14} strokeWidth={2.4} />
//         {buttonText}
//       </button>
//     </div>
//   </div>
// );

/* =========================================================
   Section Card
========================================================= */

const SectionCard = ({ eyebrow, title, subtitle, action, children }) => (
  <section className="relative overflow-hidden rounded-[26px] border border-[#47317c]/[0.09] bg-white p-4 shadow-[0_16px_42px_rgba(71,49,124,0.075)] sm:p-5 lg:p-6">
    <div className="pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full bg-[#47317c]/[0.045] blur-3xl" />

    <div className="relative mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2 className="mont-bold-font text-[19px] leading-tight tracking-[-0.03em] text-slate-950 sm:text-[25px]">
          {eyebrow}
        </h2>

        {title && title !== eyebrow && (
          <p className="mont-medium-font mt-1 text-[11px] text-[#47317c]">
            {title}
          </p>
        )}

        {subtitle && (
          <p className="mont-reg-font mt-1.5 max-w-4xl text-[13px] lg:text-[15px] 2xl:text-[16px] leading-5 text-slate-800">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>

    <div className="relative">{children}</div>
  </section>
);

/* =========================================================
   My Account
========================================================= */

const MyAccount = () => {
  const { imageUploaded, setImageUploaded } = useImageUploadStore();
  const { reorder } = useReorder();
  const { token } = useAuthStore();
  const { idVerificationUpload, setIdVerificationUpload } =
    useIdVerificationUploadStore();

  const { setExplainenationEvidence, setExplainenationEvidenceDetails } =
    useExplanationEvidenceStore();

  const router = useRouter();
  const pathname = usePathname();
  const normalizedPathname = pathname?.endsWith("/")
    ? pathname
    : `${pathname || "/"}/`;

  const dashboardRoutes = [
    "/dashboard/",
    "/orders/",
    "/address/",
    "/change-password/",
    "/order-detail/",
    "/profile/",
    "/weight-loss-journey/",
  ];
  const isDashboardRoute = dashboardRoutes.includes(normalizedPathname);

  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState(null);
  const [productView, setProductView] = useState("list");
  const [isReorderLoading, setIsReorderLoading] = useState(false);

  const { authUserDetail, setIsReturning } = useAuthUserDetailStore();

  const { setReorderBackProcess } = useReorderBackProcessStore();

  const { setProductId } = useProductId();
  const { setReorder } = useReorder();
  const { clearCoupon } = useCouponStore();

  const clearCart = () => {
    console.log("Cart cleared");
  };

  useEffect(() => {
    setReorderBackProcess(false);
  }, [setReorderBackProcess]);

  const getProducts = useMutation(GetProductsApi, {
    onSuccess: (response) => {
      const productsResponse = response?.data?.data || {};

      setProductData(productsResponse);
      clearCart();
      setIsLoading(false);
    },

    onError: (error) => {
      toast.error(error?.response?.data?.errors || "Something went wrong");

      setIsLoading(false);
    },
  });

  useEffect(() => {
    getProducts.mutate({
      data: {},
    });
  }, []);

  useEffect(() => {
    setIsReturning(productData?.reorder != null);
  }, [productData?.reorder, setIsReturning]);

  /*
   * Reorder products sirf Current Treatment section
   * mein use honge.
   */
  const reorderProducts = useMemo(() => {
    if (Array.isArray(productData?.reorder)) {
      return productData.reorder;
    }

    return productData?.reorder ? [productData.reorder] : [];
  }, [productData?.reorder]);

  const currentTreatment =
    reorderProducts.length > 0 ? reorderProducts[0] : null;

  /*
   * Reorder product IDs available treatments se
   * exclude karne ke liye.
   */
  const reorderProductIds = useMemo(() => {
    return new Set(
      reorderProducts
        .map((product) => product?.id)
        .filter((productId) => productId !== null && productId !== undefined)
        .map(String),
    );
  }, [reorderProducts]);

  /*
   * Available Treatments mein sirf normal products.
   */
  const availableProducts = useMemo(() => {
    if (!Array.isArray(productData?.products)) {
      return [];
    }

    return [...productData.products]
      .filter((product) => {
        if (product?.id === null || product?.id === undefined) {
          return true;
        }

        return !reorderProductIds.has(String(product.id));
      })
      .sort(
        (firstProduct, secondProduct) =>
          (firstProduct?.sequence || 0) - (secondProduct?.sequence || 0),
      );
  }, [productData?.products, reorderProductIds]);

  const displayName = authUserDetail?.fname?.trim() || "Patient";

  const displayEmail = authUserDetail?.email?.trim() || "Not available";

  const lastOrderDate =
    currentTreatment?.lastOrderDate ||
    currentTreatment?.last_order_date ||
    currentTreatment?.last_order?.created_at ||
    "Not available";

  const currentTreatmentPrice =
    currentTreatment?.price !== null &&
    currentTreatment?.price !== undefined &&
    currentTreatment?.price !== ""
      ? currentTreatment.price
      : null;

  const currentTreatmentPreLaunchPrice =
    currentTreatment?.pre_launch_price !== null &&
    currentTreatment?.pre_launch_price !== undefined &&
    currentTreatment?.pre_launch_price !== ""
      ? currentTreatment.pre_launch_price
      : null;

  const currentTreatmentDisplayPrice =
    currentTreatmentPreLaunchPrice || currentTreatmentPrice;

  /*
   * Reorder click:
   * 1. Product ID store
   * 2. Reorder mode true
   * 3. Previous coupon clear
   * 4. Navigate to reorder page
   */
  const handleReorder = async (productId) => {
    if (!productId) {
      toast.error("Product ID is not available.");
      return;
    }

    if (isReorderLoading) {
      return;
    }

    try {
      setIsReorderLoading(true);

      setProductId(productId);
      setReorder(true);
      clearCoupon();
      setReorderBackProcess(false);

      await router.push("/re-order");
    } catch (error) {
      console.error("Failed to start reorder:", error);

      toast.error("Unable to start the reorder process.");

      setIsReorderLoading(false);
    }
  };

  // image uplaod and id verification status

  useEffect(() => {
    const fetchImageStatus = async () => {
      try {
        const res = await GetImageIsUplaod({ reorder });
        setImageUploaded(res?.data?.status);
      } catch (error) {
        console.error("Failed to fetch image status:", error);
      }
    };

    fetchImageStatus();
  }, [reorder]);

  useEffect(() => {
    const fetchIdStatus = async () => {
      try {
        const res = await GetIdVerification({ reorder });
        setIdVerificationUpload(res?.data?.status);
      } catch (error) {
        console.error("Failed to fetch ID status:", error);
      }
    };

    fetchIdStatus();
  }, [reorder]);

  useEffect(() => {
    const getEvidence = async () => {
      try {
        const res = await GetPrescriptionEvidence({ token });
        setExplainenationEvidence(res?.data?.require_evidence);
        setExplainenationEvidenceDetails(res?.data);
      } catch (error) {
        console.error("Failed to fetch prescription evidence status:", error);
      }
    };

    getEvidence();
  }, []);

  return (
    <main className="mont-reg-font min-w-0 flex-1 bg-[#f4f5fb] py-4.5">
      <div className="flex w-full max-w-[1560px] flex-col gap-4">
        {/* Welcome section */}
        <section className="relative overflow-hidden rounded-[26px] border border-[#47317c]/[0.09] bg-white px-4 py-5 shadow-[0_16px_42px_rgba(71,49,124,0.08)] sm:px-6 sm:py-6 lg:px-7">
          <div className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-[#47317c]/[0.07] blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="mont-bold-font mb-1.5 text-[10px] uppercase tracking-[0.16em] text-[#47317c]">
                My Account
              </p>

              <h1 className="mont-bold-font text-[25px] leading-tight tracking-[-0.04em] text-slate-950 sm:text-[29px]">
                {/* Welcome,{" "} */}
                <span className="mont-bold-font text-[25px] leading-tight tracking-[-0.04em] text-slate-950 sm:text-[29px] capitalize">
                  {" "}
                  {displayName}
                </span>
              </h1>
            </div>

            <div className="flex min-w-0 items-center gap-3 rounded-[18px] border border-[#47317c]/10 bg-[#faf8fd] px-4 py-3 lg:w-[300px]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#47317c] text-white shadow-[0_8px_18px_rgba(71,49,124,0.22)]">
                <CircleUserRound size={18} strokeWidth={2} />
              </span>

              <div className="min-w-0">
                <p className="mont-medium-font text-[10px] lg:text-[11px] 2xl:text-[13px] uppercase tracking-[0.11em] text-slate-400">
                  Logged in as
                </p>

                <p className="mont-medium-font mt-1 truncate text-[13px] lg:text-[15px] 2xl:text-[16px] text-slate-900">
                  {displayEmail}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Alerts */}
        <div className="flex flex-col gap-4">
          {(!imageUploaded || !idVerificationUpload) && isDashboardRoute && (
            <>
              <UploadTopPrompt />
            </>
          )}
        </div>
        {/* Current treatment */}
        {currentTreatment && (
          <SectionCard
            eyebrow="Reorder Treatment"
            title=""
            subtitle=""
            action={
              <div className="flex flex-wrap items-center justify-end gap-2" />
            }
          >
            <div className="overflow-hidden rounded-[20px] border border-[#47317c]/10 bg-gradient-to-r from-[#fbfaff] via-white to-white">
              <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                {/* Product details */}
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="relative flex h-[82px] w-[82px] shrink-0 items-center justify-center overflow-hidden rounded-[17px] border border-[#47317c]/10 bg-white shadow-[0_8px_24px_rgba(71,49,124,0.07)]">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#47317c]/[0.04] to-transparent" />

                    {currentTreatment?.img ? (
                      <img
                        src={currentTreatment.img}
                        alt={currentTreatment?.name || "Current treatment"}
                        className="relative z-10 h-full w-full object-contain p-2.5"
                      />
                    ) : (
                      <Pill
                        size={29}
                        strokeWidth={1.6}
                        className="relative z-10 text-[#47317c]"
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    {/* Desktop last order date */}
                    <div className="mb-1 hidden items-center gap-1 sm:flex">
                      <p className="mont-medium-font text-[10px] lg:text-[12px] 2xl:text-[14px] uppercase tracking-[0.1em] text-slate-800">
                        Last ordered:
                      </p>

                      <p className="mont-semibold-font text-[10px] lg:text-[12px] 2xl:text-[14px] text-slate-800">
                        {lastOrderDate}
                      </p>
                    </div>

                    <h3 className="mont-bold-font text-[14px] lg:text-[18px] 2xl:text-[20px] lg:text-[15px] 2xl:text-[16px] leading-6 tracking-[-0.02em] text-slate-950 sm:text-[18px]">
                      {currentTreatment?.name}
                    </h3>

                    <p className="mont-reg-font mt-1 text-[14px] lg:text-[15px] 2xl:text-[16px] leading-5 text-slate-500">
                      Your latest clinician-approved treatment.
                    </p>

                    {/* Mobile last order date */}
                    <div className="mt-3 inline-flex items-center gap-2 rounded-[10px] bg-[#47317c]/[0.05] px-2.5 py-2 sm:hidden">
                      <CalendarDays
                        size={13}
                        strokeWidth={2}
                        className="text-[#47317c]"
                      />

                      <span className="mont-medium-font text-[14px] text-slate-500">
                        Last ordered:
                      </span>

                      <span className="mont-semibold-font text-[16px] text-slate-800">
                        {lastOrderDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price and reorder action */}
                <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
                  {/* Price */}
                  <div className="flex min-h-[44px] items-center justify-between gap-4 rounded-[13px] px-4 py-2.5 sm:min-w-[145px] sm:justify-end">
                    <div className="sm:text-right">
                      <p className="mont-medium-font  text-[10px] lg:text-[12px] 2xl:text-[14px] uppercase tracking-[0.12em] text-slate-400">
                        From
                      </p>

                      <div className="mt-1 flex items-end gap-2 sm:justify-end">
                        <span className="mont-bold-font  text-[10px] lg:text-[18px] 2xl:text-[20px] leading-none text-[#47317c]">
                          £{currentTreatmentDisplayPrice}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reorder action */}
                  <button
                    type="button"
                    onClick={() => handleReorder(currentTreatment?.id)}
                    disabled={!currentTreatment?.id || isReorderLoading}
                    aria-busy={isReorderLoading}
                    className={`
                      mont-medium-font inline-flex min-h-[44px]
                      w-full shrink-0 items-center justify-center
                      gap-2 rounded-[13px] px-5 py-3
                       text-[12px] lg:text-[14px] 2xl:text-[16px] text-white
                      transition-all duration-200 sm:w-auto

                      ${
                        !currentTreatment?.id || isReorderLoading
                          ? `
                            cursor-not-allowed
                            bg-slate-300 shadow-none
                          `
                          : `
                            cursor-pointer bg-[#47317c]
                            shadow-[0_8px_20px_rgba(71,49,124,0.2)]
                            hover:bg-[#392765]
                            hover:shadow-[0_11px_26px_rgba(71,49,124,0.27)]
                            active:scale-[0.98]
                          `
                      }
                    `}
                  >
                    {isReorderLoading ? (
                      <>
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <RefreshCcw size={14} strokeWidth={2.4} />
                        Reorder treatment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Available treatments */}
        <SectionCard
          eyebrow="Available Treatments"
          title=""
          subtitle="We offer the following weight loss injection treatment options to help you in your weight loss journey."
          action={
            <div className="inline-flex w-full items-center rounded-[13px] border border-[#47317c]/10 bg-[#f7f5fa] p-1 sm:w-auto">
              <button
                type="button"
                onClick={() => setProductView("list")}
                aria-pressed={productView === "list"}
                className={`
                  mont-semibold-font inline-flex min-h-[38px]
                  flex-1 items-center justify-center gap-2
                  rounded-[9px] px-3.5 py-2 text-[14px]
                  transition-all duration-200 sm:flex-none cursor-pointer

                  ${
                    productView === "list"
                      ? `
                        bg-[#47317c] text-white
                        shadow-[0_6px_15px_rgba(71,49,124,0.2)]
                      `
                      : `
                        text-slate-500
                        hover:bg-white
                        hover:text-[#47317c]
                      `
                  }
                `}
              >
                <List size={14} strokeWidth={2.3} />
                List view
              </button>

              <button
                type="button"
                onClick={() => setProductView("grid")}
                aria-pressed={productView === "grid"}
                className={`
                  mont-semibold-font inline-flex min-h-[38px]
                  flex-1 items-center justify-center gap-2
                  rounded-[9px] px-3.5 py-2 text-[14px]
                  transition-all duration-200 sm:flex-none cursor-pointer

                  ${
                    productView === "grid"
                      ? `
                        bg-[#47317c] text-white
                        shadow-[0_6px_15px_rgba(71,49,124,0.2)]
                      `
                      : `
                        text-slate-500
                        hover:bg-white
                        hover:text-[#47317c]
                      `
                  }
                `}
              >
                <Grid2X2 size={14} strokeWidth={2.3} />
                Grid view
              </button>
            </div>
          }
        >
          {isLoading ? (
            <div
              className={
                productView === "list"
                  ? "grid grid-cols-1 gap-3 xl:grid-cols-2"
                  : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
              }
            >
              {[0, 1, 2].map((item) => (
                <SkeletonCard key={item} viewMode={productView} />
              ))}
            </div>
          ) : availableProducts.length > 0 ? (
            <div
              className={
                productView === "list"
                  ? "grid grid-cols-1 gap-3 xl:grid-cols-2"
                  : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
              }
            >
              {availableProducts.map((product, index) => (
                <ProductCard
                  key={product?.id || product?.sequence || index}
                  id={product?.id}
                  title={product?.name}
                  description={
                    product?.short_description ||
                    product?.description ||
                    product?.subtitle
                  }
                  image={product?.img}
                  price={product?.price || "N/A"}
                  pre_launch_price={product?.pre_launch_price || null}
                  status={product?.inventories?.[0]?.status}
                  buttonText="Start Consultation"
                  reorder={false}
                  viewMode={productView}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[20px] border border-dashed border-[#47317c]/20 bg-[#47317c]/[0.025] px-4 py-12 text-center">
              <Pill
                size={26}
                strokeWidth={1.7}
                className="mx-auto text-[#47317c]"
              />

              <p className="mont-semibold-font mt-3 text-[12px] text-slate-800">
                No treatments available
              </p>

              <p className="mont-reg-font mt-1 text-[10.5px] text-slate-500">
                Treatments will appear here when they become available.
              </p>
            </div>
          )}
        </SectionCard>
      </div>
    </main>
  );
};

export default MyAccount;
