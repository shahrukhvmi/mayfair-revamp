import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { HiBadgeCheck } from "react-icons/hi";
import NextButton from "../NextButton/NextButton";
import useCartStore from "@/store/useCartStore";
import { RiErrorWarningLine } from "react-icons/ri";
import useImageUploadStore from "@/store/useImageUploadStore ";
import GetImageIsUplaod from "@/api/GetImageIsUplaod";
import GetUserOrderApi from "@/api/GetUserOrderApi";
import useAuthStore from "@/store/authStore";
import Fetcher from "@/library/Fetcher";
import toast from "react-hot-toast";
import useUserDataStore from "@/store/userDataStore";
import usePatientInfoStore from "@/store/patientInfoStore";
import useProductId from "@/store/useProductIdStore";
import { trackCustomerLabsPurchased } from "@/config/CustomerLabs";
import patientSource from "@/api/patientSource";
import useReturning from "@/store/useReturningPatient";

const ThankYou = () => {
  const { orderId, checkOut, setOrderId, setCheckOut } = useCartStore();
  const { token } = useAuthStore();
  const router = useRouter();
  const [items, setItems] = useState(null);
  const { userData } = useUserDataStore();
  const { patientInfo } = usePatientInfoStore();
  const { productId } = useProductId();
  const { isReturningPatient } = useReturning();

  // console.log(isReturningPatient, "isReturningPatient");

  // useEffect(() => {

  //   if (!checkOut || Object.keys(checkOut).length === 0) {
  //     router.replace("/dashboard");
  //   }
  // }, [checkOut, router]);

  // if (!checkOut || Object.keys(checkOut).length === 0) {
  //   return null;
  // }
  const GO = useRouter();
  const { imageUploaded, setImageUploaded } = useImageUploadStore();
  useEffect(() => {
    const fetchImageStatus = async () => {
      try {
        const res = await GetImageIsUplaod({ order_id: orderId });

        setImageUploaded(res?.data?.status);
      } catch (error) {
        console.error(
          "Failed to fetch image status:",
          error?.response?.data?.errors?.Order,
        );
      }
    };

    if (orderId) fetchImageStatus();
  }, [orderId]);

  useEffect(() => {
    const fetchUserOrder = async () => {
      try {
        if (!token) {
          toast.error("User not authenticated");
          router.replace("/login");
          return;
        }
        Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${token}`;

        const res = await GetUserOrderApi();
        setOrderId(res?.data?.id);
        setItems(res?.data?.items);
        setCheckOut(res?.data?.consultation?.fields?.checkout);

        const consultationCheckout = res?.data?.consultation?.fields?.checkout;
        const patientData = res?.data?.consultation?.fields?.patientInfo;

        // CustomerLabs — fire Purchased event on successful order
        const clOrderId = res?.data?.id;
        const clItems = res?.data?.items || [];
        const clCheckout = res?.data?.consultation?.fields?.checkout;

        // Main product = item where product and name are different (dose item)
        // Addon = item where product and name are the same
        const mainItem = clItems.find((item) => item?.product !== item?.name);
        const addonItems = clItems.filter(
          (item) => item?.product === item?.name,
        );

        const productName = mainItem?.product || "Weight Loss Treatment";
        const doseName = mainItem?.name || "";
        const doseQuantity = mainItem?.quantity || 1;

        const addonsString =
          addonItems.length > 0
            ? addonItems
              .map((item) => `${item?.name} x${item?.quantity || 1}`)
              .join(", ")
            : "None";

        // Build productProperties array for CL
        const productProperties = clItems.map((item) => {
          const isMainProduct = item?.product !== item?.name;
          return {
            product_id: {
              t: "string",
              v: String(item?.extra_id || item?.id || ""),
            },
            product_name: { t: "string", v: item?.product || item?.name || "" },
            product_quantity: { t: "number", v: item?.quantity || 1 },
            product_price: { t: "number", v: parseFloat(item?.price) || 0 },
            ...(isMainProduct && {
              product_variant: { t: "string", v: item?.name || "" },
            }),
          };
        });

        const stored = JSON.parse(
          localStorage.getItem("mayfair_attribution") || "null",
        );

        if (stored) {
          try {
            await patientSource({
              user_id: userData?.id || null,
              order_id: clOrderId,
              first_touch: {
                channel: stored.first_touch?.channel || "Direct",
                source: stored.first_touch?.source || "direct",
                medium: stored.first_touch?.medium || "none",
                paid_status: stored.first_touch?.paid_status || "unknown",
              },
              last_touch: {
                channel: stored.last_touch?.channel || "Direct",
                source: stored.last_touch?.source || "direct",
                medium: stored.last_touch?.medium || "none",
                paid_status: stored.last_touch?.paid_status || "unknown",
              },
            });

            localStorage.removeItem("mayfair_attribution");
            localStorage.removeItem("utm_source");
            localStorage.removeItem("utm_medium");
            localStorage.removeItem("utm_campaign");

            console.log("✅ Mayfair attribution sent");
          } catch (attributionError) {
            console.error("Attribution API failed:", attributionError);
          }
        }

        trackCustomerLabsPurchased({
          formName: "Thank You - Order Placed",
          formId: "mayfair_thankyou_order",
          dedupeKey: clOrderId
            ? `customerlabs_purchased_thankyou_${clOrderId}`
            : null,
          identity: {
            firstName: patientData?.firstName || userData?.fname || "",
            lastName: patientData?.lastName || userData?.lname || "",
            email: consultationCheckout?.email || userData?.email || "",
            phone: patientData?.phoneNo || userData?.phone || "",
            userId: res?.data?.userid || userData?.id || "",
          },

          properties: {
            event_source: "thank_you_page",
            currency: "GBP",
            value: clCheckout?.total || 0,
            transaction_id: String(clOrderId || ""),
            order_id: String(clOrderId || ""),
            product_name: productName,
            treatment_name: productName,
            dose: `${doseName} x${doseQuantity}`,
            addons: addonsString,
          },
          productProperties,
        });
      } catch (error) {
        toast.error(
          error?.response?.data?.errors?.Order || "An error occurred",
        );
        router.replace("/dashboard");
        console.error("Failed to fetch user order:", error);
      }
    };

    fetchUserOrder();
  }, [token]);

  const handleGoBack = () => {
    // if ( !imageUploaded) {

    //   GO.push("/photo-upload");

    // } else {

    GO.push("/dashboard");
    // }
  };

  const handleGoUpload = () => {
    GO.push("/photo-upload");
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-[#47317c]/10 bg-white shadow-[0_18px_55px_rgba(71,49,124,0.10)] transition-all duration-300">
        <div className="mb-0 border-b border-[#47317c]/[0.08] bg-[#f5f2fc] px-6 py-8 text-center sm:px-10">
          <HiBadgeCheck className="mx-auto mb-4 h-14 w-14 fill-[#47317c] text-white" />
          <h2 className="inter-bold-font mb-2 text-[24px] tracking-[-0.02em] text-slate-900 sm:text-[30px]">
            {" "}
            Order Placed Successfully
          </h2>
          <span className="inter-semibold-font text-[15px] text-[#47317c] sm:text-[16px]">
            {" "}
            Order #{orderId}
          </span>
        </div>

        <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
          <div>
            {/* <h3 className="text-2xl reg-font text-gray-800 border-b border-gray-200 pb-2 mb-4 text-center">Order Summary</h3> */}
            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
              <table className="inter-reg-font min-w-full divide-y divide-slate-100 text-sm text-slate-700">
                <thead className="inter-semibold-font bg-[#47317c]/[0.05] text-slate-700">
                  <tr>
                    <th className="inter-semibold-font px-6 py-4 text-left">Items</th>
                    <th className="inter-semibold-font px-6 py-4 text-right">Quantity</th>
                    <th className="inter-semibold-font px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items?.map((item, index) => (
                    <tr key={`addon-${index}`} className="transition-colors hover:bg-[#47317c]/[0.02]">
                      <td className="inter-medium-font px-6 py-3 text-slate-900">
                        {item?.label || item?.product || "Add-on"}
                      </td>
                      <td className="inter-reg-font px-6 py-3 text-center">
                        {item?.quantity}
                      </td>
                      <td className="inter-reg-font px-6 py-3 text-right">
                        £
                        {(
                          parseFloat(item?.price) * (item?.quantity || 1)
                        ).toFixed(2)}
                        <span className="text-gray-500 text-sm ml-1">
                          {/* (£{parseFloat(item?.price).toFixed(2)} each) */}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* {items.addons.length > 0 &&
                    items.addons.map((item, index) => (
                      <tr key={`addon-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-3 reg-font">
                          {item?.product || item?.name || "Add-on"}
                        </td>
                        <td className="px-6 py-3 text-center reg-font">
                          {item?.qty}
                        </td>
                        <td className="px-6 py-3 text-right reg-font">
                          £
                          {(
                            parseFloat(item?.price) * (item?.qty || 1)
                          ).toFixed(2)}
                          <span className="text-gray-500 text-sm ml-1">
                          </span>
                        </td>
                      </tr>
                    ))} */}

                  {checkOut?.discount?.discount !== null && (
                    <tr className="hover:bg-gray-50">
                      <td className="inter-reg-font px-6 py-3 text-slate-900">
                        Discount
                        {checkOut?.discount?.type === "Percent"
                          ? ` (${parseInt(checkOut?.discount?.discount)}%)`
                          : checkOut?.discount?.type &&
                          ` (${checkOut?.discount?.type})`}
                        {checkOut?.discount?.code &&
                          ` - Code: ${checkOut?.discount?.code}`}
                      </td>
                      <td></td>
                      <td className="inter-medium-font px-6 py-3 text-right text-[#47317c]">
                        {checkOut?.discount?.type === "Percent"
                          ? `-£${parseFloat(checkOut?.discount?.discount_value || 0).toFixed(2)}`
                          : `-£${parseFloat(checkOut?.discount?.discount).toFixed(2)}`}
                      </td>
                    </tr>
                  )}

                  {/* {checkOut?.discount?.discount !== null && (
                    <tr className="hover:bg-gray-50">
                      <td className="inter-reg-font px-6 py-3 text-slate-900">
                        Discount
                        {checkOut?.discount?.type &&
                          ` (${checkOut?.discount?.type})`}
                        {checkOut?.discount?.code &&
                          ` - Code: ${checkOut?.discount?.code}`}
                      </td>
                      <td></td>
                      <td className="px-6 py-3 text-right reg-font text-primary">
                        {checkOut?.discount?.type == "Percent"
                          ? `${parseFloat(checkOut?.discount?.discount).toFixed(
                              2,
                            )}%`
                          : `-£${parseFloat(
                              checkOut?.discount?.discount,
                            ).toFixed(2)}`}
                      </td>
                    </tr>
                  )} */}

                  {/* {checkOut?.discount?.discount_value &&
                    checkOut?.discount?.type === "Percent" && (
                      <tr>
                        <td className="px-6 py-3 reg-font text-black">
                          Discounted Amount
                        </td>
                        <td></td>
                        <td className="px-6 py-3 text-right reg-font">
                          -£
                          {parseFloat(
                            checkOut?.discount?.discount_value,
                          ).toFixed(2)}
                        </td>
                      </tr>
                    )} */}

                  {checkOut?.shipment && (
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-3 reg-font text-black">
                        Shipping{" "}
                        <span className="text-black mx-2">
                          ({checkOut?.shipment?.name})
                        </span>
                      </td>
                      <td></td>
                      <td className="inter-reg-font px-6 py-3 text-right">
                        £{parseFloat(checkOut?.shipment?.price).toFixed(2)}
                      </td>
                    </tr>
                  )}

                  <tr className="bg-[#47317c]/[0.055] font-bold text-slate-900">
                    <td colSpan={2} className="inter-semibold-font px-6 py-3 text-right">
                      Total
                    </td>
                    <td className="inter-semibold-font px-6 py-3 text-right text-[#47317c]">
                      £{parseFloat(checkOut?.total).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {!imageUploaded && (
            <>
              <blockquote
                className={`rounded-xl border border-[#47317c]/10 bg-[#47317c]/[0.035] p-5 ${imageUploaded ? "my-6" : ""}`}
              >
                <h2 className="inter-semibold-font mb-2 text-[15px] text-slate-900">
                  Photo Upload Request:
                </h2>{" "}
                <p className="inter-reg-font text-[13px] leading-relaxed text-slate-600">
                  {" "}
                  To complete your order, please upload a clear, recent
                  full-body photo as part of our prescription approval process.
                  This helps our prescribers verify your BMI and ensure the safe
                  and appropriate supply of your treatment.
                </p>
                <p className="inter-reg-font my-3 text-[13px] leading-relaxed text-slate-600">
                  {" "}
                  Please upload a clear, recent full-body photograph. This
                  is one of the methods we use to verify your BMI and ensure
                  that your treatment remains safe and appropriate for you.
                </p>
                <p className="inter-reg-font my-3 text-[13px] leading-relaxed text-slate-600">
                  {" "}
                  Once your photo has been reviewed and approved by our
                  clinical team, your order will be processed and dispensed
                  by our pharmacy.
                </p>
                <p className="thin-font text-gray-700 my-3 ">
                  {" "}
                  Your privacy is important to us, therefore all photos are
                  stored securely, encrypted, and handled in strict
                  confidence in accordance with applicable data protection
                  regulations.
                </p>

              </blockquote>

              <div className="my-6 flex justify-center ">
                <button
                  className="inter-semibold-font flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-[13px] leading-relaxed text-amber-900 transition-colors hover:bg-amber-100"
                  onClick={handleGoUpload}
                >
                  <RiErrorWarningLine
                    className="shrink-0 text-amber-700"
                    size={20}
                  />
                  Click here to upload your full-body image to complete your
                  order
                </button>
              </div>
            </>
          )}

          <div className="inter-reg-font space-y-4 text-left text-[13px] leading-relaxed text-slate-600">
            {/* <p>
              We have received your medical consultation form which is now being
              reviewed by our prescribers. You may be contacted by a member of
              our medical team for more information prior to your medication
              being dispensed. Details of your order have been emailed to you
              and is also available to view on the "my orders" section of your
              account.
            </p> */}
            <p>
              <span className="inter-semibold-font text-slate-900">Delivery:</span>{" "}
              All orders, once approved, are shipped via next-day tracked
              delivery using either DPD or Royal Mail. Orders may take longer
              than one working day to approve due to the clinical checks
              required. If you would like your order delivered on a specific
              date, please contact us before it is dispatched so we can send it
              accordingly.
            </p>
            <p>
              <span className="inter-semibold-font text-slate-900">
                Changes or cancellation:
              </span>{" "}
              If there are any changes you would like to make to your order or
              to cancel it, please contact us immediately by email on{" "}
              <a
                href="mailto:contact@mayfairweightlossclinic.co.uk."
                className="inter-medium-font text-[#47317c] underline underline-offset-2"
              >
                contact@mayfairweightlossclinic.co.uk.
              </a>{" "}
              Please note that once your medication has been dispensed you will
              not be able to cancel or return your order. This is due to
              legislation around prescription-only medication.
            </p>
          </div>
          {imageUploaded && (
            <>
              <div className="">
                <NextButton
                  className=""
                  onClick={handleGoBack}
                  label="Continue to view order details"
                // disabled={!imageUploaded}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
