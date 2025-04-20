import React from "react";
import { Link } from "react-router-dom";
import TopicRelationshipsChart from "../components/TopicRelationshipsChart";

const TopicRelationships = () => {
  return (
    <div className="p-8 flex flex-col min-h-screen justify-between">
      {/* График */}
      <div>
        <TopicRelationshipsChart />
      </div>

      {/* Ссылка внизу справа */}
      <div className="w-full flex justify-between mt-6">
        <Link
          to="/tasks" // Замени на актуальный маршрут
          className="text-white text-lg font-semibold hover:text-customYellow transition"
        >
          ← Go to previous step
        </Link>

        <Link
          to="/user-rating"
          className="text-white text-lg font-semibold hover:text-customYellow transition"
        >
          Go to next step →
        </Link>
      </div>
    </div>
  );
};

export default TopicRelationships;
