// src/components/StepCard.js
import React from "react";
import { Link } from "react-router-dom";

const StepCard = ({ step, text, to }) => {
  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/30 text-white rounded-2xl shadow-xl p-6 transition hover:scale-105 duration-300 hover:shadow-2xl">
      <h3 className="text-2xl font-bold mb-3">Step {step}</h3>
      <p className="mb-5 text-white/90">{text}</p>
      <Link
        to={to}
        className="inline-block bg-white text-black font-semibold py-2 px-4 rounded-lg hover:bg-yellow-300 transition"
      >
        Explore More
      </Link>
    </div>
  );
};

export default StepCard;
