import React, { useEffect, useState } from "react";
import Link from "next/link";
import moment from "moment";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Package,
  ReceiptText,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import getOrderByIdApi from "@/api/getOrderByIdApi";
import useOrderId from "@/store/useOrderIdStore";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import DashBoardLayout from "@/Components/Dashboard/DashboardLayout/DashBoardLayout";
import ProtectedPage from "@/Components/ProtectedPage/ProtectedPage";

/* =========================================================
   Helpers
========================================================= */

const getStatusClasses = (status = "") => {
  switch (status?.toLowerCase()) {
    case "processing":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "incomplete":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";

    case "paid":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "failed":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

const formatCurrency = (value) => {
  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    return value || "0.00";
  }

  return parsedValue.toFixed(2);
};

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  if (moment(value, "DD-MM-YYYY", true).isValid()) {
    return moment(value, "DD-MM-YYYY").format("DD MMM YYYY");
  }

  return value;
};

const StatusBadge = ({ status }) => (
  <span
    className={`
      mont-medium-font inline-flex items-center rounded-full border
      px-3 py-1.5 text-[11px] leading-none
      ${getStatusClasses(status)}
    `}
  >
    {status || "N/A"}
  </span>
);

/* =========================================================
   Summary Card
========================================================= */

const SummaryCard = ({ icon: Icon, label, children }) => (
  <div className="flex min-w-0 items-center gap-3.5 rounded-[18px] border border-[#47317c]/10 bg-[#faf8fd] px-4 py-3.5">
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#47317c]/[0.08] text-[#47317c]">
      <Icon size={19} strokeWidth={2} />
    </span>

    <div className="min-w-0 flex-1">
      <p className="mont-medium-font text-[10px] uppercase tracking-[0.11em] text-slate-400">
        {label}
      </p>

      <div className="mt-1.5">{children}</div>
    </div>
  </div>
);

/* =========================================================
   Patient Detail Field
========================================================= */

const DetailField = ({ label, value, capitalize = false }) => (
  <div className="rounded-[16px] border border-[#47317c]/[0.08] bg-[#faf9fc] px-4 py-4">
    <p className="mont-medium-font text-[10px] uppercase tracking-[0.11em] text-slate-400">
      {label}
    </p>

    <p
      className={`
        mont-medium-font mt-2 text-[13px] leading-5 text-slate-900
        ${capitalize ? "capitalize" : ""}
      `}
    >
      {value || "N/A"}
    </p>
  </div>
);

/* =========================================================
   Loading
========================================================= */

const OrderDetailLoader = () => (
  <main className="min-w-0 flex-1 bg-[#f4f5fb] p-3 sm:p-4 lg:p-5 xl:p-6">
    <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-4">
      <div className="animate-pulse rounded-[26px] border border-[#47317c]/10 bg-white p-6">
        <div className="h-4 w-32 rounded-full bg-[#47317c]/[0.07]" />

        <div className="mt-4 h-8 w-72 max-w-full rounded-full bg-[#47317c]/[0.07]" />

        <div className="mt-3 h-4 w-96 max-w-full rounded-full bg-[#47317c]/[0.07]" />

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-[76px] rounded-[18px] bg-[#47317c]/[0.06]"
            />
          ))}
        </div>
      </div>

      <div className="animate-pulse rounded-[26px] border border-[#47317c]/10 bg-white p-6">
        <div className="h-12 w-full rounded-[15px] bg-[#47317c]/[0.06]" />

        <div className="mt-5 h-[320px] w-full rounded-[20px] bg-[#47317c]/[0.05]" />
      </div>
    </div>
  </main>
);

/* =========================================================
   Order Not Found
========================================================= */

const OrderNotFound = () => (
  <main className="min-w-0 flex-1 bg-[#f4f5fb] p-3 sm:p-4 lg:p-5 xl:p-6">
    <div className="mx-auto w-full max-w-[1560px]">
      <div className="flex min-h-[380px] flex-col items-center justify-center rounded-[26px] border border-[#47317c]/10 bg-white px-5 text-center shadow-[0_16px_42px_rgba(71,49,124,0.07)]">
        <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#47317c]/[0.07] text-[#47317c]">
          <Package size={28} strokeWidth={1.8} />
        </span>

        <h1 className="mont-bold-font mt-5 text-[22px] text-slate-950">
          Order not available
        </h1>

        <p className="mont-reg-font mt-2 max-w-md text-[13px] leading-6 text-slate-500">
          The selected order could not be loaded. Return to your orders and
          select an order again.
        </p>

        <Link
          href="/orders"
          className="mont-medium-font mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#47317c] px-5 py-2.5 text-[12px] text-white no-underline transition-colors hover:bg-[#392765]"
        >
          <ArrowLeft size={16} strokeWidth={2.2} />
          Back to orders
        </Link>
      </div>
    </div>
  </main>
);

