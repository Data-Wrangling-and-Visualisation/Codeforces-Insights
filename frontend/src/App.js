// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import UserRating from "./pages/UserRating";
import TopicRelationships from "./pages/TopicRelationships";
import Tasks from "./pages/Tasks";
import Blogs from "./pages/Blogs";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="bg-darkBlue text-white min-h-screen relative overflow-hidden">
        <Header />
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/user-rating" element={<UserRating />} />
          <Route path="/topic-relationships" element={<TopicRelationships />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/blogs" element={<Blogs />} />
        </Routes>
        <div className="absolute top-0 left-4 h-full w-[1px] bg-yellow-400 z-0" />
        <div className="absolute top-0 right-4 h-full w-[1px] bg-yellow-400 z-0" />
      </div>
    </Router>
  );
}

export default App;
