import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import PageLoader from "@/Components/PageLoader/PageLoader";

const Payment = () => {
  const router = useRouter();
  const { order_id } = router.query;

  const [countdown, setCountdown] = useState(3);
  const [paymentData, setPaymentData] = useState(null);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    if (!order_id) return;

    const fetchPaymentData = async () => {
      try {
        const res = await fetch(
          "https://app.mayfairweightlossclinic.co.uk/api/PaymentDataOnOrderToken",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Company-Id": 1,
            },
            body: JSON.stringify({ order_token: order_id }),
          }
        );

        const data = await res.json();

        // ✅ Log full response
        console.log("Payment Data API Response:", data?.paymentData);

        if (data?.paymentData) {
          setPaymentData(data.paymentData);
        }
      } catch (err) {
        setShowLoader(false);
        console.error("Error fetching paymentData:", err);
      }
    };

    fetchPaymentData();
  }, [order_id]);

  useEffect(() => {
    if (!paymentData?.actionurl) return;

    const updateCountdown = () => {
      setCountdown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("p_id");
          document.getElementById("process-payment-form")?.submit();
          return 0;
        }
        setTimeout(updateCountdown, 1000);
        return prev - 1;
      });
    };

    const timer = setTimeout(updateCountdown, 1000);
    return () => clearTimeout(timer);
  }, [paymentData]);

  if (!order_id) return null;

  return (
    <>
      {paymentData && (
        <form
          style={{ display: "none" }}
          id="process-payment-form"
          method="post"
          action={paymentData.actionurl}
        >
          <fieldset>
            <legend>IPG Connect Request Details</legend>
            <p>
              <label>Biling Information:</label>
              <input
                type="hidden"
                name="bname"
                value={paymentData.bname}
                readOnly
              />
              <input
                type="hidden"
                name="baddr1"
                value={paymentData.baddr1}
                readOnly
              />
              <input
                type="hidden"
                name="baddr2"
                value={paymentData.baddr2}
                readOnly
              />
              <input
                type="hidden"
                name="bcity"
                value={paymentData.bcity}
                readOnly
              />
              <input
                type="hidden"
                name="bstate"
                value={paymentData.bstate}
                readOnly
              />
              <input
                type="hidden"
                name="bcountry"
                value={paymentData.bcountry}
                readOnly
              />
              <input
                type="hidden"
                name="bzip"
                value={paymentData.bzip}
                readOnly
              />
              <input
                type="hidden"
                name="phone"
                value={paymentData.phone}
                readOnly
              />
              <input
                type="hidden"
                name="email"
                value={paymentData.email}
                readOnly
              />
            </p>
            <p>
              <label htmlFor="oid">Order ID:</label>
              <input
                type="hidden"
                name="oid"
                value={paymentData.oid}
                readOnly
              />
            </p>
            {/* <p>
              <label htmlFor="companyId">Company ID:</label>
              <input type="hidden" name="companyId" value={1} readOnly />
            </p> */}
            <p>
              <label htmlFor="company_id">Company ID:</label>
              <input type="hidden" name="company_id" value={1} readOnly />
            </p>
            <p>
              <label htmlFor="storename">Store ID:</label>
              <input
                type="hidden"
                name="storename"
                value={paymentData.storename}
                readOnly
              />
            </p>
            <p>
              <label htmlFor="timezone">Timezone:</label>
              <input
                type="hidden"
                name="timezone"
                value={paymentData.timezone}
                readOnly
              />
            </p>
            <p>
              <label htmlFor="txntype">Transaction Type:</label>
              <input
                type="hidden"
                name="txntype"
                value={paymentData.txntype}
                readOnly
              />
            </p>
            <p>
              <label htmlFor="currency">Currency (see ISO4217):</label>
              <input
                type="hidden"
                name="currency"
                value={paymentData.currency}
                readOnly
              />
            </p>
            <p>
              <label htmlFor="chargetotal">Transaction Charge Total:</label>
              <input
                type="hidden"
                name="chargetotal"
                value={paymentData.chargetotal}
                readOnly
              />
            </p>
            <p>
              <label htmlFor="txndatetime">Transaction DateTime:</label>
              <input
                type="hidden"
                name="txndatetime"
                value={paymentData.txndatetime}
                readOnly
              />
            </p>
            <p>
              <label htmlFor="checkoutoption">Checkout option:</label>
              <input
                type="hidden"
                name="checkoutoption"
                value={paymentData.checkoutoption}
                readOnly
              />
            </p>
            <p>
              <label htmlFor="hash_algorithm">Hash Algorithm:</label>
              <input
                type="hidden"
                name="hash_algorithm"
                value={paymentData.hash_algorithm}
                readOnly
              />
            </p>
            <p>
              <label htmlFor="hashExtended">Hash Extended:</label>
              <input
                type="hidden"
                name="hashExtended"
                value={paymentData.HashDigest}
                readOnly
              />
            </p>
            <p>
              <label htmlFor="responseSuccessURL">Success URL:</label>
              <input
                type="hidden"
                name="responseSuccessURL"
                value={paymentData.responseSuccessURL}
                readOnly
              />
            </p>
            <p>
              <label htmlFor="responseFailURL">Fail URL:</label>
              <input
                type="hidden"
                name="responseFailURL"
                value={paymentData.responseFailURL}
                readOnly
              />
            </p>
          </fieldset>
        </form>
      )}
      {showLoader && (
        <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/60 rounded-lg cursor-not-allowed">
          <PageLoader />
        </div>
      )}
    </>
  );
};

export default Payment;
