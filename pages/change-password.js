import DashBoardLayout from "@/Components/Dashboard/DashboardLayout/DashBoardLayout";
import ProtectedPage from "@/Components/ProtectedPage/ProtectedPage";
import React from "react";

const changePassword = () => {
  return (
    <ProtectedPage>
      <DashBoardLayout>
        <h1>Change Password</h1>
      </DashBoardLayout>
    </ProtectedPage>
  );
};

export default changePassword;
