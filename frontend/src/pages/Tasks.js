// src/pages/UserRating.js
import React from "react";
import TasksSolvabilityChart from "../components/TasksSolvabilityChart";
import TasksRatingDistributionChart from "../components/TasksRatingDistributionChart";

const Tasks = () => {
  return (
    <div className="p-8">
        <TasksSolvabilityChart/>
        <TasksRatingDistributionChart/>
    </div>
  );
};

export default Tasks;