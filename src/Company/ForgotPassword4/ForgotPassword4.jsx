import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { confirmResetPassword } from "../../services/api";
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ForgotPassword4 = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;
    const code = location.state?.code;

    useEffect(() => {
        if (!email || !code) {
            toast.error("Xatolik yuz berdi, qaytadan urinib ko'ring.");
            navigate('/company/forgot-password-1');
        }
    }, [email, code, navigate]);

    const handleReset = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Parollar mos kelmadi!");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Parol kamida 6 ta belgi bo'lsin!");
            return;
        }

        setLoading(true);
        try {
            await confirmResetPassword(email, code, newPassword);
            toast.success("Parol muvaffaqiyatli yangilandi!");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || "Xatolik yuz berdi!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white p-4">
            <div className="w-full max-w-[500px] px-6 py-8 shadow-2xl rounded-3xl border border-gray-100 text-center">
                <h1 className="text-[28px] font-bold text-[#1e3a5a] mb-2">Create New Password</h1>
                <p className="text-gray-500 mb-8 text-sm">Please enter your new secure password</p>

                <form onSubmit={handleReset} className="space-y-6">
                    <div className="space-y-4 text-left">
                        <div className="relative">
                            <input
                                type={showPass ? "text" : "password"}
                                placeholder="New Password"
                                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-[#1e3a5a] outline-none transition-all"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPass ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                        </div>

                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-[#1e3a5a] outline-none transition-all"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1e3a5a] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#152c45] active:scale-95 transition-all disabled:bg-gray-300"
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword4;