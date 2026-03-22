import React, { useEffect, useState } from "react";
import { talentApi } from "../../services/api";
import { jwtDecode } from "jwt-decode";
import { useTheme } from "../../Context/ThemeContext.jsx";
import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";

const Dashboard1 = () => {
  const { settings } = useTheme();
  const isDark = settings.darkMode;
  const navigate = useNavigate();

  const [percent, setPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || token === "undefined") {
          setLoading(false);
          return;
        }

        const decoded = jwtDecode(token);
        const res = await talentApi.getById(decoded.id);
        const data = res.data;

        let skillsArray = [];
        if (data.skils) {
          skillsArray = typeof data.skils === 'string' ? JSON.parse(data.skils) : data.skils;
        }

        const skillsCount = Array.isArray(skillsArray) ? skillsArray.length : 0;
        const hasSeenModal = sessionStorage.getItem("hasSeenSkillModal");

        if (skillsCount < 3 && hasSeenModal !== "true") {
          setIsModalOpen(true);
          sessionStorage.setItem("hasSeenSkillModal", "true");
        }

        const values = Object.values(data);
        const filtered = values.filter(v => typeof v !== "number" && v !== data.createdAt && v !== data.updatedAt);
        const filled = filtered.filter(v => {
          if (!v) return false;
          if (typeof v === "string" && (v === "[]" || v === "{}")) return false;
          if (Array.isArray(v)) return v.length > 0;
          return true;
        });

        setPercent(Math.round((filled.length / filtered.length) * 100));
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const CircleProgress = ({ percentage }) => {
    // Card kattalashgani uchun aylanani ham sal kattaroq qildik (140 -> 150)
    const size = 150;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#5ABF89"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="text-4xl font-bold tracking-tight">{percentage}%</span>
          <span className="text-[10px] font-bold uppercase tracking-[2px] mt-1 opacity-90">Complete</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center lg:justify-start h-full">
      {/* max-w-[500px] bo'ldi (yana 50px qo'shildi) */}
      <div className="pt-6 w-full max-w-[500px]">
        <div
          className={`relative overflow-hidden w-full h-[350px] rounded-[24px] 
          flex flex-col items-center justify-between p-8 text-center
          ${isDark
              ? "bg-gradient-to-b from-[#1E293B] to-[#0F172A]"
              : "bg-gradient-to-b from-[#214D76] to-[#6A89CF]"
            }`}
        >
          {/* Sarlavha */}
          <h2 className="text-white text-2xl font-bold tracking-wide mt-2">
            Profile completed
          </h2>

          {/* Progress doirasi */}
          <div className="flex-grow flex items-center justify-center">
            <CircleProgress percentage={percent} />
          </div>

          {/* Pastki matn - Kenglikka moslab max-w oshirildi */}
          <p className="text-white/90 text-[14px] leading-relaxed max-w-[340px] mb-2">
            Complete all parts of your profile and increase your chances of finding a job
          </p>
        </div>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className={`${isDark ? "bg-[#1E293B] text-white" : "bg-white text-[#1E293B]"} relative w-full max-w-[450px] rounded-[40px] p-10 shadow-2xl text-center`}>
            <div className={`mx-auto mb-8 flex items-center justify-center w-24 h-24 rounded-full ${isDark ? "bg-emerald-500/20" : "bg-emerald-50"}`}>
              <FiPlus className="text-[#4AD395] text-5xl" />
            </div>
            <h2 className="text-3xl font-extrabold mb-4 italic">Boost Your Profile!</h2>
            <p className={`text-lg mb-10 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              It looks like you only added a few skills. To attract top companies, we recommend adding more of your expertise!
            </p>
            <div className="flex gap-4">
              <button onClick={() => setIsModalOpen(false)} className={`flex-1 py-4 rounded-2xl font-semibold ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>Maybe Later</button>
              <button onClick={() => { setIsModalOpen(false); navigate("/talent/profile", { state: { openModal: "skils" } }); }} className="flex-1 py-4 bg-[#4AD395] text-white rounded-2xl font-bold shadow-lg">Add Skills</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard1;