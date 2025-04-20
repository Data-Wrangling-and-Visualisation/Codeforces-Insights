// src/components/Timeline.js
import React from "react";
import StepCard from "./StepCard";

const steps = [
  {
    step: 1,
    text: "Assess your level of preparation and identify gaps in your knowledge.",
    to: "/tasks",
  },
  {
    step: 2,
    text: "Study topics sequentially - starting with general topics and then delving into specific ones.",
    to: "/topic-relationships",
  },
  {
    step: 3,
    text: "Find out what factors influence user ratings on a website.",
    to: "/user-rating",
  },
  {
    step: 4,
    text: "Join the site's community - find out what competitive programmers are discussing.",
    to: "/blogs",
  },
];

const Timeline = () => {
  return (
    <div className="relative max-w-4xl mx-auto mt-24">
      <div className="absolute left-1/2 top-0 h-full w-1 bg-white/30 transform -translate-x-1/2 z-0"></div>

      {steps.map((step, index) => {
        const isLeft = index % 2 === 0;
        return (
          <div
            key={step.step}
            className={`relative flex items-center mb-16 ${
              isLeft ? "justify-start" : "justify-end"
            }`}
          >
            {/* Точка на линии */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-5 h-5 bg-white rounded-full z-10 shadow-md"></div>

            {/* Карточка */}
            <div
              className={`w-1/2 z-10 ${
                isLeft ? "pr-8 text-left" : "pl-8 text-right"
              }`}
            >
              <StepCard step={step.step} text={step.text} to={step.to} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
