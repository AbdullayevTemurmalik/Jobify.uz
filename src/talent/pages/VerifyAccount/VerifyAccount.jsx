import React, { useState, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";

import toast, { Toaster } from "react-hot-toast";

import { talentApi } from "../../services/api";

import verifyImg from "../../assets/verify.png";

import Header from "../../../Company/Header/Header";

import Footer from "../../../Company/Footer/Footer";



export default function VerifyAccount() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [code, setCode] = useState(new Array(6).fill(""));

  const [loading, setLoading] = useState(false);

  const [showOtp, setShowOtp] = useState(false);



  const inputRefs = useRef([]);



  useEffect(() => {

    const savedEmail = localStorage.getItem("verify_email");

    if (!savedEmail) {

      navigate("/talent/registration/step-1");

    } else {

      setEmail(savedEmail);

    }

  }, [navigate]);



  const handleChange = (e, index) => {

    const value = e.target.value;

    if (isNaN(value)) return;



    const newCode = [...code];

    newCode[index] = value.substring(value.length - 1);

    setCode(newCode);



    if (value && index < 5) {

      inputRefs.current[index + 1].focus();

    }

  };



  const handleKeyDown = (e, index) => {

    if (e.key === "Backspace") {

      if (!code[index] && index > 0) {

        const newCode = [...code];

        newCode[index - 1] = "";

        setCode(newCode);

        inputRefs.current[index - 1].focus();

      }

    }

  };



  const handlePaste = (e) => {

    const pasteData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pasteData)) return;



    const newCode = [...code];

    pasteData.split("").forEach((char, index) => {

      if (index < 6) newCode[index] = char;

    });

    setCode(newCode);



    const nextIndex = pasteData.length < 6 ? pasteData.length : 5;

    inputRefs.current[nextIndex].focus();

  };



  const handleConnectTelegram = () => {
    const botUsername = "jobify1_bot";
    window.open(`https://t.me/${botUsername}?start=${email}`, "_blank");

    talentApi.sendVerifyCode(email).catch(() => { });

  };



  const handleNextClick = () => {

    if (!showOtp) {

      setShowOtp(true);

    } else {

      handleVerify();

    }

  };



  const handleVerify = async () => {

    const finalCode = code.join("");

    if (finalCode.length < 6)

      return toast.error("Please enter the 6-digit code.");



    setLoading(true);

    try {

      await talentApi.checkVerifyCode(email, finalCode);

      toast.success("Account verified successfully!");

      setTimeout(() => navigate("/talent/signin"), 1500);

    } catch (error) {

      toast.error("Invalid code or expired. Please try again.");

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="flex flex-col min-h-screen">

      <Header />

      <main className="flex-grow flex flex-col items-center justify-center p-4 bg-white">

        <Toaster position="top-right" />



        <div className="max-w-2xl w-full text-center space-y-8">

          <h1 className="text-2xl md:text-3xl font-bold text-[#163D5C] px-4">

            Start our Telegram bot to be notified when we find a job that fits

            you perfectly!

          </h1>



          <div className="min-h-[400px] flex flex-col items-center justify-center space-y-8 transition-all duration-500">

            {!showOtp ? (

              <>

                <button

                  onClick={handleConnectTelegram}

                  className="bg-[#61C491] hover:bg-[#52a37a] text-white px-10 py-3 rounded-xl text-xl font-medium transition-all shadow-md active:scale-95"

                >

                  Click here!

                </button>



                <div className="relative flex justify-center py-4">

                  <img

                    src={verifyImg}

                    alt="Verification Illustration"

                    className="w-full max-w-[400px] h-auto animate-fade-in"

                  />

                </div>

              </>

            ) : (

              <div className="space-y-6 animate-slide-up">

                <p className="text-gray-500 font-medium">

                  Enter the 6-digit code sent to your Telegram

                </p>

                <div

                  className="flex gap-2 md:gap-4 justify-center"

                  onPaste={handlePaste}

                >

                  {code.map((data, index) => (

                    <input

                      key={index}

                      type="text"

                      maxLength="1"

                      ref={(el) => (inputRefs.current[index] = el)}

                      value={data}

                      onChange={(e) => handleChange(e, index)}

                      onKeyDown={(e) => handleKeyDown(e, index)}

                      onFocus={(e) => e.target.select()}

                      className="w-12 h-16 md:w-16 md:h-20 border-2 border-gray-100 bg-gray-50 rounded-2xl text-center text-2xl font-bold text-[#163D5C] focus:border-[#163D5C] focus:bg-white outline-none transition-all shadow-sm"

                    />

                  ))}

                </div>

                <button

                  onClick={() => setShowOtp(false)}

                  className="text-sm text-gray-400 hover:text-[#163D5C] underline"

                >

                  Resend code or change method

                </button>

              </div>

            )}

          </div>



          <div className="flex gap-4 justify-center pt-6">

            <button

              onClick={() => (showOtp ? setShowOtp(false) : navigate(-1))}

              className="px-12 py-3 border-2 border-[#163D5C] text-[#163D5C] rounded-xl font-bold hover:bg-gray-50 transition-all w-40"

            >

              Back

            </button>

            <button

              onClick={handleNextClick}

              disabled={loading}

              className="px-12 py-3 bg-[#163D5C] text-white rounded-xl font-bold hover:bg-[#1a4d73] transition-all w-40 shadow-lg disabled:opacity-70"

            >

              {loading ? "..." : "Next"}

            </button>

          </div>

        </div>

      </main>

      <Footer />

    </div>

  );

}
