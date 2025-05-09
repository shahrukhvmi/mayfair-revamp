import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import PageLoader from "@/Components/PageLoader/PageLoader";
import StepsHeader from "@/layout/stepsHeader";
import NextButton from "@/Components/NextButton/NextButton";
import Image from "next/image";
import usePatientStatus from "@/store/patientStatus";
import useProductId from "@/store/useProductIdStore";
import { useSearchParams } from "next/navigation";

export default function Index() {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);

  //Search Param to get product ID
  const searchParams = useSearchParams();

  //From zustand Store
  const { productId, setProductId } = useProductId();
  const { patientStatus } = usePatientStatus();

  useEffect(() => {
    const param = searchParams.get("product_id");
    if (param) {
      const parsedId = parseInt(param, 10);
      if (!isNaN(parsedId)) {
        setProductId(parsedId); // ✅ store in Zustand + localStorage
      }
    }
  }, [searchParams, setProductId]);

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {},
  });

<<<<<<< HEAD
  const setReorderPatient = usePatientStatus.getState().setReorderPatient;
  const setNewPatient = usePatientStatus.getState().setNewPatient;
  
=======
  const setReorderPatient = usePatientStatus((state) => state.setReorderPatient);
  const setNewPatient = usePatientStatus((state) => state.setNewPatient);

>>>>>>> f2e3c83b1e1f7bf0b23384b70871ec86a05bb64d
  const onSubmit = async (data, e) => {
    const action = e.nativeEvent.submitter.value;

    if (action === "Accept and re-order") {
      setReorderPatient();
      router.push("/login");
    } else {
      setNewPatient();
      router.push("/acknowledgment");
    }

    setShowLoader(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <>
      <StepsHeader />

      <section className="my-8">
        <div className="bg-white max-w-xl mx-auto rounded-3xl p-10 shadow-lg border border-gray-100 relative">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <Image
              src="https://a.storyblok.com/f/263052/120x150/9bfb6f4c97/pod-conditions-icons__weight-loss_new.svg"
              alt="Weight Loss Icon"
              width={100}
              height={125}
              className="rounded-lg"
            />
          </div>

          {/* Heading */}
          <h2 className=" bold-font paragraph text-xl text-start mb-3 p-0">Let's get you started on your weight loss journey.</h2>

          <p className="reg-font text-start text-sm paragraph mb-8">We’ll now ask a few questions about you and your health.</p>

          {/* Good to know */}
          <div className="mb-10">
            <p className="bold-font paragraph mb-4">Good to know:</p>
            <ul className="reg-font list-disc list-inside space-y-3 paragraph text-[15px] leading-relaxed">
              <li>Your consultation will take about five minutes to complete.</li>
              <li>All your responses are confidential and securely stored.</li>
              <li>We’ll show suitable treatment options based on the information you provide.</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <NextButton type="submit" label="Accept and continue" disabled={!isValid} />

            <button
              type="submit"
              name="action"
              value="Accept and re-order"
              disabled={!isValid}
              className="cursor-pointer bg-[#8363b8] hover:bg-[#8363b8] text-white w-full py-3 rounded-full bold-font text-sm  transition my-3"
            >
              Accept and re-order
            </button>
          </form>

          {showLoader && (
            <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">
              <PageLoader />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
