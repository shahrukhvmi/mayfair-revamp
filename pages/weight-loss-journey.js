import DashBoardLayout from "@/Components/Dashboard/DashboardLayout/DashBoardLayout";
import WeightLossJourney from "@/Components/Dashboard/WeightLossJourney/WeightLossJourney";
import ProtectedPage from "@/Components/ProtectedPage/ProtectedPage";
import React from "react";

const WeightLoss = () => {
  return (
    <ProtectedPage>
      <DashBoardLayout>
        <WeightLossJourney />
      </DashBoardLayout>
    </ProtectedPage>
  );
};

export default WeightLoss;
