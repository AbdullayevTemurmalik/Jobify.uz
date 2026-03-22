import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jobApi, applicationApi } from "../../services/api";
import { jwtDecode } from "jwt-decode";
import {
  FaChevronLeft,
  FaCloudUploadAlt,
  FaFileAlt,
  FaTrashAlt,
  FaMapMarkerAlt,
  FaRegClock,
  FaThumbsDown,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useTheme } from "../../Context/ThemeContext.jsx";
import nonImg from "../../assets/img.jpg";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useTheme();
  const isDark = settings.darkMode;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        const res = await jobApi.getById(id);
        setJob(res.data);
      } catch (err) {
        toast.error("Error fetching job details.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobData();
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleApply = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please sign in to apply for jobs.");

    if (!selectedFile) {
      return toast.error("Please upload your resume file.");
    }

    try {
      setIsSubmitting(true);
      const decoded = jwtDecode(token);

      const formData = new FormData();
      formData.append("job_id", parseInt(id));
      formData.append("talent_id", parseInt(decoded.id));
      formData.append("cover_letter", message);
      formData.append("resume", selectedFile);

      const response = await applicationApi.apply(formData);

      if (response.data) {
        toast.success("Application submitted successfully!");
        navigate("/talent/matches");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Error submitting application."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-[#121212] text-white" : "bg-[#F9FAFB] text-gray-500"
        }`}
      >
        <div
          className={`w-10 h-10 border-4 rounded-full animate-spin ${
            isDark
              ? "border-gray-800 border-t-blue-500"
              : "border-gray-100 border-t-[#163D5C]"
          }`}
        ></div>
      </div>
    );

  if (!job) return <div className="text-center py-20">Job not found</div>;

  return (
    <div
      className={`min-h-screen transition-colors duration-500 p-4 md:p-8 font-sans ${
        isDark ? "bg-[#121212] text-white" : "bg-[#F9FAFB] text-[#1E293B]"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 font-bold mb-6 transition-colors ${
            isDark
              ? "text-blue-400 hover:text-blue-300"
              : "text-[#163D5C] hover:text-blue-700"
          }`}
        >
          <FaChevronLeft /> Back to matches
        </button>

        <div
          className={`rounded-[32px] p-8 border transition-all duration-500 mb-6 shadow-sm ${
            isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-100"
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div className="flex gap-5">
              {/* ✅ UPDATED LOGO (DUMALOQ + PREMIUM) */}
              <div className="relative group shrink-0">
                <div
                  className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300
                    ${
                      isDark
                        ? "bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border border-gray-700 shadow-lg shadow-black/40"
                        : "bg-white border border-gray-200 shadow-md"
                    }
                    group-hover:scale-105 group-hover:shadow-xl`}
                >
                  {job.company?.profileimg_url ? (
                    <img
                      src={job.company.profileimg_url}
                      alt="logo"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <span className="text-lg font-bold text-blue-500">
                      {job.company?.company_name?.charAt(0) || "C"}
                    </span>
                  )}
                </div>

                {/* subtle ring */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 ring-2 ring-blue-400/30"></div>
              </div>

              <div>
                <h1
                  className={`text-2xl font-black ${
                    isDark ? "text-gray-100" : "text-slate-800"
                  }`}
                >
                  {job.occupation}
                </h1>
                <p className="text-gray-500 font-bold">
                  {job.company?.company_name || "Company Name"}
                </p>
                <div className="flex items-center gap-4 mt-2 text-gray-400 text-xs font-bold">
                  <span className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-blue-400" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaRegClock /> 4 days ago
                  </span>
                </div>
              </div>
            </div>

            {/* ✅ SALARY MIN + MAX */}
            <div className="md:text-right">
              <span
                className={`text-2xl font-black ${
                  isDark ? "text-blue-400" : "text-slate-800"
                }`}
              >
                {job.salary_min === job.salary_max
                  ? `$${job.salary_min?.toLocaleString()}`
                  : `$${job.salary_min?.toLocaleString()} – $${job.salary_max?.toLocaleString()}`}
              </span>
            </div>
          </div>

          <p
            className={`text-sm leading-relaxed ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {job.description}
          </p>
        </div>

        <div
          className={`rounded-[32px] p-8 md:p-10 border transition-all duration-500 shadow-sm ${
            isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-100"
          }`}
        >
          <div
            className={`relative border-2 border-dashed rounded-[28px] p-12 text-center transition-all ${
              isDark
                ? "border-gray-700 bg-[#252525] hover:border-blue-500 hover:bg-[#2a2a2a]"
                : "border-gray-200 hover:border-blue-400"
            }`}
          >
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.doc,.docx"
            />
            <FaCloudUploadAlt
              className={`mx-auto text-5xl mb-4 ${
                isDark ? "text-blue-500" : "text-[#163D5C]"
              }`}
            />
            <p
              className={`font-bold ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Drag and drop or{" "}
              <span className="text-blue-500 underline">Browse</span> resume file
            </p>
          </div>

          {selectedFile && (
            <div
              className={`flex items-center justify-between p-4 rounded-2xl mt-6 border ${
                isDark
                  ? "bg-[#252525] border-gray-700"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <FaFileAlt
                  className={isDark ? "text-blue-400" : "text-[#163D5C]"}
                />
                <div className="truncate max-w-[200px]">
                  <p
                    className={`text-xs font-bold truncate ${
                      isDark ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    {selectedFile.name}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className={`p-2 rounded-xl transition-colors ${
                  isDark
                    ? "bg-red-900/20 text-red-500 hover:bg-red-900/40"
                    : "bg-red-50 text-red-400 hover:bg-red-100"
                }`}
              >
                <FaTrashAlt size={14} />
              </button>
            </div>
          )}

          <textarea
            className={`w-full mt-8 p-6 border-none rounded-[24px] outline-none min-h-[150px] transition-all ${
              isDark
                ? "bg-[#252525] text-white placeholder:text-gray-600 focus:ring-1 focus:ring-gray-700"
                : "bg-[#F9FAFB] placeholder:text-gray-300"
            }`}
            placeholder="Say something to the employer..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>

          <div className="flex items-center justify-between mt-8">
            <button className="text-gray-400 hover:text-red-400 transition-colors">
              <FaThumbsDown size={24} />
            </button>
            <button
              onClick={handleApply}
              disabled={isSubmitting}
              className={`px-16 md:px-24 py-4 rounded-2xl text-white font-black text-lg shadow-lg transition-all ${
                isSubmitting
                  ? "bg-gray-600 cursor-not-allowed"
                  : isDark
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-[#52D394] hover:bg-[#46b881]"
              }`}
            >
              {isSubmitting ? "Sending..." : "Apply Now"}
            </button>
            <div className="w-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
