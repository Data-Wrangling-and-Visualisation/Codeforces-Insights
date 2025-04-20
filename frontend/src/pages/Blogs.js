// src/pages/UserRating.js
import React from "react";
import { Link } from "react-router-dom";
import BlogsChart from "../components/BlogsChart";

const Blogs = () => {
  return (
    <div className="p-8 space-y-6">
      <BlogsChart />

      <div className="w-full flex justify-start mt-6">
        <Link
          to="/user-rating" // Замени на актуальный путь к предыдущему шагу
          className="text-white text-lg font-semibold hover:text-yellow-300 transition"
        >
          ← Go to previous step
        </Link>
      </div>
    </div>
  );
};

export default Blogs;
