import DashBoardLayout from "@/Components/Dashboard/DashboardLayout/DashBoardLayout";
import MyAddress from "@/Components/Dashboard/MyAddress/MyAddress";
import ProtectedPage from "@/Components/ProtectedPage/ProtectedPage";
import React from "react";

const Address = () => {
  return (
    <ProtectedPage>
      <DashBoardLayout>
        <MyAddress />
      </DashBoardLayout>
    </ProtectedPage>
  );
};

export default Address;
