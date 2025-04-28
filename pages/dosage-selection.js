import StepsHeader from "@/layout/stepsHeader";
import React, { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import FormWrapper from "@/Components/FormWrapper/FormWrapper";
import { useForm } from "react-hook-form";
import NextButton from "@/Components/NextButton/NextButton";
import Dose from "@/Components/Dose/Dose";
import AddOn from "@/Components/AddOn/AddOn";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function DosageSelection() {
  const router = useRouter();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // You can change to "auto" for instant scrolling
    });
  }, []);

  const {
    register,
    handleSubmit,
    clearErrors,
    setValue,
    formState: { isValid, errors },
  } = useForm({
    mode: "onChange",
  });

  const clinic_id = 1;

  const onSubmit = (data) => {
    console.log("Submit");
    router.push("/checkout");
  };

  const variations = [
    {
      id: 19,
      name: "2.5 mg",
      mediName: "Mounjaro",
      status: 1,
      allowed: "4",
      multiple: 0,
      type: "Variation",
      required: 1,
      title: "2.5 mg",
      notice: "",
      price: "159.00",
      deleted_at: null,
      created_at: "2024-08-29T02:59:59.000000Z",
      updated_at: "2025-02-17T10:01:30.000000Z",
      expiry: "2025-08-31 00:00:00",
      stock: {
        id: 23,
        status: 1,
        quantity: 2,
        taggable_type: "App\\Models\\Extra",
        taggable_id: 19,
        deleted_at: null,
        created_at: "2024-08-29T02:59:59.000000Z",
        updated_at: "2025-04-14T11:16:51.000000Z",
      },
      pivot: {
        pid: 4,
        eid: 19,
      },
    },
    {
      id: 20,
      name: "5 mg",
      mediName: "Mounjaro",
      status: 1,
      allowed: "2",
      multiple: 0,
      type: "Variation",
      required: 1,
      title: "5 mg",
      notice: "",
      price: "189.00",
      deleted_at: null,
      created_at: "2024-08-29T03:01:12.000000Z",
      updated_at: "2025-02-17T10:01:40.000000Z",
      expiry: "2025-12-01 00:00:00",
      stock: {
        id: 24,
        status: 1,
        quantity: 10,
        taggable_type: "App\\Models\\Extra",
        taggable_id: 20,
        deleted_at: null,
        created_at: "2024-08-29T03:01:12.000000Z",
        updated_at: "2025-04-15T09:55:03.000000Z",
      },
      pivot: {
        pid: 4,
        eid: 20,
      },
    },
    {
      id: 21,
      name: "7.5 mg",
      mediName: "Mounjaro",
      status: 1,
      allowed: "3",
      multiple: 0,
      type: "Variation",
      required: 0,
      title: "7.5 mg",
      notice: "",
      price: "229.00",
      deleted_at: null,
      created_at: "2024-08-29T03:01:34.000000Z",
      updated_at: "2025-02-17T10:01:51.000000Z",
      expiry: "2025-12-01 00:00:00",
      stock: {
        id: 25,
        status: 1,
        quantity: 10,
        taggable_type: "App\\Models\\Extra",
        taggable_id: 21,
        deleted_at: null,
        created_at: "2024-08-29T03:01:34.000000Z",
        updated_at: "2025-04-15T09:54:56.000000Z",
      },
      pivot: {
        pid: 4,
        eid: 21,
      },
    },
    {
      id: 22,
      name: "10 mg",
      mediName: "Mounjaro",
      status: 1,
      allowed: "3",
      multiple: 0,
      type: "Variation",
      required: 0,
      title: "10 mg",
      notice: "",
      price: "229.00",
      deleted_at: null,
      created_at: "2024-08-29T03:01:55.000000Z",
      updated_at: "2025-02-17T10:02:12.000000Z",
      expiry: "2026-04-01 00:00:00",
      stock: {
        id: 26,
        status: 1,
        quantity: 10,
        taggable_type: "App\\Models\\Extra",
        taggable_id: 22,
        deleted_at: null,
        created_at: "2024-08-29T03:01:55.000000Z",
        updated_at: "2025-04-15T09:55:10.000000Z",
      },
      pivot: {
        pid: 4,
        eid: 22,
      },
    },
    {
      id: 23,
      name: "12.5 mg",
      mediName: "Mounjaro",
      status: 1,
      allowed: "3",
      multiple: 0,
      type: "Variation",
      required: 0,
      title: "12.5 mg",
      notice: "",
      price: "245.00",
      deleted_at: null,
      created_at: "2024-10-11T13:01:44.000000Z",
      updated_at: "2025-02-17T10:02:28.000000Z",
      expiry: "2025-12-01 00:00:00",
      stock: {
        id: 27,
        status: 0,
        quantity: 10,
        taggable_type: "App\\Models\\Extra",
        taggable_id: 23,
        deleted_at: null,
        created_at: "2024-10-11T13:01:44.000000Z",
        updated_at: "2025-02-17T10:02:28.000000Z",
      },
      pivot: {
        pid: 4,
        eid: 23,
      },
    },
    {
      id: 24,
      name: "15 mg",
      mediName: "Mounjaro",
      status: 1,
      allowed: "3",
      multiple: 0,
      type: "Variation",
      required: 0,
      title: "15 mg",
      notice: "",
      price: "245.00",
      deleted_at: null,
      created_at: "2024-10-11T13:02:41.000000Z",
      updated_at: "2025-02-17T10:02:48.000000Z",
      expiry: "2025-09-01 00:00:00",
      stock: {
        id: 28,
        status: 0,
        quantity: 8,
        taggable_type: "App\\Models\\Extra",
        taggable_id: 24,
        deleted_at: null,
        created_at: "2024-10-11T13:02:41.000000Z",
        updated_at: "2025-02-17T10:02:48.000000Z",
      },
      pivot: {
        pid: 4,
        eid: 24,
      },
    },
  ];

  const addons = [
    {
      id: 26,
      name: "Sharps Bin",
      status: 1,
      allowed: "10",
      multiple: 0,
      type: "Addon",
      required: 0,
      title: "Sharps Bin",
      notice: "<p>   </p>",
      price: "5.00",
      deleted_at: null,
      created_at: "2024-10-18T10:04:15.000000Z",
      updated_at: "2025-02-17T10:03:20.000000Z",
      expiry: "2025-04-01 00:00:00",
      stock: {
        id: 30,
        status: 1,
        quantity: 9,
        taggable_type: "App\\Models\\Extra",
        taggable_id: 26,
        deleted_at: null,
        created_at: "2024-10-18T10:04:15.000000Z",
        updated_at: "2025-02-17T10:03:20.000000Z",
      },
      pivot: {
        pid: 4,
        eid: 26,
      },
    },
    {
      id: 27,
      name: "Box of 5 Needles",
      status: 0,
      allowed: "10",
      multiple: 0,
      type: "Addon",
      required: 0,
      title: "Box of 5 Needles",
      notice: "<p> </p>",
      price: "2.00",
      deleted_at: null,
      created_at: "2024-10-18T10:05:50.000000Z",
      updated_at: "2025-02-17T10:03:28.000000Z",
      expiry: "2025-04-01 00:00:00",
      stock: {
        id: 31,
        status: 1,
        quantity: 10,
        taggable_type: "App\\Models\\Extra",
        taggable_id: 27,
        deleted_at: null,
        created_at: "2024-10-18T10:05:50.000000Z",
        updated_at: "2025-02-17T10:03:28.000000Z",
      },
      pivot: {
        pid: 4,
        eid: 27,
      },
    },
    {
      id: 28,
      name: "Pack of 10 Swabs",
      status: 1,
      allowed: "10",
      multiple: 0,
      type: "Addon",
      required: 0,
      title: "Pack of 10 Swabs",
      notice: "<p> </p>",
      price: "2.00",
      deleted_at: null,
      created_at: "2024-10-18T10:06:26.000000Z",
      updated_at: "2025-02-17T10:03:34.000000Z",
      expiry: "2025-04-01 00:00:00",
      stock: {
        id: 32,
        status: 1,
        quantity: 7,
        taggable_type: "App\\Models\\Extra",
        taggable_id: 28,
        deleted_at: null,
        created_at: "2024-10-18T10:06:26.000000Z",
        updated_at: "2025-02-17T10:03:34.000000Z",
      },
      pivot: {
        pid: 4,
        eid: 28,
      },
    },
  ];

  return (
    <>
      <StepsHeader />
      <div className={`${inter.className} flex items-center justify-center bg-green-50 px-4 sm:px-6 lg:px-8 `}>
        <div className="rounded-xl w-full max-w-2xl my-20">
          <div className="w-full mx-auto sm:px-8 my-6 rounded-md">
            <div className="flex justify-center">
              <h1 className="text-2xl md:text-4xl text-center my-3 text-black">You’re ready to start your personal weight loss journey</h1>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 px-4">
                {/* Left Column (Main Content) */}
                <div className="col-span-12 sm:col-span-6 md:px-4 py-10">
                  {/* Product Info */}
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                    <div className="bg-violet-700 p-6">
                      <img src="/images/wegovy.png" alt="" className="w-full h-40 object-contain" />
                    </div>
                    <div className="p-6">
                      <h2 className="text-2xl mb-4 text-gray-800">Wegovy (Semaglutide)</h2>
                      <span className="text-gray-800">From £168.00</span>
                    </div>
                  </div>

                  <h1 className="my-4 font-reg text-2xl text-gray-800">
                    Select <span className="font-bold text-2xl">Dosage</span>
                  </h1>

                  {Array.isArray(variations) && variations.map((dose, index) => <Dose dose={dose} />)}

                  {addons?.length > 0 && (
                    <>
                      <h1 className="my-4 font-reg text-2xl text-gray-800">
                        Select <span className="font-bold text-2xl">Addons</span>
                      </h1>
                      {addons.map((addon, index) => (
                        <AddOn addon={addon} />
                      ))}
                    </>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-violet-300 px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] ">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          {/* Product Info */}
          <div className="flex items-center space-x-3 me-5">
            <img src="/images/wegovy.png" alt="Mounjaro" className="w-10 h-10 rounded-md object-contain" />
            <div className="text-black leading-tight">
              <div className="text-sm font-semibold">Mounjaro</div>
              <div className="text-base font-bold">
                £189 <span className="text-sm font-normal">/month</span>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleSubmit(onSubmit)}
            className="w-80 bg-violet-800 text-white font-semibold text-base px-10 py-2.5 rounded-md hover:opacity-90 transition-all duration-200 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
