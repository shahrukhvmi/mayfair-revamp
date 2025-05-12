import DashBoardLayout from "@/Components/Dashboard/DashboardLayout/DashBoardLayout";
import MyAccount from "@/Components/Dashboard/MyAccount/MyAccount";
import ProtectedPage from "@/Components/ProtectedPage/ProtectedPage";
import React from "react";

const dashboard = () => {
  return (
    <>
      <ProtectedPage>   
        <DashBoardLayout>
          <MyAccount />
        </DashBoardLayout>
      </ProtectedPage>
    </>
  );
};

export default dashboard;
