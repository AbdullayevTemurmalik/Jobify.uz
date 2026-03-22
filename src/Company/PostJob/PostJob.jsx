import React, { useState, useEffect, useRef } from 'react';
import { jobApi, talentApi, UZBEK_REGIONS } from '../../services/api.js';
import { XCircle, ChevronDown, ArrowLeft } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../talent/Context/ThemeContext";
import 'react-toastify/dist/ReactToastify.css';
import Img from "../../assets/Frame.png";

const PostJob = () => {
  const navigate = useNavigate();
  const { settings } = useTheme();
  const isDark = settings.darkMode;

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('Matches');
  const [allTalents, setAllTalents] = useState([]);

  const [showRegions, setShowRegions] = useState(false);
  const [activeLangIndex, setActiveLangIndex] = useState(null);

  const regionRef = useRef(null);
  const langRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user_info") || "{}");
  const companyId = user.id || user._id;

  const [formData, setFormData] = useState({
    occupation: '',
    speciality: '',
    location: '',
    salary_min: '',
    salary_max: '',
    skils: [{ name: '', experience: '' }],
    languages: [{ name: '', level: '' }],
    description: ''
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (regionRef.current && !regionRef.current.contains(event.target)) setShowRegions(false);
      if (langRef.current && !langRef.current.contains(event.target)) setActiveLangIndex(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (submitted) {
      talentApi.getAll().then(res => setAllTalents(res.data || [])).catch(console.error);
    }
  }, [submitted]);

  const LANGUAGE_LEVELS = ['Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'Native'];

  const filteredRegions = UZBEK_REGIONS.filter(region =>
    region.toLowerCase().includes(formData.location.toLowerCase())
  );

  const parseTalentSkils = (skilsStr) => {
    try {
      if (!skilsStr) return [];
      const parsed = typeof skilsStr === 'string' ? JSON.parse(skilsStr) : skilsStr;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  };

  const matchedTalents = allTalents.filter(talent => {
    const jobOcc = formData.occupation.toLowerCase().trim();
    const talentOcc = (talent.occupation || "").toLowerCase().trim();
    const talentSpec = (talent.specialty || "").toLowerCase().trim();
    const isOccMatch = talentOcc.includes(jobOcc) || talentSpec.includes(jobOcc) || jobOcc.includes(talentOcc);
    const talentSkils = parseTalentSkils(talent.skils);
    const jobSkils = formData.skils.map(s => s.name.toLowerCase().trim()).filter(s => s !== "");
    const isSkillMatch = jobSkils.length === 0 || talentSkils.some(ts =>
      jobSkils.some(js => ts.skil?.toLowerCase().includes(js))
    );
    return isOccMatch || isSkillMatch;
  });

  const handleDynamicChange = (index, field, value, type) => {
    const newData = [...formData[type]];
    if (field === 'experience') {
      newData[index][field] = value.replace(/\D/g, "");
    } else {
      newData[index][field] = value;
    }
    setFormData({ ...formData, [type]: newData });
  };

  const addField = (type) => {
    const newItem = type === 'skils' ? { name: '', experience: '' } : { name: '', level: '' };
    setFormData({ ...formData, [type]: [...formData[type], newItem] });
  };

  const removeField = (index, type) => {
    const newData = formData[type].filter((_, i) => i !== index);
    setFormData({ ...formData, [type]: newData });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) {
      toast.error("Kompaniya ID topilmadi.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        company_id: Number(companyId),
        occupation: formData.occupation,
        speciality: formData.speciality,
        job_type: "Full-time",
        workplace_type: "Remote",
        salary_min: Number(formData.salary_min),
        salary_max: Number(formData.salary_max),
        description: formData.description,
        location: formData.location,
        skils: formData.skils.map(s => `${s.name} (${s.experience} years)`).join(", ")
      };
      await jobApi.create(payload);
      toast.success("Ish muvaffaqiyatli joylashtirildi!");
      setSubmitted(true);
    } catch (err) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`max-w-5xl mx-auto my-10 px-4 transition-colors duration-300 ${isDark ? "bg-[#121212]" : "bg-[#FDFEFF]"}`}>
        <ToastContainer position="top-right" autoClose={3000} />
        <div className={`p-10 rounded-3xl shadow-sm border text-center mb-10 transition-all ${isDark
            ? "bg-[#1E1E1E] border-gray-800 text-white shadow-[#5CB85C]/10"
            : "bg-white border-gray-100 text-[#1A1C21] shadow-sm"
          }`}>
          <h2 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>Congratulations!</h2>
          <p className={`text-gray-500 mb-6 ${isDark ? "text-gray-400" : ""}`}>Congratulations on successfully submitting your job posting!</p>
          <div className="flex justify-center mb-6">
            <img src={Img} alt="Success" className="max-w-xs md:max-w-sm" />
          </div>
          <Link to="/company/my-jobs" className={`px-8 py-2 border-2 rounded-full font-bold hover:bg-gray-50 transition-all inline-block ${isDark
              ? "border-[#5CB85C] text-[#5CB85C] hover:bg-[#5CB85C]/10"
              : "border-[#1D3D54] text-[#1D3D54]"
            }`}>
            Back to My jobs
          </Link>
        </div>

        <div className={`flex p-1.5 rounded-[1.5rem] w-full relative mb-10 overflow-hidden max-w-2xl mx-auto transition-colors ${isDark ? "bg-[#2A2A2A]" : "bg-[#E9E9E9]"
          }`}>
          <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-[1.2rem] shadow-sm transition-all duration-300
            ${activeDetailTab === 'Matches' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`} />
          <button onClick={() => setActiveDetailTab('Matches')} className={`flex-1 py-3.5 z-10 font-bold text-sm transition-colors ${activeDetailTab === 'Matches'
              ? 'text-[#343C44]'
              : isDark ? 'text-gray-400' : 'text-[#8E8E8E]'
            }`}>
            All Matches
          </button>
          <button onClick={() => setActiveDetailTab('Invitations')} className={`flex-1 py-3.5 z-10 font-bold text-sm transition-colors ${activeDetailTab === 'Invitations'
              ? 'text-[#343C44]'
              : isDark ? 'text-gray-400' : 'text-[#8E8E8E]'
            }`}>
            Invitations sent
          </button>
        </div>

        <div className="pb-20">
          {activeDetailTab === 'Matches' ? (
            <div className="space-y-6">
              <h3 className={`text-xl font-bold mb-4 px-4 py-2 rounded-lg inline-block ${isDark
                  ? "text-white bg-[#2A2A2A]"
                  : "text-gray-800 bg-gray-50"
                }`}>Best matches</h3>
              <p className={`text-gray-400 font-medium mb-6 ${isDark ? "text-gray-500" : ""}`}>
                {matchedTalents.length} talents matches for "{formData.occupation}"
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchedTalents.map(talent => (
                  <div key={talent.id} className={`border rounded-[2.5rem] shadow-sm hover:shadow-md transition-all p-8 text-center ${isDark
                      ? "bg-[#1E1E1E] border-gray-800 hover:shadow-[#5CB85C]/20"
                      : "bg-white border-gray-100"
                    }`}>
                    <div className={`w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden ${isDark ? "bg-[#2A2A2A]" : "bg-gray-50"}`}>
                      {talent.image ? (
                        <img src={talent.image} className="w-full h-full object-cover" alt="talent" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-2xl font-bold ${isDark ? "text-gray-500" : "text-gray-300"}`}>
                          {talent.first_name?.[0]}
                        </div>
                      )}
                    </div>
                    <h4 className={`font-bold text-xl ${isDark ? "text-white" : "text-[#343C44]"}`}>
                      {talent.first_name} {talent.last_name}
                    </h4>
                    <p className={`font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {talent.specialty || "Specialist"}
                    </p>
                    <p className={`text-sm mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      {talent.location || "Uzbekistan"}
                    </p>
                    <p className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-[#343C44]"}`}>
                      ${talent.minimum_salary?.toLocaleString()}
                    </p>
                    <Link to={`/talents/${talent.id}`} className={`w-full py-3 border-2 rounded-full text-sm font-bold transition-colors inline-block ${isDark
                        ? "border-[#A855F7] text-[#A855F7] hover:bg-[#A855F7]/10"
                        : "border-[#A855F7] text-[#A855F7] hover:bg-purple-50"
                      }`}>
                      View profile
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`py-20 rounded-[2rem] border border-dashed text-lg transition-all ${isDark
                ? "bg-[#1E1E1E] border-gray-800 text-gray-500"
                : "bg-white border-gray-200 text-gray-400"
              }`}>
              Yuborilgan taklifnomalar ro'yxati bo'sh.
            </div>
          )}
        </div>
      </div>
    );
  }

  const inputClass = `w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5CB85C] transition-all ${isDark
      ? "bg-[#2A2A2A] border-gray-700 text-white placeholder-gray-500 focus:ring-[#5CB85C]"
      : "border-gray-200 bg-white"
    }`;

  const cardBg = isDark ? "bg-[#1E1E1E] border-gray-800 shadow-[#5CB85C]/10" : "bg-white border-gray-50 shadow-sm";
  const btnStyle = `hover:bg-[#4cae4c] text-white transition-all active:scale-95 shadow-sm ${isDark ? "bg-[#5CB85C] shadow-[#5CB85C]/30 hover:shadow-[#5CB85C]/40" : "bg-[#5CB85C]"
    }`;

  return (
    <div className={`max-w-5xl mx-auto pb-20 my-6 px-4 transition-colors duration-300 ${isDark ? "bg-[#121212]" : "bg-[#FDFEFF]"
      }`}>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className={`flex items-center justify-between p-3 rounded-[1.5rem] shadow-sm mb-8 border transition-all ${isDark
          ? "bg-[#1E1E1E] border-gray-800 shadow-[#5CB85C]/10"
          : "bg-white border-gray-50"
        }`}>
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 px-6 py-2 font-bold text-xl hover:text-[#5CB85C] transition-colors ${isDark ? "text-gray-300" : "text-[#343C44]"
            }`}
        >
          <ArrowLeft size={24} />
          Back
        </button>

        <button
          onClick={() => navigate('/company/my-jobs')}
          className={`${btnStyle} px-8 py-3 rounded-2xl font-bold`}
        >
          My Jobs
        </button>
      </div>

      <div className={`rounded-[2rem] p-8 ${cardBg}`}>
        <h2 className={`text-2xl font-bold mb-8 ${isDark ? "text-white" : "text-[#343C44]"}`}>Post a job</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>Occupation</label>
              <input
                className={inputClass}
                placeholder="Designer"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>Speciality</label>
              <input
                className={inputClass}
                placeholder="UX/UI"
                value={formData.speciality}
                onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 relative" ref={regionRef}>
              <label className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>Location</label>
              <div className="relative">
                <input
                  className={inputClass}
                  placeholder="Select or type region"
                  value={formData.location}
                  onChange={(e) => { setFormData({ ...formData, location: e.target.value }); setShowRegions(true); }}
                  onFocus={() => setShowRegions(true)}
                />
                <ChevronDown size={18} className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform cursor-pointer ${showRegions ? 'rotate-180' : ''
                  } ${isDark ? "text-gray-500" : ""}`} />
              </div>
              {showRegions && filteredRegions.length > 0 && (
                <div className={`absolute z-50 w-full mt-1 border rounded-xl shadow-xl max-h-60 overflow-y-auto ${isDark
                    ? "bg-[#2A2A2A] border-gray-700 shadow-[#5CB85C]/20"
                    : "bg-white border-gray-200 shadow-xl"
                  }`}>
                  {filteredRegions.map(region => (
                    <div key={region} className={`px-4 py-3 hover:bg-[#5CB85C] hover:text-white cursor-pointer transition-colors border-b last:border-none ${isDark ? "border-gray-700 text-gray-300" : "border-gray-50"
                      }`}
                      onClick={() => { setFormData({ ...formData, location: region }); setShowRegions(false); }}
                    >
                      {region}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>Salary (USD)</label>
              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>$</span>
                  <input
                    type="text"
                    className={`${inputClass} pl-7`}
                    placeholder="300"
                    value={formData.salary_min}
                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value.replace(/\D/g, "") })}
                  />
                </div>
                <span className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>To</span>
                <div className="relative w-full">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>$</span>
                  <input
                    type="text"
                    className={`${inputClass} pl-7`}
                    placeholder="500"
                    value={formData.salary_max}
                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value.replace(/\D/g, "") })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className={`text-sm font-semibold uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-700"}`}>Skils</label>
              {formData.skils.map((skill, index) => (
                <div key={index} className="flex gap-3 items-center group">
                  <input
                    className={inputClass}
                    placeholder="Figma"
                    value={skill.name}
                    onChange={(e) => handleDynamicChange(index, 'name', e.target.value, 'skils')}
                  />
                  <input
                    className={inputClass}
                    placeholder="Years (e.g. 5)"
                    value={skill.experience}
                    onChange={(e) => handleDynamicChange(index, 'experience', e.target.value, 'skils')}
                  />
                  {index > 0 && (
                    <XCircle
                      className={`text-gray-300 hover:text-red-500 cursor-pointer transition-colors flex-shrink-0 ${isDark ? "hover:text-red-400" : ""}`}
                      onClick={() => removeField(index, 'skils')}
                      size={32}
                    />
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addField('skils')} className={`${btnStyle} px-6 py-2 rounded-full text-sm font-medium`}>
                Add skill
              </button>
            </div>

            <div className="space-y-4">
              <label className={`text-sm font-semibold uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-700"}`}>Language</label>
              {formData.languages.map((lang, index) => (
                <div key={index} className="flex gap-3 items-center group" ref={index === activeLangIndex ? langRef : null}>
                  <input
                    className={inputClass}
                    placeholder="English"
                    value={lang.name}
                    onChange={(e) => handleDynamicChange(index, 'name', e.target.value, 'languages')}
                  />
                  <div className="relative w-full">
                    <div className={`${inputClass} flex justify-between items-center cursor-pointer`} onClick={() => setActiveLangIndex(activeLangIndex === index ? null : index)}>
                      <span className={lang.level ? (isDark ? "text-white" : "text-gray-800") : (isDark ? "text-gray-500" : "text-gray-400")}>
                        {lang.level || "Level"}
                      </span>
                      <ChevronDown size={16} className={`transition-transform ${activeLangIndex === index ? 'rotate-180' : ''} ${isDark ? "text-gray-500" : ""}`} />
                    </div>
                    {activeLangIndex === index && (
                      <div className={`absolute z-50 w-full mt-1 border rounded-xl shadow-xl max-h-48 overflow-y-auto ${isDark
                          ? "bg-[#2A2A2A] border-gray-700 shadow-[#5CB85C]/20"
                          : "bg-white border-gray-200 shadow-xl"
                        }`}>
                        {LANGUAGE_LEVELS.map(level => (
                          <div key={level} className={`px-4 py-2 hover:bg-[#5CB85C] hover:text-white cursor-pointer text-sm transition-colors border-b last:border-none ${isDark ? "border-gray-700 text-gray-300" : "border-gray-50"
                            }`} onClick={() => {
                              const newLangs = [...formData.languages];
                              newLangs[index].level = level;
                              setFormData({ ...formData, languages: newLangs });
                              setActiveLangIndex(null);
                            }}>
                            {level}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {index > 0 && (
                    <XCircle
                      className={`text-gray-300 hover:text-red-500 cursor-pointer transition-colors flex-shrink-0 ${isDark ? "hover:text-red-400" : ""}`}
                      onClick={() => removeField(index, 'languages')}
                      size={32}
                    />
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addField('languages')} className={`${btnStyle} px-6 py-2 rounded-full text-sm font-medium`}>
                Add language
              </button>
            </div>
          </div>

          <div className="space-y-2 mt-8">
            <label className={`text-sm font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>Job description</label>
            <div className={`border rounded-2xl overflow-hidden ${isDark ? "border-gray-700 bg-[#2A2A2A]" : "border-gray-200"
              }`}>
              <textarea
                className={`w-full p-4 h-48 focus:outline-none resize-none ${isDark ? "bg-[#2A2A2A] border-none text-white placeholder-gray-500" : "bg-white"}`}
                placeholder="Write here..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="pt-6 text-center">
            <button
              type="submit"
              disabled={loading}
              className={`${btnStyle} w-full md:w-1/3 py-3 rounded-full text-lg font-bold disabled:opacity-50`}
            >
              {loading ? "Posting..." : "Submit Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
