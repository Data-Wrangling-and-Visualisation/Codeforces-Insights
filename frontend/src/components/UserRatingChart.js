import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";

const UserRatingChart = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [chartType, setChartType] = useState("experience");

  const calculateBoxplotDataExperience = (data) => {
    const groupedData = d3.group(data, d => d.time_registration_years);
    return Array.from(groupedData, ([experience, entries]) => {
      const ratings = entries.map(d => d.rating).sort((a, b) => a - b);
      return {
        experience,
        q1: d3.quantile(ratings, 0.25),
        median: d3.quantile(ratings, 0.5),
        q3: d3.quantile(ratings, 0.75),
        min: d3.min(ratings),
        max: d3.max(ratings),
      };
    }).sort((a, b) => a.experience - b.experience);
  };

  const calculateBoxplotDataSolutionsAmount = (data) => {
    const maxRange = 4400; // Максимальный диапазон до объединения
    const rangeSize = 400; // Шаг диапазона
  
    // Группировка данных по диапазонам
    const groupedData = d3.group(data, d => {
      if (d.number_of_solved_problems > maxRange) {
        return '4400+'; // Объединяем все значения больше 4400 в один диапазон
      }
      return Math.floor(d.number_of_solved_problems / rangeSize) * rangeSize; // Группировка по диапазонам с шагом 200
    });
  
    return Array.from(groupedData, ([range, entries]) => {
      const ratings = entries.map(d => d.rating).sort((a, b) => a - b);
      
      // Формируем диапазон вида '0-199', '200-399' и т.д.
      const rangeLabel = range === '4400+' ? '4400+' : `${range}-${range + rangeSize - 1}`;
      
      return {
        solvedProblemsRange: rangeLabel,
        q1: d3.quantile(ratings, 0.25),
        median: d3.quantile(ratings, 0.5),
        q3: d3.quantile(ratings, 0.75),
        min: d3.min(ratings),
        max: d3.max(ratings),
      };
    }).sort((a, b) => {
      if (a.solvedProblemsRange === '4400+') return 1; // Сортируем блок 4400+ в конец
      if (b.solvedProblemsRange === '4400+') return -1;
      return a.solvedProblemsRange - b.solvedProblemsRange; // Сортировка по диапазонам
    });
};

  

  const calculateBoxplotDataSolutionsRating = (data) => {
    const rangeSize = 150; // Размер шага для диапазонов
    const minRating = 800; // Начальный диапазон
  
    // Группировка данных по диапазонам
    const groupedData = d3.group(data, d => {
      const rangeStart = Math.max(Math.floor((d.avg_rating_of_solved_problems - minRating) / rangeSize), 0) * rangeSize + minRating;
      const rangeEnd = rangeStart + rangeSize - 1;
      return `${rangeStart}-${rangeEnd}`;
    });
  
    return Array.from(groupedData, ([range, entries]) => {
      const ratings = entries.map(d => d.rating).sort((a, b) => a - b);
      return {
        ratingRange: range,
        q1: d3.quantile(ratings, 0.25),
        median: d3.quantile(ratings, 0.5),
        q3: d3.quantile(ratings, 0.75),
        min: d3.min(ratings),
        max: d3.max(ratings),
      };
    }).sort((a, b) => {
      const aRange = a.ratingRange.split('-').map(Number);
      const bRange = b.ratingRange.split('-').map(Number);
      return aRange[0] - bRange[0]; // Сортировка по начальной границе диапазона
    });
  };
  

  const calculateBoxplotDataSolutionsSolvability = (data) => {
    const groupedData = d3.group(data, d =>
      Math.floor(d.avg_solvability_of_solved_problems * 50) / 50 // группируем по 0.1
    );
    return Array.from(groupedData, ([range, entries]) => {
      const ratings = entries.map(d => d.rating).sort((a, b) => a - b);
      return {
        solvabilityRange: range,
        q1: d3.quantile(ratings, 0.25),
        median: d3.quantile(ratings, 0.5),
        q3: d3.quantile(ratings, 0.75),
        min: d3.min(ratings),
        max: d3.max(ratings),
      };
    }).sort((a, b) => a.solvabilityRange - b.solvabilityRange);
  };
  

  const fetchData = async (type) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users_rating_distribution_by_${type}`);
      const result = (await response.json()).data;
      if (type === "experience") {
        setData(calculateBoxplotDataExperience(result));
      } else if (type === "solutions_amount") {
        setData(calculateBoxplotDataSolutionsAmount(result));
      } else if (type === "solutions_rating") {
        setData(calculateBoxplotDataSolutionsRating(result));
      } else if (type === "solutions_solvability") {
        setData(calculateBoxplotDataSolutionsSolvability(result));
      }
    } catch (error) {
      console.error("Ошибка при получении данных:", error);
    }
  };

  useEffect(() => {
    fetchData(chartType);
  }, [chartType]);

  useEffect(() => {

    if (data.length === 0) return;

    function getXValue(d) {
      if (chartType === "experience") return d.experience;
      if (chartType === "solutions_amount") return d.solvedProblemsRange;
      if (chartType === "solutions_rating") return d.ratingRange;
      if (chartType === "solutions_solvability") return d.solvabilityRange;
    }

    function getXLabel(type) {
      if (type === "experience") return "Experience (Years)";
      if (type === "solutions_amount") return "Solved Problems (0-200, 201-400, etc.)";
      if (type === "solutions_rating") return "Average Rating of Solved Problems (0-200, etc.)";
      if (type === "solutions_solvability") return "Avg Solvability of Solved Problems (0.0 - 1.0)";
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 30, bottom: 70, left: 70 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const chart = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map((d) => {
        if (chartType === "experience") return d.experience;
        if (chartType === "solutions_amount") return d.solvedProblemsRange;
        if (chartType === "solutions_rating") return d.ratingRange;
        if (chartType === "solutions_solvability") return d.solvabilityRange;
      }))
      .range([0, width])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d.max) || 1])
      .range([height, 0]);

      chart.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", "#F5C638");

      chart.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("fill", "#F5C638");


    // Вертикальные линии (усы)
    chart.selectAll(".boxline")
      .data(data)
      .enter()
      .append("line")
      .attr("x1", d => x(getXValue(d)) + x.bandwidth() / 2)
      .attr("x2", d => x(getXValue(d)) + x.bandwidth() / 2)
      .attr("y1", d => y(d.max))
      .attr("y2", d => y(d.min))
      .attr("stroke", "#F5C638")
      .attr("stroke-width", 2);

    // Прямоугольники boxplot
    chart.selectAll(".box")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(getXValue(d)))
      .attr("y", d => y(d.q3))
      .attr("width", x.bandwidth())
      .attr("height", d => y(d.q1) - y(d.q3))
      .attr("fill", "#127FC2")
      .attr("stroke", "#F5C638")
      .attr("stroke-width", 2);

    // Линии медианы
    chart.selectAll(".median")
      .data(data)
      .enter()
      .append("line")
      .attr("x1", d => x(getXValue(d)))
      .attr("x2", d => x(getXValue(d)) + x.bandwidth())
      .attr("y1", d => y(d.median))
      .attr("y2", d => y(d.median))
      .attr("stroke", "#F5C638")
      .attr("stroke-width", 2);

    // Верхние усы
    chart.selectAll(".whiskerTop")
      .data(data)
      .enter()
      .append("line")
      .attr("x1", d => x(getXValue(d)))
      .attr("x2", d => x(getXValue(d)) + x.bandwidth())
      .attr("y1", d => y(d.max))
      .attr("y2", d => y(d.max))
      .attr("stroke", "#F5C638")
      .attr("stroke-width", 2);

    // Нижние усы
    chart.selectAll(".whiskerBottom")
      .data(data)
      .enter()
      .append("line")
      .attr("x1", d => x(getXValue(d)))
      .attr("x2", d => x(getXValue(d)) + x.bandwidth())
      .attr("y1", d => y(d.min))
      .attr("y2", d => y(d.min))
      .attr("stroke", "#F5C638")
      .attr("stroke-width", 2);

    // Подписи осей
    svg.append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 40)
      .attr("text-anchor", "middle")
      .attr("fill", "#F5C638")
      .style("font-size", "14px")
      .text(getXLabel(chartType));

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2 - margin.top)
      .attr("y", margin.left - 60)
      .attr("text-anchor", "middle")
      .attr("fill", "#F5C638")
      .style("font-size", "14px")
      .text("User Rating");

  }, [data]);

  return (
    <div className="flex w-full">
      <svg ref={svgRef} className="flex-grow"></svg>
      <div className="flex flex-col items-stretch w-1/4 space-y-4 mt-10">
        <button
          onClick={() => setChartType("experience")}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 w-full"
        >
          Experience
        </button>
        <button
          onClick={() => setChartType("solutions_amount")}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 w-full"
        >
          Solutions Amount
        </button>
        <button
          onClick={() => setChartType("solutions_rating")}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 w-full"
        >
          Solutions Rating
        </button>
        <button
          onClick={() => setChartType("solutions_solvability")}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 w-full"
        >
          Solutions Solvability
        </button>
      </div>
    </div>
  );
};

export default UserRatingChart;
