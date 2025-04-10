// src/pages/UserRating.js
import React, { useEffect, useRef, useState } from "react";
import UserRatingChart from "../components/UserRatingChart";

const UserRating = () => {  
  return (
    <div className="p-8">
      {/* <h1 className="text-3xl font-bold mb-4">User Rating Page</h1>
      <p className="mb-6">Добро пожаловать на страницу рейтингов пользователей.</p> */}
      <UserRatingChart />
    </div>
  );
};

export default UserRating;
