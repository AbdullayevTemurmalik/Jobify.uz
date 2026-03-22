import React, { useState, useEffect } from "react";
import { MdEmail } from "react-icons/md";
import { IoMdLock } from "react-icons/io";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { talentApi } from "../../services/api";
import Footer from "../../../Company/Footer/Footer";
import Header from "../../../Company/Header/Header";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState({
    email: false,
    password: false,
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Xatoliklarni tozalash
  useEffect(() => {
    if (errors.email || errors.password) {
      setErrors({ email: false, password: false });
    }
  }, [formData.email, formData.password]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    let val = value;
    if (id === "password") {
      val = value.replace(/\s/g, "").slice(0, 16);
    }
    setFormData({ ...formData, [id]: val });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Fill in the email field";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Fill in the password field";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors({
        email: !!validationErrors.email,
        password: !!validationErrors.password,
      });
      toast.error(validationErrors.email || validationErrors.password);
      return;
    }

    setLoading(true);

    try {
      const res = await talentApi.login({
        email: formData.email,
        password: formData.password
      });

      const { token, user } = res.data;

      if (token) {
        sessionStorage.removeItem("hasSeenSkillModal");
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Successfully logged in!");
        const redirectTo = searchParams.get("redirect") || "/talent/dashboard";

        setTimeout(() => {
          navigate(redirectTo);
        }, 1000);
      }
    } catch (error) {
      console.error("Login Error:", error);
      setErrors({ email: true, password: true });
      toast.error(error.response?.data?.message || "Wrong email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow flex flex-col justify-center items-center bg-gray-100 py-10 px-4 font-['Mulish']">
          <h2 className="text-3xl font-semibold text-center mb-6 text-gray-700">
            Login
          </h2>

          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm border border-gray-200"
          >
            {/* Email Field */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <MdEmail className={`absolute left-3 top-1/2 -translate-y-1/2 text-xl ${errors.email ? "text-red-500" : "text-gray-400"}`} />
                <input
                  type="email" id="email" placeholder="admin@gmail.com"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 outline-none transition ${errors.email ? "border-red-500 focus:ring-red-300 bg-red-50" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"}`}
                  value={formData.email} onChange={handleChange} required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <IoMdLock className={`absolute left-3 top-1/2 -translate-y-1/2 text-xl ${errors.password ? "text-red-500" : "text-gray-400"}`} />
                <input
                  type={showPassword ? "text" : "password"} id="password" placeholder="••••••••" maxLength={16}
                  className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 outline-none transition ${errors.password ? "border-red-500 focus:ring-red-300 bg-red-50" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"}`}
                  value={formData.password} onChange={handleChange} required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 mr-2 accent-[#163D5C]" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                Remember me
              </label>
              <Link to="/talent/forgot-password" className="text-sm text-[#163D5C] hover:underline font-medium">Forgot password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-bold transition-all ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#163D5C] hover:bg-[#0f2a40] shadow-lg active:scale-95"}`}
            >
              {loading ? "Processing..." : "Sign In"}
            </button>

            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{" "}
              <Link to="/talent/registration/step-1" className="text-[#163D5C] font-bold hover:underline">
                Register
              </Link>
            </p>
          </form>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SignIn;