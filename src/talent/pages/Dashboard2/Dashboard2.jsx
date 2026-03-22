import React, { useEffect, useState } from "react";
import { applicationApi } from "../../services/api";
import { useTheme } from "../../Context/ThemeContext.jsx";

const Dashboard2 = () => {
  const { settings } = useTheme();
  const isDark = settings.darkMode;

  const [stats, setStats] = useState({
    weekly: [0, 0, 0, 0, 0, 0, 0],
    monthly: new Array(12).fill(0),
  });
  const [activeTab, setActiveTab] = useState("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const getThisMonday = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const getCurrentYear = () => new Date().getFullYear();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await applicationApi.getAll();

        let applications = [];
        if (response?.data) {
          if (Array.isArray(response.data)) {
            applications = response.data;
          } else if (Array.isArray(response.data.applications)) {
            applications = response.data.applications;
          } else if (Array.isArray(response.data.results)) {
            applications = response.data.results;
          } else if (typeof response.data === "object") {
            applications = Object.values(response.data).flat().filter(Boolean);
          }
        }

        const token = localStorage.getItem("token");
        let myApplications = applications;

        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const userId =
              payload.id ||
              payload.userId ||
              payload.user_id ||
              payload.talentId ||
              payload.talent_id ||
              payload.applicantId ||
              payload.applicant_id ||
              payload.profileId;

            if (userId) {
              myApplications = applications.filter((app) => {
                return (
                  app.talentId === userId ||
                  app.talent_id === userId ||
                  app.applicantId === userId ||
                  app.applicant_id === userId ||
                  app.userId === userId ||
                  app.user_id === userId ||
                  app.profileId === userId
                );
              });
            }
          } catch (e) {
            console.warn("Token parse qilib bo'lmadi", e);
          }
        }

        const monday = getThisMonday();
        const weekEnd = new Date(monday);
        weekEnd.setDate(monday.getDate() + 7);
        const weekData = new Array(7).fill(0);

        const currentYear = getCurrentYear();
        const monthData = new Array(12).fill(0);

        myApplications.forEach((app) => {
          if (!app?.createdAt) return;
          const created = new Date(app.createdAt);

          if (created >= monday && created < weekEnd) {
            const dayIndex = Math.floor(
              (created - monday) / (1000 * 60 * 60 * 24)
            );
            if (dayIndex >= 0 && dayIndex < 7) weekData[dayIndex]++;
          }

          if (created.getFullYear() === currentYear) {
            monthData[created.getMonth()]++;
          }
        });

        if (isMounted) {
          setStats({ weekly: weekData, monthly: monthData });
        }
      } catch (err) {
        console.error("Dashboard ma'lumot xatosi:", err);
        setError("Ma'lumotlarni yuklab bo'lmadi");
        if (isMounted) {
          setStats({
            weekly: [45, 120, 85, 210, 180, 95, 60],
            monthly: [
              120, 150, 180, 200, 220, 240, 260, 280, 250, 230, 210, 190,
            ],
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeStats = activeTab === "week" ? stats.weekly : stats.monthly;
  const labels = activeTab === "week" ? weekDays : monthNames;
  const maxValue = Math.max(...activeStats, 1);

  const getChartHeight = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) return 60;
      if (window.innerWidth < 768) return 70;
      if (window.innerWidth < 1024) return 75;
      return 80;
    }
    return 80;
  };

  const getContainerHeight = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) return "140px";
      if (window.innerWidth < 768) return "150px";
      if (window.innerWidth < 1024) return "155px";
      return "165px";
    }
    return "165px";
  };

  const getBarHeight = (value, maxValue) => {
    const height = (value / maxValue) * getChartHeight();
    return Math.max(height, 2);
  };

  const getLineTop = (i) => {
    const chartH = getChartHeight();
    if (i === 0) return "0px";
    if (i === 1) return `${chartH * 0.625}px`;
    return `${chartH * 1.25}px`;
  };

  const yAxisValues = [0, Math.round(maxValue * 0.5), maxValue];

  const getDisplayDate = () => {
    if (activeTab === "week") {
      const monday = getThisMonday();
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return `${monday.getDate()} ${monday.toLocaleDateString("en-GB", {
        month: "short",
      })} - ${sunday.getDate()} ${sunday.toLocaleDateString("en-GB", {
        month: "short",
      })} ${monday.getFullYear()}`;
    }
    return `January - December ${getCurrentYear()}`;
  };

  return (
    <div className="w-full mx-auto lg:max-w-none lg:w-auto lg:flex-1 pt-0 sm:pt-3 lg:pt-6">
      <div
        className={`rounded-xl shadow-md p-4 sm:p-5 lg:p-6 border ${
          isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-100"
        }`}
      >
        <div className="text-center mb-4 sm:mb-5 lg:mb-6">
          <h2
            className={`text-lg sm:text-xl lg:text-2xl font-bold mb-1 ${
              isDark ? "text-gray-100" : "text-gray-800"
            }`}
          >
            Profile Views
          </h2>

          <div
            className={`inline-flex rounded-full p-0.5 sm:p-1 lg:p-1 mb-2 sm:mb-3 lg:mb-3 ${
              isDark ? "bg-[#252525]" : "bg-gray-100"
            }`}
          >
            <button
              className={`px-3 sm:px-4 lg:px-6 py-1 sm:py-1.5 lg:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-sm whitespace-nowrap transition-all ${
                activeTab === "week"
                  ? isDark
                    ? "bg-[#1E1E1E] text-gray-100"
                    : "bg-white text-gray-800"
                  : isDark
                  ? "text-gray-300 hover:bg-white/10"
                  : "text-gray-600 hover:bg-white/60"
              }`}
              onClick={() => setActiveTab("week")}
            >
              This week
            </button>

            <button
              className={`px-3 sm:px-4 lg:px-6 py-1 sm:py-1.5 lg:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-sm whitespace-nowrap transition-all ${
                activeTab === "month"
                  ? isDark
                    ? "bg-[#1E1E1E] text-gray-100"
                    : "bg-white text-gray-800"
                  : isDark
                  ? "text-gray-300 hover:bg-white/10"
                  : "text-gray-600 hover:bg-white/60"
              }`}
              onClick={() => setActiveTab("month")}
            >
              This year
            </button>
          </div>

          <div
            className={`text-xs sm:text-sm ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {getDisplayDate()}
          </div>
        </div>

        <div className="relative">
          {loading ? (
            <div
              className={`flex items-center justify-center gap-2 sm:gap-3 ${
                isDark ? "text-gray-300" : "text-gray-500"
              }`}
              style={{ height: getContainerHeight() }}
            >
              <div className="animate-spin h-5 w-5 sm:h-6 sm:w-6 border-3 sm:border-4 border-blue-500 border-t-transparent rounded-full" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : error ? (
            <div
              className="flex items-center justify-center text-red-500"
              style={{ height: getContainerHeight() }}
            >
              {error}
            </div>
          ) : (
            <div style={{ height: getContainerHeight() }} className="flex">
              <div
                className={`w-8 sm:w-10 lg:w-12 flex flex-col justify-between text-[10px] sm:text-xs pr-1 sm:pr-2 text-right pb-2 ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {yAxisValues
                  .slice()
                  .reverse()
                  .map((val, i) => {
                    const chartH = getChartHeight();
                    const itemHeight = chartH + chartH * 0.5625;
                    return (
                      <div
                        key={i}
                        className="flex items-end justify-end"
                        style={{ height: `${itemHeight / 2.5}px` }}
                      >
                        {val}
                      </div>
                    );
                  })}
              </div>

              <div className="flex-1 relative">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2].map((_, i) => (
                    <div
                      key={i}
                      className={`border-t w-full ${
                        isDark ? "border-gray-800" : "border-gray-100"
                      }`}
                      style={{
                        position: "absolute",
                        top: getLineTop(i),
                        width: "100%",
                      }}
                    />
                  ))}
                </div>

                <div
                  className={`absolute inset-0 flex items-end justify-between px-1 sm:px-1.5 lg:px-2 pb-2 ${
                    activeTab === "month" ? "gap-0.5 sm:gap-1 lg:gap-1.5" : ""
                  }`}
                >
                  {labels.map((label, i) => {
                    const value = activeStats[i];
                    const height = getBarHeight(value, maxValue);

                    return (
                      <div
                        key={`${label}-${i}`}
                        className="flex flex-col items-center group"
                        style={{
                          width: `calc(100% / ${labels.length} - ${
                            activeTab === "month" ? "4px" : "2px"
                          })`,
                        }}
                      >
                        <div className="relative w-full">
                          <div
                            className={`w-full rounded-t-lg sm:rounded-t-xl transition-all duration-300 ${
                              value > 0
                                ? "bg-gradient-to-t from-indigo-600 to-purple-500 hover:brightness-110"
                                : isDark
                                ? "bg-[#252525]"
                                : "bg-gray-100"
                            }`}
                            style={{ height: `${height}px`, minHeight: "2px" }}
                          />

                          <div className="absolute -top-6 sm:-top-7 lg:-top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                            <div className="bg-gray-900 text-white text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                              {value} view{value !== 1 ? "s" : ""}
                            </div>
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 bg-gray-900 rotate-45 mx-auto -mt-1 sm:-mt-1.5" />
                          </div>
                        </div>

                        <div
                          className={`mt-1 sm:mt-1.5 lg:mt-2 font-medium ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          } ${
                            activeTab === "month"
                              ? "text-[10px] sm:text-xs rotate-45 origin-left"
                              : "text-xs sm:text-sm"
                          }`}
                        >
                          {label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard2;
