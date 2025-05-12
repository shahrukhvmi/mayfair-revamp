import DashBoardLayout from "@/Components/Dashboard/DashboardLayout/DashBoardLayout";
import ProtectedPage from "@/Components/ProtectedPage/ProtectedPage";
import React from "react";

const address = () => {
  return (
    <ProtectedPage>
      <DashBoardLayout>
        <h1>My Address</h1>
      </DashBoardLayout>
    </ProtectedPage>
  );
};

export default address;
