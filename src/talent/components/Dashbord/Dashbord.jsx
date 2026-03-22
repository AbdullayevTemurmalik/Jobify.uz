import React from "react";
import Dashboard1 from "../../pages/Dashboard1/Dashboard1";
import Dashboard2 from "../../pages/Dashboard2/Dashboard2";
import Dashboard3 from "../../pages/Dashboard3/Dashboard3";
import { useTheme } from "../../Context/ThemeContext.jsx";

const Dashboard = () => {
  const { settings } = useTheme();
  const isDark = settings.darkMode;

  return (
    <div
      className={`w-full min-h-screen min-w-0 px-3 xs:px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${
        isDark ? "bg-[#121212]" : "bg-[#F8F9FB]"
      }`}
    >
      <h2
        className={`py-3 xs:py-4 px-4 xs:px-6 sm:pl-8 rounded-xl text-xl md:text-2xl font-semibold mb-4 xs:mb-6 border transition-all duration-500 shadow-sm ${
          isDark
            ? "bg-[#1E1E1E] text-gray-200 border-gray-800"
            : "bg-white text-{#505151} border-gray-100"
        }`}
      >
        Dashboard
      </h2>

      <div className="flex flex-col lg:flex-row gap-4 xs:gap-6 w-full">
        <div className="w-full lg:w-auto">
          <Dashboard1 />
        </div>
        <div className="w-full lg:flex-1">
          <Dashboard2 />
        </div>
      </div>

      <div className="w-full mt-4 xs:mt-6 pb-8">
        <Dashboard3 />
      </div>
    </div>
  );
};

export default Dashboard;
