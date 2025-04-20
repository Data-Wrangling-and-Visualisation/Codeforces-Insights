// src/pages/UserRating.js (или Tasks.js, если ты переименуешь файл)
import React from "react";
import { Link } from "react-router-dom";
import TasksSolvabilityChart from "../components/TasksSolvabilityChart";
import TasksRatingDistributionChart from "../components/TasksRatingDistributionChart";

const Tasks = () => {
  return (
    <div className="p-8 flex flex-col min-h-screen justify-between">
      {/* График */}
      <div>
        <TasksSolvabilityChart />
      </div>

        <TasksRatingDistributionChart/>
        {/* Ссылка внизу справа */}
      <div className="w-full flex justify-end mt-6">
        <Link
          to="/blogs" // замени на нужный путь
          className="text-white text-lg font-semibold hover:text-yellow-300 transition"
        >
          Go to next step →
        </Link>
      </div>
    </div>
  );
};

export default Tasks;
