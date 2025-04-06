// src/components/Header.js
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-darkBlue px-16 border-b-[1px] border-customYellow">
      <div className="flex items-center space-x-4">
        <Link to="/" className="flex items-center space-x-4">
          <img src="/assets/icons/logo.svg" alt="Логотип" className="w-10 h-auto" />
          <h1 className="text-xl font-bold text-customYellow text-center">Codeforces Insights</h1>
        </Link>
      </div>

      <nav className="ml-auto">
        <ul className="flex space-x-32">
          <li className="flex justify-center items-center w-full"><Link to="/user-rating" className="hover:text-customYellow text-xs text-center">USER RATING</Link></li>
          <li className="flex justify-center items-center w-full"><Link to="/topic-relationships" className="hover:text-customYellow text-xs text-center">TOPIC RELATIONSHIPS</Link></li>
          <li className="flex justify-center items-center w-full"><Link to="/tasks" className="hover:text-customYellow text-xs text-center">TASKS</Link></li>
          <li className="flex justify-center items-center w-full"><Link to="/blogs" className="hover:text-customYellow text-xs text-center">BLOGS</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
