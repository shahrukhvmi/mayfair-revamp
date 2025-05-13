import DashBoardLayout from "@/Components/Dashboard/DashboardLayout/DashBoardLayout";
import MyProfile from "@/Components/Dashboard/MyProfile/MyProfile";
import ProtectedPage from "@/Components/ProtectedPage/ProtectedPage";
import React from "react";

const profile = () => {
  return (
    <ProtectedPage>
      <DashBoardLayout>
        <MyProfile />
      </DashBoardLayout>
    </ProtectedPage>
  );
};

export default profile;
