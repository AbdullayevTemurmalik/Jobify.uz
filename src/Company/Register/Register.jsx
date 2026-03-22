import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { BiSolidCity, BiRefresh } from "react-icons/bi";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaChevronDown,
  FaLock,
  FaEye,
  FaUser,
  FaBuilding,
  FaEyeSlash,
} from "react-icons/fa";
import { PiFlagPennantFill } from "react-icons/pi";
import { COUNTRIES, UZBEK_REGIONS, INDUSTRIES } from "../../services/api";

const SignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("company");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVisible, setCaptchaVisible] = useState(false); // Captcha ko'rinishi uchun

  const [formData, setFormData] = useState({
    company_name: "",
    phone: "",
    email: "",
    password: "",
    website: "",
    industry: "",
    country: "Uzbekistan",
    city: "",
  });

  // --- Captcha State ---
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaStyles, setCaptchaStyles] = useState([]);
  const [noiseLines, setNoiseLines] = useState([]);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    let styles = [];

    // Ranglar palitrasini kengaytirdik (Rasmdegidek yorqinroq ranglar)
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#F333FF", "#33FFF3", "#FF33A8", "#163D5C"];

    for (let i = 0; i < 6; i++) {
      const char = chars.charAt(Math.floor(Math.random() * chars.length));
      code += char;
      styles.push({
        char,
        rotate: Math.floor(Math.random() * 60) - 30, // Ko'proq qiyshaytirish (-30 dan 30 gacha)
        fontSize: Math.floor(Math.random() * 8) + 30, // 30px dan 38px gacha (Katta-kichik)
        blur: "0.8px", // Siz aytgan 35/100 darajadagi xiralik (blur)
        opacity: Math.random() * 0.3 + 0.6, // Shaffoflik
        color: colors[Math.floor(Math.random() * colors.length)], // Har bir harf har xil rangda
        marginLeft: Math.floor(Math.random() * 5) - 2, // Harflar bir-biriga yaqin yoki uzoq
      });
    }

    // Shovqin chiziqlarini ko'paytiramiz (Professional ko'rinish uchun)
    const lines = Array.from({ length: 8 }).map(() => ({
      x1: Math.random() * 100,
      y1: Math.random() * 100,
      x2: Math.random() * 100,
      y2: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    setCaptchaCode(code);
    setCaptchaStyles(styles);
    setNoiseLines(lines);
    setCaptchaInput("");
  };



  const handleNext = (e) => {
    e.preventDefault();

    // 1. Avval validatsiya
    const required = ["company_name", "phone", "email", "password", "industry", "city"];
    for (let key of required) {
      if (!formData[key]) {
        setCaptchaVisible(false); // Xato bo'lsa captchani yopish
        return toast.error(`${key.replace("_", " ")} to'ldirilishi shart!`);
      }
    }

    // 2. Agar Captcha hali chiqmagan bo'lsa, uni chiqarish
    if (!captchaVisible) {
      generateCaptcha();
      setCaptchaVisible(true);
      return;
    }

    // 3. Captcha kiritilgan bo'lsa, uni tekshirish
    if (captchaInput.toUpperCase() !== captchaCode.toUpperCase()) {
      generateCaptcha();
      return toast.error("Captcha kodi noto'g'ri!");
    }

    // 4. Hammasi tayyor bo'lsa o'tish
    navigate("/company/signup/telegram", { state: { allData: formData } });
  };

  // --- Dropdown Logic ---
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [industrySearch, setIndustrySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [dropUpIndustry, setDropUpIndustry] = useState(false);
  const [dropUpCity, setDropUpCity] = useState(false);

  const industryRef = useRef(null);
  const cityRef = useRef(null);

  const checkSpace = (ref, setDropUp) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDropUp(window.innerHeight - rect.bottom < 280);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length === 0) { setFormData(p => ({ ...p, [name]: "" })); return; }
      let mainDigits = digits.startsWith("998") ? digits.slice(3) : digits;
      mainDigits = mainDigits.substring(0, 9);
      let formatted = "+998 ";
      if (mainDigits.length > 0) formatted += "(" + mainDigits.substring(0, 2);
      if (mainDigits.length > 2) formatted += ") " + mainDigits.substring(2, 5);
      if (mainDigits.length > 5) formatted += "-" + mainDigits.substring(5, 7);
      if (mainDigits.length > 7) formatted += "-" + mainDigits.substring(7, 9);
      setFormData(p => ({ ...p, [name]: formatted }));
    } else {
      setFormData(p => ({ ...p, [name]: value }));
    }
  };

  const inputStyle = "w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#163D5C]/20 focus:border-[#163D5C] text-sm transition-all";
  const labelStyle = "block text-gray-700 font-semibold mb-1.5 text-sm";
  const iconStyle = "absolute text-gray-400 left-4 top-1/2 -translate-y-1/2 text-lg z-10";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <ToastContainer position="top-center" autoClose={2500} />
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 sm:p-10">

        {/* Tab switcher */}
        <div className="relative bg-gray-100 rounded-full border border-gray-200 grid grid-cols-2 p-1 mb-8">
          <Link to="/talent/registration/step-1" className="flex items-center justify-center gap-2 py-3 font-medium text-gray-400 text-sm">
            <FaUser /> Talent
          </Link>
          <div className="flex items-center justify-center gap-2 py-3 bg-white shadow-md rounded-full font-bold text-[#163D5C] text-sm">
            <FaBuilding /> Company
          </div>
        </div>

        <form onSubmit={handleNext} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div className="space-y-1">
              <label className={labelStyle}>Company name *</label>
              <div className="relative"><BiSolidCity className={iconStyle} /><input name="company_name" value={formData.company_name} onChange={handleChange} className={inputStyle} placeholder="TechCells" /></div>
            </div>

            <div className="space-y-1">
              <label className={labelStyle}>Phone *</label>
              <div className="relative"><FaPhoneAlt className={iconStyle} /><input name="phone" value={formData.phone} onChange={handleChange} className={inputStyle} placeholder="+998 (99) 123-45-67" /></div>
            </div>

            <div className="space-y-1">
              <label className={labelStyle}>Email *</label>
              <div className="relative"><FaEnvelope className={iconStyle} /><input name="email" type="email" value={formData.email} onChange={handleChange} className={inputStyle} placeholder="example@domain.com" /></div>
            </div>

            <div className="space-y-1">
              <label className={labelStyle}>Password *</label>
              <div className="relative">
                <FaLock className={iconStyle} />
                <input name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} className={inputStyle} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#163D5C]">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelStyle}>Website (Optional)</label>
              <div className="relative"><FaGlobe className={iconStyle} /><input name="website" value={formData.website} onChange={handleChange} className={inputStyle} placeholder="www.TechCells.com" /></div>
            </div>

            <div className="space-y-1">
              <label className={labelStyle}>Country *</label>
              <div className="relative"><PiFlagPennantFill className={iconStyle} /><input readOnly value={formData.country} className={`${inputStyle} bg-gray-50`} /></div>
            </div>

            {/* Industry Dropdown */}
            <div className="relative space-y-1" ref={industryRef}>
              <label className={labelStyle}>Industry *</label>
              <div className="relative cursor-pointer" onClick={() => { checkSpace(industryRef, setDropUpIndustry); setShowIndustryDropdown(!showIndustryDropdown); }}>
                <BiSolidCity className={iconStyle} />
                <input readOnly value={formData.industry} className={`${inputStyle} cursor-pointer`} placeholder="Select Industry" />
                <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-[10px]" />
              </div>
              {showIndustryDropdown && (
                <div className={`absolute z-50 w-full bg-white border border-gray-100 rounded-xl shadow-2xl max-h-52 overflow-y-auto ${dropUpIndustry ? "bottom-full mb-2" : "mt-2"}`}>
                  <div className="sticky top-0 bg-white p-2 border-b border-gray-50">
                    <input autoFocus className="w-full px-3 py-1.5 bg-gray-50 rounded-md outline-none text-xs" placeholder="Search..." onChange={(e) => setIndustrySearch(e.target.value)} />
                  </div>
                  {INDUSTRIES.filter(i => i.toLowerCase().includes(industrySearch.toLowerCase())).map(i => (
                    <div key={i} onClick={() => { setFormData(p => ({ ...p, industry: i })); setShowIndustryDropdown(false); }} className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm border-b border-gray-50 last:border-0">{i}</div>
                  ))}
                </div>
              )}
            </div>

            {/* City Dropdown */}
            <div className="relative space-y-1" ref={cityRef}>
              <label className={labelStyle}>City *</label>
              <div className="relative cursor-pointer" onClick={() => { checkSpace(cityRef, setDropUpCity); setShowCityDropdown(!showCityDropdown); }}>
                <BiSolidCity className={iconStyle} />
                <input readOnly value={formData.city} className={`${inputStyle} cursor-pointer`} placeholder="Select City" />
                <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-[10px]" />
              </div>
              {showCityDropdown && (
                <div className={`absolute z-50 w-full bg-white border border-gray-100 rounded-xl shadow-2xl max-h-52 overflow-y-auto ${dropUpCity ? "bottom-full mb-2" : "mt-2"}`}>
                  <div className="sticky top-0 bg-white p-2 border-b border-gray-50">
                    <input autoFocus className="w-full px-3 py-1.5 bg-gray-50 rounded-md outline-none text-xs" placeholder="Search city..." onChange={(e) => setCitySearch(e.target.value)} />
                  </div>
                  {UZBEK_REGIONS.filter(c => c.toLowerCase().includes(citySearch.toLowerCase())).map(c => (
                    <div key={c} onClick={() => { setFormData(p => ({ ...p, city: c })); setShowCityDropdown(false); }} className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm border-b border-gray-50 last:border-0">{c}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* --- PROFESSIONAL CAPTCHA SECTION --- */}
          {captchaVisible && (
            <div className="flex justify-center py-4 animate-in fade-in zoom-in duration-300">
              <div className="w-full max-w-[320px] bg-white border border-gray-100 rounded-2xl p-5 shadow-2xl border-t-4 border-t-[#163D5C]">
                <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-[3px] mb-4">Tasdiqlash kodi</p>

                <div className="relative h-24 bg-[#F8FAFC] rounded-xl border border-dashed border-gray-200 overflow-hidden mb-5 select-none flex items-center justify-center">
                  {/* Shovqin chiziqlari (Harflar ostida va ustida) */}
                  <svg className="absolute inset-0 w-full h-full z-0 opacity-30 pointer-events-none">
                    {noiseLines.map((l, i) => (
                      <line key={i} x1={`${l.x1}%`} y1={`${l.y1}%`} x2={`${l.x2}%`} y2={`${l.y2}%`} stroke={l.color} strokeWidth="0.8" />
                    ))}
                  </svg>

                  {/* Harflar qatlami */}
                  <div className="relative z-10 flex items-center justify-center w-full px-4">
                    {captchaStyles.map((item, idx) => (
                      <span key={idx} style={{
                        color: item.color,
                        transform: `rotate(${item.rotate}deg) translateY(${Math.random() * 10 - 5}px)`, // Har xil balandlik
                        fontSize: `${item.fontSize}px`,
                        filter: `blur(${item.blur})`,
                        opacity: item.opacity,
                        fontWeight: '300', // Ingichka shrift (Rasmdegidek)
                        display: 'inline-block',
                        margin: `0 ${item.marginLeft}px`,
                        fontFamily: '"Courier New", Courier, monospace' // Captcha uchun mos shrift
                      }}>
                        {item.char}
                      </span>
                    ))}
                  </div>

                  {/* Yangilash tugmasi */}
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="absolute right-2 top-2 z-30 text-gray-400 hover:text-[#163D5C] transition-transform hover:rotate-180 duration-500"
                  >
                    <BiRefresh size={24} />
                  </button>
                </div>

                <input
                  autoFocus
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="KODNI KIRITING"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-center focus:ring-2 focus:ring-[#163D5C]/20 focus:bg-white outline-none font-bold text-sm tracking-[6px] uppercase transition-all"
                />
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-4 justify-center">
            <button type="button" onClick={() => navigate("/")} className="px-10 py-3 border-2 border-[#163D5C] text-[#163D5C] rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Back</button>
            <button type="submit" className="px-10 py-3 bg-[#163D5C] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#163D5C]/20 hover:bg-[#1c4d74] transition-colors">
              {captchaVisible ? "Verify & Next" : "Next"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;