import React, { useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { toast, ToastContainer } from "react-toastify";

import img1 from "../../assets/img1.svg";

import { companyApi } from "../../services/api";

import LoadingSpinner from "../common/LoadingSpinner";



const TelegramVerify = () => {

  const navigate = useNavigate();

  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);

  const { allData } = location.state || {};



  const handleTelegramClick = async () => {

    // 1. Botni yangi oynada ochish
    window.open("https://t.me/jobify1_bot", "_blank");



    // 2. Bazaga yuborish

    if (allData) {

      try {

        setIsLoading(true);

        await companyApi.registerCompany(allData);

        toast.success("Details saved successfully!");

      } catch (err) {

        toast.error(err.message || "Connection error");

      } finally {

        setIsLoading(false);

      }

    } else {

      toast.warning("No data found to save. Please go back.");

    }

  };



  return (

    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">

      <ToastContainer />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">

        <p className="text-gray-500 text-sm mb-8 font-bold leading-relaxed">
          Start our Telegram bot to be notified when we find the best talent for
          you!
        </p>



        <button

          onClick={handleTelegramClick}

          disabled={isLoading}

          className="w-[185px] h-[50px] bg-[#24A1DE] text-white rounded-2xl font-bold shadow-md hover:bg-[#208aba] transition-all mb-6 flex items-center justify-center mx-auto disabled:opacity-50"

        >

          {isLoading ? <LoadingSpinner size="sm" /> : "Click here!"}

        </button>



        <img

          src={img1}

          alt="Illustration"

          className="w-full max-w-[280px] mx-auto mb-6 h-auto"

        />



        <div className="flex gap-4 pt-6 border-t border-gray-100">

          <button

            onClick={() => navigate("/company/signup", { state: { allData } })} // MA'LUMOTLARNI QAYTARISH

            className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-500 font-medium hover:bg-gray-50"

          >

            Back

          </button>

          <button
            onClick={() =>
              navigate("/company/signup/verify", { state: { ...allData } })
            }
            className="flex-1 py-3 bg-[#163D5C] text-white rounded-xl font-bold hover:opacity-90"

          >

            Next

          </button>

        </div>

      </div>

    </div>

  );

};

export default TelegramVerify;
