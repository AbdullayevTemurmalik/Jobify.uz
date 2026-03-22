import React, { useState, useEffect } from "react";
import {
  TbWorld,
  TbBrandTelegram,
  TbMail,
  TbHeadset,
  TbLogout,
  TbAlertTriangle,
} from "react-icons/tb";
import { useTheme } from "../../Context/ThemeContext.jsx";
import { useNavigate } from "react-router-dom";
import Theme from "../../components/Theme/Theme.jsx";
import toast, { Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { talentApi, companyApi } from "../../services/api";

const Setting = () => {
  const { settings, toggleSwitch } = useTheme();
  const navigate = useNavigate();

  // Modal states
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Data states
  const [confirmText, setConfirmText] = useState("");
  const [userData, setUserData] = useState({ id: "", type: "" });

  const REQUIRED_TEXT = "delete account";

  // Load user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userTypeFromStorage = localStorage.getItem("userType");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserData({
          id: decoded.id,
          type: decoded.role || userTypeFromStorage
        });
      } catch (err) {
        console.error("Token error:", err);
      }
    }
  }, []);

  const handleSupportClick = () => {
    window.open("https://t.me/Xakimdjanov7", "_blank");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    setShowLogoutModal(false);
    navigate("/");
  };

  const handleFinalDelete = async () => {
    try {
      if (userData.type === "company") {
        await companyApi.delete(userData.id);
      } else {
        await talentApi.delete(userData.id);
      }

      toast.success("Your account has been deleted");
      localStorage.clear();
      sessionStorage.clear();

      setTimeout(() => {
        navigate('/home');
        window.location.reload();
      }, 1500);

    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "An error occurred during deletion");
    }
  };

  const CustomToggle = ({ isOn, onToggle }) => (
    <div
      onClick={onToggle}
      className={`relative w-[46px] h-[24px] md:w-[50px] md:h-[26px] flex items-center rounded-full cursor-pointer transition-colors duration-500 ${isOn ? "bg-[#55B985]" : "bg-gray-300"
        }`}
    >
      <div
        className={`absolute bg-white w-[18px] h-[18px] md:w-[20px] md:h-[20px] rounded-full shadow-sm transition-all duration-500 ${isOn ? "translate-x-[24px]" : "translate-x-[4px]"
          }`}
      />
    </div>
  );

  return (
    <div
      className={`min-h-full p-4 sm:p-6 md:p-8 pb-[100px] md:pb-8 font-sans transition-colors duration-500 ${settings.darkMode ? "bg-[#121212] text-white" : "bg-[#F8F9FA] text-gray-800"
        }`}
    >
      <Toaster position="top-right" />
      <div className="max-w-[900px] mx-auto relative">
        <div
          className={`${settings.darkMode ? "bg-[#1E1E1E] border-gray-700" : "bg-white border-gray-100"
            } p-3 md:p-4 rounded-xl shadow-sm mb-6 border transition-colors`}
        >
          <h1 className={`text-xl md:text-2xl font-semibold ${settings.darkMode ? "text-gray-200" : "text-gray-800"} ml-1`}>
            Settings
          </h1>
        </div>

        {/* Notification settings */}
        <div className="mb-8">
          <h2 className={`text-[16px] md:text-[18px] font-bold mb-4 ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Notification settings
          </h2>
          <div className="flex flex-col gap-3 md:gap-4">
            <SettingItem
              icon={<TbWorld />}
              title="Website"
              desc="Get notifications on website"
              isOn={settings.website}
              onToggle={() => toggleSwitch("website")}
              CustomToggle={CustomToggle}
              isDark={settings.darkMode}
            />
            <item
              icon={<TbBrandTelegram />}
              title="Telegram"
              desc="Get notifications on Telegram"
              isOn={settings.telegram}
              onToggle={() => toggleSwitch("telegram")}
              CustomToggle={CustomToggle}
              isDark={settings.darkMode}
            />
            <SettingItem
              icon={<TbMail />}
              title="Email"
              desc="Get notifications on Email"
              isOn={settings.email}
              onToggle={() => toggleSwitch("email")}
              CustomToggle={CustomToggle}
              isDark={settings.darkMode}
            />
          </div>
        </div>

        {/* Support section */}
        <div className="mb-8">
          <h2 className={`text-[16px] md:text-[18px] font-bold mb-4 ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Support
          </h2>
          <div
            onClick={handleSupportClick}
            className={`${settings.darkMode ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-50"} p-4 md:p-6 rounded-[22px] flex justify-between items-center shadow-sm border cursor-pointer group`}
          >
            <div className="flex items-start gap-4">
              <TbHeadset className={`text-2xl mt-1 ${settings.darkMode ? "text-indigo-400" : "text-indigo-600"}`} />
              <div>
                <h3 className={`text-[15px] md:text-[17px] font-bold ${settings.darkMode ? "text-gray-200" : "text-gray-800"}`}>
                  Connect with support
                </h3>
                <p className={`text-[11px] md:text-[14px] ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Our team is always ready to help you
                </p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${settings.darkMode ? "bg-indigo-600/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
              Chat now
            </div>
          </div>
        </div>

        {/* Theme Section */}
        <Theme CustomToggle={CustomToggle} SettingItem={SettingItem} />

        {/* Logout section (Mobile) */}
        <div className="mb-8 md:hidden">
          <h2 className="text-[16px] font-bold mb-4 text-red-500">Account</h2>
          <div
            onClick={() => setShowLogoutModal(true)}
            className={`${settings.darkMode ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-50"} p-4 rounded-[22px] flex items-center gap-4 shadow-sm border cursor-pointer active:bg-red-50 transition-colors`}
          >
            <TbLogout className="text-2xl text-red-500" />
            <span className="font-bold text-[15px] text-red-500">Log Out</span>
          </div>
        </div>

        {/* DANGER ZONE (Account Delete) */}
        <div className="mt-12 bg-red-500/5 border border-red-500/20 p-6 rounded-[26px]">
          <h2 className="text-red-500 font-bold mb-4 uppercase tracking-widest text-sm">Danger Zone</h2>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm opacity-70 text-center md:text-left">Deleting your account is an irreversible process.</p>
            <button onClick={() => setIsFirstModalOpen(true)} className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all w-full md:w-auto shadow-lg shadow-red-500/20">
              Delete Account
            </button>
          </div>
        </div>

        {/* LOGOUT MODAL */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`${settings.darkMode ? "bg-[#1E1E1E] border-gray-700" : "bg-white"} w-full max-sm rounded-[24px] p-6 shadow-2xl border animate-in zoom-in duration-200`}>
              <h3 className={`text-xl font-bold mb-2 text-center ${settings.darkMode ? "text-white" : "text-gray-900"}`}>Log Out?</h3>
              <p className={`text-center mb-6 ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`}>Are you sure you want to log out of your account?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutModal(false)} className={`flex-1 py-3 rounded-xl font-semibold ${settings.darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"}`}>No, stay</button>
                <button onClick={handleLogout} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold">Yes, log out</button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE VERIFICATION MODAL */}
        {isFirstModalOpen && (
          <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className={`w-full max-w-md rounded-[30px] p-8 shadow-2xl ${settings.darkMode ? "bg-[#111] border border-gray-800" : "bg-white"}`}>
              <h2 className={`text-2xl font-black mb-4 ${settings.darkMode ? "text-white" : "text-black"}`}>Verification</h2>
              <div className="space-y-5">
                <p className={`text-sm opacity-70 ${settings.darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  To confirm account deletion, type the word <span className="text-red-500 font-bold italic">"{REQUIRED_TEXT}"</span> in the field below:
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toLowerCase())}
                  className={`w-full p-4 rounded-2xl border-2 outline-none transition-all ${confirmText === REQUIRED_TEXT ? "border-green-500" : "border-red-500/30"} ${settings.darkMode ? "bg-black text-white" : "bg-gray-50 text-black"}`}
                  placeholder="Type here..."
                />
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={() => { setIsFirstModalOpen(false); setConfirmText(""); }} className="flex-1 py-4 font-bold opacity-50">Cancel</button>
                <button
                  disabled={confirmText !== REQUIRED_TEXT}
                  onClick={() => { setIsFirstModalOpen(false); setIsConfirmModalOpen(true); }}
                  className={`flex-1 py-4 rounded-2xl font-black transition-all ${confirmText === REQUIRED_TEXT ? "bg-red-600 text-white shadow-lg" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FINAL DELETE CONFIRM MODAL */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-[35px] text-center max-w-sm">
              <TbAlertTriangle className="text-5xl text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-black mb-2">Are you sure?</h2>
              <p className="text-sm text-gray-500 mb-8">
                You are about to permanently delete the {userData.type} profile (ID: {userData.id}).
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={handleFinalDelete} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl">Yes, delete permanently</button>
                <button onClick={() => setIsConfirmModalOpen(false)} className="w-full py-4 text-gray-500 font-bold hover:text-black">No, cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SettingItem = ({ icon, title, desc, isOn, onToggle, CustomToggle, isDark }) => (
  <div className={`${isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-50"} p-4 md:p-6 rounded-[22px] flex justify-between items-center shadow-sm border mb-4 transition-all hover:shadow-md`}>
    <div className="flex items-start gap-4">
      <div className={`text-2xl mt-1 opacity-50 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{icon}</div>
      <div>
        <h3 className={`text-[15px] md:text-[17px] font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}>{title}</h3>
        <p className={`text-[11px] md:text-[14px] ${isDark ? "text-gray-400" : "text-gray-500"}`}>{desc}</p>
      </div>
    </div>
    <CustomToggle isOn={isOn} onToggle={onToggle} />
  </div>
);

export default Setting;