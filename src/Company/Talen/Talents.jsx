import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { talenApi } from "../../services/api";
import { HiOutlineBriefcase } from "react-icons/hi";
import { PiMonitorBold } from "react-icons/pi";
import { LuUser } from "react-icons/lu";
import { toast } from "react-toastify";
import {
  FaUser,
  FaMoneyBillWave,
  FaCity,
  FaEarthAmericas,
  FaPlus,
} from "react-icons/fa6";
import { useTheme } from "../../talent/Context/ThemeContext";

const Talents = () => {
  const [allTalents, setAllTalents] = useState([]);
  const [filteredTalents, setFilteredTalents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Skills and expertice");
  const { settings } = useTheme();
  const isDark = settings.darkMode;

  // Filter States
  const [selectedSpecs, setSelectedSpecs] = useState([]);
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [occupation, setOccupation] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [skillsRows, setSkillsRows] = useState([
    { id: 1, skill: "", experience: "", isDefault: true },
  ]);
  const [workType, setWorkType] = useState("");
  const [workplaceType, setWorkplaceType] = useState("");
  const [salaryRange, setSalaryRange] = useState({ min: "", max: "" });
  const [location, setLocation] = useState({ country: "", city: "" });

  const popularLanguages = ["Uzbek", "English", "Russian", "Turkish", "German"];
  const defaultAvatar =
    "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTalents = async () => {
      setIsLoading(true);
      try {
        const res = await talenApi.getAll();
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setAllTalents(data);
        setFilteredTalents(data);
      } catch (err) {
        console.error("Talantlarni yuklashda xatolik:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };
    fetchTalents();
  }, []);

  useEffect(() => {
    let result = [...allTalents];

    if (occupation)
      result = result.filter((t) =>
        t.occupation?.toLowerCase().includes(occupation.toLowerCase())
      );

    if (speciality)
      result = result.filter((t) =>
        t.specialty?.toLowerCase().includes(speciality.toLowerCase())
      );

    if (selectedSpecs.length > 0)
      result = result.filter((t) => selectedSpecs.includes(t.specialty));

    if (selectedLangs.length > 0) {
      result = result.filter((talent) => {
        try {
          const tLangs =
            typeof talent.language === "string"
              ? JSON.parse(talent.language)
              : talent.language || [];
          return selectedLangs.some((sl) =>
            tLangs.some(
              (tl) => tl.language?.toLowerCase() === sl.toLowerCase()
            )
          );
        } catch {
          return false;
        }
      });
    }

    const activeSkills = skillsRows.filter((r) => r.skill.trim() !== "");
    if (activeSkills.length > 0) {
      result = result.filter((talent) => {
        try {
          const talentSkills =
            typeof talent.skils === "string"
              ? JSON.parse(talent.skils)
              : talent.skils || [];
          return activeSkills.every((fRow) => {
            return talentSkills.some((ts) => {
              const skillMatch = (ts.skill || "")
                .toLowerCase()
                .includes(fRow.skill.toLowerCase());
              const talentExpNumber = parseInt(ts.experience_years) || 0;
              const requiredExpNumber = parseInt(fRow.experience) || 0;
              return (
                skillMatch &&
                (fRow.experience === "" || talentExpNumber >= requiredExpNumber)
              );
            });
          });
        } catch {
          return false;
        }
      });
    }

    if (workType) result = result.filter((t) => t.work_type === workType);
    if (workplaceType)
      result = result.filter((t) => t.workplace_type === workplaceType);
    if (salaryRange.min)
      result = result.filter(
        (t) => (t.minimum_salary || 0) >= Number(salaryRange.min)
      );
    if (salaryRange.max)
      result = result.filter(
        (t) => (t.minimum_salary || 0) <= Number(salaryRange.max)
      );
    if (location.country)
      result = result.filter((t) =>
        t.country?.toLowerCase().includes(location.country.toLowerCase())
      );
    if (location.city)
      result = result.filter((t) =>
        t.city?.toLowerCase().includes(location.city.toLowerCase())
      );

    setFilteredTalents(result);
  }, [
    occupation,
    speciality,
    skillsRows,
    selectedSpecs,
    selectedLangs,
    workType,
    workplaceType,
    salaryRange,
    location,
    allTalents,
  ]);

  const inputClass = `w-full py-3 bg-transparent rounded-xl outline-none border transition-all ${isDark
      ? "bg-[#2A2A2A] border-gray-700 text-white placeholder-gray-500 focus:border-[#163D5C]"
      : "bg-[#F8F9FA] border-transparent focus:border-[#163D5C]"
    }`;

  const SkeletonCard = () => (
    <div
      className={`${isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-100"
        } rounded-[40px] border p-6 text-center w-full max-w-[280px] animate-pulse flex flex-col items-center`}
    >
      <div
        className={`w-[115px] h-[115px] ${isDark ? "bg-gray-700" : "bg-gray-200"
          } rounded-full mb-4`}
      ></div>
      <div
        className={`h-6 ${isDark ? "bg-gray-700" : "bg-gray-200"
          } rounded-md w-3/4 mb-2`}
      ></div>
      <div
        className={`h-4 ${isDark ? "bg-gray-700" : "bg-gray-200"
          } rounded-md w-1/2 mb-4`}
      ></div>
      <div
        className={`h-8 ${isDark ? "bg-gray-800" : "bg-gray-100"
          } rounded-md w-1/3 mb-6`}
      ></div>
      <div
        className={`h-10 ${isDark ? "bg-gray-700" : "bg-gray-200"
          } rounded-[20px] w-[170px] mt-auto`}
      ></div>
    </div>
  );

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-[#121212] text-gray-100" : "bg-[#F8F9FA] text-[#111827]"
        } py-6 pb-20 md:py-10 px-4 md:px-6 font-gilroy transition-colors duration-300`}
    >
      <div className="max-w-[1240px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-10">
          <h1
            className={`text-xl sm:text-2xl font-bold ${isDark
                ? "bg-[#1E1E1E] border-gray-800 text-gray-100"
                : "bg-white border-gray-100 text-[#4B5563]"
              } px-8 py-5 rounded-2xl shadow-sm w-full md:flex-1 border text-center md:text-left leading-none transition-colors`}
          >
            Talent
          </h1>
          <button
            onClick={() => navigate("/company/post-job")}
            className="bg-[#163D5C] hover:bg-[#1a3851] text-white w-full md:w-auto px-10 py-5 rounded-2xl font-bold shadow-md active:scale-95 transition-all text-lg"
          >
            Post a Job
          </button>
        </div>

        {/* Filter Section */}
        <div className="max-w-[1043px] mx-auto mb-6">
          <div
            className={`${isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-100"
              } rounded-[20px] shadow-sm border p-2 flex items-center justify-between gap-2 transition-colors`}
          >
            <div className="flex flex-1 gap-1 md:gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              {["Specialty", "Skills and expertice", "Preferences"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative flex-1 min-w-[130px] py-3 rounded-[15px] font-bold text-[13px] md:text-[16px] transition-all z-10 whitespace-nowrap ${activeTab === tab
                      ? isDark
                        ? "bg-[#2A2A2A] shadow-sm text-white"
                        : "bg-[#F8F9FA] shadow-sm text-[#26282c]"
                      : isDark
                        ? "text-gray-500"
                        : "text-[#C7C7C7]"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`px-2 md:px-4 transition-transform ${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-600"
                }`}
              style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>

          {isOpen && (
            <div
              className={`mt-4 ${isDark
                  ? "bg-[#1E1E1E] border-gray-800"
                  : "bg-white border-gray-100"
                } rounded-[25px] md:rounded-[30px] p-5 md:p-8 border shadow-sm overflow-hidden transition-colors`}
            >
              {/* 1. Specialty Tab */}
              {activeTab === "Specialty" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    ...new Set(
                      allTalents.map((t) => t.specialty).filter(Boolean)
                    ),
                  ].map((spec, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSpecs.includes(spec)}
                        onChange={() =>
                          setSelectedSpecs((prev) =>
                            prev.includes(spec)
                              ? prev.filter((s) => s !== spec)
                              : [...prev, spec]
                          )
                        }
                        className="w-5 h-5 rounded border-gray-300 accent-[#163D5C]"
                      />
                      <span
                        className={`text-[14px] ${selectedSpecs.includes(spec)
                            ? "text-[#163D5C] font-bold"
                            : isDark
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                      >
                        {spec}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* 2. Skills and Expertise Tab */}
              {activeTab === "Skills and expertice" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className={`font-bold ${isDark ? "text-gray-200" : ""}`}>
                        Occupation
                      </p>
                      <div className="relative">
                        <HiOutlineBriefcase
                          className={`absolute left-4 top-1/2 -translate-y-1/2 text-xl ${isDark ? "text-[#163D5C]" : "text-[#163D5C]"
                            }`}
                        />
                        <input
                          type="text"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          placeholder="e.g. Designer"
                          className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none border transition-all ${isDark
                              ? "bg-[#2A2A2A] border-gray-700 text-white placeholder-gray-500 focus:border-[#163D5C]"
                              : "bg-[#F8F9FA] border-transparent focus:border-[#163D5C]"
                            }`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className={`font-bold ${isDark ? "text-gray-200" : ""}`}>
                        Speciality
                      </p>
                      <div className="relative">
                        <PiMonitorBold
                          className={`absolute left-4 top-1/2 -translate-y-1/2 text-xl ${isDark ? "text-[#163D5C]" : "text-[#163D5C]"
                            }`}
                        />
                        <input
                          type="text"
                          value={speciality}
                          onChange={(e) => setSpeciality(e.target.value)}
                          placeholder="e.g. UX/UI"
                          className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none border transition-all ${isDark
                              ? "bg-[#2A2A2A] border-gray-700 text-white placeholder-gray-500 focus:border-[#163D5C]"
                              : "bg-[#F8F9FA] border-transparent focus:border-[#163D5C]"
                            }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p
                      className={`font-bold ${isDark ? "text-[#163D5C]" : "text-[#163D5C]"
                        }`}
                    >
                      Languages
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {popularLanguages.map((lang) => (
                        <button
                          key={lang}
                          onClick={() =>
                            setSelectedLangs((prev) =>
                              prev.includes(lang)
                                ? prev.filter((l) => l !== lang)
                                : [...prev, lang]
                            )
                          }
                          className={`px-4 py-2 rounded-xl font-bold text-sm border transition-all ${selectedLangs.includes(lang)
                              ? "bg-[#163D5C] text-white border-[#163D5C]"
                              : isDark
                                ? "bg-[#2A2A2A] text-gray-400 border-gray-700 hover:border-[#163D5C]"
                                : "bg-[#F8F9FA] text-gray-500 border-transparent hover:border-gray-300"
                            }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {skillsRows.map((row) => (
                    <div
                      key={row.id}
                      className="flex flex-col md:flex-row gap-4"
                    >
                      <div className="relative flex-1">
                        <LuUser
                          className={`absolute left-4 top-1/2 -translate-y-1/2 text-xl ${isDark ? "text-[#163D5C]" : "text-[#163D5C]"
                            }`}
                        />
                        <input
                          type="text"
                          placeholder="Skill (e.g. Figma)"
                          value={row.skill}
                          onChange={(e) =>
                            setSkillsRows(
                              skillsRows.map((r) =>
                                r.id === row.id
                                  ? { ...r, skill: e.target.value }
                                  : r
                              )
                            )
                          }
                          className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none border transition-all ${isDark
                              ? "bg-[#2A2A2A] border-gray-700 text-white placeholder-gray-500 focus:border-[#163D5C]"
                              : "bg-[#F8F9FA] border-transparent focus:border-[#163D5C]"
                            }`}
                        />
                      </div>
                      <div className="relative flex-1">
                        <FaUser
                          className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-[#163D5C]" : "text-[#163D5C]"
                            }`}
                        />
                        <input
                          type="number"
                          placeholder="Min years experience"
                          value={row.experience}
                          onChange={(e) =>
                            setSkillsRows(
                              skillsRows.map((r) =>
                                r.id === row.id
                                  ? { ...r, experience: e.target.value }
                                  : r
                              )
                            )
                          }
                          className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none border transition-all ${isDark
                              ? "bg-[#2A2A2A] border-gray-700 text-white placeholder-gray-500 focus:border-[#163D5C]"
                              : "bg-[#F8F9FA] border-transparent focus:border-[#163D5C]"
                            }`}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() =>
                      setSkillsRows([
                        ...skillsRows,
                        { id: Date.now(), skill: "", experience: "" },
                      ])
                    }
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-colors ${isDark
                        ? "bg-[#163D5C]/10 text-[#163D5C] hover:bg-[#163D5C]/20"
                        : "bg-[#50C594]/10 text-[#50C594] hover:bg-[#50C594]/20"
                      }`}
                  >
                    <FaPlus /> Add skill
                  </button>
                </div>
              )}

              {/* 3. Preferences Tab */}
              {activeTab === "Preferences" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Employment & Workplace */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <p
                          className={`font-bold ${isDark ? "text-[#163D5C]" : "text-[#163D5C]"
                            }`}
                        >
                          Employment type
                        </p>
                        <div
                          className={`flex flex-wrap p-1.5 rounded-2xl gap-1 ${isDark ? "bg-[#2A2A2A]" : "bg-[#F8F9FA]"
                            }`}
                        >
                          {["fulltime", "parttime", "contract", "freelance"].map(
                            (type) => (
                              <button
                                key={type}
                                onClick={() =>
                                  setWorkType(workType === type ? "" : type)
                                }
                                className={`flex-1 py-2 rounded-xl text-sm font-bold capitalize transition-all ${workType === type
                                    ? isDark
                                      ? "bg-[#1E1E1E] shadow-md text-[#163D5C]"
                                      : "bg-white shadow-md text-[#163D5C]"
                                    : isDark
                                      ? "text-gray-500"
                                      : "text-gray-400"
                                  }`}
                              >
                                {type}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p
                          className={`font-bold ${isDark ? "text-[#163D5C]" : "text-[#163D5C]"
                            }`}
                        >
                          Workplace type
                        </p>
                        <div
                          className={`flex p-1.5 rounded-2xl gap-1 ${isDark ? "bg-[#2A2A2A]" : "bg-[#F8F9FA]"
                            }`}
                        >
                          {["Onsite", "Remote", "Hybrid"].map((type) => (
                            <button
                              key={type}
                              onClick={() =>
                                setWorkplaceType(
                                  workplaceType === type ? "" : type
                                )
                              }
                              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${workplaceType === type
                                  ? isDark
                                    ? "bg-[#1E1E1E] shadow-md text-[#163D5C]"
                                    : "bg-white shadow-md text-[#163D5C]"
                                  : isDark
                                    ? "text-gray-500"
                                    : "text-gray-400"
                                }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Salary & Location */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <p
                          className={`font-bold ${isDark ? "text-[#163D5C]" : "text-[#163D5C]"
                            }`}
                        >
                          Expected Salary ($)
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <FaMoneyBillWave
                              className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-[#163D5C]" : "text-[#163D5C]"
                                }`}
                            />
                            <input
                              type="number"
                              placeholder="Min"
                              value={salaryRange.min}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "0") {
                                  toast.warn("No such talents available", {
                                    position: "top-right",
                                    autoClose: 3000,
                                  });
                                }
                                setSalaryRange({ ...salaryRange, min: val });
                              }}
                              className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none border transition-all ${isDark
                                  ? "bg-[#2A2A2A] border-gray-700 text-white placeholder-gray-500 focus:border-[#163D5C]"
                                  : "bg-[#F8F9FA] border-transparent focus:border-[#163D5C]"
                                }`}
                            />
                          </div>
                          <div className="relative">
                            <FaMoneyBillWave
                              className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-[#163D5C]" : "text-[#163D5C]"
                                }`}
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              value={salaryRange.max}
                              onChange={(e) =>
                                setSalaryRange({
                                  ...salaryRange,
                                  max: e.target.value,
                                })
                              }
                              className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none border transition-all ${isDark
                                  ? "bg-[#2A2A2A] border-gray-700 text-white placeholder-gray-500 focus:border-[#163D5C]"
                                  : "bg-[#F8F9FA] border-transparent focus:border-[#163D5C]"
                                }`}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p
                            className={`font-bold ${isDark ? "text-[#163D5C]" : "text-[#163D5C]"
                              }`}
                          >
                            Country
                          </p>
                          <div className="relative">
                            <FaEarthAmericas
                              className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-[#163D5C]" : "text-[#163D5C]"
                                }`}
                            />
                            <input
                              type="text"
                              placeholder="Country"
                              value={location.country}
                              onChange={(e) =>
                                setLocation({
                                  ...location,
                                  country: e.target.value,
                                })
                              }
                              className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none border transition-all ${isDark
                                  ? "bg-[#2A2A2A] border-gray-700 text-white placeholder-gray-500 focus:border-[#163D5C]"
                                  : "bg-[#F8F9FA] border-transparent focus:border-[#163D5C]"
                                }`}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p
                            className={`font-bold ${isDark ? "text-[#163D5C]" : "text-[#163D5C]"
                              }`}
                          >
                            City
                          </p>
                          <div className="relative">
                            <FaCity
                              className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-[#163D5C]" : "text-[#163D5C]"
                                }`}
                            />
                            <input
                              type="text"
                              placeholder="City"
                              value={location.city}
                              onChange={(e) =>
                                setLocation({
                                  ...location,
                                  city: e.target.value,
                                })
                              }
                              className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none border transition-all ${isDark
                                  ? "bg-[#2A2A2A] border-gray-700 text-white placeholder-gray-500 focus:border-[#163D5C]"
                                  : "bg-[#F8F9FA] border-transparent focus:border-[#163D5C]"
                                }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Info */}
        <div
          className={`max-w-[1043px] mx-auto mb-8 pt-6 border-t ${isDark ? "border-gray-800" : "border-gray-200"
            }`}
        >
          <h2
            className={`text-xl md:text-2xl font-bold ${isDark ? "text-gray-100" : ""
              }`}
          >
            {isLoading ? "" : `${filteredTalents.length} talents found`}
          </h2>
        </div>

        {/* Talent Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 justify-items-center">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
            : filteredTalents.map((talent) => (
              <div
                key={talent.id}
                className={`${isDark
                    ? "bg-[#1E1E1E] border-gray-800 hover:shadow-[#163D5C]/20"
                    : "bg-white border-gray-100"
                  } rounded-[40px] border p-6 text-center w-full max-w-[280px] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center`}
              >
                <div
                  className={`w-[115px] h-[115px] rounded-full overflow-hidden border-4 ${isDark ? "border-[#2A2A2A]" : "border-white"
                    } shadow-sm mb-4`}
                >
                  <img
                    src={talent.image || defaultAvatar}
                    className="w-full h-full object-cover"
                    alt="Avatar"
                  />
                </div>
                <h3
                  className={`font-bold text-[20px] mb-1 line-clamp-1 ${isDark ? "text-white" : "text-[#2D2D2D]"
                    }`}
                >
                  {talent.first_name} {talent.last_name}
                </h3>
                <p
                  className={`text-[15px] font-medium mb-1 line-clamp-1 ${isDark ? "text-gray-400" : "text-[#888888]"
                    }`}
                >
                  {talent.specialty || talent.occupation}
                </p>
                <p
                  className={`text-[14px] mb-4 ${isDark ? "text-gray-500" : "text-[#888888]"
                    }`}
                >
                  {talent.city}, {talent.country}
                </p>
                <div className="mb-6">
                  <span
                    className={`font-black text-[22px] ${isDark ? "text-white" : "text-[#2D2D2D]"
                      }`}
                  >
                    ${" "}
                    {new Intl.NumberFormat("de-DE").format(
                      talent.minimum_salary || 0
                    )}
                  </span>
                </div>
                <button
                  onClick={() =>
                    navigate(`/company/talents/${talent.id}`)
                  }
                  className={`w-[170px] py-2 border-2 rounded-[20px] font-bold transition-all mt-auto ${isDark
                      ? "border-[#163D5C] text-[#163D5C] hover:bg-[#163D5C] hover:text-white"
                      : "border-[#163D5C] text-[#163D5C] hover:bg-[#163D5C] hover:text-white"
                    }`}
                >
                  View profile
                </button>
              </div>
            ))}
        </div>

        {!isLoading && filteredTalents.length === 0 && (
          <div
            className={`text-center py-20 ${isDark
                ? "bg-[#1E1E1E] border-gray-700"
                : "bg-white border-gray-200"
              } rounded-[40px] mt-10 border-2 border-dashed`}
          >
            <p
              className={`text-lg ${isDark ? "text-gray-500" : "text-gray-400"
                }`}
            >
              No talents match your current filters.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-[#163D5C] font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Talents;