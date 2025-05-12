import DashBoardLayout from "@/Components/Dashboard/DashboardLayout/DashBoardLayout";
import ProtectedPage from "@/Components/ProtectedPage/ProtectedPage";
import React from "react";

const profile = () => {
  return (
    <ProtectedPage>
      <DashBoardLayout>
        <h1>My Profile</h1>
      </DashBoardLayout>
    </ProtectedPage>
  );
};

export default profile;
