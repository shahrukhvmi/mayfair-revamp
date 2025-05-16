import StepsHeader from "@/layout/stepsHeader";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import getVariationsApi from "@/api/getVariationsApi";
import toast from "react-hot-toast";
import Fetcher from "@/library/Fetcher";
import useVariationStore from "@/store/useVariationStore";
import PageLoader from "@/Components/PageLoader/PageLoader";
import useShipmentCountries from "@/store/useShipmentCountriesStore";
import useBillingCountries from "@/store/useBillingCountriesStore";
import useCartStore from "@/store/useCartStore";
import useProductId from "@/store/useProductIdStore";

export default function GatherData() {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

  // store addons or dose here 🔥🔥
  const { setVariation } = useVariationStore();
  const { setShipmentCountries } = useShipmentCountries();
  const { setBillingCountries } = useBillingCountries();
  const { clearCart } = useCartStore();
  const { productId } = useProductId();

  console.log(productId, "productId productId");

  // Variations fetch mutation
  const variationMutation = useMutation(getVariationsApi, {
    onSuccess: (data) => {
      console.log(data, "ckdsjksdkjsd");
      if (data) {
        clearCart();
        // toast.success("User registered successfully!");
        const variations = data?.data?.data || [];
        setVariation(variations);
        setShipmentCountries(data?.data?.data?.shippment_countries);
        setBillingCountries(data?.data?.data?.billing_countries);
        // Redirect
        router.push("/dosage-selection");
      }
    },
    onError: (error) => {
      if (error?.response?.data?.errors) {
        toast.error(error?.response?.data?.errors);
        setShowLoader(false);
      }
    },
  });

  // Call mutation on mount
  useEffect(() => {
    setShowLoader(true);
    if (productId != null) {
      // console.log("Api Run");
      variationMutation.mutate({ id: productId, data: {} });
    }
  }, [productId]);

  return (
    <>
      <StepsHeader />
      {showLoader && (
        <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">
          <PageLoader />
        </div>
      )}
    </>
  );
}
