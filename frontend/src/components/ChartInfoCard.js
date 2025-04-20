import React, { useState, useEffect } from "react";

const chartDescriptions = {
  solutions_rating: {
    title: "Solutions Rating",
    description:
      'The metric shows the average rating of tasks that the user has solved.',
  },
  solutions_amount: {
    title: "Solutions Amount",
    description:
      'The amount of user tasks solved is the number of tasks that received the "accepted" verdict on codeforce.',
  },
  experience: {
    title: "Experience",
    description:
      "Experience shows how many years have passed since the user registered on the site.",
  },
  solutions_solvability: {
    title: "Tasks Solvability",
    description:
      'The solvability of tasks is intended to show the complexity of tasks solved by the user, namely how many users who tried to solve the task received the "accepted" verdict on the site.',
  },
};

const chartTypes = [
  "solutions_rating",
  "solutions_amount",
  "experience",
  "solutions_solvability",
];

const ChartInfoCard = ({ chartType, setChartType }) => {
  const [correlation, setCorrelation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCorrelationData = async (type) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://127.0.0.1:8000/api/users_rating_distribution_by_${type}`
      );
      const data = await response.json();

      if (type === "experience") {
        setCorrelation(data.rating_experience_correlation);
      } else if (type === "solutions_amount") {
        setCorrelation(data.rating_solutions_count_correlation);
      } else if (type === "solutions_rating") {
        setCorrelation(data.rating_correlation);
      } else if (type === "solutions_solvability") {
        setCorrelation(data.rating_solvability_correlation);
      }
    } catch (error) {
      console.error("Ошибка при получении данных:", error);
      setCorrelation(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorrelationData(chartType);
  }, [chartType]);

  const index = chartTypes.indexOf(chartType);
  const rank = index + 1;
  const isMost = rank === 1;
  const isLeast = rank === chartTypes.length;

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/30 text-white rounded-2xl shadow-xl p-6 transition duration-300 hover:shadow-2xl">
      <h2 className="text-2xl font-bold mb-3 flex items-center">
        <span className="text-yellow-400 mr-2">{rank}.</span>
        <span>{chartDescriptions[chartType].title}</span>
        {(isMost || isLeast) && (
          <span className="ml-auto text-yellow-300 text-sm font-normal text-white/90">
            {isMost ? "(Has the most influence)" : "(Has the least influence)"}
          </span>
        )}
      </h2>




      <p className="mt-2">
        <span className="font-medium">Correlation:</span>{" "}
        {loading
          ? "Loading..."
          : typeof correlation === "number"
          ? correlation.toFixed(3)
          : "Not available"}
      </p>
      <p className="mb-5 text-white/90">
        {chartDescriptions[chartType].description}
      </p>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() =>
            setChartType(
              chartTypes[
                (chartTypes.indexOf(chartType) - 1 + chartTypes.length) %
                  chartTypes.length
              ]
            )
          }
          className="bg-white text-black font-bold py-2 px-3 rounded-full hover:bg-yellow-300 transition"
        >
          ←
        </button>
        <button
          onClick={() =>
            setChartType(
              chartTypes[(chartTypes.indexOf(chartType) + 1) % chartTypes.length]
            )
          }
          className="bg-white text-black font-bold py-2 px-3 rounded-full hover:bg-yellow-300 transition"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default ChartInfoCard;
