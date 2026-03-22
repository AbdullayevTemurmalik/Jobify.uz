import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ForgotPassword2 = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";

    const handleOpenBot = () => {
        window.open("https://t.me/jobify1_bot", "_blank");
    };

    // NEXT tugmasi uchun funksiya
    const handleGoNext = () => {
        // Bu yerda hech qanday kod kiritilmagani uchun to'g'ridan-to'g'ri 3-sahifaga o'tamiz
        navigate('/company/forgot-password-3', { state: { email } });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white pt-10 font-sans p-4">
            <div className="w-full max-w-[500px] px-6 text-center">

                {/* TITLE */}
                <h1 className="text-[28px] md:text-[32px] font-bold text-[#1e3a5a] mb-4">
                    Reset your password
                </h1>

                {/* DESCRIPTION */}
                <p className="text-[#5b7083] text-[16px] md:text-[18px] mb-6">
                    Start our Telegram bot to get reset code
                </p>

                {/* TELEGRAM BUTTON */}
                <button
                    onClick={handleOpenBot}
                    className="bg-[#70cc96] hover:bg-[#5eb683] text-white px-10 py-3 rounded-lg font-bold text-[18px] mb-8 transition-colors duration-300 active:scale-95"
                >
                    Click here!
                </button>

                {/* IMAGE CONTAINER */}
                <div className="flex justify-center mb-10">
                    <img
                        src="https://img.freepik.com/premium-vector/robot-holding-smartphone-online-chatting-bot-concept_270158-450.jpg"
                        alt="Telegram bot illustration"
                        className="w-48 h-auto object-contain"
                    />
                </div>

                {/* BUTTON CONTAINER - Back chapda, Next o'ngda */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-5 mt-8 mb-12 w-full max-w-[350px] mx-auto">

                    {/* BACK BUTTON */}
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="w-full sm:flex-1 bg-white border-2 border-[#1e3a5a] text-[#1e3a5a] hover:bg-gray-50 py-4 rounded-xl font-bold text-lg active:scale-95 transition-all order-2 sm:order-1"
                    >
                        Back
                    </button>

                    {/* NEXT BUTTON */}
                    <button
                        type="button"
                        onClick={handleGoNext}
                        className="w-full sm:flex-1 bg-[#1e3a5a] hover:bg-[#152c45] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/10 active:scale-95 transition-all order-1 sm:order-2"
                    >
                        Next
                    </button>

                </div>
            </div>
        </div>
    );
};

export default ForgotPassword2;