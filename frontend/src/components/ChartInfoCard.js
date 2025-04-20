import React, { useState, useEffect } from "react";

const chartDescriptions = {
  solutions_rating: {
    title: "Solutions Rating",
    description: "User rating vs the average rating of the problems they've solved.",
  },
  solutions_amount: {
    title: "Solutions Amount",
    description: "How the number of solved problems correlates with user rating.",
  },
  experience: {
    title: "Experience",
    description: "Distribution of user ratings based on years since registration.",
  },
  solutions_solvability: {
    title: "Solutions Solvability",
    description: "Rating distribution by how solvable the problems were.",
  },
};

const chartTypes = ["solutions_rating", "solutions_amount", "experience", "solutions_solvability"];


const ChartInfoCard = ({ chartType, setChartType }) => {
  const [correlation, setCorrelation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Функция для запроса данных
  const fetchCorrelationData = async (type) => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/users_rating_distribution_by_${type}`);
      const data = await response.json();

      // В зависимости от типа графика, получаем соответствующую корреляцию
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
      setCorrelation(null); // Если есть ошибка, устанавливаем значение корреляции в null
    } finally {
      setLoading(false);
    }
  };

  // При изменении типа графика, запрашиваем новые данные
  useEffect(() => {
    fetchCorrelationData(chartType);
  }, [chartType]);

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/30 text-white rounded-2xl shadow-xl p-6 transition duration-300 hover:shadow-2xl">
      <h2 className="text-2xl font-bold mb-3">{chartDescriptions[chartType].title}</h2>

      <p className="mt-2">
        <span className="font-medium">Correlation:</span>{" "}
        {loading
          ? "Loading..."
          : typeof correlation === "number"
          ? correlation.toFixed(3)
          : "Not available"}
      </p>
      <p className="mb-5 text-white/90">{chartDescriptions[chartType].description}</p>

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setChartType(chartTypes[(chartTypes.indexOf(chartType) - 1 + chartTypes.length) % chartTypes.length])}
          className="bg-white text-black font-bold py-2 px-3 rounded-full hover:bg-yellow-300 transition"
        >
          ←
        </button>
        <button
          onClick={() => setChartType(chartTypes[(chartTypes.indexOf(chartType) + 1) % chartTypes.length])}
          className="bg-white text-black font-bold py-2 px-3 rounded-full hover:bg-yellow-300 transition"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default ChartInfoCard;
