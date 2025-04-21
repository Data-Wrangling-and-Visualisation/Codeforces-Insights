import React from "react";

const InfoCard = ({ title, content, isList = false }) => {
  return (
    <div className="flex-1 backdrop-blur-md bg-white/10 border border-white/30 text-white rounded-2xl shadow-xl p-6 transition hover:scale-105 duration-300 hover:shadow-2xl">
      {title && (
        <>
          <h3 className="text-2xl font-bold text-customYellow">{title}</h3>
          <hr className="my-4 border-white/20" />
        </>
      )}
      
      {isList ? (
        <ul className="space-y-3 list-none mt-4">
          {content.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="w-2 h-2 mt-2 mr-3 rounded-full bg-customYellow flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-white/90 whitespace-pre-line">{content}</p>
      )}
    </div>
  );
};

export default InfoCard;
