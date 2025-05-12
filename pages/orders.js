import DashBoardLayout from "@/Components/Dashboard/DashboardLayout/DashBoardLayout";
import ProtectedPage from "@/Components/ProtectedPage/ProtectedPage";
import React from "react";

const orders = () => {
  return (
    <ProtectedPage>
      <DashBoardLayout>
        <h1>My orders</h1>
      </DashBoardLayout>
    </ProtectedPage>
  );
};

export default orders;
