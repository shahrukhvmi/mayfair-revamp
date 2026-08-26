import React, { useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";

import { userConsultationApi } from "@/api/consultationApi";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import useBmiStore from "@/store/bmiStore";
import useCheckoutStore from "@/store/checkoutStore";
import useConfirmationInfoStore from "@/store/confirmationInfoStore";
import useCouponStore from "@/store/couponStore";
import useGpDetailsStore from "@/store/gpDetailStore";
import useLastBmi from "@/store/useLastBmiStore";
import lastOrderStore from "@/store/lastOrderStore";
import useMedicalInfoStore from "@/store/medicalInfoStore";
import usePatientInfoStore from "@/store/patientInfoStore";
import useProductId from "@/store/useProductIdStore";
import useReorder from "@/store/useReorderStore";
import useReturning from "@/store/useReturningPatient";
import useShippingOrBillingStore from "@/store/shipingOrbilling";
import useSignupStore from "@/store/signupStore";

import ProductGridCard from "./ProductGridCard";
import ProductListCard from "./ProductListCard";

const ProductCard = ({
  id,
  title,
  image,
  description,
  price,
  status,
  buttonText,
  reorder = false,
  pre_launch_price,
  viewMode = "list",
}) => {
  const router = useRouter();

  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const { setProductId } = useProductId();
  const { setReorder } = useReorder();
  const { clearCoupon } = useCouponStore();

  const { setBmi, clearBmi } = useBmiStore();
  const { setCheckout, clearCheckout } = useCheckoutStore();

  const { setConfirmationInfo, clearConfirmationInfo } =
    useConfirmationInfoStore();

  const { setGpDetails, clearGpDetails } = useGpDetailsStore();
  const { setMedicalInfo, clearMedicalInfo } = useMedicalInfoStore();
  const { setPatientInfo, clearPatientInfo } = usePatientInfoStore();

  const { setAuthUserDetail, clearAuthUserDetail } = useAuthUserDetailStore();

  const { setLastOrder, clearLastOrder } = lastOrderStore();

  const {
    setBilling,
    setShipping,
    setCheckShippingForAccordion,
    clearShipping,
    clearBilling,
    setCheckBillingForAccordion,
  } = useShippingOrBillingStore();

  const { setLastBmi } = useLastBmi();
  const { setFirstName, setLastName } = useSignupStore();
  const { setIsReturningPatient } = useReturning();

  const consultationMutation = useMutation(userConsultationApi, {
    onSuccess: (data) => {
      if (data?.data?.data == null) {
        clearBmi();
        clearCheckout();
        clearConfirmationInfo();
        clearGpDetails();
        clearMedicalInfo();
        clearPatientInfo();
        clearBilling();
        clearShipping();
        clearAuthUserDetail();
        clearLastOrder();
      } else if (data?.data) {
        setBmi(data?.data?.data?.bmi);
        setCheckout(data?.data?.data?.checkout);
        setConfirmationInfo(data?.data?.data?.confirmationInfo);
        setGpDetails(data?.data?.data?.gpdetails);
        setMedicalInfo(data?.data?.data?.medicalInfo);
        setPatientInfo(data?.data?.data?.patientInfo);
        setShipping(data?.data?.data?.shipping);

        setCheckShippingForAccordion(data?.data?.data?.shipping);

        setBilling(data?.data?.data?.billing);

        setCheckBillingForAccordion(data?.data?.data?.billing);

        setAuthUserDetail(data?.data?.data?.auth_user);
        setLastBmi(data?.data?.data?.bmi);
        setFirstName(data?.data?.data?.auth_user?.fname);
        setLastName(data?.data?.data?.auth_user?.lname);
        setIsReturningPatient(data?.data?.data?.isReturning);
        setLastOrder(data?.data?.data?.last_order);
      }

      if (reorder) {
        router.push("/re-order");
        setReorder(true);
        clearCoupon();
      } else {
        setReorder(false);
        router.push("/acknowledgment");
      }

      setIsButtonLoading(false);
    },

    onError: (error) => {
      console.log("error", error?.response?.data?.errors?.email);

      setIsButtonLoading(false);
    },
  });

  const handleClick = () => {
    if (!id || isButtonLoading) {
      return;
    }

    setProductId(id);
    setIsButtonLoading(true);

    consultationMutation.mutate({
      clinic_id: 1,
      product_id: id,
    });
  };

  const isOutOfStock = !status;

  const hasPrice =
    price !== null && price !== undefined && price !== "" && price !== "N/A";

  const sharedProps = {
    title,
    image,
    description,
    originalPrice: hasPrice ? price : null,
    isOutOfStock,
    isLoading: isButtonLoading,
    buttonText,
    onClick: handleClick,
  };

  if (viewMode === "grid") {
    return <ProductGridCard {...sharedProps} />;
  }
        {/* Price Ribbon */}
        {price && (
          // <div className="absolute -right-8 top-7 bg-blue-500 text-white text-xs px-[30px] py-1 rounded-tr rotate-45 z-20 thin-font">
          //   From £{price}
          // </div>
          <div className="absolute top-5 -right-10 z-20 w-40 rotate-45 rounded-sm bg-[#47317c]  py-1.5 text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-[9px] uppercase tracking-wider text-white mont-medium-font">
                From
              </span>
              <span className="text-xs mont-bold-font  tracking-wide text-white">
                {title === "Foundayo (Orforglipron)" ? `£${pre_launch_price}` : `£${price}`}
                {/* £{price} */}
              </span>
            </div>
          </div>
        )}

  return <ProductListCard {...sharedProps} />;
};

export default ProductCard;
