import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTelegramPlane } from 'react-icons/fa';

const ForgotPasswordCombined = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [timeLeft, setTimeLeft] = useState(300);
    const [loading, setLoading] = useState(false);
    const [isExpired, setIsExpired] = useState(false);

    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "User";

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('');
            setCode(digits);
            // Oxirgi inputga fokus qilish
            setTimeout(() => inputRefs.current[5]?.focus(), 10);
        } else {
            toast.error("Iltimos, 6 xonali raqamli kodni nusxalang!");
        }
    };

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value.substring(value.length - 1);
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleNextStep = () => {
        const fullCode = code.join('');

        if (isExpired) {
            toast.error("Kodning amal qilish muddati tugagan!");
            return;
        }

        if (fullCode.length < 6) {
            toast.warn("Iltimos, tasdiqlash kodini to'liq kiriting!");
            return;
        }

        setLoading(true);
        // API chaqiruvi simulyatsiyasi
        setTimeout(() => {
            setLoading(false);
            navigate('/company/forgot-password-4', { state: { email, code: fullCode } });
        }, 1000);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-8 md:p-10 border border-gray-100 text-center">

                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-[#24A1DE]/10 rounded-full flex items-center justify-center mb-4 text-[#24A1DE]">
                        <FaTelegramPlane size={40} className="ml-[-3px]" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#1e3a5a]">Verification</h2>
                    <p className="text-gray-400 mt-2 text-sm text-center">
                        Kodni olish uchun <span className="text-[#24A1DE] font-bold">@Jobify</span> botini tekshiring.
                    </p>
                </div>

                <div className="space-y-8">
                    <div className="flex justify-between gap-2" onPaste={handlePaste}>
                        {code.map((digit, idx) => (
                            <input
                                key={idx}
                                ref={(el) => (inputRefs.current[idx] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(idx, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(idx, e)}
                                disabled={isExpired}
                                className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 rounded-2xl transition-all outline-none
                                    ${isExpired ? 'bg-gray-50 border-gray-200' :
                                        digit ? 'border-[#1e3a5a] bg-blue-50/20 text-[#1e3a5a]' : 'border-gray-200 focus:border-[#1e3a5a]'}`}
                            />
                        ))}
                    </div>

                    <div>
                        <p className={`text-sm font-medium ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                            {isExpired ? "Kod amal qilish muddati tugadi!" : `Qayta yuborish: ${formatTime(timeLeft)}`}
                        </p>
                    </div>

                    {/* TUGMALAR KONTEYNERI - O'lcham max-350px va Markazlashtirilgan */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-5 mt-8 mb-4 w-full max-w-[350px] mx-auto">

                        {/* BACK BUTTON - Birinchi (Chapda) */}
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="w-full sm:flex-1 bg-white border-2 border-[#1e3a5a] text-[#1e3a5a] hover:bg-gray-50 py-4 rounded-xl font-bold text-lg active:scale-95 transition-all order-2 sm:order-1"
                        >
                            Back
                        </button>

                        {/* NEXT BUTTON - Ikkinchi (O'ngda) */}
                        <button
                            type="button"
                            onClick={handleNextStep}
                            disabled={loading || isExpired}
                            className="w-full sm:flex-1 bg-[#1e3a5a] hover:bg-[#152c45] text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all order-1 sm:order-2"
                        >
                            {loading ? "..." : "Next"}
                        </button>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        Kodni olmadingizmi?
                        <button
                            type="button"
                            onClick={() => window.open("https://t.me/jobify1_bot", "_blank")}
                            className="ml-2 text-[#24A1DE] font-bold hover:underline cursor-pointer"
                        >
                            Botni tekshirish
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordCombined;