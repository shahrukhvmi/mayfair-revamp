import DashBoardLayout from "@/Components/Dashboard/DashboardLayout/DashBoardLayout";
import MyProfile from "@/Components/Dashboard/MyProfile/MyProfile";
import ProtectedPage from "@/Components/ProtectedPage/ProtectedPage";
import { meta_url } from "@/config/constants";
import MetaLayout from "@/Meta/MetaLayout";
import React from "react";

const profile = () => {
  return (
    <>
      <MetaLayout canonical={`${meta_url}`} />
      <ProtectedPage>
        <DashBoardLayout>
          <MyProfile />
        </DashBoardLayout>
      </ProtectedPage>
    </>
  );
};

export default profile;
