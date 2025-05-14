import DashBoardLayout from "@/Components/Dashboard/DashboardLayout/DashBoardLayout";
import MyOrders from "@/Components/Dashboard/MyOrders/MyOrders";
import ProtectedPage from "@/Components/ProtectedPage/ProtectedPage";
import React from "react";

const orders = () => {
  return (
    <ProtectedPage>
      <DashBoardLayout>
        <MyOrders/>
      </DashBoardLayout>
    </ProtectedPage>
  );
};

export default orders;
