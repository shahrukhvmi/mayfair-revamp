import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useDebounce } from "use-debounce";
import {
  CalendarDays,
  ChevronDown,
  Eye,
  Info,
  Search,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";

import Pagination from "@/Components/Pagination/Pagination";
import GetOrdersApi from "@/api/getOrders";
import useOrderId from "@/store/useOrderIdStore";
import usePaginationStore from "@/store/pagination";
import { useStatusStore } from "@/store/useStatusStore";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import { PageHeader } from "@/Components/Dashboard/MyAccount/MyAccount";

const statusOptions = [
  { value: "all",        label: "All orders",  color: "bg-[#f3f0f9] text-[#47317c] border-[#d9cff0]" },
  { value: "processing", label: "Processing",  color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "incomplete", label: "Incomplete",  color: "bg-orange-50 text-orange-700 border-orange-200" },
  { value: "approved",   label: "Approved",    color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "cancelled",  label: "Cancelled",   color: "bg-red-50 text-red-700 border-red-200" },
];

const statusDot = {
  all:        "bg-[#47317c]",
  processing: "bg-amber-500",
  incomplete: "bg-orange-500",
  approved:   "bg-emerald-500",
  cancelled:  "bg-red-500",
};

const getStatusClasses = (status = "") => {
  switch (status.toLowerCase()) {
    case "processing": return "border-amber-200 bg-amber-50 text-amber-700";
    case "incomplete":  return "border-orange-200 bg-orange-50 text-orange-700";
    case "approved":    return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "cancelled":   return "border-red-200 bg-red-50 text-red-700";
    default:            return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

const OrderStatus = ({ status }) => (
  <span className={`inter-medium-font inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] lg:text-[12px] 2xl:text-[13px] leading-none ${getStatusClasses(status)}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${statusDot[status?.toLowerCase()] || "bg-slate-400"}`} />
    {status}
  </span>
);

/* ── Custom Status Dropdown ── */
const StatusFilter = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = statusOptions.find((o) => o.value === value) || statusOptions[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full sm:w-[200px]">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`inter-medium-font flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-[13px] transition-all duration-150 cursor-pointer ${current.color}`}
      >
        <span className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${statusDot[current.value]}`} />
          {current.label}
        </span>
        <ChevronDown size={14} strokeWidth={2.2} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.1)]">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`inter-medium-font flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] text-left transition-colors duration-100 cursor-pointer
                ${value === opt.value ? opt.color : "text-slate-700 hover:bg-slate-50"}`}
            >
              <span className={`h-2 w-2 rounded-full ${statusDot[opt.value]}`} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Column configs: [width, height] matching real row layout
const SKELETON_COLS = [
  { w: 76,  h: 14 }, // Order ID  (bold, larger)
  { w: 108, h: 13 }, // Order date (icon + text)
  { w: 148, h: 13 }, // Treatment
  { w: 168, h: 13, sub: 100 }, // Items (may have 2 lines)
  { w: 86,  h: 22, pill: true }, // Status pill
  { w: 68,  h: 14 }, // Total
  { w: 36,  h: 36, btn: true },  // Action button
];

const TableSkeletonRow = ({ index }) => (
  <tr className="border-b border-slate-100 last:border-b-0">
    {SKELETON_COLS.map((col, i) => (
      <td key={`${index}-${i}`} className="px-5 py-4">
        {col.btn ? (
          <div className="h-9 w-9 animate-pulse rounded-xl bg-[#47317c]/[0.07]" />
        ) : col.pill ? (
          <div className="h-[22px] w-[86px] animate-pulse rounded-full bg-slate-100" />
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="animate-pulse rounded-full bg-slate-100" style={{ width: col.w, height: col.h }} />
            {col.sub && (
              <div className="animate-pulse rounded-full bg-slate-100/70" style={{ width: col.sub, height: 12 }} />
            )}
          </div>
        )}
      </td>
    ))}
  </tr>
);

const MobileOrderSkeleton = () => (
  <div className="rounded-2xl border border-slate-100 bg-white p-4">
    <div className="flex items-center justify-between gap-3">
      <div className="h-5 w-28 animate-pulse rounded-full bg-slate-100" />
      <div className="h-[22px] w-24 animate-pulse rounded-full bg-slate-100" />
    </div>
    <div className="mt-4 grid grid-cols-2 gap-4">
      <div>
        <div className="h-3 w-10 animate-pulse rounded-full bg-slate-100" />
        <div className="mt-2 h-4 w-24 animate-pulse rounded-full bg-slate-100" />
      </div>
      <div className="text-right">
        <div className="ml-auto h-3 w-10 animate-pulse rounded-full bg-slate-100" />
        <div className="ml-auto mt-2 h-5 w-16 animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>
    <div className="mt-4 border-t border-slate-100 pt-4">
      <div className="h-3 w-20 animate-pulse rounded-full bg-slate-100" />
      <div className="mt-2 h-4 w-40 animate-pulse rounded-full bg-slate-100" />
    </div>
    <div className="mt-3">
      <div className="h-3 w-10 animate-pulse rounded-full bg-slate-100" />
      <div className="mt-2 h-4 w-52 animate-pulse rounded-full bg-slate-100" />
      <div className="mt-1.5 h-4 w-40 animate-pulse rounded-full bg-slate-100/70" />
    </div>
    <div className="mt-5 h-10 w-full animate-pulse rounded-xl bg-[#47317c]/[0.07]" />
  </div>
);

const EmptyOrders = () => (
  <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
      <ShoppingBag size={24} strokeWidth={1.8} />
    </div>
    <h3 className="inter-bold-font mt-4 text-[16px] text-slate-900">No orders found</h3>
    <p className="inter-reg-font mt-1.5 max-w-sm text-[13px] leading-[1.7] text-slate-500">
      No orders match your search or filter.
    </p>
  </div>
);

const MyOrders = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setOrderList] = useState(null);
  const [totalOrders, setTotalOrders] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch] = useDebounce(searchValue, 500);

  const { currentPage, setCurrentPage } = usePaginationStore();
  const { status, setStatus } = useStatusStore();
  const { setOrderId } = useOrderId();
  const { authUserDetail } = useAuthUserDetailStore();
  const router = useRouter();

  const isMountedRef = useRef(false);

  const getOrderList = useMutation(GetOrdersApi, {
    onSuccess: (response) => {
      const myorders = response?.data?.myorders || {};
      setOrderList(myorders);
      if (status === "all" && !debouncedSearch) {
        setTotalOrders(myorders?.total ?? null);
      }
      setIsLoading(false);
    },
    onError: (error) => { toast.error(error?.response?.data?.errors || "Something went wrong"); setIsLoading(false); },
  });

  // Sirf total count ke liye — filter/search se independent
  const getTotalCount = useMutation(GetOrdersApi, {
    onSuccess: (response) => {
      setTotalOrders(response?.data?.myorders?.total ?? 0);
    },
  });

  const buildParams = (page) => ({
    data: {
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(status !== "all"  ? { status }              : {}),
    },
    page,
  });

  const fetchOrders = (page) => {
    setIsLoading(true);
    setOrderList(null);
    getOrderList.mutate(buildParams(page));
  };

  // Fetch when page changes
  useEffect(() => { fetchOrders(currentPage); }, [currentPage]);

  // When search changes: reset to page 1 or fetch directly if already on 1
  useEffect(() => {
    if (!isMountedRef.current) return;
    if (currentPage !== 1) { setCurrentPage(1); } else { fetchOrders(1); }
  }, [debouncedSearch]);

  // When status changes: reset to page 1 or fetch directly if already on 1
  useEffect(() => {
    if (!isMountedRef.current) return;
    if (currentPage !== 1) { setCurrentPage(1); } else { fetchOrders(1); }
  }, [status]);

  useEffect(() => { isMountedRef.current = true; }, []);

  // Mount par hamesha total fetch karo — filter se qata nazar
  useEffect(() => {
    getTotalCount.mutate({ data: {}, page: 1 });
  }, []);

  // All filtering is server-side — only strip orders with missing order_id
  const filteredData = data?.allorders?.filter((order) => !!order?.order_id);

  const handleSendId = (id) => { setOrderId(id); router.push("/order-detail"); };

  const getUniqueTreatments = (order) => {
    const items = Array.isArray(order?.items) ? order.items : [];
    return Array.from(new Set(items.map((i) => i?.product).filter(Boolean)));
  };

  const getGroupedItems = (order) => {
    const items = Array.isArray(order?.items) ? order.items : [];
    return Object.values(items.reduce((acc, item) => {
      const name = (item?.name === "" && item?.label === "Pack of 5 Needles") ? "Pack of 5 Needles" : (item?.name || item?.label || item?.product || "Item");
      acc[name] = acc[name] || { name, quantity: 0 };
      acc[name].quantity += Number(item?.quantity) || 0;
      return acc;
    }, {}));
  };

  return (
    <main className="inter-reg-font min-w-0 flex-1 bg-[#FBFBFD]">
      <div className="mx-auto flex w-full flex-col gap-6 p-4 sm:p-5 lg:p-6 2xl:p-8 2xl:gap-8">

        {/* Header */}
        <PageHeader
          label="Account"
          title="My Orders"
          subtitle="Review your previous orders and complete order details."
          right={
            <div className="flex items-center gap-2 rounded-xl border border-[#e8e2f5] bg-white/70 px-4 py-2.5">
              <ShoppingBag size={14} strokeWidth={2} className="text-[#47317c]" />
              <span className="inter-semibold-font text-[13px] text-slate-800">
                {totalOrders === null
                  ? <span className="inline-block h-3.5 w-10 animate-pulse rounded-full bg-slate-200 align-middle" />
                  : totalOrders
                } orders
              </span>
            </div>
          }
        />

        {/* Orders content */}
        <section className="rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)]">

          {/* Search + Filter */}
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <form className="w-full lg:max-w-[480px]" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <Search size={16} strokeWidth={2} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value.toLowerCase())}
                  placeholder="Search by order ID or treatment…"
                  className="inter-reg-font min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-4 text-[13px] text-slate-900 outline-none placeholder:text-slate-400 transition-all duration-150 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-100"
                />
              </div>
            </form>

            <div className="flex items-center gap-3">
              {/* Filter result count */}
              {!isLoading && data && (status !== "all" || searchValue) && (
                <span className={`inter-medium-font whitespace-nowrap rounded-lg border px-3 py-1.5 text-[12px] ${statusOptions.find((o) => o.value === status)?.color ?? "bg-[#f3f0f9] text-[#47317c] border-[#d9cff0]"}`}>
                  {data?.total ?? 0} results
                </span>
              )}
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} strokeWidth={2} className="text-slate-400 sm:block hidden" />
                <span className="inter-reg-font text-[10.5px] sm:text-[12px] text-slate-500">Sort by status</span>
              </div>
              <StatusFilter value={status} onChange={setStatus} />
            </div>
          </div>

          {/* Info notice */}
          <div className="mx-4 mt-4 sm:mx-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <Info size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-slate-400" />
            <p className="inter-reg-font text-[14px] leading-[1.65] text-slate-500">
            <strong className="inter-bold-font">Note:   </strong>
Changes to your shipping address will only apply to future orders and will not affect previous ones
            </p>
          </div>

          {/* Orders table — horizontally scrollable on smaller screens */}
          <div className="mt-4 overflow-hidden">
            <div className="overflow-x-auto overscroll-x-contain">
              <table className="w-full min-w-[1080px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {["Order ID", "Order date", "Treatment", "Items", "Status", "Total", ""].map((h) => (
                      <th key={h || "action"} scope="col" className="inter-medium-font whitespace-nowrap px-5 py-3.5 text-[10.5px] lg:text-[11.5px] 2xl:text-[12.5px] uppercase tracking-[0.11em] text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => <TableSkeletonRow key={i} index={i} />)
                  ) : filteredData?.length === 0 ? (
                    <tr><td colSpan={7}><EmptyOrders /></td></tr>
                  ) : (
                    filteredData?.map((order) => {
                      const treatments = getUniqueTreatments(order);
                      const groupedItems = getGroupedItems(order);
                      return (
                        <tr key={order.id} className="group border-b border-slate-100 last:border-b-0 transition-colors duration-150 hover:bg-slate-50/60">
                          <td className="px-5 py-4">
                            <span className="inter-bold-font text-[13px] lg:text-[14px] 2xl:text-[15px] text-slate-800">#{order.order_id}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <CalendarDays size={13} strokeWidth={2} className="shrink-0 text-slate-400" />
                              <span className="inter-medium-font whitespace-nowrap text-[12.5px] lg:text-[13.5px] 2xl:text-[14.5px] text-slate-600">{order.created_at}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex max-w-[190px] flex-col gap-1">
                              {treatments.map((t, i) => (
                                <span key={`${t}-${i}`} className="inter-medium-font text-[12.5px] lg:text-[13.5px] 2xl:text-[14.5px] leading-5 text-slate-800">{t}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex max-w-[225px] flex-col gap-1">
                              {groupedItems.map((item, i) => (
                                <span key={`${item.name}-${i}`} className="inter-reg-font text-[12px] lg:text-[13px] 2xl:text-[14px] leading-5 text-slate-500">
                                  {item.name}<span className="inter-medium-font ml-1 text-slate-700">× {item.quantity}</span>
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-4"><OrderStatus status={order.status} /></td>
                          <td className="px-5 py-4">
                            <span className="inter-bold-font whitespace-nowrap text-[13px] lg:text-[14px] 2xl:text-[15px] text-slate-900">£{order.total_price}</span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleSendId(order?.id)}
                              aria-label={`View order ${order.order_id}`}
                              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#47317c]/10 bg-[#47317c]/[0.09] text-[#47317c] transition-all duration-150 hover:border-[#47317c]/20 hover:bg-[#47317c]/[0.14]"
                            >
                              <Eye size={15} strokeWidth={2} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="hidden">
            {isLoading ? (
              [...Array(4)].map((_, i) => <MobileOrderSkeleton key={i} />)
            ) : filteredData?.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-white"><EmptyOrders /></div>
            ) : (
              filteredData?.map((order) => {
                const treatments = getUniqueTreatments(order);
                const groupedItems = getGroupedItems(order);
                return (
                  <article key={order.id} className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3.5">
                      <div>
                        <p className="inter-medium-font text-[10px] uppercase tracking-[0.12em] text-slate-400">Order</p>
                        <p className="inter-bold-font mt-0.5 text-[15px] text-slate-900">#{order.order_id}</p>
                      </div>
                      <OrderStatus status={order.status} />
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="inter-medium-font text-[10px] uppercase tracking-[0.11em] text-slate-400">Date</p>
                          <p className="inter-medium-font mt-1 text-[12.5px] text-slate-700">{order.created_at}</p>
                        </div>
                        <div className="text-right">
                          <p className="inter-medium-font text-[10px] uppercase tracking-[0.11em] text-slate-400">Total</p>
                          <p className="inter-bold-font mt-1 text-[16px] text-slate-900">£{order.total_price}</p>
                        </div>
                      </div>
                      <div className="mt-3.5 border-t border-slate-100 pt-3.5">
                        <p className="inter-medium-font text-[10px] uppercase tracking-[0.11em] text-slate-400">Treatment</p>
                        <div className="mt-1.5 flex flex-col gap-1">
                          {treatments.map((t, i) => <p key={`${t}-${i}`} className="inter-medium-font text-[13px] text-slate-900">{t}</p>)}
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="inter-medium-font text-[10px] uppercase tracking-[0.11em] text-slate-400">Items</p>
                        <div className="mt-1.5 flex flex-col gap-1">
                          {groupedItems.map((item, i) => (
                            <p key={`${item.name}-${i}`} className="inter-reg-font text-[12px] text-slate-500">
                              {item.name}<span className="inter-medium-font ml-1 text-slate-700">× {item.quantity}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSendId(order?.id)}
                        className="inter-medium-font mt-4 inline-flex min-h-[40px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-[13px] text-white transition-all duration-150 hover:bg-slate-800 active:scale-[0.98]"
                      >
                        <Eye size={15} strokeWidth={2} />
                        View order
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {!isLoading && data && filteredData?.length > 0 && (
            <div className="min-w-0 overflow-hidden border-t border-slate-100 px-3 py-4 sm:px-5">
              <Pagination pagination={data} setPage={setCurrentPage} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default MyOrders;
