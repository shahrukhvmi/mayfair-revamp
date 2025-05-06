import StepsHeader from "@/layout/stepsHeader";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import getVariationsApi from "@/api/getVariationsApi";
import toast from "react-hot-toast";
import Fetcher from "@/library/Fetcher";
import useVariationStore from "@/store/useVariationStore";
import PageLoader from "@/Components/PageLoader/PageLoader";

export default function GatherData() {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

  // store addons or dose here 🔥🔥
  const { setVariation } = useVariationStore();

  // Variations fetch mutation
  const variationMutation = useMutation(getVariationsApi, {
    onSuccess: (data) => {
      console.log(data, "ckdsjksdkjsd");
      if (data) {
        // toast.success("User registered successfully!");
        const token = data?.data?.data?.token;
        const variations = data?.data?.data || [];
        setVariation(variations);
        Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${token}`;

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
    variationMutation.mutate({ id: 4, data: {} });
  }, []);

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
