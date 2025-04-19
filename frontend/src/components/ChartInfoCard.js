import React from "react";

const chartDescriptions = {
  experience: {
    title: "Experience",
    description: "Distribution of user ratings based on years since registration.",
  },
  solutions_amount: {
    title: "Solutions Amount",
    description: "How the number of solved problems correlates with user rating.",
  },
  solutions_rating: {
    title: "Solutions Rating",
    description: "User rating vs the average rating of the problems they've solved.",
  },
  solutions_solvability: {
    title: "Solutions Solvability",
    description: "Rating distribution by how solvable the problems were.",
  },
};

const chartTypes = ["experience", "solutions_amount", "solutions_rating", "solutions_solvability"];

const ChartInfoCard = ({ chartType, setChartType }) => {
  const currentIndex = chartTypes.indexOf(chartType);

  const goToPrevious = () => {
    const prevIndex = (currentIndex - 1 + chartTypes.length) % chartTypes.length;
    setChartType(chartTypes[prevIndex]);
  };

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % chartTypes.length;
    setChartType(chartTypes[nextIndex]);
  };

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/30 text-white rounded-2xl shadow-xl p-6 transition duration-300 hover:shadow-2xl">
      <h2 className="text-2xl font-bold mb-3">{chartDescriptions[chartType].title}</h2>
      <p className="mb-5 text-white/90">{chartDescriptions[chartType].description}</p>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={goToPrevious}
          className="bg-white text-black font-bold py-2 px-3 rounded-full hover:bg-yellow-300 transition"
        >
          ←
        </button>
        <button
          onClick={goToNext}
          className="bg-white text-black font-bold py-2 px-3 rounded-full hover:bg-yellow-300 transition"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default ChartInfoCard;
