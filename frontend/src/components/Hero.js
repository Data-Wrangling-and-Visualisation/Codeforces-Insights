// src/components/Hero.tsx
import React from "react";

const Hero = () => {
  return (
    <section className="relative text-center py-20 px-4 overflow-hidden bg-[#031323] mt-10">
      {/* SVG circles as background */}
      <img
        src="/assets/images/red_ellipse.svg"
        alt="Red Circle"
        className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 opacity-100 z-0"
      />
      <img
        src="../assets/images/yellow_ellipse.svg"
        alt="Yellow Circle"
        className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-100 z-0"
      />
      <img
        src="../assets/images/blue_ellipse.svg"
        alt="Blue Circle"
        className="absolute top-1/3 left-2/3 transform -translate-x-1/2 -translate-y-1/2 opacity-100 z-0"
      />

      {/* Обертка для текста с дополнительным отступом */}
      <div className="relative z-10 mt-10"> {/* Добавлен mt-20 для отступа сверху */}
        <h2 className="text-4xl font-bold text-white">
          Level Up Your Competitive Programming
        </h2>
        <h2 className="text-4xl font-bold text-white">
          with Codeforces Insights!
        </h2>

        <p className="text-customYellow mt-4 text-lg">
          Discover hidden patterns and analyze trends of competitive programming like never before!
        </p>
      </div>
    </section>
  );
};

export default Hero;