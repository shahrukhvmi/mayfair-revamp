import StepsHeader from "@/layout/stepsHeader";
import React from "react";
import { Inter } from "next/font/google";
import { useForm } from "react-hook-form";
import NextButton from "@/Components/NextButton/NextButton";
import Dose from "@/Components/Dose/Dose";
import AddOn from "@/Components/AddOn/AddOn";
import { useRouter } from "next/router";
import useVariationStore from "@/store/useVariationStore";
import useCartStore from "@/store/useCartStore";
import toast from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function DosageSelection() {
  const router = useRouter();
  // const {  } = useCartStore();
  const {
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    items,
  } = useCartStore();

  const { register, handleSubmit, formState: { isValid, errors } } = useForm({
    mode: "onChange",
  });

  const { variation } = useVariationStore();
  console.log(variation, "allowed")
  const allowed = variation?.allowed;
  const onSubmit = () => {
    router.push("/checkout");
  };

  // const handleAddDose = (dose) => {
  //   addToCart({
  //     id: dose.id,
  //     type: "dose", // ✅ FIXED (Directly dose likh do, ye galti waha hui thi)
  //     name: dose.name,
  //     price: parseFloat(dose.price),
  //     allowed: parseInt(dose.allowed),
  //     item_id: dose.id,
  //     product: dose?.product_name || "Dose Product",
  //     product_concent: "Once Weekly",
  //     label: dose?.name,
  //     expiry: dose.expiry,
  //     isSelected: true,
  //   });
  // };
  // const totalQty = totalSelectedQty + 1;


  const totalSelectedQty = () => items?.doses.reduce((total, v) => total + v.qty, 0);
  const handleAddDose = (dose) => {
    const totalQty = totalSelectedQty() + 1;

    if (allowed > 0 && totalQty > allowed) {
      console.log(allowed, "allowed")
      toast.error(`You can select only ${allowed} units in total.`);
      return;
    }

    const stockQuantity = parseInt(dose?.stock?.quantity) || 0;
    const existingItem = items?.doses?.find(i => i.id === dose.id);
    const currentQty = existingItem?.quantity || 0;

    if (currentQty + 1 > stockQuantity) {
      toast.error(`Only ${stockQuantity} units available in stock.`);
      return;
    }

    addToCart({
      id: dose.id,
      type: "dose",
      name: dose.name,
      price: parseFloat(dose.price),
      allowed: parseInt(dose.allowed),
      item_id: dose.id,
      product: dose?.product_name || "Dose Product",
      product_concent: "Once Weekly",
      label: dose?.name,
      expiry: dose.expiry,
      isSelected: true,
    });
  };









  const handleAddAddon = (addon) => {
    addToCart({
      id: addon.id,
      type: "addon",   // ✅ Correct -> only "addon", store ke andar hi ye addons banega
      name: addon.name,
      price: parseFloat(addon.price),
      allowed: parseInt(addon.allowed),
      item_id: addon.id,
      product: addon?.title || "Addon Product",  // ✅ Title use karo kyunki Addons me title hota hai
      product_concent: "Addon",
      label: addon?.name,
      expiry: addon.expiry,
      isSelected: true,

    });
  };


  return (
    <>
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
                      <img src="/images/wegovy.png" alt="" className="w-full h-40 object-contain" />
                    </div>
                    <div className="p-6">
                      <h2 className="text-2xl mb-4 bold-font text-gray-800">Mounjaro (Tirzepatide)</h2>
                      <span className="bold-font text-black">From £168.00</span>
                    </div>
                  </div>


                  <div className="bg-white rounded-lg shadow-lg  px-4 py-6">

                    <h1 className="my-4 bold-font text-2xl text-black text-center">
                      Choose your dosage
                    </h1>

                    {variation?.variations &&
                      variation?.variations.map((dose, index) => {
                        const cartDose = items.doses.find(item => item.id === dose.id);
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

                        )
                      })}
                  </div>



                  {Array.isArray(variation?.addons) && variation?.addons.length > 0 && (
                    <>
                      <h1 className="my-4 niba-reg-font text-2xl text-gray-800">
                        Select <span className="font-bold text-2xl">Addons</span>
                      </h1>
                      {variation?.addons.map((addon) => {
                        const cartAddon = items.addons.find(item => item.id === addon.id);
                        const cartQty = cartAddon?.qty || 0;

                        return (
                          <AddOn
                            addon={addon}
                            quantity={cartQty}   // ✅ yeh change krna hoga DosageSelection me
                            isSelected={cartQty > 0}
                            onAdd={() => handleAddAddon(addon)}
                            onIncrement={() => increaseQuantity(addon.id, "addon")}
                            onDecrement={() => decreaseQuantity(addon.id, "addon")}
                          />

                        )
                      })}
                    </>
                  )}

                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#ffffff] px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] ">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 me-5">
            <img src="/images/wegovy.png" alt="Mounjaro" className="w-10 h-10 rounded-md object-contain" />
            <div className="text-black leading-tight">
              <div className="text-lg bold-font">Mounjaro</div>
              <div className="text-lg bold-font">
                £189 <span className="text-lg reg-font">/month</span>
              </div>
            </div>
          </div>
          <div>

            <NextButton onClick={handleSubmit(onSubmit)} label="Next" />
          </div>

        </div>
      </div>
    </>
  );
}
