import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, TableHead } from "@mui/material";
import moment from "moment";
import getOrderByIdApi from "@/api/getOrderByIdApi";
import { motion } from "framer-motion";
import StepsHeader from "@/layout/stepsHeader";
import SwitchTabs from "@/Components/Tabs/SwitchTabs"; // Ensure correct path
import Link from "next/link";
import useOrderId from "@/store/useOrderIdStore";

const OrderDetail = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // State for active tab
  const { orderId } = useOrderId();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };
  useEffect(() => {
    if (orderId) {
      setLoading(true);
      getOrderByIdApi(orderId)
        .then((res) => {
          setOrder(res?.data);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    }
  }, [orderId]);

  // Destructure data properly
  const shippingData = order?.data?.order?.shipping;
  const bmiData = order?.data?.order?.consultation?.fields?.bmi;
  const medicalInfo = order?.data?.order?.consultation?.fields?.medicalInfo;
  const BillingData = order?.data?.order?.billing;
  const patientData = order?.data?.order?.consultation?.fields?.patientInfo;
  const gpDetails = order?.data?.order?.consultation?.fields?.gpdetails;
  const date = order?.data?.order?.created_at;
  const time = order?.data?.order?.created_at_time;
  const products = order?.data?.order?.items;
  const shipmentFee = order?.data?.order?.shippment_weight;
  const total = order?.data?.order?.total_price;
  const orders = order?.data?.order?.consultation?.fields?.checkout?.discount;


  // Tab Transition Animation Variants
  const tabContentVariants = {
    initial: { opacity: 0, y: 20 }, // Start below and hidden
    animate: { opacity: 1, y: 0 },   // Animate to visible position
    exit: { opacity: 0, y: 20 },     // Fade out and move below
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <StepsHeader isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className="p-3 sm:p-6 sm:bg-[#F9FAFB] sm:min-h-screen sm:rounded-md sm:shadow-md my-5 sm:m-5">
        <div className="relative">
          <p className="h-fit whitespace-nowrap inline-flex items-center px-6 py-2 bg-primary border border-transparent rounded-tr-full rounded-br-full font-semibold text-xs cursor-text text-white uppercase tracking-widest hover:bg-primary focus:bg-primary active:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition ease-in-out duration-150  absolute -left-4 -top-4 lg:relative lg:top-0 lg:left-0">
            {moment(date, "DD-MM-YYYY", true).isValid() ? moment(date, "DD-MM-YYYY").format("DD-MM-YYYY") : "N/A"} {time}
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center my-6">
          <h1 className="text-2xl bold-font text-[#1C1C29] my-4 sm:mb-4 md:mb-0">
            Details of Order # <span className="niba-bold-font">{order?.data?.order?.id}</span>
          </h1>

          {/* Buttons for Order Details */}
          <div className="flex-wrap justify-between md:space-x-2 space-y-2 md:space-y-0 hidden sm:flex">
            <button className="reg-font px-5 py-3 bg-primary text-white rounded-full hover:bg-[#3a4e91] transition duration-300 ease-in-out w-full md:w-auto">
              <span className="mx-1 my-1">Order Status</span>
              <span className="reg-font bg-violet-900 text-xs rounded-lg p-1">{order?.data?.order?.status}</span>
            </button>

            <button className="reg-font px-5 py-3 bg-primary text-white rounded-full hover:bg-[#3a4e91] transition duration-300 ease-in-out w-full md:w-auto">
              <span className="mx-1 my-1">Payment Status</span>
              <span className="reg-font bg-violet-900 text-xs p-1 rounded-lg">{order?.data?.order?.payments?.status}</span>
            </button>

            <button className="reg-font px-5 py-3 bg-primary text-white rounded-full hover:bg-[#3a4e91] transition duration-300 ease-in-out w-full md:w-auto">
              <span className="mx-1 my-1">Order Total</span>
              <span className="reg-font bg-violet-900 text-xs p-1 rounded-lg">£{order?.data?.order?.total_price}</span>
            </button>
          </div>
          <div className="overflow-x-auto block sm:hidden w-full p-1">
            <h2 className="text-xl semibold-font text-[#1C1C29] mb-4">Order Status</h2>
            <table className="min-w-full bg-white border border-gray-300 rounded-lg">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="px-3 py-4 text-gray-700">Order Status</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1  text-sm rounded-lg font-bold">{order?.data?.order?.status}</span>
                  </td>
                </tr>

                <tr className="border-b border-gray-300">
                  <td className="px-3 py-4 text-gray-700">Payment Status</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-sm rounded-lg font-bold">{order?.data?.order?.payments?.status}</span>
                  </td>
                </tr>

                <tr>
                  <td className="px-3 py-4 text-gray-700">Order Total</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-sm rounded-lg font-bold">£{order?.data?.order?.total_price}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>






        {/* Tabs */}
        <SwitchTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={["Patient Info", "Shipping & Billing", "Products"]}
        />

        {/* Tab Content with Animation */}
        <motion.div
          className="tab-content mt-6"
          variants={tabContentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5 }}  // Adjust transition duration
        >
          {activeTab === 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>First Name</TableCell>
                      <TableCell>{patientData?.firstName || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Last Name</TableCell>
                      <TableCell>{patientData?.lastName || "N/A"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}

          {activeTab === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Shipping & Billing Information</h2>
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Shipping Address</TableCell>
                      <TableCell>{shippingData?.addressone || "N/A"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Billing Address</TableCell>
                      {/* <TableCell>{billingData?.addressone || "N/A"}</TableCell> */}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}

          {activeTab === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Products</h2>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products?.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.label}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>£{(product.price * product.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}
        </motion.div>

        {/* Back Button */}
        <Link href="/orders/">
          <button className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mt-6">Back</button>
        </Link>
      </div>
    </>
  );
};

export default OrderDetail;
