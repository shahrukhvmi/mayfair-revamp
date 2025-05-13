import DashBoardLayout from "@/Components/Dashboard/DashboardLayout/DashBoardLayout";
import MyAccount from "@/Components/Dashboard/MyAccount/MyAccount";
import ProtectedPage from "@/Components/ProtectedPage/ProtectedPage";
import React from "react";

const Dashboard = () => {
  return (
    <>
      {/* <ProtectedPage> */}
        <DashBoardLayout>
          <MyAccount />
        </DashBoardLayout>
      {/* </ProtectedPage> */}
    </>
  );
};

export default Dashboard;
