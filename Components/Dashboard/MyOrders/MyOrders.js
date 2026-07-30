import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  CalendarDays,
  ChevronDown,
  Eye,
  Info,
  PackageOpen,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import Pagination from "@/Components/Pagination/Pagination";
import GetOrdersApi from "@/api/getOrders";
import useOrderId from "@/store/useOrderIdStore";
import usePaginationStore from "@/store/pagination";
import { useStatusStore } from "@/store/useStatusStore";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";

const statusOptions = [
  {
    value: "all",
    label: "All orders",
  },
  {
    value: "processing",
    label: "Processing",
  },
  {
    value: "incomplete",
    label: "Incomplete",
  },
  {
    value: "approved",
    label: "Approved",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

const getStatusClasses = (status = "") => {
  switch (status.toLowerCase()) {
    case "processing":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "incomplete":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

const OrderStatus = ({ status }) => (
  <span
    className={`
      mont-medium-font inline-flex items-center rounded-full border
      px-3 py-1.5 text-[11px] leading-none
      ${getStatusClasses(status)}
    `}
  >
    {status}
  </span>
);

const TableSkeletonRow = ({ index }) => {
  const widths = [80, 105, 155, 180, 92, 72, 42];

  return (
    <tr
      key={index}
      className="border-b border-[#47317c]/[0.06] last:border-b-0"
    >
      {widths.map((width, itemIndex) => (
        <td key={`${index}-${itemIndex}`} className="px-5 py-5">
          <div
            className="h-4 animate-pulse rounded-full bg-[#47317c]/[0.07]"
            style={{
              width,
              maxWidth: "100%",
            }}
          />
        </td>
      ))}
    </tr>
  );
};

const MobileOrderSkeleton = ({ index }) => (
  <div
    key={index}
    className="rounded-[20px] border border-[#47317c]/10 bg-white p-5"
  >
    <div className="flex items-center justify-between gap-3">
      <div className="h-5 w-28 animate-pulse rounded-full bg-[#47317c]/[0.07]" />

      <div className="h-7 w-24 animate-pulse rounded-full bg-[#47317c]/[0.07]" />
    </div>

    <div className="mt-5 h-5 w-2/3 animate-pulse rounded-full bg-[#47317c]/[0.07]" />

    <div className="mt-2.5 h-4 w-1/2 animate-pulse rounded-full bg-[#47317c]/[0.07]" />

    <div className="mt-6 h-11 w-full animate-pulse rounded-[12px] bg-[#47317c]/[0.07]" />
  </div>
);

const EmptyOrders = () => (
  <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-[19px] bg-[#47317c]/[0.07] text-[#47317c]">
      <ShoppingBag size={28} strokeWidth={1.8} />
    </div>

    <h3 className="mont-bold-font mt-4 text-[17px] text-slate-900">
      No orders found
    </h3>

    <p className="mont-reg-font mt-1.5 max-w-sm text-[12px] leading-[1.7] text-slate-500">
      No orders match the selected search or status filter.
    </p>
  </div>
);

const MyOrders = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setOrderList] = useState(null);
  const [searchValue, setSearchValue] = useState("");

  const { currentPage, setCurrentPage } = usePaginationStore();

  const { status, setStatus } = useStatusStore();
  const { setOrderId } = useOrderId();

  const { authUserDetail } = useAuthUserDetailStore();

  const router = useRouter();

  const displayEmail = authUserDetail?.email?.trim() || "Not available";

  const getOrderList = useMutation(GetOrdersApi, {
    onSuccess: (response) => {
      const paginationData = response?.data?.myorders || {};

      setOrderList(paginationData);
      setIsLoading(false);
    },

    onError: (error) => {
      toast.error(error?.response?.data?.errors || "Something went wrong");

      setIsLoading(false);
    },
  });

  useEffect(() => {
    getOrderList.mutate({
      data: {},
      page: currentPage,
    });
  }, [currentPage]);

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value.toLowerCase());
  };

  const handleStatusChange = (selectedStatus) => {
    setStatus(selectedStatus);
  };

  const filteredData = data?.allorders?.filter((order) => {
    const orderItems = Array.isArray(order?.items) ? order.items : [];

    const matchesSearch =
      order?.order_id?.toString().includes(searchValue) ||
      order?.treatment?.toLowerCase().includes(searchValue) ||
      orderItems.some((item) =>
        item?.product?.toLowerCase().includes(searchValue),
      );

    const matchesStatus =
      status === "all" ||
      order?.status?.toLowerCase() === status?.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleSendId = (id) => {
    setOrderId(id);
    router.push("/order-detail");
  };

  const getUniqueTreatments = (order) => {
    const orderItems = Array.isArray(order?.items) ? order.items : [];

    return Array.from(
      new Set(orderItems.map((item) => item?.product).filter(Boolean)),
    );
  };

  const getGroupedItems = (order) => {
    const orderItems = Array.isArray(order?.items) ? order.items : [];

    return Object.values(
      orderItems.reduce((accumulator, item) => {
        const fallbackName =
          item?.name === "" && item?.label === "Pack of 5 Needles"
            ? "Pack of 5 Needles"
            : item?.name;

        const itemName = fallbackName || item?.label || item?.product || "Item";

        const key = itemName;

        accumulator[key] = accumulator[key] || {
          name: itemName,
          quantity: 0,
        };

        accumulator[key].quantity += Number(item?.quantity) || 0;

        return accumulator;
      }, {}),
    );
  };

  return (
    <main className="mont-reg-font min-w-0 flex-1 bg-[#f4f5fb] p-3 sm:p-4 lg:p-5 xl:p-6">
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-4">
        {/* Header */}
        <section className="relative overflow-hidden rounded-[26px] border border-[#47317c]/[0.09] bg-white px-5 py-6 shadow-[0_16px_42px_rgba(71,49,124,0.075)] sm:px-6 lg:px-7">
          <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-[#47317c]/[0.06] blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="mont-bold-font mb-2 text-[11px] uppercase tracking-[0.16em] text-[#47317c]">
                Orders
              </p>

              <h1 className="mont-bold-font text-[28px] leading-tight tracking-[-0.04em] text-slate-950 sm:text-[32px]">
                My Orders
              </h1>

              <p className="mont-reg-font mt-2.5 max-w-2xl text-[13px] leading-[1.7] text-slate-500 sm:text-[14px]">
                Review your previous orders, treatments, current status and
                complete order details.
              </p>
            </div>

            {/* Logged in user */}
            <div className="flex w-full min-w-0 items-center gap-3.5 rounded-[18px] border border-[#47317c]/10 bg-[#faf8fd] px-4 py-3.5 lg:w-[310px]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#47317c] text-white shadow-[0_8px_18px_rgba(71,49,124,0.2)]">
                <UserRound size={19} strokeWidth={2} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="mont-medium-font text-[10px] uppercase tracking-[0.12em] text-[#47317c]/55">
                  Logged in as
                </p>

                <p
                  title={displayEmail}
                  className="mont-reg-font mt-0.5 truncate text-[11px] leading-4 text-slate-500"
                >
                  {displayEmail}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Orders content */}
        <section className="relative overflow-hidden rounded-[26px] border border-[#47317c]/[0.09] bg-white p-4 shadow-[0_16px_42px_rgba(71,49,124,0.075)] sm:p-5 lg:p-6">
          {/* Search and filters */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <form
              className="w-full lg:max-w-[510px]"
              onSubmit={(event) => event.preventDefault()}
            >
              <label htmlFor="order-search" className="sr-only">
                Search orders
              </label>

              <div className="relative">
                <Search
                  size={18}
                  strokeWidth={2}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#47317c]/45"
                />

                <input
                  id="order-search"
                  type="text"
                  value={searchValue}
                  onChange={handleSearchChange}
                  placeholder="Search by order ID or treatment"
                  className="
                    mont-reg-font min-h-[48px] w-full
                    rounded-[14px] border border-[#47317c]/10
                    bg-[#faf9fc] py-3 pl-11 pr-4
                    text-[13px] text-slate-900 outline-none
                    transition-all duration-200
                    placeholder:text-slate-400
                    focus:border-[#47317c]/25
                    focus:bg-white
                    focus:ring-4 focus:ring-[#47317c]/[0.04]
                  "
                />
              </div>
            </form>

            <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center lg:w-auto">
              <div className="flex items-center gap-2">
                <SlidersHorizontal
                  size={16}
                  strokeWidth={2}
                  className="text-[#47317c]"
                />

                <label
                  htmlFor="order-status"
                  className="mont-medium-font text-[12px] text-slate-500"
                >
                  Filter status
                </label>
              </div>

              <div className="relative w-full sm:w-[190px]">
                <select
                  id="order-status"
                  value={status}
                  onChange={(event) => handleStatusChange(event.target.value)}
                  className="
                    mont-medium-font min-h-[48px] w-full
                    cursor-pointer appearance-none
                    rounded-[14px] border border-[#47317c]/10
                    bg-white px-4 py-3 pr-11
                    text-[12.5px] text-slate-700 outline-none
                    transition-all duration-200
                    focus:border-[#47317c]/25
                    focus:ring-4 focus:ring-[#47317c]/[0.04]
                  "
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  strokeWidth={2.2}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#47317c]/60"
                />
              </div>
            </div>
          </div>

          {/* Information notice */}
          <div className="mt-5 flex items-start gap-3.5 rounded-[16px] border border-sky-200/70 bg-sky-50/70 px-4 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-white text-sky-600 shadow-sm">
              <Info size={17} strokeWidth={2.2} />
            </span>

            <div className="min-w-0 pt-0.5">
              <p className="mont-medium-font text-[12px] leading-5 text-sky-900">
                Address changes
              </p>

              <p className="mont-reg-font mt-0.5 text-[11.5px] leading-[1.6] text-sky-700">
                Changes to your shipping address apply only to future orders and
                do not affect previous orders.
              </p>
            </div>
          </div>

          {/* Desktop table */}
          <div className="mt-5 hidden overflow-hidden rounded-[19px] border border-[#47317c]/10 lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] border-collapse text-left">
                <thead className="bg-[#faf9fc]">
                  <tr className="border-b border-[#47317c]/[0.07]">
                    {[
                      "Order ID",
                      "Order date",
                      "Treatment",
                      "Items",
                      "Status",
                      "Total",
                      "",
                    ].map((heading) => (
                      <th
                        key={heading || "action"}
                        scope="col"
                        className="
                          mont-medium-font whitespace-nowrap
                          px-5 py-4 text-[10.5px]
                          uppercase tracking-[0.11em]
                          text-slate-400
                        "
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white">
                  {isLoading ? (
                    [...Array(5)].map((_, index) => (
                      <TableSkeletonRow key={index} index={index} />
                    ))
                  ) : filteredData?.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <EmptyOrders />
                      </td>
                    </tr>
                  ) : (
                    filteredData?.map((order) => {
                      const treatments = getUniqueTreatments(order);

                      const groupedItems = getGroupedItems(order);

                      return (
                        <tr
                          key={order.order_id}
                          className="
                            group border-b
                            border-[#47317c]/[0.06]
                            transition-colors duration-200
                            last:border-b-0
                            hover:bg-[#47317c]/[0.018]
                          "
                        >
                          <td className="px-5 py-5">
                            <span className="mont-bold-font text-[13px] text-[#47317c]">
                              #{order.order_id}
                            </span>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={15}
                                strokeWidth={2}
                                className="shrink-0 text-[#47317c]/55"
                              />

                              <span className="mont-medium-font whitespace-nowrap text-[12px] text-slate-600">
                                {order.created_at}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex max-w-[190px] flex-col gap-1.5">
                              {treatments.map((treatment, index) => (
                                <span
                                  key={`${treatment}-${index}`}
                                  className="mont-medium-font text-[12px] leading-5 text-slate-800"
                                >
                                  {treatment}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex max-w-[225px] flex-col gap-1.5">
                              {groupedItems.map((item, index) => (
                                <span
                                  key={`${item.name}-${index}`}
                                  className="mont-reg-font text-[11.5px] leading-5 text-slate-500"
                                >
                                  {item.name}

                                  <span className="mont-medium-font ml-1 text-slate-700">
                                    × {item.quantity}
                                  </span>
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <OrderStatus status={order.status} />
                          </td>

                          <td className="px-5 py-5">
                            <span className="mont-bold-font whitespace-nowrap text-[13px] text-slate-950">
                              £{order.total_price}
                            </span>
                          </td>

                          <td className="px-5 py-5 text-right">
                            <button
                              type="button"
                              onClick={() => handleSendId(order?.id)}
                              aria-label={`View order ${order.order_id}`}
                              className="
                                inline-flex h-10 w-10 cursor-pointer
                                items-center justify-center
                                rounded-[11px] border
                                border-[#47317c]/10 bg-white
                                text-[#47317c]
                                transition-all duration-200
                                hover:border-[#47317c]/20
                                hover:bg-[#47317c]
                                hover:text-white
                              "
                            >
                              <Eye size={17} strokeWidth={2} />
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

          {/* Mobile and tablet */}
          <div className="mt-5 grid grid-cols-1 gap-4 lg:hidden">
            {isLoading ? (
              [...Array(4)].map((_, index) => (
                <MobileOrderSkeleton key={index} index={index} />
              ))
            ) : filteredData?.length === 0 ? (
              <div className="rounded-[20px] border border-[#47317c]/10 bg-white">
                <EmptyOrders />
              </div>
            ) : (
              filteredData?.map((order) => {
                const treatments = getUniqueTreatments(order);

                const groupedItems = getGroupedItems(order);

                return (
                  <article
                    key={order.order_id}
                    className="overflow-hidden rounded-[20px] border border-[#47317c]/10 bg-white"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-[#47317c]/[0.07] bg-[#faf9fc] px-4 py-4">
                      <div className="min-w-0">
                        <p className="mont-medium-font text-[10px] uppercase tracking-[0.12em] text-slate-400">
                          Order
                        </p>

                        <p className="mont-bold-font mt-1 text-[15px] text-[#47317c]">
                          #{order.order_id}
                        </p>
                      </div>

                      <OrderStatus status={order.status} />
                    </div>

                    <div className="p-4 sm:p-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="mont-medium-font text-[10px] uppercase tracking-[0.11em] text-slate-400">
                            Order date
                          </p>

                          <p className="mont-medium-font mt-1.5 text-[12px] text-slate-700">
                            {order.created_at}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="mont-medium-font text-[10px] uppercase tracking-[0.11em] text-slate-400">
                            Total
                          </p>

                          <p className="mont-bold-font mt-1.5 text-[16px] text-[#47317c]">
                            £{order.total_price}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-[#47317c]/[0.07] pt-4">
                        <p className="mont-medium-font text-[10px] uppercase tracking-[0.11em] text-slate-400">
                          Treatment
                        </p>

                        <div className="mt-2 flex flex-col gap-1.5">
                          {treatments.map((treatment, index) => (
                            <p
                              key={`${treatment}-${index}`}
                              className="mont-medium-font text-[13px] text-slate-900"
                            >
                              {treatment}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="mont-medium-font text-[10px] uppercase tracking-[0.11em] text-slate-400">
                          Items
                        </p>

                        <div className="mt-2 flex flex-col gap-1.5">
                          {groupedItems.map((item, index) => (
                            <p
                              key={`${item.name}-${index}`}
                              className="mont-reg-font text-[12px] leading-5 text-slate-500"
                            >
                              {item.name}

                              <span className="mont-medium-font ml-1 text-slate-700">
                                × {item.quantity}
                              </span>
                            </p>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSendId(order?.id)}
                        className="
                          mont-medium-font mt-5 inline-flex min-h-[44px]
                          w-full cursor-pointer items-center
                          justify-center gap-2 rounded-[12px]
                          bg-[#47317c] px-4 py-2.5
                          text-[12px] text-white
                          transition-all duration-200
                          hover:bg-[#392765]
                          active:scale-[0.98]
                        "
                      >
                        <Eye size={16} strokeWidth={2} />
                        View order
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {!isLoading && data && (
            <div className="mt-6 border-t border-[#47317c]/[0.07] pt-5">
              <Pagination pagination={data} setPage={setCurrentPage} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default MyOrders;
