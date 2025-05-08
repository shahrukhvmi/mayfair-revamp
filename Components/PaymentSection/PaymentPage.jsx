import React, { useEffect, useState } from "react";
// import { setPaymentLoading } from "../../store/slice/paymentLoaderSlice"; // adjust path as needed
const PaymentPage = ({ paymentData }) => {
  const [countdown, setCountdown] = useState(3);


  //   useEffect(() => {

  //     const updateCountdown = () => {
  //         console.log(paymentData,"paymentData")
  //       setCountdown((prevCountdown) => {
  //         if (prevCountdown <= 1) {
  //             console.log(paymentData);

  //            document.getElementById('process-payment-form').submit();
  //           return 0;
  //         }
  //         return prevCountdown - 1;
  //       });
  //     };

  //     const timer = setInterval(updateCountdown, 1000);

  //     return () => clearInterval(timer);
  //   }, []);

  // useEffect(() => {
  //     console.log(paymentData); // Log paymentData to see if it's available
  //     if (!paymentData?.actionurl) {
  //         console.error("Payment action URL is missing");
  //         return;
  //     }

  //     const updateCountdown = () => {
  //         setCountdown((prevCountdown) => {
  //             if (prevCountdown <= 1) {
  //                 console.log("Form is being submitted:", paymentData);
  //                 document.getElementById("process-payment-form").submit();
  //                 return 0;
  //             }
  //             return prevCountdown - 1;
  //         });
  //     };

  //     const timer = setTimeout(updateCountdown, 1000);

  //     return () => clearTimeout(timer);
  // }, [paymentData]);

  useEffect(() => {
    if (!paymentData?.actionurl) {
      return;
    }

    // Set loader true when countdown starts
    // dispatch(setPaymentLoading(true));

    const updateCountdown = () => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          localStorage.removeItem("p_id");
          document.getElementById("process-payment-form").submit();
          // Set loader false when countdown ends
          setTimeout(() => {
            // dispatch(setPaymentLoading(false));
          }, 4000); // 4 sec delay
          return 0;
        }
        setTimeout(updateCountdown, 1000); // Recursive call
        return prevCountdown - 1;
      });
    };

    const timer = setTimeout(updateCountdown, 1000);

    return () => clearTimeout(timer);
  }, [paymentData]);

  return (
    <>
      <div className="process-payment-overlay-block"></div>
      <div className="jumbotron text-center thank-you-main">
        <div className="container d-flex justify-content-center">
          <div className="process-payment bg-white p-4 rounded">
            <div>
              <svg className="spinner" viewBox="0 0 50 50">
                <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
              </svg>
            </div>
            <p className="lead text-center">
              <strong>Your payment is being processed!</strong>
            </p>
            <div id="countdown">Redirecting in {countdown}...</div>
            <hr />
            <div className="row justify-content-center">
              <div className="col-6">
                <p className="stay-text lead">Do not leave this page, you will be redirected to payment promptly.</p>
              </div>
            </div>
          </div>
        </div>

        <form style={{ display: "none" }} id="process-payment-form" method="post" action={paymentData.actionurl}>
          <fieldset>
            <legend>IPG Connect Request Details</legend>
            <p>
              <label>Biling Information:</label>
              <input type="hidden" name="bname" value={paymentData.bname} readOnly />
              <input type="hidden" name="baddr1" value={paymentData.baddr1} readOnly />
              <input type="hidden" name="baddr2" value={paymentData.baddr2} readOnly />
              <input type="hidden" name="bcity" value={paymentData.bcity} readOnly />
              <input type="hidden" name="bstate" value={paymentData.bstate} readOnly />
              <input type="hidden" name="bcountry" value={paymentData.bcountry} readOnly />
              <input type="hidden" name="bzip" value={paymentData.bzip} readOnly />
              <input type="hidden" name="phone" value={paymentData.phone} readOnly />
              <input type="hidden" name="email" value={paymentData.email} readOnly />
            </p>
            <p>
              <label htmlFor="oid">Order ID:</label>
              <input type="hidden" name="oid" value={paymentData.oid} readOnly />
            </p>
            <p>
              <label htmlFor="storename">Store ID:</label>
              <input type="hidden" name="storename" value={paymentData.storename} readOnly />
            </p>
            <p>
              <label htmlFor="timezone">Timezone:</label>
              <input type="hidden" name="timezone" value={paymentData.timezone} readOnly />
            </p>
            <p>
              <label htmlFor="txntype">Transaction Type:</label>
              <input type="hidden" name="txntype" value={paymentData.txntype} readOnly />
            </p>
            <p>
              <label htmlFor="currency">Currency (see ISO4217):</label>
              <input type="hidden" name="currency" value={paymentData.currency} readOnly />
            </p>
            <p>
              <label htmlFor="chargetotal">Transaction Charge Total:</label>
              <input type="hidden" name="chargetotal" value={paymentData.chargetotal} readOnly />
            </p>
            <p>
              <label htmlFor="txndatetime">Transaction DateTime:</label>
              <input type="hidden" name="txndatetime" value={paymentData.txndatetime} readOnly />
            </p>
            <p>
              <label htmlFor="checkoutoption">Checkout option:</label>
              <input type="hidden" name="checkoutoption" value={paymentData.checkoutoption} readOnly />
            </p>
            <p>
              <label htmlFor="hash_algorithm">Hash Algorithm:</label>
              <input type="hidden" name="hash_algorithm" value={paymentData.hash_algorithm} readOnly />
            </p>
            <p>
              <label htmlFor="hashExtended">Hash Extended:</label>
              <input type="hidden" name="hashExtended" value={paymentData.HashDigest} readOnly />
            </p>
            <p>
              <label htmlFor="responseSuccessURL">Success URL:</label>
              <input type="hidden" name="responseSuccessURL" value={paymentData.responseSuccessURL} readOnly />
            </p>
            <p>
              <label htmlFor="responseFailURL">Fail URL:</label>
              <input type="hidden" name="responseFailURL" value={paymentData.responseFailURL} readOnly />
            </p>
          </fieldset>
        </form>
      </div>
    </>
  );
};

export default PaymentPage;
