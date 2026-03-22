import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { IoMdLock, IoMdMail } from "react-icons/io";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { talentApi } from "../../services/api";
import verifyImg from "../../assets/verify.png";
import Header from "../../../Company/Header/Header";
import Footer from "../../../Company/Footer/Footer";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isError, setIsError] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (step === 3 && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleResendCode = async () => {
    setLoading(true);
    try {
      await talentApi.sendResetCode(email);
      setTimeLeft(300);
      setCode(Array(6).fill(""));
      setIsError(false);
      toast.success("Code has been resent!");
    } catch (err) {
      toast.error("Error occurred while resending code");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d?$/.test(val)) return;
    setIsError(false);

    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);

    if (val && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newCode = [...code];
      if (!newCode[index] && index > 0) {
        newCode[index - 1] = "";
        inputRefs.current[index - 1].focus();
      } else {
        newCode[index] = "";
      }
      setCode(newCode);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newCode = pasteData.split("").concat(Array(6).fill("")).slice(0, 6);
    setCode(newCode);
    const focusIndex = Math.min(pasteData.length - 1, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!email.includes("@")) return toast.error("Invalid Email");
      setLoading(true);
      try {
        await talentApi.sendResetCode(email);
        localStorage.setItem("verify_email", email);
        setStep(2);
      } catch (err) {
        toast.error("Error: Email not found");
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      const finalCode = code.join("");
      if (finalCode.length < 6) return toast.error("Enter complete code");
      if (timeLeft === 0)
        return toast.error("Code expired! Please resend the code.");

      setLoading(true);
      try {
        const res = await talentApi.checkResetCode(email, finalCode);
        if (res.status === 200 || res.data?.success) {
          toast.success("Code confirmed!");
          setStep(4);
        }
      } catch (err) {
        setIsError(true);
        toast.error("Invalid code. Please try again.");
      } finally {
        setLoading(false);
      }
    } else if (step === 4) {
      if (newPassword.length < 6) return toast.error("Password too short");
      setLoading(true);
      try {
        await talentApi.confirmResetPassword(email, code.join(""), newPassword);
        toast.success("Password reset successful!");
        navigate("/talent/signin");
      } catch (err) {
        toast.error("Error resetting password");
      } finally {
        setLoading(false);
      }
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <Toaster position="top-right" />
        <div className="max-w-xl w-full text-center space-y-6">
          <h1 className="text-3xl font-bold text-[#163D5C]">
            {step === 4 ? "Set New Password" : "Reset your password"}
          </h1>

          {step === 1 && (
            <div className="max-w-sm mx-auto space-y-4">
              <div className="relative">
                <IoMdMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#163D5C] bg-white text-black"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <p className="text-gray-600">
                Start our Telegram bot to get reset code
              </p>
              <button
                onClick={() =>
                  window.open("https://t.me/jobify1_bot", "_blank")
                }
                className="bg-[#61C491] text-white px-8 py-2 rounded-lg font-semibold hover:bg-[#4fb17f] transition-colors"
              >
                Click here!
              </button>
              <img src={verifyImg} alt="Verify" className="mx-auto w-48" />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex justify-center gap-2">
                {code.map((v, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    value={v}
                    maxLength={1}
                    onPaste={handlePaste}
                    onChange={(e) => handleChange(e, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    disabled={timeLeft === 0}
                    className={`w-12 h-14 text-center text-xl border-2 rounded-xl outline-none bg-white text-black
                      ${
                        isError
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 focus:border-[#163D5C]"
                      }
                      ${
                        timeLeft === 0
                          ? "opacity-50 cursor-not-allowed bg-gray-50"
                          : ""
                      }
                    `}
                  />
                ))}
              </div>

              <div className="space-y-2">
                {timeLeft > 0 ? (
                  <p className="text-[#163D5C] font-bold">
                    Enter sent code: {formatTime(timeLeft)}
                  </p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-red-500 font-semibold">Time is up!!</p>
                    <button
                      onClick={handleResendCode}
                      className="text-blue-600 underline font-medium hover:text-blue-800 bg-transparent"
                    >
                      Resend Code
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="max-w-sm mx-auto space-y-4">
              <div className="relative">
                <IoMdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#163D5C] bg-white text-black"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                >
                  {showPassword ? (
                    <FaRegEyeSlash size={20} />
                  ) : (
                    <FaRegEye size={20} />
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={handleNext}
              disabled={loading || (step === 3 && timeLeft === 0)}
              className="bg-[#163D5C] text-white px-12 py-2 rounded-xl font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {loading ? "Loading..." : "Next"}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