/* =========================================================
   Order Detail
========================================================= */

const OrderDetail = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const { orderId } = useOrderId();

  useEffect(() => {
    if (!orderId) {
      return;
    }

    setLoading(true);

    getOrderByIdApi(orderId)
      .then((response) => {
        setOrder(response?.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load order:", error);
        setLoading(false);
      });
  }, [orderId]);

  const currentOrder = order?.data?.order;

  const patientData = currentOrder?.consultation?.fields?.patientInfo;

  const products = Array.isArray(currentOrder?.items) ? currentOrder.items : [];

  const date = currentOrder?.created_at;
  const time = currentOrder?.created_at_time;
  const shipmentFee = currentOrder?.shippment_weight;
  const total = currentOrder?.total_price;

  const discountData = currentOrder?.consultation?.fields?.checkout?.discount;

  const formattedDate = formatDate(date);

  const formattedDob = formatDate(patientData?.dob);

  const tabContentVariants = {
    initial: {
      opacity: 0,
      y: 12,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: 12,
    },
  };

  if (loading) {
    return (
      <>
        <MetaLayout canonical={`${meta_url}order-detail/`} />

        <ProtectedPage>
          <DashBoardLayout>
            <OrderDetailLoader />
          </DashBoardLayout>
        </ProtectedPage>
      </>
    );
  }

  if (!orderId || !currentOrder) {
    return (
      <>
        <MetaLayout canonical={`${meta_url}order-detail/`} />

        <ProtectedPage>
          <DashBoardLayout>
            <OrderNotFound />
          </DashBoardLayout>
        </ProtectedPage>
      </>
    );
  }

  return (
    <>
      <MetaLayout canonical={`${meta_url}order-detail/`} />

      <ProtectedPage>
        <DashBoardLayout>
          <main className="mont-reg-font min-w-0 flex-1 bg-[#f4f5fb] p-3 sm:p-4 lg:p-5 xl:p-6">
            <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-4">
              {/* Page header */}
              <section className="relative overflow-hidden rounded-[26px] border border-[#47317c]/[0.09] bg-white px-5 py-6 shadow-[0_16px_42px_rgba(71,49,124,0.075)] sm:px-6 lg:px-7">
                <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-[#47317c]/[0.06] blur-3xl" />

                <div className="relative">
                  <Link
                    href="/orders"
                    className="mont-medium-font inline-flex items-center gap-2 text-[12px] text-[#47317c] no-underline transition-colors hover:text-[#392765]"
                  >
                    <ArrowLeft size={16} strokeWidth={2.2} />
                    Back to orders
                  </Link>

                  <div className="mt-5">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <p className="mont-bold-font m-0 text-[11px] uppercase tracking-[0.16em] text-[#47317c]">
                        Order details
                      </p>

                      <span className="mont-medium-font inline-flex flex-wrap items-center gap-1.5 rounded-full border border-[#47317c]/10 bg-[#47317c]/[0.04] px-3 py-1.5 text-[10.5px] text-[#47317c]">
                        <CalendarDays size={13} strokeWidth={2} />

                        {formattedDate}

                        {time && (
                          <>
                            <span className="text-[#47317c]/25">•</span>

                            <Clock3 size={12} strokeWidth={2} />

                            {time}
                          </>
                        )}
                      </span>
                    </div>

                    <h1 className="mont-bold-font text-[27px] leading-tight tracking-[-0.04em] text-slate-950 sm:text-[32px]">
                      Order #{currentOrder?.id}
                    </h1>

                    <p className="mont-reg-font mt-2.5 max-w-2xl text-[13px] leading-[1.7] text-slate-500 sm:text-[14px]">
                      Review the treatment items, order status, payment details
                      and patient information.
                    </p>
                  </div>

                  {/* Order summary cards */}
                  <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <SummaryCard icon={CheckCircle2} label="Order status">
                      <StatusBadge status={currentOrder?.status} />
                    </SummaryCard>

                    <SummaryCard icon={CreditCard} label="Payment status">
                      <StatusBadge status={currentOrder?.payments?.status} />
                    </SummaryCard>

                    <SummaryCard icon={CircleDollarSign} label="Order total">
                      <p className="mont-bold-font text-[17px] leading-5 text-[#47317c]">
                        £{formatCurrency(currentOrder?.total_price)}
                      </p>
                    </SummaryCard>
                  </div>
                </div>
              </section>

              {/* Detail content */}
              <section className="relative overflow-hidden rounded-[26px] border border-[#47317c]/[0.09] bg-white p-4 shadow-[0_16px_42px_rgba(71,49,124,0.075)] sm:p-5 lg:p-6">
                {/* Tabs */}
                <div className="inline-flex w-full rounded-[15px] border border-[#47317c]/10 bg-[#f7f5fa] p-1 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab(0)}
                    className={`
                      mont-medium-font inline-flex min-h-[42px]
                      flex-1 cursor-pointer items-center justify-center
                      gap-2 rounded-[11px] px-4 py-2.5
                      text-[12px] transition-all duration-200
                      sm:flex-none

                      ${
                        activeTab === 0
                          ? `
                            bg-[#47317c] text-white
                            shadow-[0_7px_18px_rgba(71,49,124,0.2)]
                          `
                          : `
                            text-slate-500
                            hover:bg-white
                            hover:text-[#47317c]
                          `
                      }
                    `}
                  >
                    <ReceiptText size={16} strokeWidth={2} />
                    Order details
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab(1)}
                    className={`
                      mont-medium-font inline-flex min-h-[42px]
                      flex-1 cursor-pointer items-center justify-center
                      gap-2 rounded-[11px] px-4 py-2.5
                      text-[12px] transition-all duration-200
                      sm:flex-none

                      ${
                        activeTab === 1
                          ? `
                            bg-[#47317c] text-white
                            shadow-[0_7px_18px_rgba(71,49,124,0.2)]
                          `
                          : `
                            text-slate-500
                            hover:bg-white
                            hover:text-[#47317c]
                          `
                      }
                    `}
                  >
                    <UserRound size={16} strokeWidth={2} />
                    Patient details
                  </button>
                </div>

                <motion.div
                  key={activeTab}
                  variants={tabContentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{
                    duration: 0.25,
                  }}
                  className="mt-6"
                >
                  {/* =====================================================
                      Order Details Tab
                  ===================================================== */}

                  {activeTab === 0 && (
                    <div className="overflow-hidden rounded-[22px] border border-[#47317c]/10 bg-white">
                      {/* Unified header */}
                      <div className="flex items-center gap-3 border-b border-[#47317c]/[0.07] bg-[#faf9fc] px-5 py-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#47317c]/[0.08] text-[#47317c]">
                          <ShoppingBag size={19} strokeWidth={2} />
                        </span>

                        <div className="min-w-0">
                          <h2 className="mont-bold-font text-[18px] leading-6 text-slate-950">
                            Order details
                          </h2>

                          {/* <p className="mont-reg-font mt-0.5 text-[12px] leading-5 text-slate-500">
                            Treatment items and complete payment breakdown.
                          </p> */}
                        </div>
                      </div>

                      {/* Desktop single table */}
                      <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[700px] border-collapse text-left">
                          <thead className="bg-white">
                            <tr className="border-b border-[#47317c]/[0.07]">
                              <th className="mont-medium-font px-5 py-4 text-[11px] uppercase tracking-[0.11em] text-slate-400">
                                Item
                              </th>

                              <th className="mont-medium-font w-[150px] px-5 py-4 text-center text-[11px] uppercase tracking-[0.11em] text-slate-400">
                                Quantity
                              </th>

                              <th className="mont-medium-font w-[180px] px-5 py-4 text-right text-[11px] uppercase tracking-[0.11em] text-slate-400">
                                Amount
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {/* Product rows */}
                            {products.map((product, index) => (
                              <tr
                                key={
                                  product?.id || `${product?.label}-${index}`
                                }
                                className="border-b border-[#47317c]/[0.06] transition-colors duration-200 hover:bg-[#47317c]/[0.018]"
                              >
                                <td className="px-5 py-5">
                                  <p className="mont-medium-font text-[13px] capitalize leading-5 text-slate-900">
                                    {product?.label ||
                                      product?.name ||
                                      product?.product ||
                                      "Item"}
                                  </p>
                                </td>

                                <td className="px-5 py-5 text-center">
                                  <span className="mont-medium-font inline-flex min-w-[38px] items-center justify-center rounded-[10px] bg-[#47317c]/[0.06] px-3 py-2 text-[12px] text-[#47317c]">
                                    {product?.quantity}
                                  </span>
                                </td>

                                <td className="px-5 py-5 text-right">
                                  <span className="mont-bold-font text-[14px] text-slate-950">
                                    £
                                    {formatCurrency(
                                      parseFloat(product?.price) *
                                        Number(product?.quantity),
                                    )}
                                  </span>
                                </td>
                              </tr>
                            ))}

                            {/* Discount */}
                            {discountData?.discount > 0 && (
                              <>
                                <tr className="border-b border-[#47317c]/[0.06] bg-[#faf9fc]/60">
                                  <td className="px-5 py-4">
                                    <span className="mont-medium-font text-[12px] text-slate-600">
                                      Discount
                                    </span>
                                  </td>

                                  <td />

                                  <td className="px-5 py-4 text-right">
                                    <span className="mont-medium-font text-[12px] text-emerald-600">
                                      {discountData?.type === "Fixed"
                                        ? `-£${formatCurrency(
                                            discountData?.discount_value,
                                          )}`
                                        : `-${parseFloat(
                                            discountData?.discount_value,
                                          ).toFixed(1)}%`}
                                    </span>
                                  </td>
                                </tr>

                                <tr className="border-b border-[#47317c]/[0.06] bg-[#faf9fc]/60">
                                  <td className="px-5 py-4">
                                    <span className="mont-medium-font text-[12px] text-slate-600">
                                      Coupon code
                                    </span>
                                  </td>

                                  <td />

                                  <td className="px-5 py-4 text-right">
                                    <span className="mont-medium-font text-[12px] text-slate-900">
                                      {discountData?.code || "N/A"}
                                    </span>
                                  </td>
                                </tr>

                                <tr className="border-b border-[#47317c]/[0.06] bg-[#faf9fc]/60">
                                  <td className="px-5 py-4">
                                    <span className="mont-medium-font text-[12px] text-slate-600">
                                      Discount type
                                    </span>
                                  </td>

                                  <td />

                                  <td className="px-5 py-4 text-right">
                                    <span className="mont-medium-font text-[12px] text-slate-900">
                                      {discountData?.type === "Fixed"
                                        ? "Fixed"
                                        : "Percentage"}
                                    </span>
                                  </td>
                                </tr>
                              </>
                            )}

                            {/* Shipping fee */}
                            <tr className="border-b border-[#47317c]/[0.07] bg-[#faf9fc]/60">
                              <td className="px-5 py-4">
                                <span className="mont-medium-font text-[12px] text-slate-600">
                                  Shipping fee
                                </span>
                              </td>

                              <td />

                              <td className="px-5 py-4 text-right">
                                <span className="mont-medium-font text-[12px] text-slate-900">
                                  £{formatCurrency(shipmentFee)}
                                </span>
                              </td>
                            </tr>

                            {/* Total */}
                            <tr className="bg-[#47317c]/[0.035]">
                              <td className="px-5 py-5">
                                <div className="flex items-center gap-2">
                                  <ReceiptText
                                    size={17}
                                    strokeWidth={2}
                                    className="text-[#47317c]"
                                  />

                                  <span className="mont-bold-font text-[15px] text-slate-950">
                                    Order total
                                  </span>
                                </div>
                              </td>

                              <td />

                              <td className="px-5 py-5 text-right">
                                <span className="mont-bold-font text-[21px] leading-none text-[#47317c]">
                                  £{formatCurrency(total)}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile layout */}
                      <div className="md:hidden">
                        <div className="grid grid-cols-1 gap-3 p-4">
                          {products.map((product, index) => (
                            <div
                              key={product?.id || `${product?.label}-${index}`}
                              className="rounded-[17px] border border-[#47317c]/[0.08] bg-[#faf9fc] p-4"
                            >
                              <p className="mont-medium-font text-[13px] capitalize leading-5 text-slate-900">
                                {product?.label ||
                                  product?.name ||
                                  product?.product ||
                                  "Item"}
                              </p>

                              <div className="mt-4 flex items-end justify-between gap-3">
                                <div>
                                  <p className="mont-medium-font text-[10px] uppercase tracking-[0.1em] text-slate-400">
                                    Quantity
                                  </p>

                                  <p className="mont-medium-font mt-1.5 text-[12px] text-slate-700">
                                    {product?.quantity}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <p className="mont-medium-font text-[10px] uppercase tracking-[0.1em] text-slate-400">
                                    Amount
                                  </p>

                                  <p className="mont-bold-font mt-1.5 text-[15px] text-[#47317c]">
                                    £
                                    {formatCurrency(
                                      parseFloat(product?.price) *
                                        Number(product?.quantity),
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Mobile summary */}
                        <div className="border-t border-[#47317c]/[0.07] bg-[#faf9fc] p-4">
                          <div className="space-y-3.5">
                            {discountData?.discount > 0 && (
                              <>
                                <div className="flex items-center justify-between gap-4">
                                  <span className="mont-reg-font text-[12px] text-slate-500">
                                    Discount
                                  </span>

                                  <span className="mont-medium-font text-[12px] text-emerald-600">
                                    {discountData?.type === "Fixed"
                                      ? `-£${formatCurrency(
                                          discountData?.discount_value,
                                        )}`
                                      : `-${parseFloat(
                                          discountData?.discount_value,
                                        ).toFixed(1)}%`}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                  <span className="mont-reg-font text-[12px] text-slate-500">
                                    Coupon code
                                  </span>

                                  <span className="mont-medium-font text-[12px] text-slate-900">
                                    {discountData?.code || "N/A"}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                  <span className="mont-reg-font text-[12px] text-slate-500">
                                    Discount type
                                  </span>

                                  <span className="mont-medium-font text-[12px] text-slate-900">
                                    {discountData?.type === "Fixed"
                                      ? "Fixed"
                                      : "Percentage"}
                                  </span>
                                </div>
                              </>
                            )}

                            <div className="flex items-center justify-between gap-4">
                              <span className="mont-reg-font text-[12px] text-slate-500">
                                Shipping fee
                              </span>

                              <span className="mont-medium-font text-[12px] text-slate-900">
                                £{formatCurrency(shipmentFee)}
                              </span>
                            </div>

                            <div className="h-px bg-[#47317c]/10" />

                            <div className="flex items-end justify-between gap-4">
                              <span className="mont-bold-font text-[14px] text-slate-950">
                                Total
                              </span>

                              <span className="mont-bold-font text-[20px] text-[#47317c]">
                                £{formatCurrency(total)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =====================================================
                      Patient Details Tab
                  ===================================================== */}

                  {activeTab === 1 && (
                    <div className="overflow-hidden rounded-[22px] border border-[#47317c]/10 bg-white">
                      <div className="flex items-center gap-3 border-b border-[#47317c]/[0.07] bg-[#faf9fc] px-5 py-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#47317c]/[0.08] text-[#47317c]">
                          <UserRound size={19} strokeWidth={2} />
                        </span>

                        <div className="min-w-0">
                          <h2 className="mont-bold-font text-[18px] leading-6 text-slate-950">
                            Patient information
                          </h2>

                          {/* <p className="mont-reg-font mt-0.5 text-[12px] leading-5 text-slate-500">
                            Personal details associated with this order.
                          </p> */}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                        <DetailField
                          label="First name"
                          value={patientData?.firstName}
                          capitalize
                        />

                        <DetailField
                          label="Last name"
                          value={patientData?.lastName}
                          capitalize
                        />

                        <DetailField
                          label="Gender"
                          value={patientData?.gender}
                          capitalize
                        />

                        <DetailField
                          label="Pregnancy"
                          value={patientData?.pregnancy}
                          capitalize
                        />

                        <DetailField
                          label="Date of birth"
                          value={formattedDob}
                        />

                        <DetailField
                          label="Phone number"
                          value={patientData?.phoneNo}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </section>
            </div>
          </main>
        </DashBoardLayout>
      </ProtectedPage>
    </>
  );
};

export default OrderDetail;
