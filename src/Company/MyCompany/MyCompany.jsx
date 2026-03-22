import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { Pencil, X, Camera, ChevronDown } from "lucide-react";
import { companyApi, jobApi, applicationApi } from "../../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Country, City } from "country-state-city";
import { useTheme } from "../../talent/Context/ThemeContext";
import { Link } from "react-router-dom";

export const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Other",
];

// --- SKELETON KOMPONENTI (DARK MODE MOSLASHTIRILDI) ---
const CompanySkeleton = ({ isDark }) => (
  <div
    className={`p-4 pb-20 sm:p-6 lg:p-8 ${isDark ? "bg-[#121212]" : "bg-[#F9FAFB]"} min-h-screen animate-pulse`}
  >
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 md:mt-0">
        <div
          className={`h-16 ${isDark ? "bg-[#1E1E1E]" : "bg-white"} rounded-2xl w-full md:flex-1 shadow-sm`}
        ></div>
        <div
          className={`h-16 ${isDark ? "bg-[#2D2D2D]" : "bg-gray-200"} rounded-2xl w-full md:w-48 shadow-md`}
        ></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[380px_1fr] gap-8">
        <div
          className={`${isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-50"} rounded-[2rem] p-6 sm:p-8 shadow-sm h-fit border`}
        >
          <div className="flex flex-col items-center mb-8">
            <div
              className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-200"} mb-4`}
            ></div>
            <div
              className={`h-6 ${isDark ? "bg-gray-700" : "bg-gray-200"} rounded w-3/4 mb-2`}
            ></div>
            <div
              className={`h-4 ${isDark ? "bg-gray-800" : "bg-gray-100"} rounded w-1/2`}
            ></div>
          </div>
          <div
            className={`space-y-4 pt-4 border-t ${isDark ? "border-gray-800" : "border-gray-50"}`}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex justify-between">
                <div
                  className={`h-5 ${isDark ? "bg-gray-800" : "bg-gray-100"} rounded w-1/4`}
                ></div>
                <div
                  className={`h-4 ${isDark ? "bg-gray-700" : "bg-gray-200"} rounded w-1/2`}
                ></div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-8">
          <div
            className={`h-48 ${isDark ? "bg-[#2D2D2D]" : "bg-gray-300"} rounded-[2rem] shadow-xl`}
          ></div>
          <div
            className={`${isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-100"} h-96 rounded-[2rem] p-6 md:p-10 shadow-sm border`}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

const MyCompany = () => {
  const { settings } = useTheme();
  const isDark = settings?.darkMode;

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState({ active: 0, posted: 0, hired: 0 });
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const allCountries = Country.getAllCountries();
  const [availableCities, setAvailableCities] = useState([]);

  const defaultAvatar =
    "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=";

  useEffect(() => {
    fetchData();
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (formData.country) {
      const selectedCountry = allCountries.find(
        (c) => c.name === formData.country,
      );
      if (selectedCountry) {
        const cities = City.getCitiesOfCountry(selectedCountry.isoCode);
        setAvailableCities(cities.map((city) => city.name));
      }
    } else {
      setAvailableCities([]);
    }
  }, [formData.country]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return setLoading(false);
      const decoded = jwtDecode(token);
      const companyId = String(decoded.id);

      let profileData = null;
      try {
        const res = await companyApi.getProfile();
        profileData = res.data?.data || res.data;
      } catch (e) {
        const resById = await companyApi.getById(companyId);
        profileData = resById.data?.data || resById.data;
      }

      if (profileData) {
        setCompany(profileData);
        setFormData({ ...profileData });
      }

      const [jobsRes, appsRes] = await Promise.allSettled([
        jobApi.getAll(),
        applicationApi.getAll(),
      ]);

      const jobsData = jobsRes.status === "fulfilled" ? (jobsRes.value.data?.data || jobsRes.value.data || []) : [];
      const appsData = appsRes.status === "fulfilled" ? (appsRes.value.data?.data || appsRes.value.data || []) : [];

      if (Array.isArray(jobsData)) {
        const myJobs = jobsData.filter(
          (job) => String(job.company_id) === companyId
        );
        
        const myJobIds = myJobs.map(j => String(j.id));
        const hiredCount = Array.isArray(appsData) 
          ? appsData.filter(app => myJobIds.includes(String(app.job_id)) && (app.status === "accepted" || app.status === "hired")).length 
          : 0;

        setStats({
          posted: myJobs.length,
          active: myJobs.filter((j) => j.is_activate || j.is_active).length,
          hired: hiredCount,
        });
      }
    } catch (error) {
      toast.error("Failed to load company data");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (digits.length === 0) {
      setFormData((prev) => ({ ...prev, phone: "" }));
      return;
    }
    let mainDigits = digits.startsWith("998") ? digits.slice(3) : digits;
    mainDigits = mainDigits.substring(0, 9);
    let formatted = "+998 ";
    if (mainDigits.length > 0) formatted += "(" + mainDigits.substring(0, 2);
    if (mainDigits.length >= 2) formatted += ") " + mainDigits.substring(2, 5);
    if (mainDigits.length >= 5) formatted += "-" + mainDigits.substring(5, 7);
    if (mainDigits.length >= 7) formatted += "-" + mainDigits.substring(7, 9);
    setFormData((prev) => ({ ...prev, phone: formatted.trim() }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.warn("Image size must be less than 2MB");
      return;
    }
    const toastId = toast.loading("Uploading logo...");
    try {
      const imgData = new FormData();
      imgData.append("profileimg", file);
      const response = await companyApi.update(
        company?.id || formData?.id,
        imgData,
      );
      if (response.status === 200 || response.data) {
        const newImgUrl =
          response.data.profileimg_url || URL.createObjectURL(file);
        setImagePreview(newImgUrl);
        const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
        userInfo.profileimg_url = newImgUrl;
        localStorage.setItem("user_info", JSON.stringify(userInfo));
        window.dispatchEvent(new Event("userInfoUpdated"));
        toast.update(toastId, {
          render: "Logo updated successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        fetchData();
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Failed to upload image",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.country || !formData.industry) {
      toast.error("Please fill in all required fields!");
      return;
    }
    const loadingToast = toast.loading("Saving changes...");
    try {
      const { created_at, profileimg_file, profileimg_url, ...updateData } =
        formData;
      const response = await companyApi.update(
        company?.id || formData?.id,
        updateData,
      );
      if (response.status === 200 || response.data) {
        setIsModalOpen(false);
        localStorage.setItem("user_info", JSON.stringify(formData));
        window.dispatchEvent(new Event("userInfoUpdated"));
        fetchData();
        toast.update(loadingToast, {
          render: "Profile updated successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.update(loadingToast, {
        render: "An error occurred while saving",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  if (loading) return <CompanySkeleton isDark={isDark} />;

  return (
    <div
      className={`p-4 pb-20 sm:p-6 lg:p-8 min-h-screen font-sans transition-colors duration-300 ${isDark ? "bg-[#121212]" : "bg-[#F9FAFB]"}`}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={isDark ? "dark" : "colored"}
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 mt-4 md:mt-0">
          <h1
            className={`text-xl sm:text-2xl font-bold px-6 py-4 rounded-2xl shadow-sm w-full md:flex-1 text-center md:text-left border transition-colors ${isDark ? "bg-[#1E1E1E] text-white border-gray-800" : "bg-white text-[#4B5563] border-gray-100"}`}
          >
            Company profile
          </h1>
          <Link
            to="/company/post-job"
            className="bg-[#5CB85C] text-center hover:bg-[#4cae4c] text-white w-full md:w-auto px-10 py-4 rounded-2xl font-bold shadow-md active:scale-95 transition-all"
          >
            Post a Job
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[380px_1fr] gap-8">
          {/* Left Sidebar */}
          <div
            className={`rounded-[2rem] p-6 sm:p-8 shadow-sm relative h-fit border transition-colors ${isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-50"}`}
          >
            <button
              onClick={() => setIsModalOpen(true)}
              className="absolute right-6 top-6 text-gray-300 hover:text-[#5CB85C] transition-colors"
            >
              <Pencil size={20} />
            </button>
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-4">
                <img
                  src={
                    imagePreview || formData?.profileimg_url || defaultAvatar
                  }
                  className={`w-full h-full rounded-full object-cover border-4 shadow-md ${isDark ? "border-gray-800" : "border-gray-50"}`}
                  alt="Profile"
                />
                <label className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-[#5CB85C] p-3 rounded-full text-white cursor-pointer shadow-lg hover:bg-[#4cae4c] transition-all">
                  <Camera size={20} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              <h2
                className={`text-lg sm:text-xl font-bold text-center mt-4 break-words w-full ${isDark ? "text-white" : "text-[#1F2937]"}`}
              >
                {company?.company_name || "Unknown Company"}
              </h2>
              <p className="text-gray-400 text-sm mt-1 text-center">
                {company?.industry || "Industry not specified"}
              </p>
            </div>
            <div
              className={`space-y-1 pt-4 border-t ${isDark ? "border-gray-800" : "border-gray-50"}`}
            >
              <h3 className="font-bold text-gray-500 mb-4 text-xs uppercase tracking-wider">
                Company info
              </h3>

              <InfoRow label="City" value={company?.city} isDark={isDark} />
              <InfoRow
                label="Country"
                value={company?.country}
                isDark={isDark}
              />
              <InfoRow label="Phone" value={company?.phone} isDark={isDark} />
              <InfoRow label="Email" value={company?.email} isDark={isDark} />
              <InfoRow
                label="Website"
                value={company?.website}
                isLink
                isDark={isDark}
              />
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-8 overflow-hidden">
 <div className="bg-gradient-to-br from-[#2B3263] via-[#7B4BA2] to-[#BD4CA1] rounded-[2rem] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
  {/* Statlar konteyneri */}
  <div className="flex flex-row justify-around items-center max-w-2xl mx-auto">
    {/* Active Stat */}
    <div className="flex-1 flex justify-center border-r border-white/10">
      <StatBox number={stats.active} label="Active" />
    </div>

    {/* Posted Stat */}
    <div className="flex-1 flex justify-center">
      <StatBox number={`+${stats.posted}`} label="Posted" />
    </div>
  </div>
</div>
            <div
              className={`w-full rounded-[2rem] p-6 sm:p-10 shadow-sm border relative min-h-[300px] md:min-h-[400px] transition-colors ${isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-100"}`}
            >
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute right-8 top-8 text-gray-300 hover:text-blue-500 transition-colors"
              >
                <Pencil size={20} />
              </button>
              <h3
                className={`font-bold text-lg md:text-xl mb-6 ${isDark ? "text-white" : "text-gray-800"}`}
              >
                About company
              </h3>
              <div
                className={`text-sm sm:text-base leading-relaxed break-all whitespace-pre-wrap ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                {company?.about_company ||
                  "Write here about your company"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL (DARK MODE MOSLASHTIRILDI) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div
            ref={dropdownRef}
            className={`rounded-[1.5rem] md:rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shadow-2xl relative my-auto transition-colors ${isDark ? "bg-[#1E1E1E]" : "bg-white"}`}
          >
            <div
              className={`sticky top-0 p-5 border-b flex justify-center items-center z-10 transition-colors ${isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-50"}`}
            >
              <h2
                className={`text-lg md:text-xl font-bold ${isDark ? "text-white" : "text-gray-700"}`}
              >
                Edit Company details
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-5 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 md:p-9 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-left">
                <ModalInput
                  label="Company name"
                  value={formData?.company_name}
                  onChange={(v) =>
                    setFormData({ ...formData, company_name: v })
                  }
                  required={true}
                  isDark={isDark}
                />
                <div className="flex flex-col text-left">
                  <label className="text-gray-400 font-bold mb-2 text-[10px] md:text-xs ml-1 uppercase tracking-wider">
                    Phone
                  </label>
                  <input
                    type="text"
                    className={`border rounded-2xl p-3 md:p-4 focus:ring-2 focus:ring-[#5CB85C]/50 outline-none text-sm transition-all ${isDark ? "bg-[#2D2D2D] border-gray-700 text-white" : "bg-gray-50/50 border-gray-100 text-black"}`}
                    value={formData?.phone || ""}
                    onChange={handlePhoneChange}
                    placeholder="+998 (__) ___-__-__"
                  />
                </div>
                <ModalInput
                  label="Website"
                  value={formData?.website}
                  onChange={(v) => setFormData({ ...formData, website: v })}
                  isDark={isDark}
                />
                <SearchableDropdown
                  label="Industry"
                  value={formData?.industry}
                  fieldName="industry"
                  options={INDUSTRIES}
                  placeholder="Select Industry"
                  onSelect={(field, val) =>
                    setFormData({ ...formData, [field]: val })
                  }
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                  required={true}
                  isDark={isDark}
                />
                <SearchableDropdown
                  label="Country"
                  value={formData?.country}
                  fieldName="country"
                  options={allCountries.map((c) => c.name)}
                  placeholder="Select Country"
                  onSelect={(field, val) =>
                    setFormData({ ...formData, [field]: val })
                  }
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                  required={true}
                  isDark={isDark}
                />
                <SearchableDropdown
                  label="City"
                  value={formData?.city}
                  fieldName="city"
                  options={availableCities}
                  placeholder={
                    formData.country ? "Select City" : "Select Country First"
                  }
                  onSelect={(field, val) =>
                    setFormData({ ...formData, [field]: val })
                  }
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                  isDark={isDark}
                />
              </div>

              <div className="mt-4 text-left">
                <label className="block text-gray-500 font-bold mb-2 text-[10px] md:text-xs ml-1 uppercase tracking-wider">
                  About
                </label>
                <textarea
                  className={`w-full h-[150px] md:h-[180px] border rounded-2xl p-4 outline-none focus:ring-2 focus:ring-[#5CB85C]/50 focus:border-[#5CB85C] text-sm leading-relaxed resize-none break-all overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-colors ${isDark ? "bg-[#2D2D2D] border-gray-700 text-white" : "bg-white border-gray-200 text-black"}`}
                  placeholder="Describe your company..."
                  value={formData?.about_company || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, about_company: e.target.value })
                  }
                />
              </div>
              <div className="mt-8 flex justify-center">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#5CB85C] text-white px-12 py-4 rounded-2xl font-bold shadow-lg hover:bg-[#4cae4c] active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- KOMPONENTLARNI PASTGA KO'CHIRDIM (LEKIN HECH NARSA O'ZGARMADI) ---

const InfoRow = ({ label, value, isLink, isDark }) => (
  <div
    className={`flex flex-row justify-between text-[13px] py-3 border-b last:border-0 ${isDark ? "border-gray-800" : "border-gray-50"}`}
  >
    <span className="text-gray-400 font-medium whitespace-nowrap">
      {label}:
    </span>
    <span
      className={`font-bold truncate ml-4 text-right flex-1 max-w-[150px] sm:max-w-none ${isDark ? "text-gray-200" : "text-gray-700"}`}
    >
      {isLink && value ? (
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 hover:underline"
        >
          {value}
        </a>
      ) : (
        value || "---"
      )}
    </span>
  </div>
);

const StatBox = ({ number, label }) => (
  <div className="flex flex-col items-center justify-center">
    <span className="text-xl sm:text-4xl font-extrabold mb-1">{number}</span>
    <span className="text-[7px] sm:text-[10px] uppercase opacity-70 tracking-widest font-bold">
      {label}
    </span>
  </div>
);

const ModalInput = ({ label, value, onChange, required, isDark }) => (
  <div className="flex flex-col text-left">
    <label className="text-gray-400 font-bold mb-2 text-[10px] md:text-xs ml-1 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="text"
      className={`border rounded-2xl p-3 md:p-4 focus:ring-2 focus:ring-[#5CB85C]/50 outline-none text-sm transition-all ${isDark ? "bg-[#2D2D2D] border-gray-700 text-white" : "bg-gray-50/50 border-gray-100 text-black"}`}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    />
  </div>
);

const SearchableDropdown = ({
  label,
  value,
  options,
  fieldName,
  placeholder,
  onSelect,
  activeDropdown,
  setActiveDropdown,
  required,
  isDark,
}) => (
  <div className="flex flex-col text-left relative">
    <label className="text-gray-400 font-bold mb-2 text-[10px] md:text-xs ml-1 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type="text"
        className={`w-full border rounded-2xl p-3 md:p-4 focus:ring-2 focus:ring-[#5CB85C]/50 outline-none text-sm transition-all pr-10 ${isDark ? "bg-[#2D2D2D] border-gray-700 text-white" : "bg-gray-50/50 border-gray-100 text-black"}`}
        value={value || ""}
        onFocus={() => setActiveDropdown(fieldName)}
        onChange={(e) => onSelect(fieldName, e.target.value)}
        placeholder={placeholder}
        required={required}
      />
      <ChevronDown
        size={18}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
    {activeDropdown === fieldName && (
      <div
        className={`absolute top-[105%] left-0 w-full border rounded-2xl mt-1 shadow-2xl z-[300] max-h-48 md:max-h-56 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isDark ? "bg-[#2D2D2D] border-gray-700" : "bg-white border-gray-100"}`}
      >
        {options
          .filter((opt) =>
            opt.toLowerCase().includes((value || "").toLowerCase()),
          )
          .slice(0, 50)
          .map((opt, i) => (
            <div
              key={i}
              className={`p-3 md:p-4 cursor-pointer text-sm border-b last:border-0 ${isDark ? "text-gray-300 border-gray-700 hover:bg-[#3D3D3D]" : "text-gray-600 border-gray-50 hover:bg-gray-50"}`}
              onClick={() => {
                onSelect(fieldName, opt);
                setActiveDropdown(null);
              }}
            >
              {opt}
            </div>
          ))}
      </div>
    )}
  </div>
);

export default MyCompany;