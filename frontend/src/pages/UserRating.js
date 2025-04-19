import React, { useState } from "react";
import UserRatingChart from "../components/UserRatingChart";
import ChartInfoCard from "../components/ChartInfoCard";

const UserRating = () => {
  const [chartType, setChartType] = useState("experience");

  return (
    <div className="p-8 flex flex-col space-y-8">
      {/* График */}
      <div className="flex-1">
        <UserRatingChart chartType={chartType} setChartType={setChartType} />
      </div>

      {/* Карточка снизу */}
      <div className="w-full">
        <ChartInfoCard chartType={chartType} setChartType={setChartType} />
      </div>
    </div>
  );
};

export default UserRating;
