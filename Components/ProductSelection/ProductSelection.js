import React, { useEffect, useState } from "react";
import FullScreenModal from "../FullScreenModal/FullScreenModal";
import GetProductsApi from "@/api/getProducts";
import useProductId from "@/store/useProductIdStore";
import { useMutation } from "@tanstack/react-query";
import ModalProductListCard from "./ModalProductListCard";
import { Skeleton } from "@mui/material";
import { userConsultationApi } from "@/api/consultationApi";
import useCheckoutStore from "@/store/checkoutStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import useGpDetailsStore from "@/store/gpDetailStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import usePatientInfoStore from "@/store/patientInfoStore";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useLastBmi from "@/store/useLastBmiStore";
import useReturning from "@/store/useReturningPatient";
import useSignupStore from "@/store/signupStore";
import useBmiStore from "@/store/bmiStore";
import Router from "next/router";
import NextButton from "../NextButton/NextButton";
import useReorderButtonStore from "@/store/useReorderButton";
import useReorder from "@/store/useReorderStore";

const ProductSelection = ({ showProductSelection }) => {
  /* ───────────────  skeleton card ────────────── */
  const SkeletonCard = () => (
    <div className="flex flex-col items-stretch gap-2 rounded-2xl border border-slate-200/70 bg-white px-3 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-3.5">
      <Skeleton
        variant="rounded"
        width={64}
        height={64}
        className="!shrink-0 !rounded-xl"
      />

      <div className="min-w-0 flex-1">
        <Skeleton variant="text" width="65%" height={26} />
      </div>

      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-start sm:gap-4">
        <div className="flex items-center gap-2 sm:block">
          <Skeleton variant="text" width={36} height={16} />
          <Skeleton variant="text" width={68} height={26} />
        </div>
        <Skeleton
          variant="rounded"
          width={142}
          height={40}
          className="!w-full !rounded-xl sm:!w-[142px]"
        />
      </div>
    </div>
  );
  /* ───────────────  local state ────────────── */
  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState(null);
  const [showModal, setShowModal] = useState(showProductSelection);
  const [selectedProductId, setSelectedProductId] = useState(null); // NEW
  const [selectedTreatmentType, setSelectedTreatmentType] = useState(null);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [redirection, setRedirection] = useState("");

  /* ───────────────  stores (init only what we SET/CLEAR) ────────────── */

  const { setProductId, productId } = useProductId();
  const { setBmi, clearBmi } = useBmiStore();
  const { setCheckout, clearCheckout } = useCheckoutStore();
  const {
    setConfirmationInfo,
    clearConfirmationInfo,
    setConsentResetProductId,
  } =
    useConfirmationInfoStore();
  const { setGpDetails, clearGpDetails } = useGpDetailsStore();
  const { setMedicalInfo, clearMedicalInfo } = useMedicalInfoStore();
  const { setPatientInfo, clearPatientInfo } = usePatientInfoStore();
  const { authUserDetail } = useAuthUserDetailStore();
  const {
    billing,
    setBilling,
    shipping,
    setShipping,
    clearShipping,
    clearBilling,
  } = useShippingOrBillingStore();
  const { setLastBmi } = useLastBmi();
  const { firstName, lastName, setFirstName, setLastName } = useSignupStore();
  const { isFromReorder } = useReorderButtonStore();
  const { setReorder } = useReorder();

  /* ───────────────  products mutation ────────────── */
  const getProducts = useMutation(GetProductsApi, {
    onSuccess: (res) => {
      const resData = res?.data?.data || {};
      setProductData(resData);
      setIsLoading(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.errors || "Something went wrong");
      setIsLoading(false);
    },
  });

  /* ───────────────  initial effects ────────────── */
  useEffect(() => {
    // fetch product list once
    getProducts.mutate({});
  }, []);

  /* ───────────────  helper ────────────── */
  const renderSkeletons = () => (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col items-center">
        <Skeleton variant="text" width={190} height={36} />
        <Skeleton variant="text" width="min(100%, 390px)" height={24} />
      </div>

      <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-1 sm:gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      <div className="flex w-full justify-end border-t border-slate-100 pt-4">
        <Skeleton
          variant="rounded"
          width={180}
          height={42}
          className="!w-full !rounded-lg sm:!w-[180px]"
        />
      </div>
    </div>
  );

  /* ───────────────  mutation for consultation ────────────── */

  /* ───────────────  product selection handler ────────────── */
  const handleProductSelect = (id, treatment) => {
    if (isFromReorder) {
      if (treatment == "reorder") {
        setRedirection("/re-order");
        setReorder(true);
      } else {
        setRedirection("/acknowledgment");
        setReorder(false);
      }
    } else {
      setRedirection("/personal-details");
      setReorder(false);
    }
    setSelectedProductId((prev) => {
      const isDeselecting = prev === id;
      setSelectedTreatmentType(isDeselecting ? null : treatment);
      return isDeselecting ? null : id;
    });
  };

  //   useEffect(() => {
  //     if (!productId) {
  //       setShowModal(true);
  //     }
  //   }, [productId]);

  /* ───────────────  continue handler ────────────── */
  const hanlePrevData = () => {
    // setShowModal(false);
    setIsButtonLoading(true);
    const productChanged =
      productId != null && String(productId) !== String(selectedProductId);
    // Reordering the existing treatment reuses its saved consent. Only a
    // genuinely new treatment invalidates the previous product consent.
    if (productChanged && selectedTreatmentType === "new") {
      clearConfirmationInfo();
      setConsentResetProductId(selectedProductId);
    }
    setProductId(selectedProductId);

    Router.push(redirection);
  };
  return (
    <FullScreenModal isOpen={showModal} onClose={() => setShowModal(false)}>
      {isLoading ? (
        renderSkeletons()
      ) : (
        <div className="flex w-full flex-col items-center justify-center">
          <div className="flex w-full flex-col items-center justify-center gap-5">
            {/* ───── Reorder Treatments ───── */}

            {/* ───── Available Treatments ───── */}
            {productData?.products?.length ? (
              <section className="flex w-full flex-col items-center gap-5">
                <div className="text-center">
                  <h2 className="inter-bold-font text-[21px] tracking-[-0.02em] text-slate-900 sm:text-[24px]">
                    Select Treatment
                  </h2>
                  <p className="inter-reg-font mx-auto mt-1.5 max-w-md text-[12.5px] leading-5 text-slate-500 sm:text-[13px]">
                    We offer the following weight-loss injection treatments to
                    help you in your weight-loss journey…
                  </p>
                </div>

                <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-1 sm:gap-3">
                  {(Array.isArray(productData.reorder)
                    ? productData.reorder
                    : [productData.reorder]
                  )
                    .filter((item) => item?.inventories?.[0]?.status === 1)
                    .map((item) => (
                      <ModalProductListCard
                        key={item?.id}
                        id={item?.id}
                        title={item?.name}
                        image={item?.img}
                        originalPrice={item?.price || "N/A"}
                        isOutOfStock={!item?.inventories?.[0]?.status}
                        isLoading={false}
                        buttonText={
                          selectedProductId === item?.id
                            ? "Selected"
                            : "Reorder Treatment"
                        }
                        isSelected={selectedProductId === item?.id}
                        onClick={() =>
                          handleProductSelect(item?.id, "reorder")
                        }
                      />
                    ))}
                  {productData.products
                    .filter((p) => p?.inventories?.[0]?.status === 1)
                    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
                    .map((p) => (
                      <ModalProductListCard
                        key={p?.id}
                        id={p?.id}
                        title={p?.name}
                        image={p?.img}
                        originalPrice={p?.price || "N/A"}
                        isOutOfStock={!p?.inventories?.[0]?.status}
                        isLoading={false}
                        buttonText={
                          selectedProductId === p?.id
                            ? "Selected"
                            : "Select Treatment"
                        }
                        isSelected={selectedProductId === p?.id}
                        onClick={() => handleProductSelect(p?.id, "new")}
                      />
                    ))}
                </div>
              </section>
            ) : (
              <p className="text-sm text-gray-500 text-center">
                No available treatments at the moment.
              </p>
            )}

            {/* ───── Continue Button ───── */}
            <div className="sticky bottom-0 flex w-full justify-end border-t border-slate-100 bg-white/95 pt-4 backdrop-blur-sm">
              <div className="w-full sm:w-[180px]">
                <NextButton
                  disabled={!selectedProductId}
                  onClick={hanlePrevData}
                  label="Continue"
                  loading={isButtonLoading}
                  className="!rounded-lg px-5"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </FullScreenModal>
  );
};
export default ProductSelection;
