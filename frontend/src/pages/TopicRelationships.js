import React from "react";
import { Link } from "react-router-dom";
import TopicRelationshipsChart from "../components/TopicRelationshipsChart";
import InfoCard from "../components/InfoCard";

const TopicRelationships = () => {
  return (
    <div className="p-8 flex flex-col min-h-screen justify-between">
      <h1 className="text-4xl font-bold text-white text-center py-24">
        In what order should you study the topics?
      </h1>

      {/* График */}
      <div>
        <TopicRelationshipsChart />
      </div>

      {/* Информационные карточки */}
      <div className="flex flex-col md:flex-row gap-4 mt-20">
        <div className="basis-2/5">
          <InfoCard
            content={
            <><strong>The size of the circles</strong> represents the number of tasks on a given topic.<br /><br /><strong>The width of the links</strong> is proportional to how often the topics of the tasks are combined.
            </>
            }
          />
        </div>
        <div className="basis-3/5">
          <InfoCard
            title="Use this in your studies:"
            isList
            content={[
              "Choose a topic that interests you",
              "See what topics it is related to",
              "Make sure you are already familiar with related, more popular topics",
              "Repeat many times",
            ]}
          />
        </div>
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
