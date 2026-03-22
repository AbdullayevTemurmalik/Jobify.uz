import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaMapMarkerAlt,
  FaPhone,
  FaCalendarAlt,
  FaBuilding,
  FaEye,
  FaEyeSlash,
  FaChevronDown,
} from "react-icons/fa";
import { BiRefresh } from "react-icons/bi"; // Refresh iconi uchun
import Header from "../../../Company/Header/Header";
import Footer from "../../../Company/Footer/Footer";

const UZBEKISTAN_CITIES = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Andijon",
  "Buxoro",
  "Farg'ona",
  "Jizzax",
  "Xorazm",
  "Namangan",
  "Navoiy",
  "Qashqadaryo",
  "Qoraqalpog'iston Respublikasi",
  "Samarqand",
  "Sirdaryo",
  "Surxondaryo",
];

export default function RegistrationForm() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("talent");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Captcha uchun statelar
  const [captchaVisible, setCaptchaVisible] = useState(false);
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaStyles, setCaptchaStyles] = useState([]);
  const [noiseLines, setNoiseLines] = useState([]);

  // Dropdown yo'nalishini aniqlash uchun state
  const [isDropUp, setIsDropUp] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    gender: "male",
    date_of_birth: "",
    location: "",
    phone: "+998",
  });

  // Professional Captcha generatsiyasi
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    let styles = [];
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#F333FF", "#33FFF3", "#FF33A8", "#163D5C"];

    for (let i = 0; i < 6; i++) {
      const char = chars.charAt(Math.floor(Math.random() * chars.length));
      code += char;
      styles.push({
        char,
        rotate: Math.floor(Math.random() * 60) - 30,
        fontSize: Math.floor(Math.random() * 8) + 30,
        blur: "0.8px",
        opacity: Math.random() * 0.3 + 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        marginLeft: Math.floor(Math.random() * 5) - 2,
      });
    }

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

  // Joyni tekshirish funksiyasi
  const checkSpace = () => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 250) {
        setIsDropUp(true);
      } else {
        setIsDropUp(false);
      }
    }
  };

  useEffect(() => {
    const savedData = localStorage.getItem("step1_data");
    if (savedData) setFormData(JSON.parse(savedData));

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/[^\d]/g, "");
    const size = phoneNumber.length;
    if (size <= 3) return `+${phoneNumber}`;
    if (size <= 5) return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}`;
    if (size <= 8) return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5, 8)}`;
    if (size <= 10) return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5, 8)}-${phoneNumber.slice(8, 10)}`;
    return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5, 8)}-${phoneNumber.slice(8, 10)}-${phoneNumber.slice(10, 12)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "phone") {
      newValue = formatPhoneNumber(value.startsWith("+998") ? value : "+998");
    }
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validatePassword = (password) => {
    const hasLength = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLength && hasUpperCase && hasNumber;
  };

  const validateAge = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) { age--; }
    return age >= 14;
  };

  const validateForm = () => {
    const errors = {};
    const firstName = formData.first_name.trim();
    if (!firstName) errors.first_name = "Enter your first name";
    else if (firstName.length < 3) errors.first_name = "Must be at least 3 characters";

    const lastName = formData.last_name.trim();
    if (!lastName) errors.last_name = "Enter your last name";
    else if (lastName.length < 3) errors.last_name = "Must be at least 3 characters";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Invalid email address";

    if (!formData.password) errors.password = "Enter your password";
    else if (!validatePassword(formData.password)) errors.password = "Must be 6+ chars, 1 uppercase, 1 number";

    if (!formData.location) errors.location = "Select your location";
    if (!formData.date_of_birth || !validateAge(formData.date_of_birth)) errors.date_of_birth = "Min age 14 required";

    const digits = formData.phone.replace(/[^\d]/g, "");
    if (digits.length < 12) errors.phone = "Invalid phone number";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!captchaVisible) {
      generateCaptcha();
      setCaptchaVisible(true);
      return;
    }

    if (captchaInput.toUpperCase() !== captchaCode) {
      toast.error("Captcha kodi noto'g'ri!");
      generateCaptcha();
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      localStorage.setItem("step1_data", JSON.stringify(formData));
      localStorage.setItem("user_role", activeTab);
      toast.success("Muvaffaqiyatli o'tdingiz!");
      navigate("/talent/registration/step-2");
    } catch (error) {
      toast.error("Xatolik yuz berdi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputErrorClass = (fieldName) => {
    return formErrors[fieldName]
      ? "border-red-500 focus:ring-red-300 bg-red-50"
      : "border-gray-200 focus:ring-[#163D5C]";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Toaster position="top-right" />
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10">
            {/* Tab Switcher */}
            <div className="relative bg-gray-100 rounded-[50px] border border-gray-200 grid grid-cols-2 p-1 mb-8 overflow-hidden">
              <div
                className="absolute top-1 bottom-1 left-1 w-[calc(50%-0.5rem)] bg-white rounded-[50px] shadow-md transition-all duration-300"
                style={{ transform: `translateX(${activeTab === "company" ? "100%" : "0%"})` }}
              ></div>
              <button
                type="button"
                onClick={() => setActiveTab("talent")}
                className={`flex items-center justify-center gap-2 py-3 relative z-10 font-medium transition-colors ${activeTab === "talent" ? "text-[#163D5C]" : "text-gray-400"}`}
              >
                <FaUser /> <span>Talent</span>
              </button>
              <Link
                to="/company/signup"
                className={`flex items-center justify-center gap-2 py-3 relative z-10 font-medium transition-colors ${activeTab === "company" ? "text-[#163D5C]" : "text-gray-400"}`}
              >
                <FaBuilding /> <span>Company</span>
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Ism */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm">First name *</label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#163D5C]" />
                    <input
                      name="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="Enter name"
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none transition-all ${getInputErrorClass("first_name")}`}
                    />
                  </div>
                  {formErrors.first_name && <p className="text-xs text-red-500 mt-1">{formErrors.first_name}</p>}
                </div>

                {/* Familiya */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm">Last name *</label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#163D5C]" />
                    <input
                      name="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none transition-all ${getInputErrorClass("last_name")}`}
                    />
                  </div>
                  {formErrors.last_name && <p className="text-xs text-red-500 mt-1">{formErrors.last_name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm">Email *</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#163D5C]" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@mail.com"
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none transition-all ${getInputErrorClass("email")}`}
                    />
                  </div>
                  {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm">Password *</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#163D5C]" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none transition-all ${getInputErrorClass("password")}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}
                </div>

                {/* Gender Switch */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm">Gender</label>
                  <div className="relative bg-gray-100 rounded-[50px] border grid grid-cols-2 p-1 overflow-hidden h-[50px]">
                    <div
                      className="absolute top-1 bottom-1 left-1 w-[calc(50%-0.5rem)] bg-white rounded-[50px] shadow-sm transition-all duration-300"
                      style={{ transform: `translateX(${formData.gender === "female" ? "100%" : "0%"})` }}
                    ></div>
                    <button type="button" onClick={() => setFormData({ ...formData, gender: "male" })} className={`relative z-10 font-medium ${formData.gender === "male" ? "text-[#163D5C]" : "text-gray-400"}`}>Male</button>
                    <button type="button" onClick={() => setFormData({ ...formData, gender: "female" })} className={`relative z-10 font-medium ${formData.gender === "female" ? "text-[#163D5C]" : "text-gray-400"}`}>Female</button>
                  </div>
                </div>

                {/* Tug'ilgan sana */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm">Date of birth *</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[#163D5C]" />
                    <input
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none transition-all ${getInputErrorClass("date_of_birth")}`}
                    />
                  </div>
                  {formErrors.date_of_birth && <p className="text-xs text-red-500 mt-1">{formErrors.date_of_birth}</p>}
                </div>

                {/* Manzil Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-gray-700 font-medium mb-2 text-sm">Location *</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[#163D5C]" />
                    <input
                      type="text"
                      value={formData.location}
                      onFocus={() => { checkSpace(); setShowDropdown(true); }}
                      onChange={(e) => { setFormData({ ...formData, location: e.target.value }); setShowDropdown(true); }}
                      placeholder="Search city..."
                      className={`w-full pl-12 pr-10 py-3 border rounded-xl focus:outline-none transition-all ${getInputErrorClass("location")}`}
                      autoComplete="off"
                    />
                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  </div>
                  {showDropdown && (
                    <div className={`absolute z-50 w-full bg-white border rounded-xl shadow-2xl max-h-48 overflow-y-auto ${isDropUp ? "bottom-full mb-2" : "mt-2"}`}>
                      {UZBEKISTAN_CITIES.filter(c => c.toLowerCase().includes(formData.location.toLowerCase())).map(city => (
                        <div key={city} onClick={() => { setFormData({ ...formData, location: city }); setShowDropdown(false); }} className="p-3 hover:bg-slate-50 cursor-pointer text-sm border-b last:border-0 transition-colors">
                          {city}
                        </div>
                      ))}
                    </div>
                  )}
                  {formErrors.location && <p className="text-xs text-red-500 mt-1">{formErrors.location}</p>}
                </div>

                {/* Telefon */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm">Phone *</label>
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#163D5C]" />
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none transition-all ${getInputErrorClass("phone")}`}
                    />
                  </div>
                  {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
                </div>
              </div>

              {/* --- CAPTCHA SECTION --- */}
              {captchaVisible && (
                <div className="flex justify-center py-4 animate-in fade-in zoom-in duration-300">
                  <div className="w-full max-w-[320px] bg-white border border-gray-100 rounded-2xl p-5 shadow-2xl border-t-4 border-t-[#163D5C]">
                    <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-[3px] mb-4">Tasdiqlash kodi</p>
                    <div className="relative h-24 bg-[#F8FAFC] rounded-xl border border-dashed border-gray-200 overflow-hidden mb-5 select-none flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full z-0 opacity-30 pointer-events-none">
                        {noiseLines.map((l, i) => (
                          <line key={i} x1={`${l.x1}%`} y1={`${l.y1}%`} x2={`${l.x2}%`} y2={`${l.y2}%`} stroke={l.color} strokeWidth="0.8" />
                        ))}
                      </svg>
                      <div className="relative z-10 flex items-center justify-center w-full px-4">
                        {captchaStyles.map((item, idx) => (
                          <span key={idx} style={{
                            color: item.color,
                            transform: `rotate(${item.rotate}deg) translateY(${Math.random() * 10 - 5}px)`,
                            fontSize: `${item.fontSize}px`,
                            filter: `blur(${item.blur})`,
                            opacity: item.opacity,
                            fontWeight: '300',
                            display: 'inline-block',
                            margin: `0 ${item.marginLeft}px`,
                            fontFamily: '"Courier New", Courier, monospace'
                          }}>
                            {item.char}
                          </span>
                        ))}
                      </div>
                      <button type="button" onClick={generateCaptcha} className="absolute right-2 top-2 z-30 text-gray-400 hover:text-[#163D5C] transition-transform hover:rotate-180 duration-500">
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

              {/* Action Buttons */}
              <div className="pt-6 flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-10 py-3 border-2 border-[#163D5C] text-[#163D5C] rounded-xl font-semibold hover:bg-slate-50 transition-all w-full sm:w-auto"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-10 py-3 bg-[#163D5C] text-white rounded-xl font-semibold hover:bg-[#1a4d73] shadow-lg transition-all flex items-center justify-center gap-2 w-full sm:w-auto min-w-[160px]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Loading...
                    </span>
                  ) : captchaVisible ? "Confirm & Register" : "Next"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}