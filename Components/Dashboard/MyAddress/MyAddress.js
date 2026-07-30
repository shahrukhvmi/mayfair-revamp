import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreditCard, MapPin, UserRound } from "lucide-react";

import Shipping from "./Shipping";
import Billing from "./Billing";
import { getProfileData } from "@/api/myProfileApi";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";

export default function MyAddress() {
  const [tabActive, setTabActive] = useState("shipping");
  const [billingCountries, setBillingCountries] = useState([]);
  const [shipmentCountries, setShipmentCountries] = useState([]);

  const { authUserDetail } = useAuthUserDetailStore();

  const displayName = authUserDetail?.fname?.trim() || "Patient";

  const displayEmail = authUserDetail?.email?.trim() || "Not available";

  const getProfileDataMutation = useMutation(getProfileData, {
    onSuccess: (data) => {
      setBillingCountries(data?.data?.profile?.billing_countries || []);

      setShipmentCountries(data?.data?.profile?.shippment_countries || []);
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    },
  });

  useEffect(() => {
    getProfileDataMutation.mutate();
  }, []);

  return (
    <main className="mont-reg-font min-w-0 flex-1 bg-[#f4f5fb] p-3 sm:p-4 lg:p-5 xl:p-6">
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-4">
        {/* Page header */}
        <section className="relative overflow-hidden rounded-[26px] border border-[#47317c]/[0.09] bg-white px-5 py-6 shadow-[0_16px_42px_rgba(71,49,124,0.075)] sm:px-6 lg:px-7">
          <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-[#47317c]/[0.06] blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="mont-bold-font mb-2 text-[11px] uppercase tracking-[0.16em] text-[#47317c]">
                Address book
              </p>

              <h1 className="mont-bold-font text-[28px] leading-tight tracking-[-0.04em] text-slate-950 sm:text-[32px]">
                My Addresses
              </h1>

              <p className="mont-reg-font mt-2.5 max-w-2xl text-[13px] leading-[1.7] text-slate-500 sm:text-[14px]">
                Manage the shipping and billing addresses used for your future
                treatment orders.
              </p>
            </div>

            {/* Logged in account */}
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

        {/* Address content */}
        <section className="relative overflow-hidden rounded-[26px] border border-[#47317c]/[0.09] bg-white p-4 shadow-[0_16px_42px_rgba(71,49,124,0.075)] sm:p-5 lg:p-6">
          {/* Tabs */}
          <div className="inline-flex w-full items-center rounded-[15px] border border-[#47317c]/10 bg-[#f7f5fa] p-1 sm:w-auto">
            <button
              type="button"
              onClick={() => setTabActive("shipping")}
              aria-pressed={tabActive === "shipping"}
              className={`
                mont-medium-font inline-flex min-h-[44px]
                flex-1 cursor-pointer items-center justify-center
                gap-2 rounded-[11px] px-4 py-2.5
                text-[12.5px] transition-all duration-200
                sm:flex-none

                ${
                  tabActive === "shipping"
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
              <MapPin size={16} strokeWidth={2} />
              Shipping address
            </button>

            <button
              type="button"
              onClick={() => setTabActive("billing")}
              aria-pressed={tabActive === "billing"}
              className={`
                mont-medium-font inline-flex min-h-[44px]
                flex-1 cursor-pointer items-center justify-center
                gap-2 rounded-[11px] px-4 py-2.5
                text-[12.5px] transition-all duration-200
                sm:flex-none

                ${
                  tabActive === "billing"
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
              <CreditCard size={16} strokeWidth={2} />
              Billing address
            </button>
          </div>

          {/* Tab content */}
          <div>
            {tabActive === "shipping" ? (
              <Shipping shipmentCountries={shipmentCountries} />
            ) : (
              <Billing billingCountries={billingCountries} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
