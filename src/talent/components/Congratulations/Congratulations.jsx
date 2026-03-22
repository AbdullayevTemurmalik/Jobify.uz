import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CongratulationBg from "../../assets/Congratulations-img.png";

const Congratulations = () => {
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("user-settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.darkMode;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div
      className={`min-h-screen w-full p-4 flex flex-col items-center gap-5 font-sans transition-colors duration-500 ${
        isDark ? "bg-[#121212] text-white" : "bg-[#f0f2f5] text-gray-800"
      }`}
    >
      <div
        className={`w-full max-w-4xl rounded-[20px] py-4 px-8 shadow-sm border transition-colors duration-500 ${
          isDark
            ? "bg-[#1E1E1E] border-gray-800"
            : "bg-white border-transparent"
        }`}
      >
        <h1
          className={`text-lg md:text-xl font-semibold tracking-tight ${
            isDark ? "text-gray-200" : "text-[#4b5563]"
          }`}
        >
          Job Matches
        </h1>
      </div>

      <div
        className={`w-full max-w-4xl rounded-[30px] shadow-sm overflow-hidden relative h-[600px] md:h-[750px] border transition-colors duration-500 ${
          isDark
            ? "bg-[#1E1E1E] border-gray-800"
            : "bg-white border-transparent"
        }`}
      >
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${CongratulationBg})` }}
        >
          <div
            className={`absolute inset-0 transition-colors duration-500 ${
              isDark ? "bg-black/40" : "bg-black/10"
            }`}
          ></div>

          <div className="relative flex flex-col items-center pt-16 md:pt-20 px-4 text-center z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg tracking-wide">
              Congratulations !
            </h2>

            <p className="text-white text-base md:text-lg opacity-95 font-medium leading-relaxed drop-shadow-md">
              You have submitted a successful application.
              <br className="hidden md:block" />
              Keep up the good work!
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 w-full flex justify-center z-20">
          <button
            onClick={() => navigate("/talent/matches")}
            className={`
              font-semibold rounded-full 
              px-6 py-1.5 md:px-8 md:py-2 
              text-xs md:text-sm
              transition-all duration-300 ease-in-out shadow-sm border-[1.5px]
              ${
                isDark
                  ? "bg-[#2A2A2A] border-gray-600 text-gray-200 hover:bg-[#333333] hover:text-white"
                  : "bg-white border-[#6b7280] text-[#4b5563] hover:bg-[#f9fafb] hover:text-black"
              }
            `}
          >
            Back to Job matches
          </button>
        </div>
      </div>
    </div>
  );
};

export default Congratulations;
