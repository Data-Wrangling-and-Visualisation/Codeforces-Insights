import React from "react";
import { Link } from "react-router-dom";
import BlogsChart from "../components/BlogsChart";
import BlogInfoCard from "../components/BlogInfoCard";

const cardData = [
  {
    title: "Learn about unusual topics",
    description:
      "Users can share rare topics that they have encountered in their path to learning competitive programming. Usually, people also share approaches to solving these problems and resources for studying the topics - expand your horizons with other users!",
  },
  {
    title: "Discuss complex problems",
    description:
      "The friendly community of Codeforces helps beginners and shares advice with everyone in need. Often, you can find both constructive help and mental support in the discussion.",
  },
  {
    title: "Learn about olympiads and bootcamps",
    description:
      "Olympiad organizers often share details of the organization and conditions of participation. Do not miss a single interesting event that can be useful in your path to competitive programming!",
  },
];

const Blogs = () => {
  return (
    <div className="p-8 space-y-6">
      {/* Заголовок страницы */}
      <h1 className="text-4xl font-bold text-white text-center py-20">
        What are competitive programmers discussing now?
      </h1>

      <BlogsChart />

      

      {/* Блок карточек */}
      <div className="mt-20 flex flex-col lg:flex-row gap-8">
        {cardData.map((card, index) => (
          <BlogInfoCard
            key={index}
            title={card.title}
            description={card.description}
          />
        ))}
      </div>

      <div className="w-full flex justify-start mt-6">
        <Link
          to="/user-rating"
          className="text-white text-lg font-semibold hover:text-customYellow transition"
        >
          ← Go to previous step
        </Link>
      </div>
    </div>
    
  );
};

export default Blogs;
