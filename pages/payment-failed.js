import PaymentFailed from "@/Components/PaymentFailed/PaymentFailed";
import { meta_url } from "@/config/constants";
import MetaLayout from "@/Meta/MetaLayout";
import React from "react";

const thankYou = () => {
  return (
    <>
      <MetaLayout canonical={`${meta_url}payment-failed/`} />
      <PaymentFailed />
    </>
  );
};

export default thankYou;
