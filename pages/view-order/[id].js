import React, { useEffect, useState } from "react";
import moment from "moment";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  MapPin,
  Package,
  Stethoscope,
  User,
} from "lucide-react";

import getOrderByIdApi from "@/api/getOrderByIdApi";
import StepsHeader from "@/layout/stepsHeader";
import DashBoardLayout from "@/Components/Dashboard/DashboardLayout/DashBoardLayout";
import { PageHeader } from "@/Components/Dashboard/MyAccount/MyAccount";

/* ── Status badge ── */
const statusColor = (s = "") => {
  switch (s.toLowerCase()) {
    case "processing":  return "bg-amber-50 border-amber-200 text-amber-700";
    case "approved":    return "bg-emerald-50 border-emerald-200 text-emerald-700";
    case "cancelled":   return "bg-red-50 border-red-200 text-red-600";
    case "paid":        return "bg-emerald-50 border-emerald-200 text-emerald-700";
    case "pending":     return "bg-amber-50 border-amber-200 text-amber-700";
    default:            return "bg-slate-50 border-slate-200 text-slate-600";
  }
};

const StatusBadge = ({ label, value }) => (
  <div className="flex flex-col items-center gap-1 rounded-xl border border-[#e8e2f5] bg-white/80 px-4 py-2.5 min-w-[110px]">
    <span className="inter-medium-font text-[9.5px] uppercase tracking-[0.1em] text-slate-400">{label}</span>
    <span className={`inter-semibold-font inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] capitalize ${statusColor(value || "")}`}>
      {value || "N/A"}
    </span>
  </div>
);

/* ── Info row ── */
const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-4 border-b border-slate-100 py-3 last:border-b-0">
    <span className="inter-medium-font w-[140px] shrink-0 text-[12px] text-slate-400">{label}</span>
    <span className="inter-medium-font text-[13px] text-slate-800 capitalize">{value || "N/A"}</span>
  </div>
);

/* ── Section card ── */
const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
    <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/60 px-4 py-3.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#47317c]/[0.08] text-[#47317c]">
        <Icon size={14} strokeWidth={2} />
      </span>
      <h3 className="inter-semibold-font text-[13.5px] text-slate-900">{title}</h3>
    </div>
    <div className="px-4 py-1">{children}</div>
  </div>
);

/* ── Tabs ── */
const TABS = [
  { key: "order",   label: "Order Details",   icon: Package },
  { key: "patient", label: "Patient Details",  icon: User },
];

const OrderDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("order");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getOrderByIdApi(id)
        .then((res) => { setOrder(res?.data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [id]);

  const o            = order?.data?.order;
  const patientData  = o?.consultation?.fields?.patientInfo;
  const gpDetails    = o?.consultation?.fields?.gpdetails;
  const shippingData = o?.shipping;
  const products     = o?.items;
  const discount     = o?.consultation?.fields?.checkout?.discount;
  const total        = o?.total_price;
  const shipmentFee  = o?.shippment_weight;

  /* ── Loader ── */
  if (loading) return (
    <DashBoardLayout>
      <main className="inter-reg-font min-w-0 flex-1 bg-[#FBFBFD]">
        <div className="mx-auto flex w-full  flex-col gap-5 p-4 sm:p-5 lg:p-6">
          <div className="h-[110px] animate-pulse rounded-2xl bg-slate-100" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[0,1,2].map(i => <div key={i} className="h-[200px] animate-pulse rounded-xl bg-slate-100" />)}
          </div>
        </div>
      </main>
    </DashBoardLayout>
  );

  return (
    <DashBoardLayout>
      <main className="inter-reg-font min-w-0 flex-1 bg-[#FBFBFD]">
        <div className="mx-auto flex w-full flex-col gap-5 p-4 sm:p-5 lg:p-6 2xl:p-8">

          {/* Header */}
          <PageHeader
            label="My Orders"
            title={`Order #${o?.id || id}`}
            subtitle={o?.created_at ? `Placed on ${moment(o.created_at, "DD-MM-YYYY").format("DD MMM YYYY")}` : ""}
            right={
              <div className="flex items-center gap-2.5">
                <StatusBadge label="Order Status"   value={o?.status} />
                <StatusBadge label="Payment Status" value={o?.payments?.status} />
              </div>
            }
          />

          {/* Tab switcher */}
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

          {/* ── ORDER DETAILS TAB ── */}
          {activeTab === "order" && (
            <div className="flex flex-col gap-4">

              {/* Products */}
              <SectionCard icon={Package} title="Products">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="inter-medium-font py-3 text-[10.5px] uppercase tracking-[0.1em] text-slate-400">Treatment</th>
                        <th className="inter-medium-font py-3 text-[10.5px] uppercase tracking-[0.1em] text-slate-400 text-center">Qty</th>
                        <th className="inter-medium-font py-3 text-[10.5px] uppercase tracking-[0.1em] text-slate-400 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products?.filter(p => p.name?.includes("mg")).map((p) => (
                        <tr key={p.id} className="border-b border-slate-100 last:border-b-0">
                          <td className="inter-medium-font py-3 text-[13px] text-slate-800">{p.label}</td>
                          <td className="inter-reg-font py-3 text-[13px] text-slate-600 text-center">{p.quantity}</td>
                          <td className="inter-semibold-font py-3 text-[13px] text-slate-900 text-right">£{(parseFloat(p.price) * p.quantity).toFixed(2)}</td>
                        </tr>
                      ))}

                      <tr className="border-b border-slate-100">
                        <td className="inter-reg-font py-3 text-[13px] text-slate-500">Shipping fee</td>
                        <td />
                        <td className="inter-reg-font py-3 text-[13px] text-slate-600 text-right">£{shipmentFee}</td>
                      </tr>

                      {discount?.discount > 0 && <>
                        <tr className="border-b border-slate-100">
                          <td className="inter-reg-font py-3 text-[13px] text-slate-500">Discount ({discount?.code})</td>
                          <td />
                          <td className="inter-reg-font py-3 text-[13px] text-emerald-600 text-right">
                            {discount?.type === "Fixed" ? `-£${discount?.discount_value}` : `-${parseFloat(discount?.discount_value).toFixed(1)}%`}
                          </td>
                        </tr>
                      </>}

                      <tr className="bg-slate-50/60">
                        <td className="inter-bold-font py-3.5 text-[14px] text-slate-900">Total</td>
                        <td />
                        <td className="inter-bold-font py-3.5 text-[16px] text-[#47317c] text-right">£{total}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              {/* Shipping */}
              <SectionCard icon={MapPin} title="Shipping Information">
                <InfoRow label="Full name"    value={`${shippingData?.first_name || patientData?.firstName || ""} ${shippingData?.last_name || patientData?.lastName || ""}`.trim()} />
                <InfoRow label="Address 1"    value={shippingData?.addressone} />
                <InfoRow label="Address 2"    value={shippingData?.addresstwo} />
                <InfoRow label="Town / City"  value={shippingData?.city} />
                <InfoRow label="County"       value={shippingData?.state} />
                <InfoRow label="Postcode"     value={shippingData?.postalcode} />
                <InfoRow label="Country"      value={shippingData?.country} />
                <InfoRow label="Phone"        value={patientData?.phoneNo} />
              </SectionCard>
            </div>
          )}

          {/* ── PATIENT DETAILS TAB ── */}
          {activeTab === "patient" && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

              {/* Patient Info */}
              <SectionCard icon={User} title="Patient Information">
                <InfoRow label="First name"   value={patientData?.firstName} />
                <InfoRow label="Last name"    value={patientData?.lastName} />
                <InfoRow label="Date of birth" value={moment(patientData?.dob, "DD-MM-YYYY", true).isValid() ? moment(patientData.dob, "DD-MM-YYYY").format("DD MMM YYYY") : patientData?.dob} />
                <InfoRow label="Gender"       value={patientData?.gender} />
                <InfoRow label="Ethnicity"    value={patientData?.ethnicity} />
                <InfoRow label="Pregnancy"    value={patientData?.pregnancy} />
                <InfoRow label="Phone"        value={patientData?.phoneNo} />
              </SectionCard>

              {/* GP Details */}
              <SectionCard icon={Stethoscope} title="GP Details">
                <InfoRow label="GP Consent"   value={gpDetails?.gpConsent} />
                <InfoRow label="Address"      value={gpDetails?.addressLine1} />
                <InfoRow label="Town / City"  value={gpDetails?.city} />
                <InfoRow label="County"       value={gpDetails?.state} />
                <InfoRow label="Email"        value={gpDetails?.email} />
              </SectionCard>
            </div>
          )}

          {/* Back */}
          <div>
            <Link href="/orders">
              <button className="inter-medium-font inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] text-slate-700 transition-all duration-150 hover:bg-slate-50 cursor-pointer">
                <ArrowLeft size={14} strokeWidth={2} />
                Back to orders
              </button>
            </Link>
          </div>

        </div>
      </main>
    </DashBoardLayout>
  );
};

export default OrderDetails;
