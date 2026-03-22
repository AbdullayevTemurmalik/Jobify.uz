import React, { useState } from "react";
import {
    FaFacebookSquare,
    FaLinkedin,
    FaTwitterSquare,
    FaYoutubeSquare,
    FaTelegram,
} from "react-icons/fa";
import { MdEmail, MdPhoneInTalk, MdLocationOn } from "react-icons/md";
import { AiOutlineGlobal } from "react-icons/ai";
import ContactImg from "../../assets/Contactimg.png";
import { contactApi } from "../../services/api";
import { useTheme } from "../../talent/Context/ThemeContext.jsx"

const Contact = () => {
    const { settings } = useTheme();
    const isDark = settings.darkMode;

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.message.trim()
        ) {
            setMessage({
                text: "Please fill in all fields before submitting.",
                type: "error",
            });
            return;
        }
        setLoading(true);
        try {
            await contactApi.sendMessage({
                ...formData,
                createdAt: new Date().toISOString(),
            });
            setMessage({
                text: "Your message has been sent successfully!",
                type: "success",
            });
            setFormData({ name: "", email: "", message: "" });
        } catch (error) {
            setMessage({
                text: "Error occurred while sending your message. Please try again later.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`min-h-screen py-4 md:py-10 px-4 font-sans transition-colors duration-500 ${isDark ? "bg-[#121212] text-white" : "bg-[#F5F5F5] text-[#1E293B]"
                }`}
        >
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="w-full flex justify-start mb-6">
                    <div
                        className={`w-full rounded-2xl py-3 px-6 md:py-4 md:px-10 shadow-sm border-l-4 transition-all duration-500 ${isDark
                            ? "bg-[#1E1E1E] border-blue-500 bg-gradient-to-r from-[#1E1E1E] via-[#1E1E1E]/70 to-transparent"
                            : "bg-white border-white bg-gradient-to-r from-white via-white/70 to-transparent"
                            }`}
                    >
                        <h1
                            className={`text-xl md:text-2xl font-semibold ${isDark ? "text-gray-100" : "text-[#505151]"
                                }`}
                        >
                            Contact Us
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    <div
                        className={`rounded-[32px] p-6 md:p-10 shadow-sm border transition-all duration-500 flex flex-col items-center w-full ${isDark
                            ? "bg-[#1E1E1E] border-gray-800"
                            : "bg-white border-gray-50"
                            }`}
                    >
                        <h2
                            className={`text-xl md:text-2xl font-bold text-center mb-8 leading-tight ${isDark ? "text-gray-100" : "text-[#333]"
                                }`}
                        >
                            Is there a message? <br /> Let us know.
                        </h2>

                        {message.text && (
                            <div
                                className={`w-full max-w-md mb-4 p-3 rounded-lg text-center text-sm ${message.type === "success"
                                    ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                                    }`}
                            >
                                {message.text}
                            </div>
                        )}

                        <form className="w-full space-y-4 max-w-md" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Your name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full p-4 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm md:text-base ${isDark
                                    ? "bg-[#252525] border-gray-700 text-white focus:ring-blue-900 placeholder:text-gray-600"
                                    : "bg-gray-50/30 border-gray-100 focus:ring-blue-100 placeholder:text-gray-300"
                                    }`}
                                disabled={loading}
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Your email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full p-4 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm md:text-base ${isDark
                                    ? "bg-[#252525] border-gray-700 text-white focus:ring-blue-900 placeholder:text-gray-600"
                                    : "bg-gray-50/30 border-gray-100 focus:ring-blue-100 placeholder:text-gray-300"
                                    }`}
                                disabled={loading}
                            />
                            <textarea
                                name="message"
                                placeholder="What is the message?"
                                rows="4"
                                value={formData.message}
                                onChange={handleChange}
                                className={`w-full p-4 rounded-xl border focus:outline-none focus:ring-2 transition-all resize-none text-sm md:text-base ${isDark
                                    ? "bg-[#252525] border-gray-700 text-white focus:ring-blue-900 placeholder:text-gray-600"
                                    : "bg-gray-50/30 border-gray-100 focus:ring-blue-100 placeholder:text-gray-300"
                                    }`}
                                disabled={loading}
                            ></textarea>

                            <div className="flex justify-center pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-12 py-3 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg w-full md:w-auto ${isDark
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : "bg-[#1B3E59] hover:bg-[#152f44]"
                                        } text-white`}
                                >
                                    {loading ? "Sending..." : "Send"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div
                            className={`rounded-[32px] p-6 shadow-sm border transition-all duration-500 flex items-center justify-center flex-grow min-h-[300px] ${isDark
                                ? "bg-[#1E1E1E] border-gray-800"
                                : "bg-white border-gray-50"
                                }`}
                        >
                            <img
                                src={ContactImg}
                                alt="Contact"
                                className={`max-h-full w-auto object-contain ${isDark ? "opacity-80" : ""
                                    }`}
                            />
                        </div>

                        <div
                            className={`rounded-2xl py-5 px-8 shadow-sm border transition-all duration-500 flex justify-center items-center gap-6 md:gap-10 ${isDark
                                ? "bg-[#1E1E1E] border-gray-800"
                                : "bg-white border-gray-50"
                                }`}
                        >
                            {[
                                FaFacebookSquare,
                                FaLinkedin,
                                FaTwitterSquare,
                                FaYoutubeSquare,
                                FaTelegram,
                            ].map((Icon, i) => (
                                <Icon
                                    key={i}
                                    className={`text-2xl md:text-3xl cursor-pointer hover:scale-110 transition-transform ${isDark ? "text-blue-400" : "text-[#1B3E59]"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div
                    className={`rounded-[32px] p-6 md:p-10 shadow-sm border transition-all duration-500 ${isDark ? "bg-[#1E1E1E] border-gray-800" : "bg-white border-gray-50"
                        }`}
                >
                    <h2
                        className={`text-xl md:text-2xl font-bold text-center mb-10 ${isDark ? "text-gray-100" : "text-[#333]"
                            }`}
                    >
                        Our contacts
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div className="space-y-6">
                            {[
                                {
                                    icon: <MdEmail />,
                                    text: "workifysupport777@mail.ru",
                                    href: "mailto:workifysupport777@mail.ru",
                                },
                                {
                                    icon: <MdPhoneInTalk />,
                                    text: "+99894-498-6565",
                                    href: "tel:+998944986565",
                                },
                                {
                                    icon: <AiOutlineGlobal />,
                                    text: "www.SyncSoft.uz",
                                    href: " https://SyncSoft.uz",
                                },
                                {
                                    icon: <MdLocationOn />,
                                    text: " A.Xodjayev Street, Korzinka near Namangan City",
                                    href: null,
                                },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-5 group">
                                    <div
                                        className={`text-2xl md:text-3xl shrink-0 group-hover:scale-110 transition-transform ${isDark ? "text-blue-400" : "text-[#1B3E59]"
                                            }`}
                                    >
                                        {item.icon}
                                    </div>
                                    {item.href ? (
                                        <a
                                            href={item.href}
                                            className={`font-medium transition-colors text-sm md:text-base ${isDark
                                                ? "text-gray-400 hover:text-white"
                                                : "text-gray-600 hover:text-blue-600"
                                                }`}
                                        >
                                            {item.text}
                                        </a>
                                    ) : (
                                        <p
                                            className={`font-medium text-sm md:text-base ${isDark ? "text-gray-400" : "text-gray-600"
                                                }`}
                                        >
                                            {item.text}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div
                            className={`rounded-3xl overflow-hidden border shadow-inner h-[250px] md:h-[350px] w-full ${isDark ? "border-gray-800" : "border-gray-100"
                                }`}
                        >
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d931.702516386193!2d71.67380983420124!3d41.00414059260599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38bb4d002546dfed%3A0xb9bab87fb75370ba!2sAlgoritm%20IT%20Center!5e0!3m2!1sen!2s!4v1768905674819!5m2!1sen!2s"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                className="hover:opacity-90 transition-all duration-700"
                                title="Our Location on Google Maps"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;