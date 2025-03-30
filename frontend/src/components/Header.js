// src/components/Header.js
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="flex justify-between items-center p-4 bg-darkBlue px-16 border-b-[1px] border-customYellow relative z-10">
      <div className="flex items-center space-x-4">
        <img src="/assets/icons/logo.svg" alt="Логотип" className="w-10 h-auto" />
        <h1 className="text-xl font-bold text-customYellow">Codeforces Insights</h1>
      </div>

      <nav className="ml-auto">
        <ul className="flex space-x-32">
          <li><Link to="/user-rating" className="hover:text-customYellow">USER RATING</Link></li>
          <li><Link to="/topic-relationships" className="hover:text-customYellow">TOPIC RELATIONSHIPS</Link></li>
          <li><Link to="/tasks" className="hover:text-customYellow">TASKS</Link></li>
          <li><Link to="/blogs" className="hover:text-customYellow">BLOGS</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
