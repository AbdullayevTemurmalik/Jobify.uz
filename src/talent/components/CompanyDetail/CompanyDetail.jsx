import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jobApi } from "../../services/api";
import { FaChevronLeft } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useTheme } from "../../Context/ThemeContext.jsx";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useTheme();
  const isDark = settings.darkMode;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyStats, setCompanyStats] = useState({ active: 0, total: 0 });

  useEffect(() => {
    const fetchFullData = async () => {
      try {
        setLoading(true);
        const res = await jobApi.getById(id);
        const jobData = res.data;
        setJob(jobData);

        if (jobData?.company_id) {
          const statsRes = await jobApi.getByCompany(jobData.company_id);
          const allJobs = Array.isArray(statsRes.data) ? statsRes.data : [];

          setCompanyStats({
            active: allJobs.filter((j) => j.is_activate === true).length,
            total: allJobs.length,
          });
        }
      } catch (err) {
        toast.error("Error fetching job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchFullData();
  }, [id]);

  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-[#121212]" : "bg-[#F9FAFB]"
        }`}
      >
        <div
          className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
            isDark ? "border-blue-500" : "border-[#52D394]"
          }`}
        ></div>
      </div>
    );

  if (!job)
    return (
      <div
        className={`text-center py-20 font-bold ${
          isDark ? "text-red-400" : "text-red-500"
        }`}
      >
        Job not found.
      </div>
    );

  return (
    <div
      className={`min-h-screen transition-colors duration-500 p-4 md:p-8 font-sans ${
        isDark ? "bg-[#121212] text-white" : "bg-[#F9FAFB] text-[#1E293B]"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div
          className={`rounded-2xl p-4 shadow-sm mb-6 flex items-center justify-between border transition-all duration-500 ${
            isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-100"
          }`}
        >
          <h2
            className={`text-lg font-bold ${
              isDark ? "text-gray-200" : "text-gray-700"
            } ml-4`}
          >
            Job Details
          </h2>
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-full transition-all ${
              isDark
                ? "hover:bg-gray-800 text-gray-400"
                : "hover:bg-gray-50 text-gray-400"
            }`}
          >
            <FaChevronLeft />
          </button>
        </div>

        <div
          className={`rounded-[32px] p-8 border transition-all duration-500 shadow-sm mb-6 ${
            isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-100"
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
            <div className="flex gap-5">
              {/* ✅ UPDATED LOGO (HEADER SECTION) */}
              <div className="relative group shrink-0">
                <div
                  className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300
                    ${
                      isDark
                        ? "bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gray-700 shadow-lg shadow-black/40"
                        : "bg-white border border-gray-200 shadow-md"
                    }
                    group-hover:scale-105`}
                >
                  {job.company?.profileimg_url ? (
                    <img
                      src={job.company.profileimg_url}
                      alt="company logo"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <span className="text-lg font-bold text-blue-500">
                      {job.company?.company_name?.charAt(0) || "C"}
                    </span>
                  )}
                </div>

                {/* soft ring hover */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 ring-2 ring-blue-400/30"></div>
              </div>

              <div>
                <h1
                  className={`text-2xl font-black tracking-tight ${
                    isDark ? "text-gray-100" : "text-slate-800"
                  }`}
                >
                  {job.occupation}
                </h1>
                <p className="text-gray-400 font-bold text-sm">
                  {job.company?.company_name}
                </p>
                <p
                  className={`text-[12px] mt-1 font-medium italic ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {job.company?.city} • {job.workplace_type}
                </p>
              </div>
            </div>

            <div className="md:text-right w-full md:w-auto">
              <p className="text-gray-500 text-xs font-bold mb-1">
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </p>
              <span
                className={`text-2xl font-black ${
                  isDark ? "text-blue-400" : "text-slate-800"
                }`}
              >
                ${job.salary_min}-${job.salary_max}
              </span>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3
                className={`text-md font-black mb-3 uppercase tracking-wider text-[13px] ${
                  isDark ? "text-gray-300" : "text-slate-800"
                }`}
              >
                What you will do:
              </h3>
              <p
                className={`text-sm leading-relaxed whitespace-pre-line ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {job.description || "No description provided."}
              </p>
            </div>

            <div>
              <h3
                className={`text-md font-black mb-3 uppercase tracking-wider text-[13px] ${
                  isDark ? "text-gray-300" : "text-slate-800"
                }`}
              >
                Required skills:
              </h3>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold border ${
                    isDark
                      ? "bg-[#252525] text-gray-300 border-gray-700"
                      : "bg-[#F1F3F6] text-gray-600 border-transparent"
                  }`}
                >
                  {job.skils}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <button
              onClick={() => navigate(`/talent/job-post/${job.id}`)}
              className={`px-20 md:px-32 py-4 text-white font-black rounded-2xl transition-all transform active:scale-95 shadow-lg
                focus:outline-none focus-visible:outline-none active:outline-none
                focus:ring-0 focus-visible:ring-0 active:ring-0
                ${
                  isDark
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-900/20"
                    : "bg-[#52D394] hover:bg-[#46b881] shadow-green-100"
                }`}
            >
              Apply Now
            </button>
          </div>
        </div>

        <div
          className={`rounded-[32px] p-8 border transition-all duration-500 shadow-sm ${
            isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-100"
          }`}
        >
          <h3
            className={`text-md font-black mb-6 uppercase tracking-wider text-[13px] ${
              isDark ? "text-gray-300" : "text-slate-800"
            }`}
          >
            About company
          </h3>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex gap-4 w-full lg:w-auto">
              {/* ✅ UPDATED LOGO (ABOUT COMPANY SECTION) */}
              <div className="relative group shrink-0">
                <div
                  className={`w-14 h-14 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300
                    ${
                      isDark
                        ? "bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gray-700 shadow-md"
                        : "bg-white border border-gray-200 shadow-sm"
                    }
                    group-hover:scale-105`}
                >
                  {job.company?.profileimg_url ? (
                    <img
                      src={job.company.profileimg_url}
                      alt="company logo"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <span className="text-sm font-bold text-blue-500">
                      {job.company?.company_name?.charAt(0) || "C"}
                    </span>
                  )}
                </div>
              </div>

              <div className="overflow-hidden">
                <h4
                  className={`text-md font-black truncate ${
                    isDark ? "text-gray-200" : "text-slate-800"
                  }`}
                >
                  {job.company?.company_name}
                </h4>
                <p className="text-gray-500 text-[11px] font-bold leading-tight uppercase truncate">
                  {job.company?.category || "Technology & Software"}
                </p>
                <p className="text-gray-500 text-[11px] font-bold mt-1 opacity-70 italic truncate">
                  {job.location}
                </p>
              </div>
            </div>

            <div
              className={`flex items-center justify-around w-full lg:w-auto gap-4 md:gap-12 text-center border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-10 ${
                isDark ? "border-gray-800" : "border-gray-100"
              }`}
            >
              <div className="min-w-[80px]">
                <p
                  className={`text-xl md:text-2xl font-black ${
                    isDark ? "text-blue-400" : "text-slate-800"
                  }`}
                >
                  {companyStats.active}
                </p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                  Active jobs
                </p>
              </div>

              <div
                className={`hidden md:block h-8 w-[1px] ${
                  isDark ? "bg-gray-800" : "bg-gray-100"
                }`}
              ></div>

              <div className="min-w-[80px]">
                <p
                  className={`text-xl md:text-2xl font-black ${
                    isDark ? "text-blue-400" : "text-slate-800"
                  }`}
                >
                  {companyStats.total}
                </p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                  Jobs posted
                </p>
              </div>

              <div
                className={`hidden md:block h-8 w-[1px] ${
                  isDark ? "bg-gray-800" : "bg-gray-100"
                }`}
              ></div>

              <div className="min-w-[80px]">
                <p
                  className={`text-xl md:text-2xl font-black ${
                    isDark ? "text-blue-400" : "text-slate-800"
                  }`}
                >
                  250+
                </p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                  Hired
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
