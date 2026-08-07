import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import { Skeleton } from "@mui/material";
import toast from "react-hot-toast";
import { CalendarDays, Grid2X2, List, Pill, RefreshCcw, User } from "lucide-react";

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
import useSignupStore from "@/store/signupStore";
import UploadTopPrompt from "@/Components/UploadTopPrompt/UploadTopPrompt";

/* ── Skeleton ── */
const SkeletonCard = ({ viewMode = "list" }) => {
  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-4 rounded-lg border border-slate-100 bg-white p-4">
        <Skeleton variant="rectangular" width={68} height={68} sx={{ borderRadius: "8px", bgcolor: "rgba(0,0,0,0.05)" }} />
        <div className="flex-1">
          <Skeleton variant="text" width="30%" sx={{ bgcolor: "rgba(0,0,0,0.05)" }} />
          <Skeleton variant="text" width="55%" height={22} sx={{ bgcolor: "rgba(0,0,0,0.05)" }} />
          <Skeleton variant="text" width="70%" sx={{ bgcolor: "rgba(0,0,0,0.05)" }} />
        </div>
        <Skeleton variant="rectangular" width={130} height={36} sx={{ borderRadius: "6px", bgcolor: "rgba(0,0,0,0.05)" }} />
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-slate-100 bg-white overflow-hidden">
      <Skeleton variant="rectangular" height={170} sx={{ bgcolor: "rgba(0,0,0,0.05)" }} />
      <div className="p-4">
        <Skeleton variant="text" width="65%" height={22} sx={{ bgcolor: "rgba(0,0,0,0.05)" }} />
        <Skeleton variant="text" width="90%" sx={{ bgcolor: "rgba(0,0,0,0.05)" }} />
        <Skeleton variant="rectangular" height={36} sx={{ mt: 2, borderRadius: "6px", bgcolor: "rgba(0,0,0,0.05)" }} />
      </div>
    </div>
  );
};

