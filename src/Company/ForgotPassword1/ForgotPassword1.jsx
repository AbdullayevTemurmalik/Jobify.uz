import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendResetCode } from "../../services/api";

const ForgotPassword1 = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleNext = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await sendResetCode(email);
            navigate('/company/forgot-password-2', { state: { email } });
        } catch (err) {
            // Xatolik kelganda state yangilanadi va input qizaradi
            setError(typeof err === 'string' ? err : "Email topilmadi!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white font-sans p-4">
            <div className="w-full max-w-[500px] px-6">

                <h1 className="text-[28px] md:text-[36px] font-bold text-[#1e3a5a] text-center mb-10 tracking-tight">
                    Reset your password
                </h1>

                <form onSubmit={handleNext} className="flex flex-col items-center">

                    {/* INPUT CONTAINER */}
                    <div className="relative w-full mb-6">
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-4 transition-colors ${error ? 'text-red-500' : 'text-gray-400'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="20" height="16" x="2" y="4" rx="2" />
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                        </span>
                        <input
                            type="email"
                            placeholder="Email"
                            required
                            className={`w-full pl-12 pr-4 py-4 border rounded-[10px] text-[18px] shadow-sm focus:outline-none transition-all placeholder-gray-400 ${error
                                    ? 'border-red-500 border-[2px] focus:ring-0'
                                    : 'border-gray-300 focus:ring-1 focus:ring-blue-400 focus:border-transparent'
                                }`}
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError(''); // Foydalanuvchi yozishni boshlasa qizilni yo'qotadi
                            }}
                        />
                    </div>

                    {/* ERROR MESSAGE */}
                    <div className="min-h-[24px] w-full mb-4">
                        {error && <p className="text-red-500 text-sm self-start pl-1 animate-pulse">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-[180px] bg-[#1e3a5a] text-white py-3 rounded-[10px] font-bold text-[18px] shadow-md hover:bg-[#152c45] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? "..." : "Next"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword1;