import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // useLocation qo'shildi
import { talentApi } from "../../services/api";
import { jwtDecode } from "jwt-decode";
import {
  FiEdit2,
  FiCamera,
  FiX,
  FiCheckCircle,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import { useTheme } from "../../Context/ThemeContext.jsx";

const spinnerStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .animate-spin-fast {
    animation: spin 0.8s linear infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .animate-pulse-custom {
    animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;

const popularLanguages = [
  "English", "Uzbek", "Russian", "Turkish", "German", "French", "Spanish",
  "Chinese", "Japanese", "Korean", "Arabic", "Portuguese", "Italian",
  "Dutch", "Polish", "Swedish", "Norwegian", "Danish", "Finnish",
  "Hindi", "Bengali", "Thai", "Vietnamese", "Indonesian",
  "Greek", "Hebrew", "Persian", "Czech", "Romanian"
];

const skillList = [
  // Frontend
  "HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Vue.js", "Next.js", "Angular", "Tailwind CSS", "SASS/SCSS", "Redux Toolkit", "Zustand", "React Query",
  // Backend
  "Node.js", "Express.js", "NestJS", "Python", "Django", "FastAPI", "PHP", "Laravel", "Go", "Java", "Spring Boot", "C#", ".NET Core",
  // Database & Infrastructure
  "PostgreSQL", "MongoDB", "MySQL", "Redis", "Firebase", "Docker", "Kubernetes", "AWS", "Google Cloud",
  // Mobile & Desktop
  "React Native", "Flutter", "Dart", "Electron",
  // Design & Tools
  "Figma", "Adobe XD", "Photoshop", "Illustrator",
  // DevOps & Others
  "Git", "GitHub", "CI/CD", "GraphQL", "REST API", "Unit Testing", "Linux",
  // Project Manager
  "Scrum", "Agile", "Jira", "ClickUp", "Trello", "Asana", "Sprint Planning",
];

const ProfilePage = () => {
  const { settings } = useTheme();
  const isDark = settings.darkMode;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [showSkillDropdown, setShowSkillDropdown] = useState([]);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState([]);
  const [formData, setFormData] = useState({});
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation(); // Dashboarddan kelgan stateni tutish uchun

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded = jwtDecode(token);
      const res = await talentApi.getById(decoded.id);
      const data = res.data;

      data.skils = typeof data.skils === "string" ? JSON.parse(data.skils) : data.skils || [];
      data.language = typeof data.language === "string" ? JSON.parse(data.language) : data.language || [];

      setUser(data);
      setFormData({ ...data });

      // Dashboarddan "Profilni to'ldiring" tugmasi bosilganda modalni ochish
      if (location.state?.openModal) {
        setActiveModal(location.state.openModal);
        // Refreshda qayta ochilmasligi uchun stateni tozalaymiz
        window.history.replaceState({}, document.title);
      }
    } catch (err) {
      console.error("Yuklashda xatolik:", err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);

      await talentApi.update(user.id, fd);

      // Sahifani to'liq refresh qilmasdan ma'lumotni yangilaymiz
      await fetchProfile();
    } catch (err) {
      alert("Rasmni saqlashda xatolik yuz berdi");
    } finally {
      setImgUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    setSaveLoading(true);

    try {
      const fd = new FormData();
      const fields = [
        "first_name", "last_name", "gender", "date_of_birth", "country", "city",
        "location", "phone", "occupation", "specialty", "work_type",
        "workplace_type", "minimum_salary", "about",
      ];

      fields.forEach((key) => {
        if (formData[key] !== undefined && formData[key] !== null) {
          fd.append(key, formData[key]);
        }
      });

      fd.append("skils", JSON.stringify(formData.skils || []));
      fd.append("language", JSON.stringify(formData.language || []));

      await talentApi.update(user.id, fd);
      await fetchProfile();
      setActiveModal(null);
    } catch (err) {
      alert("Saqlashda xatolik yuz berdi");
    } finally {
      setSaveLoading(false);
    }
  };

  // Skill mantiqlari
  const addSkill = () =>
    setFormData({
      ...formData,
      skils: [...formData.skils, { skill: "", experience_years: "" }],
    });

  const updateSkill = (index, field, value) => {
    const newskils = [...formData.skils];
    newskils[index][field] = value;
    setFormData({ ...formData, skils: newskils });
  };

  const removeSkill = (index) =>
    setFormData({
      ...formData,
      skils: formData.skils.filter((_, i) => i !== index),
    });

  // Til mantiqlari
  const addLanguage = () =>
    setFormData({
      ...formData,
      language: [...formData.language, { language: "", level: "Beginner" }],
    });

  const updateLanguage = (index, field, value) => {
    const newLang = [...formData.language];
    newLang[index][field] = value;
    setFormData({ ...formData, language: newLang });
  };

  const removeLanguage = (index) =>
    setFormData({
      ...formData,
      language: formData.language.filter((_, i) => i !== index),
    });

  const formatEmail = (email, max = 13) => {
    if (!email || typeof email !== "string") return "—";
    const atIndex = email.indexOf("@");
    if (atIndex === -1) return email;

    const name = email.slice(0, atIndex);
    const domain = email.slice(atIndex);

    const shortName = name.length > max ? name.slice(0, max) + "..." : name;
    return shortName + domain;
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen p-8 max-w-6xl mx-auto animate-pulse-custom ${isDark ? "bg-[#121212]" : "bg-[#F8F9FB]"}`}
      >
        <style>{spinnerStyle}</style>
        <div className={`h-16 rounded-xl mb-6 ${isDark ? "bg-[#1E1E1E]" : "bg-white"}`}></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`h-[500px] rounded-[24px] ${isDark ? "bg-[#1E1E1E]" : "bg-white"}`}></div>
          <div className="lg:col-span-2 space-y-6">
            <div className={`h-[250px] rounded-[24px] ${isDark ? "bg-[#1E1E1E]" : "bg-white"}`}></div>
            <div className={`h-[300px] rounded-[24px] ${isDark ? "bg-[#1E1E1E]" : "bg-white"}`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-4 md:p-8 font-sans transition-colors duration-500 ${isDark ? "bg-[#121212] text-white" : "bg-[#F8F9FB] text-[#333]"}`}
    >
      <style>{spinnerStyle}</style>
      <div className="max-w-6xl mx-auto">
        <div
          className={`rounded-xl p-4 mb-6 shadow-sm flex justify-between items-center border ${isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-100"}`}
        >
          <h1
            className={`text-xl md:text-2xl font-semibold ${isDark ? "text-gray-200" : "text-{#505151"}`}
          >
            My profile
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div
              className={`rounded-[24px] p-6 shadow-sm relative border text-center transition-all ${isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-50"}`}
            >
              <button
                onClick={() => setActiveModal("personal")}
                className={`absolute top-4 right-4 transition ${isDark ? "text-gray-600 hover:text-blue-400" : "text-gray-300 hover:text-blue-500"}`}
              >
                <FiEdit2 size={18} />
              </button>

              <div className="relative inline-block mt-4">
                <div
                  className={`w-28 h-28 rounded-full overflow-hidden border-4 shadow-lg mx-auto flex items-center justify-center ${isDark ? "border-gray-800 bg-gray-900" : "border-white bg-gray-50"}`}
                >
                  {imgUploading ? (
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin-fast"></div>
                  ) : (
                    <img
                      src={
                        user?.image ||
                        "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current.click()}
                  className={`absolute bottom-1 right-1 p-2 rounded-full shadow-md border transition ${isDark ? "bg-[#252525] border-gray-700 text-gray-400 hover:bg-blue-600 hover:text-white" : "bg-white border-gray-100 text-gray-500 hover:bg-blue-500 hover:text-white"}`}
                >
                  <FiCamera size={14} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>

              <h2 className="mt-4 text-xl font-bold flex items-center justify-center gap-2">
                {user?.first_name} {user?.last_name}
                <FiCheckCircle className="text-blue-500" size={18} />
              </h2>
              <p className="text-gray-500 font-medium text-sm mt-1">
                {user?.occupation} {user?.specialty}
              </p>
              <div
                className={`mt-1 font-bold text-lg ${isDark ? "text-blue-400" : "text-gray-800"}`}
              >
                ${user?.minimum_salary?.toLocaleString()}.00
              </div>

              <div className="flex items-center justify-center gap-1 mt-2 text-yellow-400">
                {[1, 2, 3, 4].map((star) => (
                  <span key={star}>★</span>
                ))}
                <span className={isDark ? "text-gray-700" : "text-gray-300"}>
                  ★
                </span>
                <span className="text-gray-400 text-sm ml-1">
                  (4.0) | 1K reviews
                </span>
              </div>

              <div
                className={`mt-8 pt-6 border-t space-y-3 text-left ${isDark ? "border-gray-800" : "border-gray-100"}`}
              >
                <h3
                  className={`font-bold text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-800"}`}
                >
                  Personal info:
                </h3>
                <InfoRow
                  label="Age"
                  value={user?.date_of_birth}
                  isDark={isDark}
                />
                <InfoRow label="City" value={user?.city} isDark={isDark} />
                <InfoRow
                  label="Country"
                  value={user?.country}
                  isDark={isDark}
                />
                <InfoRow label="Phone" value={user?.phone} isDark={isDark} />
                <InfoRow
                  label="Email"
                  value={formatEmail(user?.email, 13)}
                  isDark={isDark}
                />
                <InfoRow
                  label="Workplace"
                  value={user?.workplace_type || "Remote"}
                  isDark={isDark}
                />
                <InfoRow
                  label="Employment"
                  value={
                    user?.work_type === "fulltime" ? "Full-time" : "On-site"
                  }
                  isDark={isDark}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div
              className={`rounded-[24px] p-8 shadow-sm relative border transition-all ${isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-50"}`}
            >
              <button
                onClick={() => setActiveModal("skils")}
                className={`absolute top-6 right-6 transition ${isDark ? "text-gray-600 hover:text-blue-400" : "text-gray-300 hover:text-blue-500"}`}
              >
                <FiEdit2 size={18} />
              </button>

              <div className="mb-10">
                <h3 className="text-md font-bold mb-5">skils</h3>
                <div className="flex flex-wrap gap-3">
                  {user?.skils?.length > 0 ? (
                    user.skils.map((s, i) => (
                      <span
                        key={i}
                        className={`px-4 py-2 rounded-lg text-sm border transition-colors ${isDark ? "bg-[#252525] border-gray-700 text-gray-300" : "bg-[#F8F9FB] border-gray-100 text-gray-600"}`}
                      >
                        {s.skill} ({s.experience_years})
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 italic">No skils added</p>
                  )}
                </div>
              </div>

              <div
                className={`border-t pt-8 ${isDark ? "border-gray-800" : "border-gray-100"}`}
              >
                <h3 className="text-md font-bold mb-5">Languages</h3>
                <div className="flex flex-wrap gap-3">
                  {user?.language?.length > 0 ? (
                    user.language.map((l, i) => (
                      <span
                        key={i}
                        className={`px-4 py-2 rounded-lg text-sm border transition-colors ${isDark ? "bg-[#252525] border-gray-700 text-gray-300" : "bg-[#F8F9FB] border-gray-100 text-gray-600"}`}
                      >
                        {l.language} ({l.level})
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 italic">No languages added</p>
                  )}
                </div>
              </div>
            </div>

            <div
              className={`rounded-[24px] p-8 shadow-sm relative border min-h-[300px] transition-all ${isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-50"}`}
            >
              <button
                onClick={() => setActiveModal("about")}
                className={`absolute top-6 right-6 transition ${isDark ? "text-gray-600 hover:text-blue-400" : "text-gray-300 hover:text-blue-500"}`}
              >
                <FiEdit2 size={18} />
              </button>
              <h3 className="text-md font-bold mb-4">About</h3>
              <p
                className={`leading-relaxed whitespace-pre-line ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                {user?.about || "Please tell us something about yourself..."}
              </p>
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate("/talent/reactions")}
                className={`w-full px-8 py-4 rounded-2xl font-black transition-all border shadow-sm flex items-center justify-center gap-3
      ${isDark
                    ? "bg-[#1E1E1E] border-gray-800 text-gray-200 hover:bg-[#252525]"
                    : "bg-white border-gray-100 text-[#163D5C] hover:bg-gray-50"
                  }`}
              >
                <span className="text-green-500">
                  <FiCheckCircle size={18} />
                </span>
                View Likes / Dislikes
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`rounded-[24px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isDark ? "bg-[#1E1E1E] text-white" : "bg-white text-[#333]"}`}
          >
            <div className="p-8 overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold uppercase tracking-tight">
                  Edit {activeModal}
                </h2>
                <button
                  onClick={() => setActiveModal(null)}
                  className={`p-2 rounded-full transition ${isDark ? "bg-[#252525] text-gray-400 hover:text-red-400" : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500"}`}
                >
                  <FiX size={20} />
                </button>
              </div>

              {activeModal === "personal" && (
                <div className="flex flex-col items-center mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-500 p-1">
                      {imgUploading ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin-fast"></div>
                        </div>
                      ) : (
                        <img
                          src={
                            user?.image ||
                            "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png"
                          }
                          className="w-full h-full object-cover rounded-full"
                          alt="Avatar"
                        />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <FiCamera className="text-white" size={24} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 font-medium">
                    Click to change photo
                  </p>
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-6">
                {activeModal === "personal" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup
                      label="First Name"
                      value={formData.first_name}
                      onChange={(v) =>
                        setFormData({ ...formData, first_name: v })
                      }
                      isDark={isDark}
                    />
                    <InputGroup
                      label="Last Name"
                      value={formData.last_name}
                      onChange={(v) =>
                        setFormData({ ...formData, last_name: v })
                      }
                      isDark={isDark}
                    />
                    <InputGroup
                      label="Occupation"
                      value={formData.occupation}
                      onChange={(v) =>
                        setFormData({ ...formData, occupation: v })
                      }
                      isDark={isDark}
                    />
                    <InputGroup
                      label="Specialty"
                      value={formData.specialty}
                      onChange={(v) =>
                        setFormData({ ...formData, specialty: v })
                      }
                      isDark={isDark}
                    />
                    <InputGroup
                      label="Country"
                      value={formData.country}
                      onChange={(v) => setFormData({ ...formData, country: v })}
                      isDark={isDark}
                    />
                    <InputGroup
                      label="City"
                      value={formData.city}
                      onChange={(v) => setFormData({ ...formData, city: v })}
                      isDark={isDark}
                    />
                    <InputGroup
                      label="Phone"
                      value={formData.phone}
                      onChange={(v) => setFormData({ ...formData, phone: v })}
                      isDark={isDark}
                    />
                    <InputGroup
                      label="Salary ($)"
                      type="number"
                      value={formData.minimum_salary}
                      onChange={(v) =>
                        setFormData({ ...formData, minimum_salary: v })
                      }
                      isDark={isDark}
                    />
                  </div>
                )}

                {activeModal === "skils" && (
                  <div className="space-y-8">
                    {/* SKILLS */}
                    <div>
                      <div className="flex justify-between mb-4">
                        <h4 className="font-bold">Skills</h4>
                        <button
                          type="button"
                          onClick={addSkill}
                          className="text-emerald-500 font-bold flex items-center gap-1"
                        >
                          <FiPlus /> Add
                        </button>
                      </div>

                      {formData.skils?.map((s, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                          <div className="relative flex-1">
                            <input
                              placeholder="Skill"
                              value={s.skill}
                              onChange={(e) => updateSkill(i, "skill", e.target.value)}
                              onFocus={() => {
                                let arr = [...showSkillDropdown];
                                arr[i] = true;
                                setShowSkillDropdown(arr);
                              }}
                              onBlur={() =>
                                setTimeout(() => {
                                  let arr = [...showSkillDropdown];
                                  arr[i] = false;
                                  setShowSkillDropdown(arr);
                                }, 200)
                              }
                              className={`w-full p-3 rounded-xl border outline-none transition ${isDark
                                ? "bg-[#252525] border-gray-700 text-white focus:border-emerald-500"
                                : "bg-gray-50 border-gray-200 focus:border-emerald-500"
                                }`}
                            />

                            {showSkillDropdown[i] && (
                              <div className="absolute z-40 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-40 overflow-y-auto">
                                {skillList
                                  .filter((item) =>
                                    item.toLowerCase().includes((s.skill || "").toLowerCase())
                                  )
                                  .map((item, idx) => (
                                    <div
                                      key={idx}
                                      onMouseDown={() => updateSkill(i, "skill", item)}
                                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    >
                                      {item}
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                          <select
                            value={s.experience_years || ""}
                            onChange={(e) =>
                              updateSkill(i, "experience_years", e.target.value)
                            }
                            className={`w-32 p-3 rounded-xl border outline-none transition ${isDark
                              ? "bg-[#252525] border-gray-700 text-white focus:border-emerald-500"
                              : "bg-gray-50 border-gray-200 focus:border-emerald-500"
                              }`}
                          >
                            <option value="" disabled>
                              Years
                            </option>
                            <option value="1 year">1 year</option>
                            <option value="2 years">2 years</option>
                            <option value="3 years">3 years</option>
                            <option value="4 years">4 years</option>
                            <option value="5 years">5 years</option>
                            <option value="6+ years">6+ years</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => removeSkill(i)}
                            className="text-red-400 p-2 hover:text-red-600"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* LANGUAGES */}
                    <div className={`pt-6 border-t ${isDark ? "border-gray-800" : "border-gray-100"}`}>
                      <div className="flex justify-between mb-4">
                        <h4 className="font-bold">Languages</h4>
                        <button
                          type="button"
                          onClick={addLanguage}
                          className="text-emerald-500 font-bold flex items-center gap-1"
                        >
                          <FiPlus /> Add
                        </button>
                      </div>

                      {formData.language?.map((l, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                          <div className="relative flex-1">
                            <input
                              placeholder="Language"
                              value={l.language || ""}
                              onChange={(e) => updateLanguage(i, "language", e.target.value)}
                              onFocus={() => {
                                let arr = [...showLanguageDropdown];
                                arr[i] = true;
                                setShowLanguageDropdown(arr);
                              }}
                              onBlur={() =>
                                setTimeout(() => {
                                  let arr = [...showLanguageDropdown];
                                  arr[i] = false;
                                  setShowLanguageDropdown(arr);
                                }, 200)
                              }
                              className={`w-full p-3 rounded-xl border outline-none transition ${isDark
                                  ? "bg-[#252525] border-gray-700 text-white focus:border-emerald-500"
                                  : "bg-gray-50 border-gray-200 focus:border-emerald-500"
                                }`}
                            />

                            {showLanguageDropdown[i] && (
                              <div className={`absolute z-40 w-full mt-1 border rounded-xl shadow-lg max-h-40 overflow-y-auto ${isDark ? "bg-[#1E1E1E] border-gray-700" : "bg-white border-gray-100"
                                }`}>
                                {popularLanguages
                                  .filter((item) =>
                                    item.toLowerCase().includes((l.language || "").toLowerCase())
                                  )
                                  .map((item, idx) => (
                                    <div
                                      key={idx}
                                      onMouseDown={() => updateLanguage(i, "language", item)}
                                      className={`px-4 py-2 cursor-pointer text-sm ${isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                      {item}
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>

                          <select
                            value={l.level || "Beginner"}
                            onChange={(e) => updateLanguage(i, "level", e.target.value)}
                            className={`w-40 p-3 rounded-xl border outline-none transition ${isDark
                                ? "bg-[#252525] border-gray-700 text-white focus:border-emerald-500"
                                : "bg-gray-50 border-gray-200 focus:border-emerald-500"
                              }`}
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Native">Native</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => removeLanguage(i)}
                            className="text-red-400 p-2 hover:text-red-600"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeModal === "about" && (
                  <textarea
                    className={`w-full h-64 border rounded-xl p-5 focus:outline-none focus:ring-2 ring-blue-500/10 transition ${isDark ? "bg-[#252525] border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
                    value={formData.about}
                    onChange={(e) =>
                      setFormData({ ...formData, about: e.target.value })
                    }
                  />
                )}

                <button
                  type="submit"
                  disabled={saveLoading}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-3 shadow-lg ${saveLoading ? "bg-emerald-400 cursor-not-allowed" : "bg-[#4AD395] hover:bg-[#3ebe84] shadow-emerald-500/20"} text-white`}
                >
                  {saveLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin-fast"></div>{" "}
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value, isDark }) => (
  <div
    className={`flex justify-between items-center text-[13px] py-2 border-b last:border-0 ${isDark ? "border-gray-800" : "border-gray-50"}`}
  >
    <span className="text-gray-400 font-medium">{label}:</span>
    <span className={`font-bold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
      {value || "—"}
    </span>
  </div>
);

const InputGroup = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  isDark,
}) => (
  <div className="w-full text-left">
    {label && (
      <label
        className={`block text-sm font-bold mb-2 ${isDark ? "text-gray-400" : "text-gray-700"}`}
      >
        {label}
      </label>
    )}
    <input
      type={type}
      value={value || ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ring-emerald-500/10 transition ${isDark ? "bg-[#252525] border-gray-700 text-white focus:border-emerald-500" : "bg-gray-50 border-gray-200 focus:border-emerald-500"}`}
    />
  </div>
);

export default ProfilePage;
