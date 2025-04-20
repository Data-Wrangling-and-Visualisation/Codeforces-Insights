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
      <div className="w-full flex justify-end mt-6">
        <Link
          to="/tasks"
          className="text-white text-lg font-semibold hover:text-yellow-300 transition"
        >
          Go to next step →
        </Link>
      </div>
    </div>
  );
};

export default TopicRelationships;
