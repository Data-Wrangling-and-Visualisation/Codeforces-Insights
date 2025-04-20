// src/components/BlogInfoCard.js
import React from "react";

const BlogInfoCard = ({ title, description }) => {
  return (
    <div className="flex-1 backdrop-blur-md bg-white/10 border border-white/30 text-white rounded-2xl shadow-xl p-6 transition hover:scale-105 duration-300 hover:shadow-2xl">
      <h3 className="text-2xl font-bold">{title}</h3>
      <hr className="my-4 border-white/20" />
      <p className="text-white/90">{description}</p>
    </div>
  );
};

export default BlogInfoCard;
