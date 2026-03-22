import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { talentApi, applicationApi } from "../../services/api";
import { useTheme } from "../../Context/ThemeContext"; // ThemeContext ulandi
import { jwtDecode } from "jwt-decode";
import {
  HiChartBar,
  HiOutlineUserCircle,
  HiOutlineBell,
  HiOutlineRefresh,
  HiOutlineCog,
  HiOutlineChatAlt2,
  HiOutlineUsers,
  HiOutlineLogout,
} from "react-icons/hi";
import userPng from "../../assets/user.png";

const Sidebar = () => {
  const { settings } = useTheme(); // Dark mode holatini olamiz
  const isDark = settings.darkMode;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appCount, setAppCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);
        const currentUserId = decoded.id || decoded.userId || decoded.user_id;

        const [userRes, appRes] = await Promise.all([
          talentApi.getById(decoded.id),
          applicationApi.getAll(),
        ]);

        setUser(userRes.data);

        const allApps = Array.isArray(appRes.data)
          ? appRes.data
          : appRes.data?.data || [];

        if (currentUserId) {
          const myApps = allApps.filter(
            (app) =>
              app.talentId === currentUserId || app.userId === currentUserId,
          );
          setAppCount(myApps.length);
        }
      } catch (err) {
        console.error("Sidebar error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSidebarData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <aside
        className={`fixed bottom-0 left-0 w-full h-[75px] md:top-0 md:h-screen md:w-[290px] z-50 md:rounded-r-[35px] flex md:flex-col py-2 md:py-8 transition-all duration-500 border-t md:border-r ${isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-100"
          }`}
      >
        {/* User Profile Section */}
        <div className="hidden md:flex items-center gap-3 px-8 mb-8">
          {loading ? (
            <div className="flex items-center gap-3 animate-pulse">
              <div
                className={`w-11 h-11 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
              ></div>
              <div className="space-y-2">
                <div
                  className={`h-3 w-24 rounded ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
                ></div>
                <div
                  className={`h-2 w-16 rounded ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                ></div>
              </div>
            </div>
          ) : (
            <>
              <img
                src={user?.image || userPng}
              alt="avatar"
              onError={(e) => {
                e.currentTarget.src = userPng;
              }}
              className={`w-11 h-11 rounded-full object-cover border shadow-sm ${isDark ? "border-gray-700" : "border-gray-100"
                }`}
              />

              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                <h3
                  className={`font-bold text-[14px] truncate ${isDark ? "text-gray-200" : "text-[#334155]"}`}
                >
                  {user?.first_name} {user?.last_name?.charAt(0)}.
                </h3>
                <p
                  className={`text-[12px] font-medium truncate ${isDark ? "text-gray-500" : "text-[#adb6c2]"}`}
                >
                  {user?.city || user?.location || "Uzbekistan"}
                </p>
              </div>
            </>
          )}
        </div>
        {/* Navigation Menu */}
        <nav className="flex w-full justify-between px-2 md:justify-start md:flex-col md:px-5 gap-0 md:gap-1">
          <MenuItem
            to="/talent/dashboard"
            icon={<HiChartBar />}
            label="Dashboard"
            isDark={isDark}
          />
          <MenuItem
            to="/talent/profile"
            icon={<HiOutlineUserCircle />}
            label="My profile"
            isDark={isDark}
          />
          <MenuItem
            to="/talent/alerts"
            icon={<HiOutlineBell />}
            label="Job alerts"
            badge={appCount > 0 ? appCount : null}
            isDark={isDark}
          />
          <MenuItem
            to="/talent/matches"
            icon={<HiOutlineRefresh />}
            label="Job matches"
            isDark={isDark}
          />
          <MenuItem
            to="/talent/settings"
            icon={<HiOutlineCog />}
            label="Settings"
            isDark={isDark}
          />

          <div className="hidden md:block">
            <MenuItem
              to="/talent/faq"
              icon={<HiOutlineChatAlt2 />}
              label="FAQ"
              isDark={isDark}
            />
            <MenuItem
              to="/talent/contacts"
              icon={<HiOutlineUsers />}
              label="Contacts"
              isDark={isDark}
            />
          </div>

          <div className="hidden md:block md:mt-auto md:pt-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-4 px-3 md:px-6 py-2 md:py-[14px] rounded-xl md:rounded-[14px] transition-all duration-200 text-[10px] md:text-[16px] font-bold text-red-500 w-full ${isDark ? "hover:bg-red-900/20" : "hover:bg-red-50"
                }`}
            >
              <span className="text-[22px] md:text-[24px]">
                <HiOutlineLogout />
              </span>
              <span className="whitespace-nowrap tracking-wide">Log out</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Logout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200 ${isDark ? "bg-[#1E1E1E] text-white" : "bg-white"
              }`}
          >
            <h3
              className={`text-xl font-bold mb-2 ${isDark ? "text-gray-100" : "text-[#334155]"}`}
            >
              Log out
            </h3>
            <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Are you sure you want to log out? You will need to log in again to
              access your account.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors ${isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                No, cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const MenuItem = ({ to, icon, label, badge, isDark }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex flex-col md:flex-row items-center gap-1 md:gap-4
      px-2 md:px-6 py-2 md:py-[14px]
      rounded-xl md:rounded-[14px] transition-all duration-200
      text-[9px] md:text-[16px] font-bold
      relative group flex-1 md:w-full
      ${isActive
        ? "bg-[#163853] text-white shadow-md"
        : isDark
          ? "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
          : "text-[#a0a8b1] hover:bg-gray-50 hover:text-[#94a3b8]"
      }
    `}
  >
    <span className="text-[22px] md:text-[24px]">{icon}</span>
    <span className="whitespace-nowrap tracking-wide">{label}</span>
    {badge && (
      <span className="absolute top-1 right-1 md:right-4 md:top-1/2 md:-translate-y-1/2 bg-[#5cc992] text-white text-[8px] md:text-[11px] w-3.5 h-3.5 md:w-5 md:h-5 flex items-center justify-center rounded-full font-bold">
        {badge}
      </span>
    )}
  </NavLink>
);

export default Sidebar;