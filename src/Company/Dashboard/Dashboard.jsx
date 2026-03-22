import React, { useState, useEffect } from 'react';
import { companyApi, jobApi } from '../../services/api';
import { useTheme } from "../../talent/Context/ThemeContext";
import { Link } from 'react-router-dom';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, AreaChart, Area, Tooltip
} from 'recharts';

// --- SKELETON KOMPONENTI (DARK MODE MOSLASHTIRILDI) ---
const DashboardSkeleton = ({ isDark }) => (
  <div className={`p-3 pb-20 md:p-6 ${isDark ? 'bg-[#121212]' : 'bg-[#F8F9FB]'} min-h-screen animate-pulse`}>
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 max-w-[1400px] mx-auto gap-4">
      <div className={`h-16 ${isDark ? 'bg-[#1E1E1E]' : 'bg-white'} rounded-lg w-full sm:flex-grow sm:max-w-[1047px] shadow-sm`}></div>
      <div className={`h-16 ${isDark ? 'bg-[#2D2D2D]' : 'bg-gray-200'} rounded-lg w-full sm:w-48 shadow-md`}></div>
    </div>
    <div className="max-w-[1400px] mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`lg:col-span-4 ${isDark ? 'bg-gray-800' : 'bg-gray-300'} rounded-[20px] h-[350px] md:h-[400px]`}></div>
        <div className={`lg:col-span-8 ${isDark ? 'bg-[#1E1E1E]' : 'bg-white'} rounded-[20px] h-[400px] border ${isDark ? 'border-gray-800' : 'border-gray-100'}`}></div>
      </div>
      <div className={`w-full h-[400px] rounded-[20px] ${isDark ? 'bg-[#1E1E1E]' : 'bg-white'} border ${isDark ? 'border-gray-800' : 'border-gray-100'}`}></div>
    </div>
  </div>
);

const getProgressColor = (pct) => {
  if (pct <= 30) return "#FF4D4D";
  if (pct <= 55) return "#FFD60A";
  if (pct < 95) return "#56CDAD";
  return "#28A745";
};

