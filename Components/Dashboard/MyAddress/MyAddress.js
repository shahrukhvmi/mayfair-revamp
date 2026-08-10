import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreditCard, MapPin } from "lucide-react";

import Shipping from "./Shipping";
import Billing from "./Billing";
import { getProfileData } from "@/api/myProfileApi";
import useAuthUserDetailStore from "@/store/useAuthUserDetailStore";
import { PageHeader } from "@/Components/Dashboard/MyAccount/MyAccount";

export default function MyAddress() {
  const [billingCountries, setBillingCountries] = useState([]);
  const [shipmentCountries, setShipmentCountries] = useState([]);

  const { authUserDetail } = useAuthUserDetailStore();
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

  useEffect(() => { getProfileDataMutation.mutate(); }, []);

  return (
    <main className="inter-reg-font min-w-0 flex-1 bg-[#FBFBFD]">
      <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-6 p-4 sm:p-5 lg:p-6">

        <PageHeader
          label="Account"
          title="My Address Book"
          subtitle="Manage shipping and billing addresses for your orders."
        />

        {/* Both forms side by side */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {/* Shipping */}
          <section>
            {/* <div className="mb-3 flex items-center gap-2">
              <MapPin size={14} strokeWidth={2} className="text-slate-400" />
              <h2 className="inter-semibold-font text-[14px] text-slate-700">Shipping Address</h2>
            </div> */}
            {/* <div className="rounded-lg border border-slate-100 bg-white"> */}
              <Shipping shipmentCountries={shipmentCountries} />
            {/* </div> */}
          </section>

          {/* Billing */}
          <section>
            {/* <div className="mb-3 flex items-center gap-2">
              <CreditCard size={14} strokeWidth={2} className="text-slate-400" />
              <h2 className="inter-semibold-font text-[14px] text-slate-700">Billing Address</h2>
            </div> */}
            {/* <div className="rounded-lg border border-slate-100 bg-white"> */}
              <Billing billingCountries={billingCountries} />
            {/* </div> */}
          </section>
        </div>

      </div>
    </main>
  );
}
