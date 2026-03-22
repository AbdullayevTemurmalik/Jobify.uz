import React, { useEffect, useMemo, useState, useCallback } from "react";
import { jobApi, talentApi } from "../../services/api";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import { useJobReactions } from "../../Context/JobReactionsContext.jsx";
import toast, { Toaster } from "react-hot-toast";
import {
  FaSearch,
  FaChevronDown,
  FaCity,
  FaDollarSign,
  FaThumbsDown,
  FaThumbsUp,
} from "react-icons/fa";
import { useTheme } from "../../Context/ThemeContext.jsx";
import nonImg from "../../assets/img.jpg";

/** "HTML, CSS, React" -> ["HTML","CSS","React"] */
function normalizeSkills(skils) {
  if (!skils) return [];
  if (Array.isArray(skils))
    return skils
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean);
  return String(skils)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeUserSkills(rawskils) {
  const arr = Array.isArray(rawskils)
    ? rawskils
    : String(rawskils || "")
        .split(",")
        .map((s) => s.trim());

  return arr
    .map((s) => (typeof s === "string" ? s.toLowerCase() : ""))
    .filter(Boolean);
}

/** UI: "Full time" -> DB: "Full-time" */
function normalizeJobTypeFilter(uiValue) {
  if (!uiValue) return "";
  const map = { "Full time": "Full-time", "Part time": "Part-time" };
  return map[uiValue] || uiValue;
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
        {/* LEFT: logo + company */}
        <div className="flex gap-4">
          <div className="shrink-0">
            <div
              className={`w-16 h-16 rounded-full overflow-hidden shadow-md ring-2 ${
                isDark ? "ring-gray-700 bg-[#252525]" : "ring-gray-200 bg-white"
              }`}
            >
              <img
                src={job?.company?.profileimg_url || nonImg}
                alt={job?.company?.company_name || "Company"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = nonImg;
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

            {/* rating mock */}
          </div>
        </div>

        {/* RIGHT: location + time under it + workplace badge */}
        <div className="flex flex-col md:items-end gap-2">
          <div
            className={`flex items-center gap-2 font-bold text-sm ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <FaCity className="text-blue-400" />
            <span className="truncate max-w-[260px]">{locationText}</span>
          </div>

          {/* time under location */}
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

      {/* Occupation + Salary in one row with between */}
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
          {skills.length ? (
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
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function JobMatches() {
  const { settings } = useTheme();
  const isDark = settings.darkMode;

  const [allJobs, setAllJobs] = useState([]);
  const [userskils, setUserskils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  const [employmentType, setEmploymentType] = useState("");
  const [workplaceType, setWorkplaceType] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [city, setCity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { getReaction, toggleLike, toggleDislike } = useJobReactions();
  const navigate = useNavigate();

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
    [isDark],
  );

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setAllJobs([]);
          setUserskils([]);
          return;
        }

        const decoded = jwtDecode(token);

        const userRes = await talentApi.getById(decoded.id);
        const lowerUserskils = normalizeUserSkills(userRes.data?.skils);

        const jobRes = await jobApi.getAll();
        const jobs = jobRes.data || [];

        const sortedJobs = [...jobs].sort((a, b) => {
          const aMatch = lowerUserskils.some(
            (s) =>
              String(a?.specialty || "")
                .toLowerCase()
                .includes(s) ||
              String(a?.occupation || "")
                .toLowerCase()
                .includes(s),
          );
          const bMatch = lowerUserskils.some(
            (s) =>
              String(b?.specialty || "")
                .toLowerCase()
                .includes(s) ||
              String(b?.occupation || "")
                .toLowerCase()
                .includes(s),
          );
          return Number(bMatch) - Number(aMatch);
        });

        if (isMounted) {
          setUserskils(lowerUserskils);
          setAllJobs(sortedJobs);
        }
      } catch (err) {
        console.error("Xatolik:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    const typeFilter = normalizeJobTypeFilter(employmentType);

    return allJobs.filter((job) => {
      const matchType = typeFilter ? job.job_type === typeFilter : true;
      const matchWorkplace = workplaceType
        ? job.workplace_type === workplaceType
        : true;

      // YANGI MANTIQ SHU YERDA:
      let matchSalary = true;
      if (minSalary !== "") {
        const min = Number(minSalary);
        if (min === 0) {
          matchSalary = false; // Agar 0 yozilsa, hech qaysi ish ko'rinmaydi
        } else {
          matchSalary = Number(job.salary_max ?? 0) >= min;
        }
      }

      const matchCity = city
        ? String(job.location || "")
            .toLowerCase()
            .includes(city.toLowerCase())
        : true;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = q
        ? String(job.occupation || "")
            .toLowerCase()
            .includes(q) ||
          String(job.company?.company_name || "")
            .toLowerCase()
            .includes(q)
        : true;

      return (
        matchType && matchWorkplace && matchSalary && matchCity && matchSearch
      );
    });
  }, [allJobs, employmentType, workplaceType, minSalary, city, searchQuery]);
  const handleLike = useCallback(
    (jobId) => {
      const current = getReaction(jobId);
      toggleLike(jobId);
      toast(
        current === "like" ? "Removed from liked jobs" : "Added to liked jobs",
        toastOptions,
      );
    },
    [getReaction, toggleLike, toastOptions],
  );

  const handleDislike = useCallback(
    (jobId) => {
      const current = getReaction(jobId);
      toggleDislike(jobId);
      toast(
        current === "dislike"
          ? "Removed from disliked jobs"
          : "Added to disliked jobs",
        toastOptions,
      );
    },
    [getReaction, toggleDislike, toastOptions],
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-500 p-4 md:p-8 font-sans ${
        isDark ? "bg-[#121212] text-white" : "bg-[#F9FAFB] text-[#1E293B]"
      }`}
    >
      <Toaster position="top-right" toastOptions={toastOptions} />

      <div className="max-w-5xl mx-auto">
        {/* FILTER PANEL */}
        <div
          className={`rounded-3xl shadow-sm border transition-all duration-500 mb-6 overflow-hidden ${
            isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-100"
          }`}
        >
          <div
            className={`p-5 md:p-6 border-b flex justify-between items-center ${
              isDark ? "border-gray-800" : "border-gray-50"
            }`}
          >
            <h2
              className={`text-xl md:text-2xl font-semibold ${
                isDark ? "text-blue-400" : "text-[#505151]"
              }`}
            >
              Job Matches
            </h2>

            <button
              onClick={() => setIsExpanded((v) => !v)}
              className="p-2"
              type="button"
            >
              <FaChevronDown
                className={`transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-5 md:p-8 space-y-8">
              {/* Employment */}
              <div>
                <label
                  className={`block font-bold mb-3 md:mb-4 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Employment type
                </label>

                <div
                  className={`flex flex-wrap gap-2 md:gap-1 rounded-2xl p-1.5 md:p-1 ${
                    isDark ? "bg-[#252525]" : "bg-[#F1F3F6]"
                  }`}
                >
                  {["Full time", "Part time", "Contract", "Freelance"].map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() =>
                          setEmploymentType((prev) =>
                            prev === type ? "" : type,
                          )
                        }
                        type="button"
                        className={`px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-bold text-sm md:text-base transition-all flex-1 md:flex-none whitespace-nowrap
                        ${
                          employmentType === type
                            ? isDark
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-white text-[#163D5C] shadow-sm"
                            : isDark
                              ? "text-gray-500 hover:text-gray-300"
                              : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        {type}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Workplace */}
                <div>
                  <label
                    className={`block font-bold mb-3 md:mb-4 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Workplace type
                  </label>

                  <div
                    className={`flex flex-wrap md:flex-nowrap gap-2 md:gap-1 rounded-2xl p-1.5 md:p-1 ${
                      isDark ? "bg-[#252525]" : "bg-[#F1F3F6]"
                    }`}
                  >
                    {["Onsite", "Remote", "Hybrid"].map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          setWorkplaceType((prev) =>
                            prev === type ? "" : type,
                          )
                        }
                        type="button"
                        className={`px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-bold text-sm md:text-base transition-all flex-1 md:flex-none
                          ${
                            workplaceType === type
                              ? isDark
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-white text-[#163D5C] shadow-sm"
                              : isDark
                                ? "text-gray-500 hover:text-gray-300"
                                : "text-gray-400 hover:text-gray-600"
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Min salary */}
                <div>
                  <label
                    className={`block font-bold mb-3 md:mb-4 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Minimum salary
                  </label>

                  <div className="relative">
                    <FaDollarSign
                      className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                        isDark ? "text-blue-400" : "text-[#163D5C]"
                      }`}
                    />
                    <input
                      type="number"
                      className={`w-full pl-12 py-3 md:py-4 rounded-2xl font-bold text-sm md:text-base ${
                        isDark
                          ? "bg-[#252525] focus:ring-blue-900"
                          : "bg-[#F9FAFB] focus:ring-blue-100"
                      } border-none focus:ring-2 outline-none`}
                      placeholder="e.g. 500"
                      value={minSalary}
                      onChange={(e) => setMinSalary(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative mb-8 md:mb-10">
          <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            className={`w-full pl-16 pr-8 py-4 md:py-5 rounded-2xl shadow-sm text-sm md:text-base ${
              isDark
                ? "bg-[#1E1E1E] border-gray-800"
                : "bg-white border-gray-100"
            }`}
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* LIST */}
        <div className="space-y-5 md:space-y-6">
          <p
            className={`font-bold px-1 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {loading ? "Loading..." : `${filteredJobs.length} jobs available`}
          </p>

          {!loading &&
            filteredJobs.map((job) => {
              const reaction = getReaction(job.id);

              const isMatch =
                userskils.length > 0 &&
                userskils.some(
                  (s) =>
                    String(job.specialty || "")
                      .toLowerCase()
                      .includes(s) ||
                    String(job.occupation || "")
                      .toLowerCase()
                      .includes(s),
                );

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
                  onViewJob={() =>
                    navigate(`/talent/job-details/${job.company_id}`)
                  }
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}