const Dashboard = () => {
  const { settings } = useTheme();
  const isDark = settings?.darkMode;

  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rawJobs, setRawJobs] = useState([]);
  const [profileViewTab, setProfileViewTab] = useState('week');
  const [jobPostTab, setJobPostTab] = useState('week');
  const [profileStats, setProfileStats] = useState([]);
  const [jobStats, setJobStats] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 450);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 450);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getMaxScale = (data) => {
    const maxVal = data.length > 0 ? Math.max(...data.map(d => d.count)) : 0;
    return maxVal < 5 ? 5 : maxVal + 1;
  };

  const formatData = (jobs, type) => {
    const labels = type === 'week'
      ? ['Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return labels.map((label, index) => ({
      name: label,
      count: type === 'week'
        ? jobs.filter(j => {
          const dateStr = j.createdAt || j.created_at;
          const day = new Date(dateStr).getDay();
          const mappedDay = day === 0 ? 6 : day - 1;
          return mappedDay === index;
        }).length
        : jobs.filter(j => new Date(j.createdAt || j.created_at).getMonth() === index).length
    }));
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const localData = localStorage.getItem("user_info");
        if (!localData) { setLoading(false); return; }
        const user = JSON.parse(localData);
        const myId = Number(user.id);

        const res = await companyApi.getAll();
        const myData = res.data.find(c => Number(c.id) === myId);
        const targetData = myData || user;

        if (targetData) {
          if (myData) localStorage.setItem("user_info", JSON.stringify(myData));
          const fieldsToVerify = [
            targetData.company_name, targetData.phone,
            targetData.industry || targetData.Industry,
            targetData.country, targetData.city,
            targetData.website, targetData.about_company
          ];
          const filledCount = fieldsToVerify.filter(val => {
            if (val === null || val === undefined) return false;
            const str = String(val).trim();
            return str !== "" && str.toLowerCase() !== "string" && str !== "0";
          }).length;
          setPercentage(Math.round((filledCount / fieldsToVerify.length) * 100));
        }

        const jobsRes = await jobApi.getAll();
        const myJobs = jobsRes.data.filter(job =>
          Number(job.company_id) === myId || Number(job.ownerId) === myId
        );

        setRawJobs(myJobs);
        setProfileStats(formatData(myJobs, 'week'));
        setJobStats(formatData(myJobs, 'week'));
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchAllData();
  }, []);

  const radius = isMobile ? 70 : 85;
  const circumference = 2 * Math.PI * radius;
  const displayPercentage = Math.min(percentage, 100);
  const offset = circumference - (displayPercentage / 100) * circumference;

  if (loading) return <DashboardSkeleton isDark={isDark} />;

  return (
    <div className={`p-2 pb-20 sm:p-4 md:p-6 transition-colors duration-300 ${isDark ? 'bg-[#121212]' : 'bg-[#F8F9FB]'} min-h-screen font-['Mulish']`}>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 max-w-[1400px] mx-auto gap-4">
        <div className={`px-6 py-4  rounded-lg shadow-sm border transition-colors w-full sm:flex-grow sm:max-w-[930px] ${isDark ? 'bg-[#1E1E1E] border-gray-800' : 'bg-white border-gray-100'}`}>
          <h1 className={`text-[18px] text-center md:text-[20px] font-bold ${isDark ? 'text-white' : 'text-[#202430]'}`}>Dashboard</h1>
        </div>
        <Link
          to="/company/post-job"
          className="bg-[#50C594] text-center text-white w-full sm:w-auto px-10 py-4 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all shadow-md">
          Post a Job
        </Link>
      </div>

      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* PROFILE PROGRESS CARD */}
          <div className="lg:col-span-4 bg-gradient-to-br from-[#163D5C] to-[#CA5ECA] p-6 rounded-[20px] text-white flex flex-col items-center justify-center shadow-xl h-[350px] md:h-[400px]">
            <h3 className="text-[18px] font-bold mb-6 text-center">Profile completed</h3>
            <div className="relative flex items-center justify-center w-[160px] h-[160px] md:w-[200px] md:h-[200px]">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                <circle cx="100" cy="100" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="15" fill="transparent" />
                <circle cx="100" cy="100" r={radius} stroke={getProgressColor(displayPercentage)} strokeWidth="15" fill="transparent" strokeDasharray={circumference} strokeDashoffset={isNaN(offset) ? circumference : offset} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[28px] md:text-[36px] font-bold">{displayPercentage}%</span>
                <span className="text-[12px] opacity-80">Complete</span>
              </div>
            </div>
          </div>

          {/* BAR CHART CARD (PROFILE VIEWS) */}
          <div className={`lg:col-span-8 p-4 md:p-6 rounded-[20px] border shadow-sm flex flex-col items-center h-[400px] transition-colors ${isDark ? 'bg-[#1E1E1E] border-gray-800' : 'bg-white border-[#E9E9E9]'}`}>
            <h3 className={`text-[16px] md:text-[18px] font-bold mb-4 ${isDark ? 'text-white' : 'text-[#202430]'}`}>Profile views</h3>

            {/* Responsive Tab Container */}
            <div className={`p-1 rounded-xl flex items-center relative mb-6 w-full max-w-full sm:max-w-[420px] ${isDark ? 'bg-[#2D2D2D]' : 'bg-[#F8F8FD]'}`}>
              <div className={`absolute shadow-md rounded-lg transition-all duration-500 ${isDark ? 'bg-[#3D3D3D]' : 'bg-white'}`}
                style={{ width: 'calc(50% - 4px)', height: 'calc(100% - 8px)', left: profileViewTab === 'week' ? '4px' : '50%' }} />
              <button onClick={() => { setProfileViewTab('week'); setProfileStats(formatData(rawJobs, 'week')); }}
                className={`z-10 font-bold py-2 text-[12px] sm:text-[14px] flex-1 ${profileViewTab === 'week' ? (isDark ? 'text-white' : 'text-[#202430]') : 'text-gray-400'}`}>This week</button>
              <button onClick={() => { setProfileViewTab('month'); setProfileStats(formatData(rawJobs, 'month')); }}
                className={`z-10 font-bold py-2 text-[12px] sm:text-[14px] flex-1 ${profileViewTab === 'month' ? (isDark ? 'text-white' : 'text-[#202430]') : 'text-gray-400'}`}>This month</button>
            </div>

            <div className="flex-grow w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profileStats} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#CA5ECA" />
                      <stop offset="100%" stopColor="#163D5C" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#F3F3F3"} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A3A3A3', fontSize: isMobile ? 9 : 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A3A3A3', fontSize: 10 }} width={40} domain={[0, getMaxScale(profileStats)]} />
                  <Tooltip cursor={{ fill: isDark ? '#2D2D2D' : '#F8F8FD' }} contentStyle={isDark ? { backgroundColor: '#1E1E1E', borderColor: '#333', color: '#fff' } : {}} />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} barSize={isMobile ? 12 : 16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AREA CHART CARD (JOB POSTS) */}
        <div className={`p-4 md:p-8 rounded-[20px] border shadow-sm flex flex-col items-center transition-colors ${isDark ? 'bg-[#1E1E1E] border-gray-800' : 'bg-white border-[#E9E9E9]'}`}>
          <h3 className={`text-[16px] md:text-[18px] font-bold mb-6 ${isDark ? 'text-white' : 'text-[#202430]'}`}>Job posts</h3>

          <div className={`p-1 rounded-xl flex items-center relative mb-8 w-full max-w-full sm:max-w-[420px] ${isDark ? 'bg-[#2D2D2D]' : 'bg-[#F8F8FD]'}`}>
            <div className={`absolute shadow-md rounded-lg transition-all duration-500 ${isDark ? 'bg-[#3D3D3D]' : 'bg-white'}`}
              style={{ width: 'calc(50% - 4px)', height: 'calc(100% - 8px)', left: jobPostTab === 'week' ? '4px' : '50%' }} />
            <button onClick={() => { setJobPostTab('week'); setJobStats(formatData(rawJobs, 'week')); }}
              className={`z-10 font-bold py-2 text-[12px] sm:text-[14px] flex-1 ${jobPostTab === 'week' ? (isDark ? 'text-white' : 'text-[#202430]') : 'text-gray-400'}`}>This week</button>
            <button onClick={() => { setJobPostTab('month'); setJobStats(formatData(rawJobs, 'month')); }}
              className={`z-10 font-bold py-2 text-[12px] sm:text-[14px] flex-1 ${jobPostTab === 'month' ? (isDark ? 'text-white' : 'text-[#202430]') : 'text-gray-400'}`}>This month</button>
          </div>

          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={jobStats} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorJob" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5ABF89" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#5ABF8900" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#F3F3F3"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A3A3A3', fontSize: isMobile ? 9 : 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A3A3A3', fontSize: 10 }} width={40} domain={[0, getMaxScale(jobStats)]} />
                <Tooltip contentStyle={isDark ? { backgroundColor: '#1E1E1E', borderColor: '#333', color: '#fff' } : {}} />
                <Area type="monotone" dataKey="count" stroke="#50C594" strokeWidth={3} fill="url(#colorJob)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;