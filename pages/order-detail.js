import React, { useEffect, useState } from "react";
import Link from "next/link";
import moment from "moment";
import { motion } from "framer-motion";
import {
  ArrowLeft,
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
import { PageHeader } from "@/Components/Dashboard/MyAccount/MyAccount";

/* ── Helpers ── */
const getStatusColor = (status = "") => {
  switch (status?.toLowerCase()) {
    case "processing": return "border-amber-200 bg-amber-50 text-amber-700";
    case "incomplete":  return "border-orange-200 bg-orange-50 text-orange-700";
    case "approved":    return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "cancelled":   return "border-red-200 bg-red-50 text-red-600";
    case "paid":        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "pending":     return "border-amber-200 bg-amber-50 text-amber-700";
    case "failed":      return "border-red-200 bg-red-50 text-red-600";
    default:            return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

const formatCurrency = (value) => {
  const n = Number(value);
  return Number.isNaN(n) ? value || "0.00" : n.toFixed(2);
};

const formatDate = (value) => {
  if (!value) return "N/A";
  if (moment(value, "DD-MM-YYYY", true).isValid())
    return moment(value, "DD-MM-YYYY").format("DD MMM YYYY");
  return value;
};

/* ── Status badge (inline pill) ── */
const StatusBadge = ({ status }) => (
  <span className={`inter-medium-font inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] leading-none ${getStatusColor(status)}`}>
    {status || "N/A"}
  </span>
);

/* ── Detail field (patient info grid) ── */
const DetailField = ({ label, value, capitalize = false }) => (
  <div className="rounded-[16px] border border-[#47317c]/[0.08] bg-[#faf9fc] px-4 py-4">
    <p className="inter-medium-font text-[10px] uppercase tracking-[0.11em] text-slate-400">{label}</p>
    <p className={`inter-medium-font mt-2 text-[13px] leading-5 text-slate-900 ${capitalize ? "capitalize" : ""}`}>
      {value || "N/A"}
    </p>
  </div>
);

/* ── Tabs config ── */
const TABS = [
  { key: 0, label: "Order Details",   icon: ReceiptText },
  { key: 1, label: "Patient Details", icon: UserRound },
];

/* ── Loading skeleton ── */
const OrderDetailLoader = () => (
  <main className="inter-reg-font min-w-0 flex-1 bg-[#FBFBFD]">
    <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-5 p-4 sm:p-5 lg:p-6">
      <div className="h-[110px] animate-pulse rounded-2xl bg-slate-100" />
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[200px] animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  </main>
);

/* ── Not found ── */
const OrderNotFound = () => (
  <main className="inter-reg-font min-w-0 flex-1 bg-[#FBFBFD]">
    <div className="mx-auto w-full max-w-[1560px] p-4 sm:p-5 lg:p-6">
      <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#47317c]/[0.07] text-[#47317c]">
          <Package size={28} strokeWidth={1.8} />
        </span>
        <h1 className="inter-bold-font mt-5 text-[22px] text-slate-900">Order not available</h1>
        <p className="inter-reg-font mt-2 max-w-md text-[13px] leading-6 text-slate-500">
          The selected order could not be loaded. Return to your orders and select an order again.
        </p>
        <Link
          href="/orders"
          className="inter-medium-font mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#47317c] px-5 py-2.5 text-[12px] text-white no-underline transition-colors hover:bg-[#392765]"
        >
          <ArrowLeft size={16} strokeWidth={2.2} />
          Back to orders
        </Link>
      </div>
    </div>
  </main>
);

/* ── Main component ── */
const OrderDetail = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { orderId } = useOrderId();

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    getOrderByIdApi(orderId)
      .then((response) => { setOrder(response?.data); setLoading(false); })
      .catch((error) => { console.error("Failed to load order:", error); setLoading(false); });
  }, [orderId]);

  const currentOrder  = order?.data?.order;
  const patientData   = currentOrder?.consultation?.fields?.patientInfo;
  const products      = Array.isArray(currentOrder?.items) ? currentOrder.items : [];
  const date          = currentOrder?.created_at;
  const time          = currentOrder?.created_at_time;
  const shipmentFee   = currentOrder?.shippment_weight;
  const total         = currentOrder?.total_price;
  const discountData  = currentOrder?.consultation?.fields?.checkout?.discount;
  const formattedDate = formatDate(date);
  const formattedDob  = formatDate(patientData?.dob);

  if (loading) return (
    <>
      <MetaLayout canonical={`${meta_url}order-detail/`} />
      <ProtectedPage><DashBoardLayout><OrderDetailLoader /></DashBoardLayout></ProtectedPage>
    </>
  );

  if (!orderId || !currentOrder) return (
    <>
      <MetaLayout canonical={`${meta_url}order-detail/`} />
      <ProtectedPage><DashBoardLayout><OrderNotFound /></DashBoardLayout></ProtectedPage>
    </>
  );

  return (
    <>
      <MetaLayout canonical={`${meta_url}order-detail/`} />
      <ProtectedPage>
        <DashBoardLayout>
          <main className="inter-reg-font min-w-0 flex-1 bg-[#FBFBFD]">
            <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-5 p-4 sm:p-5 lg:p-6 2xl:p-8 2xl:gap-6">

              {/* Back link */}
              <div>
                <Link
                  href="/orders"
                  className="inter-medium-font inline-flex items-center gap-2 text-[12.5px] text-slate-500 no-underline transition-colors hover:text-[#47317c]"
                >
                  <ArrowLeft size={15} strokeWidth={2.2} />
                  Back to orders
                </Link>
              </div>

              {/* Page header */}
              <PageHeader
                label="Order Details"
                title={`Order #${currentOrder?.id}`}
                subtitle={
                  formattedDate !== "N/A"
                    ? `Placed on ${formattedDate}${time ? ` · ${time}` : ""}`
                    : "Review your treatment items and patient information."
                }
                right={
                  <div className="flex items-center gap-3">
                    {/* Order Status card */}
                    <div className="flex items-center gap-3.5 rounded-2xl border border-[#e8e2f5] bg-white px-5 py-4 min-w-[200px]">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#47317c]/[0.07]">
                        <ShoppingBag size={18} strokeWidth={1.8} className="text-[#47317c]" />
                      </span>
                      <div className="flex flex-col gap-1.5">
                        <span className="inter-medium-font whitespace-nowrap text-[10px] uppercase tracking-[0.12em] text-slate-400">Order Status</span>
                        <span className={`inter-semibold-font self-start inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-[12px] capitalize ${getStatusColor(currentOrder?.status || "")}`}>
                          {currentOrder?.status || "N/A"}
                        </span>
                      </div>
                    </div>
                    {/* Payment Status card */}
                    <div className="flex items-center gap-3.5 rounded-2xl border border-[#e8e2f5] bg-white px-5 py-4 min-w-[210px]">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#47317c]/[0.07]">
                        <ReceiptText size={18} strokeWidth={1.8} className="text-[#47317c]" />
                      </span>
                      <div className="flex flex-col gap-1.5">
                        <span className="inter-medium-font whitespace-nowrap text-[10px] uppercase tracking-[0.12em] text-slate-400">Payment Status</span>
                        <span className={`inter-semibold-font self-start inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1 text-[12px] capitalize ${getStatusColor(currentOrder?.payments?.status || "")}`}>
                          {currentOrder?.payments?.status || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                }
              />

              {/* Tab switcher */}
              <div className="flex flex-col gap-2">
                <p className="inter-medium-font text-[10px] uppercase tracking-[0.12em] text-slate-400">
                  Switch Details
                </p>
                <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 w-fit">
                  {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveTab(key)}
                      className={`inter-semibold-font inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] transition-all duration-150 cursor-pointer
                        ${activeTab === key
                          ? "bg-white text-[#47317c] shadow-sm border border-slate-200/80 ring-1 ring-[#47317c]/10"
                          : "text-slate-400 hover:text-slate-700"
                        }`}
                    >
                      <Icon size={14} strokeWidth={activeTab === key ? 2.5 : 2} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >

                {/* ── Order Details tab ── */}
                {activeTab === 0 && (
                  <div className="overflow-hidden rounded-[22px] border border-[#47317c]/10 bg-white">

                    {/* Card header */}
                    <div className="flex items-center gap-3 border-b border-[#47317c]/[0.07] bg-[#faf9fc] px-5 py-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#47317c]/[0.08] text-[#47317c]">
                        <ShoppingBag size={19} strokeWidth={2} />
                      </span>
                      <h2 className="inter-bold-font text-[18px] leading-6 text-slate-950">Order details</h2>
                    </div>

                    {/* Desktop table */}
                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full min-w-[700px] border-collapse text-left">
                        <thead className="bg-white">
                          <tr className="border-b border-[#47317c]/[0.07]">
                            <th className="inter-medium-font px-5 py-4 text-[12px] lg:text-[13px] uppercase tracking-[0.11em] text-slate-400">Item</th>
                            <th className="inter-medium-font w-[150px] px-5 py-4 text-center text-[12px] lg:text-[13px] uppercase tracking-[0.11em] text-slate-400">Quantity</th>
                            <th className="inter-medium-font w-[180px] px-5 py-4 text-right text-[12px] lg:text-[13px] uppercase tracking-[0.11em] text-slate-400">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product, index) => (
                            <tr
                              key={product?.id || `${product?.label}-${index}`}
                              className="border-b border-[#47317c]/[0.06] transition-colors hover:bg-[#47317c]/[0.018]"
                            >
                              <td className="px-5 py-5">
                                <p className="inter-medium-font text-[14px] lg:text-[15px] capitalize leading-5 text-slate-900">
                                  {product?.label || product?.name || product?.product || "Item"}
                                </p>
                              </td>
                              <td className="px-5 py-5 text-center">
                                <span className="inter-medium-font inline-flex min-w-[38px] items-center justify-center rounded-[10px] bg-[#47317c]/[0.06] px-3 py-2 text-[13px] lg:text-[14px] text-[#47317c]">
                                  {product?.quantity}
                                </span>
                              </td>
                              <td className="px-5 py-5 text-right">
                                <span className="inter-bold-font text-[15px] lg:text-[16px] text-slate-950">
                                  £{formatCurrency(parseFloat(product?.price) * Number(product?.quantity))}
                                </span>
                              </td>
                            </tr>
                          ))}

                          {discountData?.discount > 0 && (
                            <>
                              <tr className="border-b border-[#47317c]/[0.06] bg-[#faf9fc]/60">
                                <td className="px-5 py-4">
                                  <span className="inter-medium-font text-[13px] lg:text-[14px] text-slate-600">Discount</span>
                                </td>
                                <td />
                                <td className="px-5 py-4 text-right">
                                  <span className="inter-medium-font text-[13px] lg:text-[14px] text-emerald-600">
                                    {discountData?.type === "Fixed"
                                      ? `-£${formatCurrency(discountData?.discount_value)}`
                                      : `-${parseFloat(discountData?.discount_value).toFixed(1)}%`}
                                  </span>
                                </td>
                              </tr>
                              <tr className="border-b border-[#47317c]/[0.06] bg-[#faf9fc]/60">
                                <td className="px-5 py-4">
                                  <span className="inter-medium-font text-[13px] lg:text-[14px] text-slate-600">Coupon code</span>
                                </td>
                                <td />
                                <td className="px-5 py-4 text-right">
                                  <span className="inter-medium-font text-[13px] lg:text-[14px] text-slate-900">{discountData?.code || "N/A"}</span>
                                </td>
                              </tr>
                              <tr className="border-b border-[#47317c]/[0.06] bg-[#faf9fc]/60">
                                <td className="px-5 py-4">
                                  <span className="inter-medium-font text-[13px] lg:text-[14px] text-slate-600">Discount type</span>
                                </td>
                                <td />
                                <td className="px-5 py-4 text-right">
                                  <span className="inter-medium-font text-[13px] lg:text-[14px] text-slate-900">
                                    {discountData?.type === "Fixed" ? "Fixed" : "Percentage"}
                                  </span>
                                </td>
                              </tr>
                            </>
                          )}

                          <tr className="border-b border-[#47317c]/[0.07] bg-[#faf9fc]/60">
                            <td className="px-5 py-4">
                              <span className="inter-medium-font text-[13px] lg:text-[14px] text-slate-600">Shipping fee</span>
                            </td>
                            <td />
                            <td className="px-5 py-4 text-right">
                              <span className="inter-medium-font text-[13px] lg:text-[14px] text-slate-900">£{formatCurrency(shipmentFee)}</span>
                            </td>
                          </tr>

                          <tr className="bg-[#47317c]/[0.035]">
                            <td className="px-5 py-5">
                              <span className="inter-bold-font text-[16px] lg:text-[17px] text-slate-950">Order total</span>
                            </td>
                            <td />
                            <td className="px-5 py-5 text-right">
                              <span className="inter-bold-font text-[23px] lg:text-[25px] leading-none text-[#47317c]">
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
                            <p className="inter-medium-font text-[13px] capitalize leading-5 text-slate-900">
                              {product?.label || product?.name || product?.product || "Item"}
                            </p>
                            <div className="mt-4 flex items-end justify-between gap-3">
                              <div>
                                <p className="inter-medium-font text-[10px] uppercase tracking-[0.1em] text-slate-400">Quantity</p>
                                <p className="inter-medium-font mt-1.5 text-[12px] text-slate-700">{product?.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="inter-medium-font text-[10px] uppercase tracking-[0.1em] text-slate-400">Amount</p>
                                <p className="inter-bold-font mt-1.5 text-[15px] text-[#47317c]">
                                  £{formatCurrency(parseFloat(product?.price) * Number(product?.quantity))}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-[#47317c]/[0.07] bg-[#faf9fc] p-4">
                        <div className="space-y-3.5">
                          {discountData?.discount > 0 && (
                            <>
                              <div className="flex items-center justify-between gap-4">
                                <span className="inter-reg-font text-[12px] text-slate-500">Discount</span>
                                <span className="inter-medium-font text-[12px] text-emerald-600">
                                  {discountData?.type === "Fixed"
                                    ? `-£${formatCurrency(discountData?.discount_value)}`
                                    : `-${parseFloat(discountData?.discount_value).toFixed(1)}%`}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="inter-reg-font text-[12px] text-slate-500">Coupon code</span>
                                <span className="inter-medium-font text-[12px] text-slate-900">{discountData?.code || "N/A"}</span>
                              </div>
                            </>
                          )}
                          <div className="flex items-center justify-between gap-4">
                            <span className="inter-reg-font text-[12px] text-slate-500">Shipping fee</span>
                            <span className="inter-medium-font text-[12px] text-slate-900">£{formatCurrency(shipmentFee)}</span>
                          </div>
                          <div className="h-px bg-[#47317c]/10" />
                          <div className="flex items-end justify-between gap-4">
                            <span className="inter-bold-font text-[14px] text-slate-950">Total</span>
                            <span className="inter-bold-font text-[20px] text-[#47317c]">£{formatCurrency(total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Patient Details tab ── */}
                {activeTab === 1 && (
                  <div className="overflow-hidden rounded-[22px] border border-[#47317c]/10 bg-white">

                    {/* Card header */}
                    <div className="flex items-center gap-3 border-b border-[#47317c]/[0.07] bg-[#faf9fc] px-5 py-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#47317c]/[0.08] text-[#47317c]">
                        <UserRound size={19} strokeWidth={2} />
                      </span>
                      <h2 className="inter-bold-font text-[18px] leading-6 text-slate-950">Patient information</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                      <DetailField label="First name"   value={patientData?.firstName}  capitalize />
                      <DetailField label="Last name"    value={patientData?.lastName}   capitalize />
                      <DetailField label="Gender"       value={patientData?.gender}     capitalize />
                      <DetailField label="Pregnancy"    value={patientData?.pregnancy}  capitalize />
                      <DetailField label="Date of birth" value={formattedDob} />
                      <DetailField label="Phone number" value={patientData?.phoneNo} />
                    </div>
                  </div>
                )}
              </motion.div>

            </div>
          </main>
        </DashBoardLayout>
      </ProtectedPage>
    </>
  );
};

export default OrderDetail;
