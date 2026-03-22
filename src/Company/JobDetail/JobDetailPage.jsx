import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  jobApi,
  talentApi,
  applicationApi,
  notificationApi,
} from "../../services/api";
import {
  MdLocationOn,
  MdKeyboardArrowLeft,
  MdClose,
  MdCheck,
} from "react-icons/md";
import { HiOutlineLocationMarker, HiOutlineBriefcase, HiOutlinePhone, HiOutlineMail } from "react-icons/hi";
import { IoChevronBack, IoStarSharp } from "react-icons/io5";
import { FiEdit2, FiTrash2, FiAlertCircle, FiDownload, FiSend } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
import { useTheme } from "../../talent/Context/ThemeContext";

const SkeletonLoader = ({ isDark }) => (
  <div className="max-w-5xl mx-auto animate-pulse">
    <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
      <div className={`h-16 rounded-2xl flex-1 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
      <div className={`h-16 rounded-2xl w-full md:w-40 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
    </div>
    <div className={`rounded-[2.5rem] p-10 mb-10 ${isDark ? "bg-[#242424] border-gray-700" : "bg-white border-gray-100"} border shadow-sm`}>
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className={`w-24 h-24 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
        <div className="flex-1 space-y-4">
          <div className={`h-8 rounded w-1/3 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
          <div className={`h-6 rounded w-1/4 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className={`h-4 rounded w-full ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
        <div className={`h-4 rounded w-5/6 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
      </div>
    </div>
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div
          key={i}
          className={`h-44 border rounded-[2rem] ${isDark ? "bg-[#242424] border-gray-700" : "bg-white border-gray-100"}`}
        ></div>
      ))}
    </div>
  </div>
);

const JobDetailPageCompany = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useTheme();
  const isDark = settings?.darkMode;

  const [job, setJob] = useState(null);
  const [allTalents, setAllTalents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDetailTab, setActiveDetailTab] = useState("Matches");

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({
    title: "New Job Available!",
    message: "",
    type: "job",
  });
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    occupation: "",
    location: "",
    salary_min: "",
    salary_max: "",
    description: "",
    skils: "",
    specialty: "",
    job_type: "",
    workplace_type: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobRes, talentRes, appRes] = await Promise.all([
        jobApi.getById(id),
        talentApi.getAll(),
        applicationApi.getAll(),
      ]);

      const jobData = jobRes.data;
      setJob(jobData);
      setAllTalents(talentRes.data || []);

      const appsData = appRes.data?.data || appRes.data || [];
      const filteredApps = appsData.filter(
        (app) => Number(app.job_id) === Number(id) && app.status !== "rejected"
      );
      setApplications(filteredApps);

      setFormData({
        occupation: jobData.occupation || "",
        location: jobData.location || "",
        salary_min: jobData.salary_min || "",
        salary_max: jobData.salary_max || "",
        description: jobData.description || "",
        skils: Array.isArray(jobData.skils)
          ? jobData.skils.join(", ")
          : jobData.skils || "",
        specialty: jobData.specialty || jobData.occupation || "",
        job_type: jobData.job_type || "Full-time",
        workplace_type: jobData.workplace_type || "Remote",
      });
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await applicationApi.updateStatus(appId, { status: newStatus });
      toast.success(`Application ${newStatus}!`);
      fetchData();
    } catch (error) {
      toast.error("Statusni yangilashda xatolik");
    }
  };

  const openInviteModal = (talent) => {
    setSelectedTalent(talent);
    setInviteData({
      ...inviteData,
      message: `A new ${job.occupation} position matches your skills at ${job.company?.company_name || "our company"}.`,
    });
    setIsInviteModalOpen(true);
  };

  const handleConfirmInvitation = async () => {
    const loadingToast = toast.loading("Taklif yuborilmoqda...");
    try {
      await notificationApi.send({
        talent_id: Number(selectedTalent.id),
        title: String(inviteData.title),
        message: String(inviteData.message),
        type: "job",
      });

      const data = new FormData();
      data.append("job_id", Number(id));
      data.append("talent_id", Number(selectedTalent.id));
      data.append("status", "pending");

      await applicationApi.apply(data);

      toast.success("Taklif muvaffaqiyatli yuborildi!", { id: loadingToast });
      setIsInviteModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Xato tafsiloti:", err.response?.data || err);
      const errorMsg =
        err.response?.data?.message || "Yuborishda xatolik yuz berdi";
      toast.error(errorMsg, { id: loadingToast });
    }
  };

  const handleDeleteJob = async () => {
    try {
      await jobApi.delete(id);
      toast.success("E'lon muvaffaqiyatli o'chirildi");
      navigate("/company/my-jobs");
    } catch (error) {
      toast.error("O'chirishda xatolik yuz berdi");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    const updatePromise = jobApi.update(id, {
      ...formData,
      company_id: job.company_id,
      salary_min: Number(formData.salary_min),
      salary_max: Number(formData.salary_max),
    });

    toast.promise(updatePromise, {
      loading: "Yangilanmoqda...",
      success: "Ish muvaffaqiyatli yangilandi! 🎉",
      error: (err) =>
        `Xatolik: ${err.response?.data?.message || "Saqlab bo'lmadi"}`,
    });

    try {
      await updatePromise;
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getInitials = (firstName, lastName) => {
    const f = firstName ? firstName.charAt(0).toUpperCase() : "";
    const l = lastName ? lastName.charAt(0).toUpperCase() : "";
    return f + l || "?";
  };

  const parseTalentSkills = (skillsStr) => {
    try {
      if (!skillsStr) return [];
      const parsed =
        typeof skillsStr === "string" ? JSON.parse(skillsStr) : skillsStr;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  const getJobSkills = () => {
    if (!job?.skils) return [];
    if (typeof job.skils === "string") {
      return job.skils
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");
    }
    return Array.isArray(job.skils) ? job.skils : [];
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price || 0);
  };

  const matchedTalents = allTalents.filter((talent) => {
    if (!job || !job.skils) return false;
    const isAlreadyApplied = applications.some(
      (app) => Number(app.talent_id) === Number(talent.id)
    );
    if (isAlreadyApplied) return false;
    const jobSkillsArr = getJobSkills().map((s) => s.toLowerCase());
    const talentSkills = parseTalentSkills(talent.skils);
    return talentSkills.some((t) =>
      jobSkillsArr.includes(t.skill?.toLowerCase())
    );
  });

  if (loading)
    return (
      <div className={`w-full min-h-screen p-8 ${isDark ? "bg-[#121212]" : "bg-[#F8F9FA]"}`}>
        <SkeletonLoader isDark={isDark} />
      </div>
    );
  if (!job)
    return (
      <div className={`p-10 text-center text-red-500 ${isDark ? "bg-[#1a1a1a]" : ""}`}>
        Job not found
      </div>
    );

  return (
    <div className={`w-full min-h-screen p-3 sm:p-6 md:p-8 text-left font-sans transition-colors duration-300 ${isDark ? "bg-[#121212] text-white" : "bg-[#F8F9FA] text-gray-800"}`}>
      <Toaster position="top-center" />

      <div className="max-w-5xl mx-auto relative">

        {/* --- DELETE MODAL --- */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl ${isDark ? "bg-[#242424]" : "bg-white"}`}>
              <div className="text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-red-900/20" : "bg-red-50"}`}>
                  <FiAlertCircle size={40} className="text-red-500" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>
                  Ishonchingiz komilmi?
                </h2>
                <p className="text-gray-500 mb-6">
                  Bu e'lonni butunlay o'chirib tashlaysizmi?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className={`flex-1 py-3.5 font-bold rounded-2xl ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"}`}
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleDeleteJob}
                    className="flex-1 py-3.5 bg-red-500 text-white font-bold rounded-2xl"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- INVITE MODAL --- */}
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative ${isDark ? "bg-[#242424]" : "bg-white"}`}>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100/10 rounded-full"
              >
                <MdClose size={24} />
              </button>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <FiSend size={28} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                    Taklif yuborish
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Nomzod: {selectedTalent?.first_name} {selectedTalent?.last_name}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Sarlavha</label>
                  <input
                    type="text"
                    value={inviteData.title}
                    onChange={(e) => setInviteData({ ...inviteData, title: e.target.value })}
                    className={`w-full mt-1 px-5 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border ${isDark ? "bg-[#1a1a1a] border-gray-700 text-white" : "bg-gray-50 border-gray-100"}`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Xabar</label>
                  <textarea
                    rows="4"
                    value={inviteData.message}
                    onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
                    className={`w-full mt-1 px-5 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 resize-none border ${isDark ? "bg-[#1a1a1a] border-gray-700 text-white" : "bg-gray-50 border-gray-100"}`}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsInviteModalOpen(false)}
                    className={`flex-1 py-4 font-bold rounded-2xl ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleConfirmInvitation}
                    className="flex-1 py-4 bg-[#1D3D54] text-white font-bold rounded-2xl shadow-lg"
                  >
                    Yuborish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- EDIT MODAL --- */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`w-full max-w-2xl rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left ${isDark ? "bg-[#242424]" : "bg-white"}`}>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100/10 rounded-full"
              >
                <MdClose size={28} />
              </button>
              <h2 className={`text-2xl font-bold mb-8 ${isDark ? "text-white" : "text-[#343C44]"}`}>
                Edit Job Position
              </h2>
              <form onSubmit={handleUpdateJob} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: "Occupation", name: "occupation", type: "text" },
                  { label: "Location", name: "location", type: "text" },
                  { label: "Salary Min ($)", name: "salary_min", type: "number" },
                  { label: "Salary Max ($)", name: "salary_max", type: "number" },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col gap-2">
                    <label className={`text-sm font-bold ${isDark ? "text-gray-400" : "text-[#343C44]"}`}>
                      {field.label}
                    </label>
                    <input
                      name={field.name}
                      type={field.type}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border ${isDark ? "bg-[#1a1a1a] border-gray-700 text-white focus:border-[#5CB85C]" : "bg-[#F8F9FA] border-gray-100 text-gray-800"}`}
                      required={field.name === "occupation"}
                    />
                  </div>
                ))}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className={`text-sm font-bold ${isDark ? "text-gray-400" : "text-[#343C44]"}`}>
                    Skills (comma separated)
                  </label>
                  <input
                    name="skils"
                    value={formData.skils}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border ${isDark ? "bg-[#1a1a1a] border-gray-700 text-white" : "bg-[#F8F9FA] border-gray-100"}`}
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className={`text-sm font-bold ${isDark ? "text-gray-400" : "text-[#343C44]"}`}>
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border resize-none ${isDark ? "bg-[#1a1a1a] border-gray-700 text-white" : "bg-[#F8F9FA] border-gray-100"}`}
                  />
                </div>
                <button
                  type="submit"
                  className="md:col-span-2 w-full mt-4 py-4 bg-[#5CB85C] text-white font-bold rounded-2xl hover:bg-[#4cae4c] transition-colors"
                >
                  Update Job Details
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 mt-2 md:mt-0 w-full">
          <div className={`px-6 sm:px-8 py-4 rounded-2xl shadow-sm border flex-1 w-full text-center md:text-left ${isDark ? "bg-[#242424] border-gray-700" : "bg-white border-gray-100"}`}>
            <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-[#4B5563]"}`}>
              Job Details
            </h1>
          </div>
          <button
            onClick={() => navigate("/company/post-job")}
            className="bg-[#5CB85C] hover:bg-[#4cae4c] text-white w-full md:w-auto px-10 py-4 rounded-2xl font-bold transition-all"
          >
            Post a Job
          </button>
        </div>

        {/* --- JOB HEADER CARD --- */}
        <div className={`rounded-[2.5rem] p-6 sm:p-10 shadow-sm border mb-10 relative transition-colors ${isDark ? "bg-[#242424] border-gray-700" : "bg-white border-gray-100"}`}>
          <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-8 mb-8 lg:pr-12">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
              <div className="w-24 h-24 shrink-0 rounded-full bg-[#00A7AC] flex items-center justify-center text-white text-4xl font-bold overflow-hidden border-4 border-gray-50/10 shadow-sm">
                {job.company?.profileimg_url ? (
                  <img src={job.company.profileimg_url} className="w-full h-full object-cover" alt="logo" />
                ) : (
                  job.occupation?.charAt(0) || "J"
                )}
              </div>
              <div className="max-w-md">
                <h2 className={`text-2xl sm:text-3xl font-bold leading-tight ${isDark ? "text-white" : "text-[#343C44]"}`}>
                  {job.occupation}
                </h2>
                <p className={`font-[600] text-[22px] mt-1 ${isDark ? "text-gray-400" : "text-[#8E8E8E]"}`}>
                  {job.company?.company_name || "Company"}
                </p>
                <div className={`flex items-center justify-center md:justify-start gap-1 mt-2 text-base sm:text-lg font-medium ${isDark ? "text-gray-500" : "text-[#a7a6a6]"}`}>
                  <MdLocationOn className="shrink-0" />
                  <span>{job.location} ({job.workplace_type || "Remote"})</span>
                </div>
              </div>
            </div>
            <div className={`text-center lg:text-right w-full lg:w-auto border-t lg:border-none pt-6 lg:pt-0 mt-2 lg:mt-0 ${isDark ? "border-gray-700" : "border-gray-100"}`}>
              <p className={`text-base sm:text-[18px] font-[600] mb-1 ${isDark ? "text-gray-500" : "text-[#8E8E8E]"}`}>
                {job.createdAt
                  ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })
                  : "Recently"}
              </p>
              <p className={`text-2xl sm:text-[28px] font-bold whitespace-nowrap ${isDark ? "text-[#5CB85C]" : "text-[#4B5563]"}`}>
                ${job.salary_min?.toLocaleString()}{" "}
                {job.salary_max ? `- $${job.salary_max.toLocaleString()}` : ""}
              </p>
            </div>
          </div>
          <p className={`text-base sm:text-lg leading-relaxed mb-8 text-center md:text-left ${isDark ? "text-gray-300" : "text-[#343C44]"}`}>
            {job.description}
          </p>
          <div className={`pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-6 ${isDark ? "border-gray-700" : "border-gray-50"}`}>
            <div className="w-full">
              <h4 className={`font-bold mb-4 uppercase text-xs sm:text-sm tracking-widest text-center md:text-left ${isDark ? "text-gray-500" : "text-[#343C44]"}`}>
                Required skills
              </h4>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3">
                {getJobSkills().map((skill, index) => (
                  <span
                    key={index}
                    className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl font-semibold border text-sm sm:text-base ${isDark ? "bg-[#1a1a1a] border-gray-700 text-gray-300" : "bg-[#F3F4F6] border-gray-100 text-[#4B5563]"}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className={`p-4 rounded-2xl transition-all border ${isDark ? "bg-[#1a1a1a] border-gray-700 text-gray-500 hover:text-[#5CB85C]" : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-[#73dd73] hover:text-white"}`}
              >
                <FiEdit2 size={22} />
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className={`p-4 rounded-2xl transition-all border ${isDark ? "bg-[#1a1a1a] border-red-900/30 text-red-900/50 hover:text-red-500" : "bg-red-50 border-red-100 text-red-500 hover:bg-red-500 hover:text-white"}`}
              >
                <FiTrash2 size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* --- BACK BUTTON --- */}
        <button
          onClick={() => navigate("/company/my-jobs")}
          className={`group flex items-center justify-center gap-3 font-bold mb-10 w-full sm:w-[240px] h-[60px] border-2 rounded-2xl shadow-sm transition-all duration-300 ${isDark ? "border-white text-white hover:bg-white hover:text-black" : "border-[#1D3D54] text-[#1D3D54] hover:bg-[#1D3D54] hover:text-white"}`}
        >
          <MdKeyboardArrowLeft size={28} className="transition-transform duration-300 group-hover:-translate-x-2" />
          <span className="text-[18px]">Back to My jobs</span>
        </button>

        {/* --- TABS --- */}
        <div className={`flex p-1.5 rounded-[1.5rem] w-full relative mb-10 overflow-hidden ${isDark ? "bg-[#242424]" : "bg-[#E9E9E9]"}`}>
          <div
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-[1.2rem] shadow-sm transition-all duration-300 ${activeDetailTab === "Matches" ? "left-1.5" : "left-[calc(50%+3px)]"} ${isDark ? "bg-[#333]" : "bg-white"}`}
          />
          <button
            onClick={() => setActiveDetailTab("Matches")}
            className={`flex-1 py-3.5 z-10 font-bold text-xs sm:text-sm transition-colors ${activeDetailTab === "Matches" ? (isDark ? "text-white" : "text-[#343C44]") : "text-[#8E8E8E]"}`}
          >
            All Matches
          </button>
          <button
            onClick={() => setActiveDetailTab("Invitations")}
            className={`flex-1 py-3.5 z-10 font-bold text-xs sm:text-sm transition-colors ${activeDetailTab === "Invitations" ? (isDark ? "text-white" : "text-[#343C44]") : "text-[#8E8E8E]"}`}
          >
            Invitations sent
          </button>
        </div>

        {/* --- CARDLAR RO'YXATI --- */}
        <div className="pb-20">
          <div className="mb-6 flex items-baseline justify-center md:justify-start gap-2">
            <span className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-[#343C44]"}`}>
              {activeDetailTab === "Matches" ? matchedTalents.length : applications.length}
            </span>
            <span className={`text-xl sm:text-2xl font-bold ${isDark ? "text-gray-500" : "text-[#343C44]"}`}>
              candidates
            </span>
          </div>

          <div className="grid grid-cols-1 min-[1350px]:grid-cols-2 gap-6 sm:gap-8 w-full">
            {(activeDetailTab === "Matches" ? matchedTalents : applications).map((item) => {
              const talent = activeDetailTab === "Matches" ? item : item.talent || {};
              const appId = item.id;
              const status = item.status || "pending";
              const resumeUrl = item.resume_url || talent?.resume;
              const uniqueKey =
                activeDetailTab === "Matches" ? `match-${talent.id}` : `app-${appId}`;

              return (
                talent && (
                  <div
                    key={uniqueKey}
                    className={`border rounded-[2rem] shadow-sm p-6 sm:p-7 flex flex-col justify-between hover:shadow-md transition-all min-h-[400px] ${isDark ? "bg-[#242424] border-gray-700" : "bg-white border-gray-100"}`}
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-5 mb-5 w-full">
                      <div className="flex flex-col lg:flex-row items-center gap-4 flex-1 w-full min-w-0">
                        <div className={`w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-full flex items-center justify-center overflow-hidden border ${isDark ? "bg-[#1a1a1a] border-gray-700" : "bg-[#F3F4F6] border-gray-100"}`}>
                          {talent.image ? (
                            <img src={talent.image} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <span className="text-2xl font-bold text-gray-400">
                              {getInitials(talent.first_name, talent.last_name)}
                            </span>
                          )}
                        </div>
                        <div className="w-full min-w-0 text-center lg:text-left">
                          <h2 className={`text-[20px] sm:text-[24px] font-bold leading-tight mb-1 ${isDark ? "text-white" : "text-[#3a3a3a]"}`}>
                            {talent.specialty || "Specialist"}
                          </h2>
                          <p className="text-gray-500 text-[16px] sm:text-[18px] font-medium">
                            {talent.first_name} {talent.last_name}
                          </p>
                        </div>
                      </div>
                      <div className={`shrink-0 w-full lg:w-auto border-t lg:border-none pt-4 lg:pt-0 text-center lg:text-right ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                        <div className={`text-[22px] sm:text-[26px] font-bold leading-tight ${isDark ? "text-[#5CB85C]" : "text-[#1D3D54]"}`}>
                          {formatPrice(talent.minimum_salary)}
                        </div>
                        <div className="flex items-center justify-center lg:justify-end gap-1 text-gray-400 text-[13px] font-bold uppercase mt-2">
                          <HiOutlineLocationMarker size={16} className="text-[#00A7AC]" />
                          <span className="whitespace-nowrap">{talent.city || "UZB"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 my-6">
                      <h4 className="text-[12px] text-gray-400 font-bold uppercase tracking-wider mb-3 text-center lg:text-left">
                        Candidate Skills:
                      </h4>
                      <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                        {parseTalentSkills(talent.skils).slice(0, 6).map((s, i) => (
                          <span
                            key={i}
                            className={`px-4 py-1.5 text-[13px] font-semibold rounded-xl border ${isDark ? "bg-[#1a1a1a] border-gray-700 text-gray-400" : "bg-[#f8fafc] border-gray-100 text-[#64748b]"}`}
                          >
                            {s.skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* --- TUGMALAR --- */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-auto items-center justify-center w-full">
                      <button
                        onClick={() => navigate(`/company/talents/${talent.id}`)}
                        className={`flex-1 w-full py-3 px-4 border-2 rounded-2xl font-bold transition-all duration-300 shadow-sm text-sm sm:text-base ${isDark ? "border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white" : "border-[#1D3D54] text-[#1D3D54] hover:bg-[#1D3D54] hover:text-white"}`}
                      >
                        View Profile
                      </button>

                      {activeDetailTab === "Matches" ? (
                        <button
                          onClick={() => openInviteModal(talent)}
                          className={`flex-1 w-full py-3 px-4 rounded-2xl font-bold transition-all shadow-md active:scale-95 text-sm sm:text-base flex items-center justify-center gap-2 ${isDark ? "bg-white text-black hover:bg-gray-200" : "bg-[#1D3D54] text-white hover:bg-[#2c5a7a]"}`}
                        >
                          <FiSend size={16} /> Send Invitation
                        </button>
                      ) : (
                        <div className="flex-1 w-full flex items-center justify-center gap-3">
                          {status === "pending" ? (
                            <>
                              {resumeUrl && (
                                <a
                                  href={resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex-1 h-[52px] flex items-center justify-center gap-2 rounded-2xl font-bold transition-all border shadow-sm text-sm ${isDark ? "bg-blue-900/20 text-blue-400 border-blue-900/30 hover:bg-blue-500 hover:text-white" : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white"}`}
                                >
                                  <FiDownload size={18} /> CV
                                </a>
                              )}
                              <button
                                onClick={() => handleStatusUpdate(appId, "accepted")}
                                className={`h-12 w-12 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border group ${isDark ? "bg-emerald-900/20 text-emerald-500 border-emerald-900/30 hover:bg-emerald-500 hover:text-white" : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-500 hover:text-white"}`}
                              >
                                <MdCheck size={28} className="group-hover:scale-110 transition-transform" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(appId, "rejected")}
                                className={`h-12 w-12 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border group ${isDark ? "bg-rose-900/20 text-rose-500 border-rose-900/30 hover:bg-rose-500 hover:text-white" : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-500 hover:text-white"}`}
                              >
                                <MdClose size={28} className="group-hover:scale-110 transition-transform" />
                              </button>
                            </>
                          ) : (
                            <div
                              className={`flex-1 py-3 text-center rounded-2xl font-bold uppercase text-xs tracking-widest border-2 ${status === "accepted" ? "border-emerald-500 bg-emerald-50/10 text-emerald-500" : "border-rose-500 bg-rose-50/10 text-rose-500"}`}
                            >
                              {status}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              );
            })}

            {/* --- BO'SH HOLAT --- */}
            {activeDetailTab === "Invitations" && applications.length === 0 && (
              <div className={`col-span-full text-center py-20 rounded-[2rem] border border-dashed ${isDark ? "bg-[#1a1a1a] border-gray-700 text-gray-600" : "bg-white border-gray-200 text-gray-400"}`}>
                Hech qanday taklif yuborilmagan.
              </div>
            )}
            {activeDetailTab === "Matches" && matchedTalents.length === 0 && (
              <div className={`col-span-full text-center py-20 rounded-[2rem] border border-dashed ${isDark ? "bg-[#1a1a1a] border-gray-700 text-gray-600" : "bg-white border-gray-200 text-gray-400"}`}>
                Mos nomzodlar topilmadi.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPageCompany;