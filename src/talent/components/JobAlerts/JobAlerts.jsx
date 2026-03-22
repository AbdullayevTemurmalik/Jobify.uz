import React, { useEffect, useMemo, useState, useCallback } from "react";
import { applicationApi, jobApi, talentApi } from "../../services/api";
import { jwtDecode } from "jwt-decode";
import toast, { Toaster } from "react-hot-toast";
import {
  FaChevronDown,
  FaBriefcase,
  FaClock,
  FaFileContract,
  FaUserTie,
  FaMapMarkerAlt,
  FaTrashAlt,
  FaSearch,
  FaCity,
  FaThumbsDown,
  FaThumbsUp,
  FaGlobe,
  FaPhoneAlt,
  FaBuilding,
} from "react-icons/fa";
import { useTheme } from "../../Context/ThemeContext.jsx";
import { useJobReactions } from "../../Context/JobReactionsContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import nonImg from "../../assets/img.jpg";
import CompImg from "../../assets/bg.png";

/** ✅ user skils: JSON string OR array OR comma-string -> ["react","node.js"] */
function parseTalentSkills(raw) {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((x) => (typeof x === "string" ? x : x?.skill))
      .map((s) => String(s || "").trim().toLowerCase())
      .filter(Boolean);
  }

  const str = String(raw).trim();

  if (str.startsWith("[") && str.includes('"skill"')) {
    try {
      const arr = JSON.parse(str);
      if (Array.isArray(arr)) {
        return arr
          .map((o) => o?.skill)
          .map((s) => String(s || "").trim().toLowerCase())
          .filter(Boolean);
      }
    } catch {
      // fallback below
    }
  }

  return str
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeSkills(skils) {
  if (!skils) return [];
  if (Array.isArray(skils))
    return skils.map(String).map((s) => s.trim()).filter(Boolean);
  return String(skils)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseJobSkillsLower(raw) {
  return normalizeSkills(raw).map((s) => s.toLowerCase()).filter(Boolean);
}

function makeJobBlob(job) {
  return [
    job?.occupation,
    job?.specialty,
    job?.location,
    job?.skils,
    job?.description,
    job?.company?.company_name,
    job?.company?.industry,
    job?.company?.city,
    job?.workplace_type,
    job?.job_type,
  ]
    .map((x) => String(x || "").toLowerCase())
    .join(" ");
}

/** createdAt -> "4 days ago" */
function daysAgoEn(isoDate) {
  if (!isoDate) return "";
  const created = new Date(isoDate);
  const now = new Date();
  const diffMs = now - created;
  const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (Number.isNaN(d)) return "";
  if (d <= 0) return "Today";
  if (d === 1) return "1 day ago";
  return `${d} days ago`;
}

/** small helper */
function safeUrl(url) {
  if (!url) return "";
  const s = String(url).trim();
  if (!s) return "";
  return s.startsWith("http://") || s.startsWith("https://") ? s : `https://${s}`;
}

function JobCard({
  job,
  isDark,
  isMatch,
  reaction,
  onLike,
  onDislike,
  onQuickApply,
  onViewJob,
}) {
  const companyName = job?.company?.company_name || "Company";
  const workplace = job?.workplace_type || "—";
  const locationText = job?.location || job?.company?.city || "Uzbekistan";

  const skills = normalizeSkills(job?.skils);
  const salaryMin = job?.salary_min ?? 0;
  const salaryMax = job?.salary_max ?? 0;

  return (
    <div
      className={`rounded-[28px] p-5 md:p-7 border transition-all ${
        isMatch
          ? isDark
            ? "border-blue-900/60 bg-blue-900/10"
            : "border-blue-200 bg-blue-50/30"
          : isDark
          ? "bg-[#1E1E1E] border-gray-800"
          : "bg-white border-gray-100"
      }`}
    >
      {/* TOP */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-5">
        {/* LEFT */}
        <div className="flex gap-4">
          <div className="shrink-0">
            <div
              className={`w-16 h-16 rounded-full overflow-hidden shadow-md ring-2 ${
                isDark ? "ring-gray-700 bg-[#252525]" : "ring-gray-200 bg-white"
              }`}
            >
              <img
                src={job?.company?.profileimg_url || nonImg}
                alt={companyName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = nonImg;
                }}
              />
            </div>
          </div>

          <div className="min-w-0">
            <h3
              className={`text-lg md:text-xl font-extrabold ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {companyName}
            </h3>

            <p
              className={`text-sm font-semibold ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {job?.company?.industry || "Computer Software"}
            </p>

            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className="text-yellow-500 text-sm">
                  ★
                </span>
              ))}
              <span
                className={`${isDark ? "text-gray-700" : "text-gray-200"} text-sm`}
              >
                ★
              </span>
              <span
                className={`${
                  isDark ? "text-gray-400" : "text-gray-500"
                } text-xs font-bold ml-1`}
              >
                (4.0)
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col md:items-end gap-2">
          <div
            className={`flex items-center gap-2 font-bold text-sm ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <FaCity className="text-blue-400" />
            <span className="truncate max-w-[260px]">{locationText}</span>
          </div>

          <div
            className={`text-xs font-bold ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}
          >
            {daysAgoEn(job?.createdAt)}
          </div>

          <span
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider w-fit ${
              isDark
                ? "bg-blue-900/30 text-blue-300"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {workplace}
          </span>
        </div>
      </div>

      {/* Occupation + Salary */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <h4
          className={`text-base md:text-lg font-extrabold ${
            isDark ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {job?.occupation || "Job title"}
        </h4>

        <div
          className={`text-xl md:text-2xl font-black ${
            isDark ? "text-blue-300" : "text-slate-900"
          }`}
        >
          ${salaryMin} - {salaryMax}
        </div>
      </div>

      {/* DESCRIPTION */}
      <p
        className={`text-sm leading-relaxed mb-5 line-clamp-2 ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}
      >
        {job?.description || "No description provided..."}
      </p>

      {/* SKILLS */}
      <div className="mb-6">
        <p
          className={`font-black text-sm mb-3 ${
            isDark ? "text-gray-300" : "text-gray-800"
          }`}
        >
          Required skills:
        </p>

        <div className="flex flex-wrap gap-2">
          {normalizeSkills(job?.skils).length ? (
            skills.map((skill, idx) => (
              <span
                key={`${skill}-${idx}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                  isDark
                    ? "bg-[#252525] text-gray-300 border-gray-700"
                    : "bg-[#F1F3F6] text-gray-700 border-transparent"
                }`}
              >
                {skill}
              </span>
            ))
          ) : (
            <span
              className={`text-sm font-semibold ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Skills not provided
            </span>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div
        className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-5 border-t ${
          isDark ? "border-gray-800" : "border-gray-100"
        }`}
      >
        <div className="flex items-center gap-5">
          <button
            onClick={onLike}
            className={`transition-all ${
              reaction === "like"
                ? "text-emerald-500 scale-110"
                : "text-gray-500 hover:text-emerald-400"
            }`}
            aria-label="Like"
            type="button"
          >
            <FaThumbsUp size={22} />
          </button>

          <button
            onClick={onDislike}
            className={`transition-all ${
              reaction === "dislike"
                ? "text-rose-500 scale-110"
                : "text-gray-500 hover:text-rose-400"
            }`}
            aria-label="Dislike"
            type="button"
          >
            <FaThumbsDown size={22} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={onQuickApply}
            type="button"
            className={`flex-1 sm:flex-none px-8 py-4 rounded-2xl font-black text-sm transition-all ${
              isDark
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-[#163D5C] hover:bg-[#0f2d45]"
            } text-white`}
          >
            Quick apply
          </button>

          <Link to={`/talent/job-details/${job.id}`}>
          <button
            type="button"
            className={`flex-1 sm:flex-none px-8 py-4 border-2 rounded-2xl font-black text-sm transition-all ${
              isDark
                ? "border-gray-700 text-gray-200 hover:bg-gray-800"
                : "border-[#163D5C] text-[#163D5C] hover:bg-gray-50"
            }`}
          >
            View job post
          </button></Link>
        </div>
      </div>
    </div>
  );
}

/** ✅ Applied card = JobMatches style + ACCEPTED extra company details */
function AppliedCard({ app, isDark, onDelete, showCompanyDetails }) {
  const job = app?.job;
  const company = job?.company;

  const companyName = company?.company_name || "Company";
  const workplace = job?.workplace_type || "—";
  const locationText = job?.location || company?.city || "Uzbekistan";

  const salaryMin = job?.salary_min ?? 0;
  const salaryMax = job?.salary_max ?? 0;

  const website = safeUrl(company?.website);
  const phone = company?.phone || "";
  const industry = company?.industry || "";
  const about = company?.about_company || "";

  return (
    <div
      className={`rounded-[28px] p-5 md:p-7 border transition-all ${
        isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-100"
      }`}
    >
      {/* TOP */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-5">
        {/* LEFT */}
        <div className="flex gap-4">
          <div className="shrink-0">
            <div
              className={`w-16 h-16 rounded-full overflow-hidden shadow-md ring-2 ${
                isDark ? "ring-gray-700 bg-[#252525]" : "ring-gray-200 bg-white"
              }`}
            >
              <img
                src={company?.profileimg_url || CompImg}
                alt={companyName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = CompImg;
                }}
              />
            </div>
          </div>

          <div className="min-w-0">
            <h3
              className={`text-lg md:text-xl font-extrabold ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {companyName}
            </h3>

            <p
              className={`text-sm font-semibold ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {industry || "Company"}
            </p>

            <div className="flex items-center gap-4 mt-2 text-xs font-bold">
              <span className="flex items-center gap-1 text-gray-400">
                <FaMapMarkerAlt className="text-blue-400" /> {locationText}
              </span>

              <span
                className={`uppercase px-3 py-1 rounded-lg text-[10px] ${
                  String(app?.status || "").toLowerCase() === "accepted"
                    ? "bg-green-500/10 text-green-500"
                    : String(app?.status || "").toLowerCase() === "rejected"
                    ? "bg-red-500/10 text-red-500"
                    : isDark
                    ? "bg-blue-900/30 text-blue-400"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {app?.status || "pending"}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col md:items-end gap-2">
          <div
            className={`flex items-center gap-2 font-bold text-sm ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <FaCity className="text-blue-400" />
            <span className="truncate max-w-[260px]">{locationText}</span>
          </div>

          <div className={`text-xs font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            Applied {daysAgoEn(app?.createdAt)}
          </div>

          <span
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider w-fit ${
              isDark
                ? "bg-blue-900/30 text-blue-300"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {workplace}
          </span>
        </div>
      </div>

      {/* Occupation + Salary */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <h4 className={`text-base md:text-lg font-extrabold ${isDark ? "text-gray-100" : "text-gray-900"}`}>
          {job?.occupation || "Job title"}
        </h4>

        <div className={`text-xl md:text-2xl font-black ${isDark ? "text-blue-300" : "text-slate-900"}`}>
          ${salaryMin} - {salaryMax}
        </div>
      </div>

      {/* ✅ ACCEPTED: show more company info */}
      {showCompanyDetails && (
        <div
          className={`rounded-2xl p-4 mb-5 border ${
            isDark ? "border-gray-800 bg-[#161616]" : "border-gray-100 bg-[#F9FAFB]"
          }`}
        >
          <p className={`text-sm font-black mb-3 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
            Company details
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`flex items-center gap-2 text-sm font-bold ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              <FaBuilding className="text-blue-400" />
              <span className="truncate">{industry || "—"}</span>
            </div>

            <div className={`flex items-center gap-2 text-sm font-bold ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              <FaPhoneAlt className="text-blue-400" />
              <span className="truncate">{phone || "—"}</span>
            </div>

            <div className={`flex items-center gap-2 text-sm font-bold ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              <FaGlobe className="text-blue-400" />
              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate underline hover:opacity-80"
                >
                  {website}
                </a>
              ) : (
                <span>—</span>
              )}
            </div>

            <div className={`flex items-center gap-2 text-sm font-bold ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              <FaMapMarkerAlt className="text-blue-400" />
              <span className="truncate">{company?.city ? `${company.city}, ${company?.country || ""}` : "—"}</span>
            </div>
          </div>

          {about ? (
            <p className={`text-sm mt-3 leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"} line-clamp-3`}>
              {about}
            </p>
          ) : null}
        </div>
      )}

      {/* Cover letter */}
      <p className={`text-sm leading-relaxed mb-5 ${isDark ? "text-gray-400" : "text-gray-600"} line-clamp-2`}>
        {app?.cover_letter ? `"${app.cover_letter}"` : `"No cover letter provided."`}
      </p>

      {/* Bottom actions */}
      <div className={`pt-5 border-t flex items-center justify-between ${isDark ? "border-gray-800" : "border-gray-100"}`}>
        <div className={`text-xs font-bold ${isDark ? "text-gray-500" : "text-gray-500"}`}>
          Status: <span className="uppercase">{app?.status || "pending"}</span>
        </div>

        <button
          onClick={onDelete}
          className={`p-4 rounded-2xl transition-all ${
            isDark
              ? "bg-red-900/20 text-red-500 hover:bg-red-900/40"
              : "bg-red-50 text-red-400 hover:bg-red-100"
          }`}
          type="button"
        >
          <FaTrashAlt size={18} />
        </button>
      </div>
    </div>
  );
}

export default function JobCenter() {
  const { settings } = useTheme();
  const isDark = settings.darkMode;

  const navigate = useNavigate();
  const { getReaction, toggleLike, toggleDislike } = useJobReactions();

  const toastOptions = useMemo(
    () => ({
      duration: 2200,
      style: {
        background: isDark ? "#1E1E1E" : "#ffffff",
        color: isDark ? "#ffffff" : "#1E293B",
        border: isDark ? "1px solid #374151" : "1px solid #E5E7EB",
        fontWeight: 700,
      },
    }),
    [isDark]
  );

  const [activeTab, setActiveTab] = useState("jobs"); // "jobs" | "applied"

  // jobs
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobSearch, setJobSearch] = useState("");
  const [userSkills, setUserSkills] = useState([]);

  // applications
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        setUserSkills([]);
        setJobs([]);
        return;
      }

      const decoded = jwtDecode(token);
      const meRes = await talentApi.getById(decoded.id);

      const skills = parseTalentSkills(meRes.data?.skils);
      setUserSkills(skills);

      try {
        const matchRes = await jobApi.getMatchingJobs();
        const arr = Array.isArray(matchRes.data)
          ? matchRes.data
          : matchRes.data?.data || [];
        setJobs(arr);
      } catch {
        const jobRes = await jobApi.getAll();
        const arr = Array.isArray(jobRes.data)
          ? jobRes.data
          : jobRes.data?.data || [];
        setJobs(arr);
      }
    } catch {
      toast.error("Error fetching jobs.", toastOptions);
      setJobs([]);
      setUserSkills([]);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setAppsLoading(true);
      const res = await applicationApi.getAll();
      const allApplications = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      const token = localStorage.getItem("token");
      if (!token) {
        setApplications([]);
        return;
      }

      let userId = null;
      try {
        const decoded = jwtDecode(token);
        userId =
          decoded?.id ||
          decoded?.userId ||
          decoded?.talentId ||
          decoded?.talent_id ||
          decoded?.profileId;
      } catch {
        userId = null;
      }

      const myApps = userId
        ? allApplications.filter(
            (app) =>
              app.talentId === userId ||
              app.talent_id === userId ||
              app.applicantId === userId ||
              app.applicant_id === userId ||
              app.userId === userId ||
              app.user_id === userId ||
              app.profileId === userId
          )
        : allApplications;

      setApplications(myApps);
    } catch {
      toast.error("Error fetching applications.", toastOptions);
      setApplications([]);
    } finally {
      setAppsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredJobs = useMemo(() => {
    const q = jobSearch.trim().toLowerCase();

    return (jobs || []).filter((job) => {
      const blob = makeJobBlob(job);
      const searchOk = q ? blob.includes(q) : true;

      if (!userSkills.length) return searchOk;

      const jobSkillsLower = parseJobSkillsLower(job?.skils);
      const anyMatch = userSkills.some((s) => blob.includes(s) || jobSkillsLower.includes(s));

      return searchOk && anyMatch;
    });
  }, [jobs, jobSearch, userSkills]);

  const filteredApps = useMemo(() => {
    return (applications || []).filter((app) => {
      if (filterStatus === "all") return true;
      return String(app.status || "").toLowerCase() === filterStatus;
    });
  }, [applications, filterStatus]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      await applicationApi.delete(id);
      toast.success("Application deleted successfully.", toastOptions);
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast.error("Error deleting application.", toastOptions);
    }
  };

  const handleLike = useCallback(
    (jobId) => {
      const current = getReaction(jobId);
      toggleLike(jobId);
      toast(current === "like" ? "Removed from liked jobs" : "Added to liked jobs", toastOptions);
    },
    [getReaction, toggleLike, toastOptions]
  );

  const handleDislike = useCallback(
    (jobId) => {
      const current = getReaction(jobId);
      toggleDislike(jobId);
      toast(
        current === "dislike" ? "Removed from disliked jobs" : "Added to disliked jobs",
        toastOptions
      );
    },
    [getReaction, toggleDislike, toastOptions]
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-500 p-4 md:p-8 font-sans ${
        isDark ? "bg-[#121212] text-white" : "bg-[#F9FAFB] text-[#1E293B]"
      }`}
    >
      <Toaster position="top-right" toastOptions={toastOptions} />

      <div className="max-w-5xl mx-auto">
        {/* HEADER + TABS */}
        <div
          className={`rounded-3xl shadow-sm border transition-all duration-500 mb-8 overflow-hidden ${
            isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-100"
          }`}
        >
          <div
            className={`p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
              isDark ? "border-gray-800" : "border-gray-50"
            }`}
          >
            <h2 className={`text-xl md:text-2xl font-semibold ${isDark ? "text-blue-400" : "text-[#505151]"}`}>
              Job Alerts
            </h2>

            <div className={`flex rounded-2xl p-1 gap-1 w-fit ${isDark ? "bg-[#252525]" : "bg-[#F1F3F6]"}`}>
              <button
                onClick={() => setActiveTab("jobs")}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
                  activeTab === "jobs"
                    ? isDark
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-[#163D5C] shadow-sm"
                    : isDark
                    ? "text-gray-500 hover:text-gray-300"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                type="button"
              >
                All Jobs
              </button>

              <button
                onClick={() => setActiveTab("applied")}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
                  activeTab === "applied"
                    ? isDark
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-[#163D5C] shadow-sm"
                    : isDark
                    ? "text-gray-500 hover:text-gray-300"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                type="button"
              >
                I Applied
              </button>
            </div>
          </div>

          {/* ALL JOBS SEARCH */}
          {activeTab === "jobs" && (
            <div className="p-6">
              <div className="relative">
                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  placeholder="Search jobs..."
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl font-bold text-sm ${
                    isDark ? "bg-[#252525] text-white" : "bg-[#F9FAFB] text-slate-900"
                  } border-none outline-none`}
                />
              </div>
            </div>
          )}

          {/* I APPLIED FILTER */}
          {activeTab === "applied" && (
            <>
              <div className={`p-6 border-b flex justify-between items-center ${isDark ? "border-gray-800" : "border-gray-50"}`}>
                <h3 className={`${isDark ? "text-gray-300" : "text-gray-700"} font-bold`}>
                  Filter by Status
                </h3>

                <button
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  className={`p-2 rounded-full transition-all ${
                    isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-50 text-gray-600"
                  }`}
                  type="button"
                >
                  <FaChevronDown className={`transition-transform duration-300 ${isFilterExpanded ? "rotate-180" : ""}`} />
                </button>
              </div>

              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isFilterExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="p-6">
                  <div className={`flex flex-wrap rounded-2xl p-1 gap-1 w-fit ${isDark ? "bg-[#252525]" : "bg-[#F1F3F6]"}`}>
                    {[
                      { id: "all", label: "All", icon: <FaBriefcase /> },
                      { id: "pending", label: "Pending", icon: <FaClock /> },
                      { id: "accepted", label: "Accepted", icon: <FaFileContract /> },
                      { id: "rejected", label: "Rejected", icon: <FaUserTie /> },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setFilterStatus(tab.id)}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
                          filterStatus === tab.id
                            ? isDark
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-white text-[#163D5C] shadow-sm"
                            : isDark
                            ? "text-gray-500 hover:text-gray-300"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                        type="button"
                      >
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* CONTENT */}
        {activeTab === "jobs" ? (
          <div className="space-y-5 md:space-y-6">
            <p className={`font-bold px-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {jobsLoading ? "Loading..." : `${filteredJobs.length} jobs available`}
            </p>

            {jobsLoading ? (
              <div className="flex justify-center py-20">
                <div
                  className={`w-10 h-10 border-4 rounded-full animate-spin ${
                    isDark ? "border-gray-800 border-t-blue-500" : "border-gray-100 border-t-[#163D5C]"
                  }`}
                />
              </div>
            ) : filteredJobs.length === 0 ? (
              <div
                className={`text-center py-20 rounded-[32px] border border-dashed ${
                  isDark ? "bg-[#1E1E1E] border-gray-700 text-gray-500" : "bg-white border-gray-200 text-gray-400"
                }`}
              >
                No jobs matched your skills.
              </div>
            ) : (
              filteredJobs.map((job) => {
                const blob = makeJobBlob(job);
                const jobSkillsLower = parseJobSkillsLower(job?.skils);

                const isMatch =
                  userSkills.length > 0 &&
                  userSkills.some((s) => blob.includes(s) || jobSkillsLower.includes(s));

                const reaction = getReaction(job.id);

                return (
                  <JobCard
                    key={job.id}
                    job={job}
                    isDark={isDark}
                    isMatch={isMatch}
                    reaction={reaction}
                    onLike={() => handleLike(job.id)}
                    onDislike={() => handleDislike(job.id)}
                    onQuickApply={() => navigate(`/talent/job-post/${job.id}`)}
                    onViewJob={() => navigate(`/talent/job-details/${job.company_id}`)}
                  />
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-5 md:space-y-6">
            <p className={`font-bold px-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              {appsLoading ? "Loading..." : `${filteredApps.length} applications found`}
            </p>

            {appsLoading ? (
              <div className="flex justify-center py-20">
                <div
                  className={`w-10 h-10 border-4 rounded-full animate-spin ${
                    isDark ? "border-gray-800 border-t-blue-500" : "border-gray-100 border-t-[#163D5C]"
                  }`}
                />
              </div>
            ) : filteredApps.length === 0 ? (
              <div
                className={`text-center py-20 rounded-[32px] border border-dashed ${
                  isDark ? "bg-[#1E1E1E] border-gray-700 text-gray-500" : "bg-white border-gray-200 text-gray-400"
                }`}
              >
                No applications found for the selected filter.
              </div>
            ) : (
              filteredApps.map((app) => (
                <AppliedCard
                  key={app.id}
                  app={app}
                  isDark={isDark}
                  onDelete={() => handleDelete(app.id)}
                  showCompanyDetails={String(app?.status || "").toLowerCase() === "accepted"} // ✅ only Accepted
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
