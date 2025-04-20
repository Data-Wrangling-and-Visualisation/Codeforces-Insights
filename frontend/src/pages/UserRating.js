import React, { useState } from "react";
import { Link } from "react-router-dom";
import UserRatingChart from "../components/UserRatingChart";
import ChartInfoCard from "../components/ChartInfoCard";

const UserRating = () => {
  const [chartType, setChartType] = useState("solutions_rating");

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

      <div className="w-full flex justify-end mt-6">
        <Link
          to="/topic-relationships"
          className="text-white text-lg font-semibold hover:text-yellow-300 transition"
        >
          Go to next step →
        </Link>
      </div>
    </div>
  );
};

export default UserRating;
