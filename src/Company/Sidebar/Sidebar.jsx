import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useTheme } from "../../talent/Context/ThemeContext";

import {
  MdWork,
  MdQuestionAnswer,
  MdContactPhone,
  MdLogout
} from 'react-icons/md';
import { IoStatsChart, IoNotifications } from "react-icons/io5";
import { FaChartPie } from "react-icons/fa6";
import { BsPersonCircle } from "react-icons/bs";
import { IoMdSettings } from "react-icons/io";

// API IMPORT:
import { notificationApi } from "../../services/api";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useTheme();
  const isDark = settings?.darkMode;

  const [user, setUser] = useState({ company_name: 'TechCells Corp.', city: 'Tashkent', img: null });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const defaultAvatar = "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=";

  const checkNotifications = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;
      const decoded = jwtDecode(token);
      const currentCompanyId = decoded.company_id || decoded.id;
      const res = await notificationApi.getAll();
      if (res.data && Array.isArray(res.data)) {
        const unread = res.data.filter(n =>
          Number(n.company_id) === Number(currentCompanyId) && !n.is_read
        ).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Notification check error:", error);
    }
  };

  const updateUserData = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userInfoRaw = localStorage.getItem('user_info') || sessionStorage.getItem('user_info');
    if (token && userInfoRaw) {
      try {
        const userInfo = JSON.parse(userInfoRaw);
        const decoded = jwtDecode(token);
        setUser({
          company_name: userInfo.company_name || decoded.company_name || 'TechCells Corp.',
          city: userInfo.city || 'Tashkent',
          img: userInfo.profileimg_url || null
        });
      } catch (error) {
        console.error("Token error:", error);
      }
    }
  };

  useEffect(() => {
    updateUserData();
    checkNotifications();
    const handleUpdate = () => {
      updateUserData();
      checkNotifications();
    };
    window.addEventListener('userInfoUpdated', handleUpdate);
    window.addEventListener('storage', updateUserData);
    return () => {
      window.removeEventListener('userInfoUpdated', handleUpdate);
      window.removeEventListener('storage', updateUserData);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/company/signin');
    window.location.reload();
  };

  const navItems = [
    { name: 'Dashboard', path: '/company/dashboard', icon: <IoStatsChart className="text-[18px] sm:text-[22px]" />, mobile: true },
    { name: 'Company', path: '/company/my-company', icon: <FaChartPie className="text-[18px] sm:text-[22px]" />, mobile: true },
    { name: 'Jobs', path: '/company/my-jobs', icon: <MdWork className="text-[18px] sm:text-[22px]" />, mobile: true },
    { name: 'Talents', path: '/company/talents', icon: <BsPersonCircle className="text-[18px] sm:text-[22px]" />, mobile: true },
    {
      name: 'Notifications',
      path: '/company/notification',
      icon: (
        <div className="relative">
          <IoNotifications className="text-[18px] sm:text-[22px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-600 rounded-full border border-white animate-glow-fast"></span>
          )}
        </div>
      ),
      mobile: true
    },
    { name: 'Settings', path: '/company/settings', icon: <IoMdSettings className="text-[18px] sm:text-[22px]" />, mobile: true },
    { name: 'FAQ', path: '/company/faq', icon: <MdQuestionAnswer size={22} />, mobile: false },
    { name: 'Contacts', path: '/company/contacts', icon: <MdContactPhone size={22} />, mobile: false },
  ];

  return (
    <>
      <div className={`fixed bottom-0 left-0 w-full h-[65px] sm:h-[75px] border-t flex flex-row items-center justify-around px-1 sm:px-2 z-[100] transition-colors duration-300
                      md:relative md:flex-col md:w-[280px] md:h-screen md:border-r md:border-t-0 md:py-8 md:px-5 md:justify-start
                      ${isDark ? 'bg-[#1E1E1E] border-gray-800' : 'bg-white border-gray-100'}`}>

        {/* Desktop Profile Header */}
        <div className="hidden md:flex items-center gap-4 mb-10 px-1 w-full text-left">
          <div className={`w-12 h-12 rounded-full overflow-hidden border flex-shrink-0 transition-colors ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-100'}`}>
            <img
              src={user.img || defaultAvatar}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = defaultAvatar }}
            />
          </div>
          <div className="flex flex-col overflow-hidden">
            <h3 className={`font-bold text-[17px] leading-tight truncate transition-colors ${isDark ? 'text-white' : 'text-[#343C44]'}`}>
              {user.company_name}
            </h3>
            <p className={`text-[14px] font-medium truncate transition-colors ${isDark ? 'text-gray-400' : 'text-[#C2C2C2]'}`}>
              {user.city}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-row md:flex-col w-full justify-between md:justify-start md:gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col md:flex-row items-center gap-0.5 sm:gap-1 md:gap-4 px-1 sm:px-4 py-2 md:py-3 rounded-xl transition-all duration-300 flex-1 md:flex-none
                ${!item.mobile ? "hidden md:flex" : "flex"} 
                ${isActive
                  ? (isDark ? "text-[#5CB85C] md:bg-[#5CB85C] md:text-white" : "text-[#163D5C] md:bg-[#163D5C] md:text-white")
                  : (isDark ? "text-gray-500 hover:text-white md:hover:bg-gray-800" : "text-[#C2C2C2] hover:text-[#163D5C] md:hover:bg-gray-50")}
              `}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="text-[9px] sm:text-[10px] md:text-[16px] font-semibold text-center whitespace-nowrap">
                {item.name === 'Notifications' ? (
                  <>
                    <span className="md:hidden">Notif</span>
                    <span className="hidden md:inline">Notifications</span>
                  </>
                ) : (
                  item.name
                )}
              </span>
            </NavLink>
          ))}

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className={`hidden md:flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 mt-auto w-full
                        ${isDark ? 'text-red-400 hover:bg-red-900/20' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}
          >
            <MdLogout size={22} className="shrink-0" />
            <span className="text-[16px] font-semibold">Logout</span>
          </button>
        </nav>
      </div>

      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] px-4">
          <div className={`p-8 rounded-3xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-200 font-sans transition-colors
                          ${isDark ? 'bg-[#2D2D2D]' : 'bg-white'}`}>
            <h3 className={`text-[20px] font-bold mb-3 transition-colors ${isDark ? 'text-white' : 'text-[#163D5C]'}`}>
              Logout
            </h3>
            <p className={`mb-8 text-[15px] transition-colors ${isDark ? 'text-gray-400' : 'text-[#343C44]'}`}>
              Do you really want to logout?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className={`flex-1 py-3 rounded-2xl font-bold border-2 transition-all
                            ${isDark ? 'border-[#5CB85C] bg-[#5CB85C] text-white hover:bg-transparent hover:text-[#5CB85C]'
                    : 'border-[#163D5C] bg-[#163D5C] text-white hover:bg-white hover:text-[#163D5C]'}`}
              >
                No
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-2xl font-bold border-2 border-red-500 bg-red-500 text-white hover:bg-transparent hover:text-red-500 transition-all"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;