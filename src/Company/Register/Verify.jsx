import React, { useState, useEffect } from "react";

import { ToastContainer, toast } from "react-toastify";

import { useNavigate, useLocation } from "react-router-dom";

import LoadingSpinner from "../common/LoadingSpinner";

import { companyApi } from "../../services/api";



const Verify = () => {

  const navigate = useNavigate();

  const location = useLocation();



  // Kodni massiv ko'rinishida saqlash boshqarishni osonlashtiradi

  const [code, setCode] = useState(["", "", "", "", "", ""]);

  const [countdown, setCountdown] = useState(300);

  const [isLoading, setIsLoading] = useState(false);



  const email = location.state?.email;



  useEffect(() => {

    if (!email) {

      toast.error("No email provided for verification");

      navigate("/company/signup");

    }

  }, [email, navigate]);



  useEffect(() => {

    let timer;

    if (countdown > 0) {

      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);

    }

    return () => clearInterval(timer);

  }, [countdown]);



  const formatTime = (seconds) => {

    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;

  };



  // Har bir input o'zgarganda ishlaydi

  const handleChange = (index, value) => {

    const val = value.replace(/\D/g, ""); // Faqat raqam

    if (val.length <= 1) {

      const newCode = [...code];

      newCode[index] = val;

      setCode(newCode);



      // Keyingi inputga o'tish

      if (val && index < 5) {

        document.getElementById(`code-input-${index + 1}`).focus();

      }

    }

  };



  const handleKeyDown = (index, e) => {

    if (e.key === "Backspace" && !code[index] && index > 0) {

      document.getElementById(`code-input-${index - 1}`).focus();

    }

  };



  const handlePaste = (e) => {

    const pasteData = e.clipboardData.getData("text").trim().slice(0, 6);

    if (/^\d{6}$/.test(pasteData)) {

      setCode(pasteData.split(""));

      document.getElementById("code-input-5").focus();

    }

    e.preventDefault();

  };



  const handleVerify = async (e) => {

    e.preventDefault();

    const fullCode = code.join(""); // Massivni stringga aylantiramiz



    if (countdown === 0) return toast.error("Code expired!");

    if (fullCode.length !== 6) return toast.error("Enter full 6-digit code");



    try {

      setIsLoading(true);

      // API ga yuborish

      const response = await companyApi.verifyCode(email, fullCode);



      toast.success("Verification successful!");

      if (response.token) localStorage.setItem("authToken", response.token);

      localStorage.setItem("companyEmail", email);



      setTimeout(() => navigate("/company/signin"), 1500);

    } catch (err) {

      toast.error(err.message || "Verification failed");

      setCode(["", "", "", "", "", ""]); // Xato bo'lsa tozalash

      document.getElementById("code-input-0").focus();

    } finally {

      setIsLoading(false);

    }

  };



  return (

    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">

      <ToastContainer />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">

        <h2 className="text-2xl font-bold text-[#163D5C] mb-2 text-center">

          Verification

        </h2>

        <p className="text-gray-500 text-sm text-center mb-8">

          Sent to: <b>{email}</b>

        </p>



        <div className="text-center mb-6">

          <div

            className={`inline-block px-4 py-2 rounded-full text-xs font-bold ${countdown > 60 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}

          >

            {formatTime(countdown)} remaining

          </div>

        </div>



        <form onSubmit={handleVerify}>

          <div className="flex gap-2 justify-center mb-8" onPaste={handlePaste}>

            {code.map((digit, i) => (

              <input

                key={i}

                id={`code-input-${i}`}

                type="text"

                maxLength="1"

                inputMode="numeric"

                value={digit}

                onChange={(e) => handleChange(i, e.target.value)}

                onKeyDown={(e) => handleKeyDown(i, e)}

                className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#163D5C] focus:ring-0 outline-none transition-all"

                autoComplete="off"

              />

            ))}

          </div>



          <div className="flex gap-4">

            <button

              type="button"

              onClick={() => navigate(-1)}

              className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold text-gray-500"

            >

              Back

            </button>

            <button

              type="submit"

              disabled={isLoading || countdown === 0}

              className="flex-1 py-4 bg-[#163D5C] text-white rounded-2xl font-bold shadow-lg disabled:opacity-50"

            >

              {isLoading ? "Checking..." : "Verify"}

            </button>

          </div>

        </form>

      </div>

    </div>

  );

};

export default Verify;