/* ── Page Header ── */
export const PageHeader = ({ label, title, subtitle, right }) => (
  <div className="relative overflow-hidden rounded-2xl border border-[#e4e0f5] px-5 py-5 sm:px-7 sm:py-6 2xl:px-9 2xl:py-8"
    style={{ backgroundImage: "radial-gradient(120% 140% at 88% 0, #ece8ff 0%, #f6f4ff 42%, #FBFBFD 78%)" }}>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="inter-semibold-font text-[10px] lg:text-[10px] 2xl:text-[11px] uppercase tracking-[0.16em] text-[#47317c]/70 mb-2">
          {label}
        </p>
        <h1 className="inter-bold-font text-[21px] leading-tight tracking-[-0.025em] text-slate-900 sm:text-[25px] lg:text-[25px] 2xl:text-[31px]">
          {title}
        </h1>
        {subtitle && (
          <p className="inter-reg-font mt-1.5 text-[12.5px] lg:text-[13px] 2xl:text-[14px] text-slate-500">{subtitle}</p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  </div>
);

/* ── My Account ── */
const MyAccount = () => {
  const { imageUploaded, setImageUploaded } = useImageUploadStore();
  const { reorder } = useReorder();
  const { token } = useAuthStore();
  const { idVerificationUpload, setIdVerificationUpload } = useIdVerificationUploadStore();
  const { setExplainenationEvidence, setExplainenationEvidenceDetails } = useExplanationEvidenceStore();

  const router = useRouter();
  const pathname = usePathname();
  const normalizedPathname = pathname?.endsWith("/") ? pathname : `${pathname || "/"}/`;

  const dashboardRoutes = ["/dashboard/", "/orders/", "/address/", "/change-password/", "/order-detail/", "/profile/", "/weight-loss-journey/"];
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

  useEffect(() => { setReorderBackProcess(false); }, [setReorderBackProcess]);

  const getProducts = useMutation(GetProductsApi, {
    onSuccess: (response) => {
      setProductData(response?.data?.data || {});
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.errors || "Something went wrong");
      setIsLoading(false);
    },
  });

  useEffect(() => { getProducts.mutate({ data: {} }); }, []);
  useEffect(() => { setIsReturning(productData?.reorder != null); }, [productData?.reorder, setIsReturning]);

  const reorderProducts = useMemo(() => {
    if (Array.isArray(productData?.reorder)) return productData.reorder;
    return productData?.reorder ? [productData.reorder] : [];
  }, [productData?.reorder]);

  const currentTreatment = reorderProducts[0] || null;

  const reorderProductIds = useMemo(() =>
    new Set(reorderProducts.map((p) => p?.id).filter(Boolean).map(String)),
    [reorderProducts]
  );

  const availableProducts = useMemo(() => {
    if (!Array.isArray(productData?.products)) return [];
    return [...productData.products]
      .filter((p) => p?.id == null || !reorderProductIds.has(String(p.id)))
      .sort((a, b) => (a?.sequence || 0) - (b?.sequence || 0));
  }, [productData?.products, reorderProductIds]);

  const { firstName } = useSignupStore();
  const displayName = authUserDetail?.fname?.trim() || firstName?.trim() || "Patient";
  const displayEmail = authUserDetail?.email?.trim() || "Not available";
  const lastOrderDate = currentTreatment?.lastOrderDate || currentTreatment?.last_order_date || currentTreatment?.last_order?.created_at || "Not available";
  const currentTreatmentDisplayPrice = currentTreatment?.pre_launch_price || currentTreatment?.price || null;

  const handleReorder = async (productId) => {
    if (!productId || isReorderLoading) return;
    try {
      setIsReorderLoading(true);
      setProductId(productId);
      setReorder(true);
      clearCoupon();
      setReorderBackProcess(false);
      await router.push("/re-order");
    } catch {
      toast.error("Unable to start the reorder process.");
      setIsReorderLoading(false);
    }
  };

  useEffect(() => {
    const run = async () => { try { const r = await GetImageIsUplaod({ reorder }); setImageUploaded(r?.data?.status); } catch {} };
    run();
  }, [reorder]);

  useEffect(() => {
    const run = async () => { try { const r = await GetIdVerification({ reorder }); setIdVerificationUpload(r?.data?.status); } catch {} };
    run();
  }, [reorder]);

  useEffect(() => {
    const run = async () => {
      try {
        const r = await GetPrescriptionEvidence({ token });
        setExplainenationEvidence(r?.data?.require_evidence);
        setExplainenationEvidenceDetails(r?.data);
      } catch {}
    };
    run();
  }, []);

  return (
    <main className="inter-reg-font min-w-0 flex-1 bg-[#FBFBFD]">
      <div className="flex w-full flex-col gap-6 p-4 sm:p-5 lg:p-6 2xl:p-8 2xl:gap-8">

        {/* Header */}
        <PageHeader
          label="My Account"
          title={`Welcome, ${displayName}`}
          subtitle="Here's an overview of your Mayfair account."
          right={
            <div className="flex items-center gap-3 rounded-xl border border-[#e8e2f5] bg-white/80 px-4 py-2.5">
              {/* <div className="flex h-8 w-8 2xl:h-10 2xl:w-10 shrink-0 items-center justify-center rounded-xl bg-[#47317c] text-white">
                <User size={14} strokeWidth={2} className="2xl:w-4 2xl:h-4" />
              </div> */}
              <div className="min-w-0">
                <p className="inter-medium-font text-[9.5px] lg:text-[10px] uppercase tracking-[0.1em] text-slate-400 leading-none mb-1">Logged in as</p>
                <p className="inter-semibold-font text-[12px] lg:text-[12px] 2xl:text-[13px] text-slate-800 truncate max-w-[160px]">{displayEmail}</p>
              </div>
            </div>
          }
        />

        {/* Alerts */}
        {(!imageUploaded || !idVerificationUpload) && isDashboardRoute && <UploadTopPrompt />}

        {/* Reorder Treatment */}
        {currentTreatment && (
          <section>
            <h2 className="inter-bold-font mb-3 text-[15px] lg:text-[16px] 2xl:text-[19px] text-slate-900">
              Reorder Treatment
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center overflow-hidden rounded-2xl border border-slate-200 bg-white">

              {/* Image panel */}
              <div className="flex h-[120px] w-full shrink-0 items-center justify-center bg-slate-50 sm:h-[100px] sm:w-[120px] lg:h-[110px] lg:w-[130px] 2xl:h-[130px] 2xl:w-[150px] border-b border-slate-100 sm:border-b-0 sm:border-r">
                {currentTreatment?.img ? (
                  <img
                    src={currentTreatment.img}
                    alt={currentTreatment?.name}
                    className="h-[88px] w-[88px] lg:h-[90px] lg:w-[90px] 2xl:h-[108px] 2xl:w-[108px] object-contain"
                  />
                ) : (
                  <Pill size={28} strokeWidth={1.5} className="text-slate-300" />
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-3 p-4 lg:p-5 2xl:p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CalendarDays size={12} strokeWidth={2} className="text-slate-400" />
                    <span className="inter-reg-font text-[12px] 2xl:text-[13px] text-slate-400">
                      Last ordered: <span className="inter-medium-font text-slate-600">{lastOrderDate}</span>
                    </span>
                  </div>
                  <h3 className="inter-bold-font text-[16px] lg:text-[17px] 2xl:text-[20px] text-slate-900 leading-tight">{currentTreatment?.name}</h3>
                  <p className="inter-reg-font mt-1 text-[12px] lg:text-[12.5px] 2xl:text-[13.5px] text-slate-500">Your latest clinician-approved treatment.</p>
                </div>

                <div className="flex items-center gap-4 sm:shrink-0">
                  {currentTreatmentDisplayPrice && (
                    <div className="text-right">
                      <p className="inter-reg-font text-[10px] uppercase tracking-[0.1em] text-slate-400">From</p>
                      <p className="inter-bold-font text-[20px] 2xl:text-[24px] text-[#47317c] leading-none mt-0.5">£{currentTreatmentDisplayPrice}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleReorder(currentTreatment?.id)}
                    disabled={!currentTreatment?.id || isReorderLoading}
                    className={`inter-medium-font inline-flex items-center gap-2 rounded-xl px-4 py-2.5 lg:px-5 2xl:px-6 2xl:py-3 text-[13px] 2xl:text-[14px] text-white transition-all duration-150 whitespace-nowrap
                      ${!currentTreatment?.id || isReorderLoading
                        ? "cursor-not-allowed bg-slate-200 text-slate-400"
                        : "cursor-pointer bg-[#47317c] hover:bg-[#392765] active:scale-[0.98]"
                      }`}
                  >
                    {isReorderLoading ? (
                      <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />Processing...</>
                    ) : (
                      <><RefreshCcw size={13} strokeWidth={2.2} />Reorder treatment</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Available Treatments */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="inter-bold-font text-[15px] lg:text-[16px] 2xl:text-[19px] text-slate-900">Available Treatments</h2>
              <p className="inter-reg-font mt-0.5 text-[12px] lg:text-[12.5px] 2xl:text-[13.5px] text-slate-500">
                Weight loss injection treatment options for your journey.
              </p>
            </div>

            {/* View toggle */}
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="inter-medium-font text-[10px] uppercase tracking-[0.1em] text-slate-400">View as</span>
              <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 gap-0.5">
                {[
                  { mode: "list",  Icon: List,    label: "List" },
                  { mode: "grid",  Icon: Grid2X2, label: "Grid" },
                ].map(({ mode, Icon, label }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setProductView(mode)}
                    aria-pressed={productView === mode}
                    title={`Switch to ${label} view`}
                    className={`inter-semibold-font inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] transition-all duration-150 cursor-pointer
                      ${productView === mode
                        ? "bg-white text-[#47317c] shadow-sm border border-slate-200/80 ring-1 ring-[#47317c]/10"
                        : "text-slate-400 hover:text-slate-700"
                      }`}
                  >
                    <Icon size={13} strokeWidth={productView === mode ? 2.5 : 2} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className={productView === "list" ? "grid grid-cols-1 gap-3 xl:grid-cols-2" : "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"}>
              {[0, 1, 2].map((i) => <SkeletonCard key={i} viewMode={productView} />)}
            </div>
          ) : availableProducts.length > 0 ? (
            <div className={productView === "list" ? "grid grid-cols-1 gap-3 xl:grid-cols-2" : "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"}>
              {availableProducts.map((product, index) => (
                <ProductCard
                  key={product?.id || product?.sequence || index}
                  id={product?.id}
                  title={product?.name}
                  description={product?.short_description || product?.description || product?.subtitle}
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
            <div className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
              <Pill size={20} strokeWidth={1.5} className="mx-auto text-slate-300" />
              <p className="inter-medium-font mt-3 text-[13px] text-slate-600">No treatments available</p>
              <p className="inter-reg-font mt-1 text-[12px] text-slate-400">Treatments will appear here when available.</p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
};

export default MyAccount;
