import React, { useEffect, useState, useMemo } from "react";
import { applicationApi } from "../../services/api";
import { useTheme } from "../../Context/ThemeContext.jsx";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard3 = () => {
  const { settings } = useTheme();
  const isDark = settings.darkMode;

  const [chartData, setChartData] = useState({ week: [], month: [] });
  const [activeTab, setActiveTab] = useState("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const weekDaysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const monthNamesShort = [
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

  useEffect(() => {
    let isMounted = true;

    const fetchAndProcess = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await applicationApi.getAll();
        let applications = [];

        if (res?.data) {
          if (Array.isArray(res.data)) {
            applications = res.data;
          } else if (Array.isArray(res.data.applications)) {
            applications = res.data.applications;
          } else if (Array.isArray(res.data.results)) {
            applications = res.data.results;
          } else if (res.data.data && Array.isArray(res.data.data)) {
            applications = res.data.data;
          } else if (typeof res.data === "object") {
            applications = Object.values(res.data)
              .flat()
              .filter(Array.isArray)
              .flat();
          }
        }

        const token = localStorage.getItem("token");
        let myApplications = applications;

        if (token && applications.length > 0) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const userId =
              payload.id ||
              payload.userId ||
              payload.user_id ||
              payload.talentId ||
              payload.talent_id ||
              payload.applicantId ||
              payload.applicant_id;

            if (userId) {
              myApplications = applications.filter(
                (app) =>
                  app &&
                  [
                    app.talentId,
                    app.talent_id,
                    app.applicantId,
                    app.applicant_id,
                    app.userId,
                    app.user_id,
                    app.profileId,
                    app.id,
                  ]
                    .map(String)
                    .includes(String(userId))
              );
            }
          } catch (e) {
            console.warn("Token parse xatosi:", e);
          }
        }

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(
          now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
        );
        startOfWeek.setHours(0, 0, 0, 0);

        const weekData = [];
        for (let i = 0; i < 7; i++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);

          const dayStart = new Date(day);
          const dayEnd = new Date(day);
          dayEnd.setHours(23, 59, 59, 999);

          let dayCount = 0;
          if (myApplications.length > 0) {
            dayCount = myApplications.filter((app) => {
              if (!app?.createdAt) return false;
              const appDate = new Date(app.createdAt);
              return appDate >= dayStart && appDate <= dayEnd;
            }).length;
          }

          weekData.push({
            day: weekDaysShort[i],
            views: dayCount,
            fullDate: day.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          });
        }

        const currentYear = now.getFullYear();
        const monthData = [];

        for (let i = 0; i < 12; i++) {
          const monthStart = new Date(currentYear, i, 1);
          const monthEnd = new Date(currentYear, i + 1, 0, 23, 59, 59, 999);

          let monthCount = 0;
          if (myApplications.length > 0) {
            monthCount = myApplications.filter((app) => {
              if (!app?.createdAt) return false;
              const appDate = new Date(app.createdAt);
              return appDate >= monthStart && appDate <= monthEnd;
            }).length;
          }

          monthData.push({
            day: monthNamesShort[i],
            views: monthCount,
            monthIndex: i,
          });
        }

        if (isMounted) {
          setChartData({
            week: weekData,
            month: monthData,
          });
        }
      } catch (err) {
        console.error("Dashboard xatosi:", err);
        setError("Ma'lumotlarni yuklab bo'lmadi");

        if (isMounted) {
          const demoWeek = weekDaysShort.map((day, i) => ({
            day,
            views: Math.floor(Math.random() * 100) + 20,
            fullDate: `Day ${i + 1}`,
          }));

          const demoMonth = monthNamesShort.map((month, i) => ({
            day: month,
            views: Math.floor(Math.random() * 200) + 50,
            monthIndex: i,
          }));

          setChartData({ week: demoWeek, month: demoMonth });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAndProcess();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeData = useMemo(() => {
    return activeTab === "week" ? chartData.week : chartData.month;
  }, [activeTab, chartData]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const dataPoint = payload[0].payload;

      return (
        <div
          className={`rounded-lg shadow-xl p-2 xs:p-3 border ${
            isDark ? "bg-[#1E1E1E] border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <p
            className={`text-xs xs:text-sm font-semibold ${
              isDark ? "text-gray-100" : "text-gray-800"
            }`}
          >
            {activeTab === "week" ? dataPoint.fullDate : dataPoint.day}
          </p>
          <p className="text-xs xs:text-sm text-[#5ABF89] font-bold">
            {value} job offer{value !== 1 ? "s" : ""}
          </p>
        </div>
      );
    }
    return null;
  };

  const getDisplayDate = () => {
    const now = new Date();
    if (activeTab === "week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(
        now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
      );
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const format = (date) =>
        date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

      return `${format(startOfWeek)} - ${format(endOfWeek)}`;
    } else {
      return now.getFullYear();
    }
  };

  const getChartHeight = () => {
    if (windowWidth < 400) return 220;
    if (windowWidth < 500) return 240;
    if (windowWidth < 640) return 260;
    if (windowWidth < 768) return 280;
    if (windowWidth < 1024) return 320;
    return 350;
  };

  const chartSettings = {
    margin: {
      top: 20,
      right: windowWidth < 400 ? 5 : windowWidth < 768 ? 10 : 20,
      left: windowWidth < 400 ? -15 : windowWidth < 768 ? -10 : 0,
      bottom: windowWidth < 400 ? 5 : windowWidth < 768 ? 10 : 15,
    },
    fontSize: {
      xAxis: windowWidth < 400 ? 10 : windowWidth < 768 ? 11 : 12,
      yAxis: windowWidth < 400 ? 10 : windowWidth < 768 ? 11 : 12,
    },
    strokeWidth: windowWidth < 400 ? 2 : windowWidth < 768 ? 2.5 : 3,
    dotRadius: windowWidth < 400 ? 3 : windowWidth < 768 ? 4 : 5,
    activeDotRadius: windowWidth < 400 ? 5 : windowWidth < 768 ? 6 : 8,
  };

  const getMaxValue = () => {
    if (!activeData || activeData.length === 0) return 100;
    const max = Math.max(...activeData.map((item) => item.views));
    return Math.ceil(max * 1.2);
  };

  const gridStroke = isDark ? "#2b2b2b" : "#f0f0f0";
  const axisTickFill = isDark ? "#9CA3AF" : "#6b7280"; 
  const cursorStroke = "#5ABF89";

  return (
    <div className="w-full mx-auto py-4 sm:py-6 pb-16">
      <div
        className={`rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 border ${
          isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-100"
        }`}
      >
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 ${
              isDark ? "text-gray-100" : "text-gray-800"
            }`}
          >
            Job Offers
          </h2>

          <div
            className={`inline-flex rounded-lg sm:rounded-xl p-1 sm:p-1.5 mb-3 sm:mb-4 ${
              isDark ? "bg-[#252525]" : "bg-gray-100"
            }`}
          >
            <button
              onClick={() => setActiveTab("week")}
              className={`px-4 sm:px-6 md:px-8 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm md:text-base font-semibold transition-all ${
                activeTab === "week"
                  ? isDark
                    ? "bg-[#1E1E1E] text-gray-100 shadow-sm"
                    : "bg-white text-gray-800 shadow-sm"
                  : isDark
                  ? "text-gray-300 hover:text-gray-100 hover:bg-white/10"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
            >
              This Week
            </button>

            <button
              onClick={() => setActiveTab("month")}
              className={`px-4 sm:px-6 md:px-8 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm md:text-base font-semibold transition-all ${
                activeTab === "month"
                  ? isDark
                    ? "bg-[#1E1E1E] text-gray-100 shadow-sm"
                    : "bg-white text-gray-800 shadow-sm"
                  : isDark
                  ? "text-gray-300 hover:text-gray-100 hover:bg-white/10"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
            >
              This Year
            </button>
          </div>

          <div
            className={`${
              isDark ? "text-gray-400" : "text-gray-500"
            } text-xs sm:text-sm`}
          >
            {getDisplayDate()}
            {activeTab === "week" && " (Current Week)"}
            {activeTab === "month" && " (Yearly Overview)"}
          </div>
        </div>

        <div style={{ height: `${getChartHeight()}px` }} className="w-full">
          {loading ? (
            <div
              className={`h-full flex flex-col items-center justify-center ${
                isDark ? "text-gray-300" : "text-gray-500"
              }`}
            >
              <div className="animate-spin h-8 w-8 sm:h-10 sm:w-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-3 sm:mb-4" />
              <span className="text-xs sm:text-sm md:text-base">
                Loading applications data...
              </span>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-500 text-lg sm:text-xl mb-2">⚠️</div>
                <div className="text-red-600 text-xs sm:text-sm md:text-base">
                  {error}
                </div>
                <div
                  className={`${
                    isDark ? "text-gray-400" : "text-gray-500"
                  } text-xs mt-2`}
                >
                  Using demo data for preview
                </div>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeData} margin={chartSettings.margin}>
                <defs>
                  <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5ABF89" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#5ABF89" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridStroke}
                  vertical={false}
                  horizontal={true}
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: axisTickFill,
                    fontSize: chartSettings.fontSize.xAxis,
                    fontWeight: 500,
                  }}
                  dy={10}
                  interval="preserveStartEnd"
                  minTickGap={
                    windowWidth < 400 ? (activeTab === "month" ? 2 : 1) : 1
                  }
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: axisTickFill,
                    fontSize: chartSettings.fontSize.yAxis,
                  }}
                  width={windowWidth < 400 ? 30 : windowWidth < 768 ? 35 : 40}
                  domain={[0, getMaxValue()]}
                  tickFormatter={(value) => value.toFixed(0)}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: cursorStroke,
                    strokeWidth: 1,
                    strokeDasharray: "3 3",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#5ABF89"
                  strokeWidth={chartSettings.strokeWidth}
                  fill="url(#colorOffers)"
                  activeDot={{
                    r: chartSettings.activeDotRadius,
                    stroke: isDark ? "#1E1E1E" : "#ffffff",
                    strokeWidth: 2,
                    fill: "#5ABF89",
                  }}
                  dot={{
                    r: chartSettings.dotRadius,
                    stroke: "#5ABF89",
                    strokeWidth: 1.5,
                    fill: isDark ? "#1E1E1E" : "#ffffff",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard3;
