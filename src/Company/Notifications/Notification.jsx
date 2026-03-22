import React, { useState, useEffect } from 'react';
import { useTheme } from "../../talent/Context/ThemeContext";
import { notificationApi } from "../../services/api";
import { IoNotificationsOutline, IoCheckmarkDoneSharp, IoTrashOutline, IoMailOpenOutline, IoMailUnreadOutline } from "react-icons/io5";
import { formatDistanceToNow, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { jwtDecode } from 'jwt-decode'; // Tokenni dekod qilish uchun kerak

const Notification = () => {
    const { settings } = useTheme();
    const isDark = settings?.darkMode;

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('unread');
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

    const fetchNotifications = async () => {
        try {
            setLoading(true);

            // 1. Tokenni olish va kompaniya ID sini aniqlash
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            let currentCompanyId = null;

            if (token) {
                const decoded = jwtDecode(token);
                // Backendda company_id qanday nomlangan bo'lsa shuni oling (masalan: decoded.company_id yoki decoded.id)
                currentCompanyId = decoded.company_id || decoded.id;
            }

            const res = await notificationApi.getAll();

            if (res.data && Array.isArray(res.data)) {
                // 2. Faqat shu kompaniyaga tegishli xabarlarni filterlash
                const filteredData = res.data.filter(n =>
                    Number(n.company_id) === Number(currentCompanyId)
                );

                // 3. Saralash (Yangi xabarlar tepada)
                const sortedData = filteredData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setNotifications(sortedData);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await notificationApi.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            window.dispatchEvent(new Event('userInfoUpdated'));
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const handleDelete = async (id) => {
        if (activeTab === 'read') {
            try {
                await notificationApi.delete(id);
                setNotifications(prev => prev.filter(n => n.id !== id));
                window.dispatchEvent(new Event('userInfoUpdated'));
            } catch (error) {
                console.error("Error deleting:", error);
            }
        } else {
            setDeleteModal({ open: true, id });
        }
    };

    const confirmDelete = async () => {
        try {
            await notificationApi.delete(deleteModal.id);
            setNotifications(prev => prev.filter(n => n.id !== deleteModal.id));
            setDeleteModal({ open: false, id: null });
            window.dispatchEvent(new Event('userInfoUpdated'));
        } catch (error) {
            console.error("Error deleting:", error);
        }
    };

    const getTimeAgo = (dateStr) => {
        if (!dateStr) return 'Just now';
        try {
            return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: enUS });
        } catch (e) { return "Just now"; }
    };

    const unreadList = notifications.filter(n => !n.is_read);
    const readList = notifications.filter(n => n.is_read);
    const displayList = activeTab === 'unread' ? unreadList : readList;

    const SkeletonItem = () => (
        <div className={`p-6 rounded-[28px] border animate-pulse ${isDark ? 'bg-[#1E1E1E] border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className="flex gap-4">
                <div className="w-3 h-3 rounded-full bg-gray-300 mt-2" />
                <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2 bg-gray-100 rounded w-1/6" />
                </div>
            </div>
        </div>
    );

    return (
        <div className={`p-4 md:p-10 min-h-screen transition-all duration-300 overflow-x-hidden ${isDark ? 'bg-[#121212]' : 'bg-[#F8F9FA]'}`}>
            <div className="max-w-6xl mx-auto">
                <div className={`flex flex-col lg:flex-row items-center justify-between gap-4 p-3 md:p-4 rounded-[24px] mb-8 border transition-all ${isDark ? 'bg-[#1E1E1E] border-gray-800 shadow-xl' : 'bg-white border-gray-100 shadow-md'}`}>
                    <div className="flex items-center gap-3 px-2 w-full lg:w-auto">
                        <div className={`p-2 rounded-xl shrink-0 ${isDark ? 'bg-[#5CB85C]/10 text-[#5CB85C]' : 'bg-[#163D5C]/5 text-[#163D5C]'}`}>
                            <IoNotificationsOutline size={26} />
                        </div>
                        <h1 className={`text-xl md:text-2xl font-black ${isDark ? 'text-white' : 'text-[#163D5C]'}`}>
                            Notifications
                        </h1>
                    </div>

                    <div className={`flex w-full lg:max-w-md p-1.5 rounded-[20px] ${isDark ? 'bg-black/20' : 'bg-gray-100/50'}`}>
                        <button
                            onClick={() => setActiveTab('unread')}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-[16px] text-xs sm:text-sm md:text-base font-bold transition-all duration-300 ${activeTab === 'unread'
                                ? (isDark ? 'bg-[#5CB85C] text-white shadow-lg' : 'bg-[#163D5C] text-white shadow-md')
                                : (isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-[#163D5C]')}`}
                        >
                            <IoMailUnreadOutline size={18} className="shrink-0" />
                            <span className="whitespace-nowrap">New ({unreadList.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('read')}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-[16px] text-xs sm:text-sm md:text-base font-bold transition-all duration-300 ${activeTab === 'read'
                                ? (isDark ? 'bg-[#5CB85C] text-white shadow-lg' : 'bg-[#163D5C] text-white shadow-md')
                                : (isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-[#163D5C]')}`}
                        >
                            <IoMailOpenOutline size={18} className="shrink-0" />
                            <span className="whitespace-nowrap">Archive ({readList.length})</span>
                        </button>
                    </div>
                </div>

                <div className="grid gap-4">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => <SkeletonItem key={i} />)
                    ) : displayList.length > 0 ? (
                        displayList.map((n) => (
                            <div
                                key={n.id}
                                className={`group p-5 md:p-6 rounded-[28px] border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
                                    ${isDark
                                        ? (n.is_read ? 'bg-[#1E1E1E] border-gray-800' : 'bg-[#1E1E1E] border-[#5CB85C]/30 shadow-lg')
                                        : (n.is_read ? 'bg-white border-gray-100 shadow-sm' : 'bg-white border-[#163D5C]/10 shadow-md')}`}
                            >
                                <div className="flex gap-3 md:gap-4 items-start flex-1 min-w-0 w-full">
                                    {!n.is_read && <div className="mt-2 shrink-0 w-2.5 h-2.5 rounded-full bg-[#5CB85C] shadow-[0_0_8px_#5CB85C] animate-pulse" />}
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-bold text-base md:text-lg leading-tight truncate ${isDark ? 'text-white' : 'text-[#163D5C]'}`}>
                                            {n.title}
                                        </h3>
                                        <p className={`text-sm mt-1 mb-2 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-[#5A6A7D]'}`}>
                                            {n.message}
                                        </p>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                            {getTimeAgo(n.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                    {!n.is_read ? (
                                        <button
                                            onClick={() => markAsRead(n.id)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${isDark
                                                ? 'bg-gray-800 text-[#5CB85C] border-gray-700 hover:bg-[#5CB85C] hover:text-white'
                                                : 'bg-white text-[#163D5C] border-gray-200 hover:bg-[#163D5C] hover:text-white'}`}
                                        >
                                            <IoCheckmarkDoneSharp size={18} />
                                            <span>Mark Read</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleDelete(n.id)}
                                            className={`p-2.5 rounded-xl transition-all border ${isDark
                                                ? 'bg-gray-800 text-red-400 border-gray-700 hover:bg-red-500 hover:text-white'
                                                : 'bg-white text-red-500 border-gray-200 hover:bg-red-500 hover:text-white'}`}
                                        >
                                            <IoTrashOutline size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <p className={`text-lg font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                No {activeTab} notifications.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] px-4">
                    <div className={`p-8 rounded-[32px] max-w-sm w-full shadow-2xl animate-in zoom-in duration-200 ${isDark ? 'bg-[#1E1E1E] border border-gray-800' : 'bg-white'}`}>
                        <div className="text-center">
                            <h3 className={`text-xl font-black mb-6 ${isDark ? 'text-white' : 'text-[#163D5C]'}`}>Delete Unread?</h3>
                            <p className="text-gray-500 mb-6 text-sm">This notification hasn't been read yet. Still delete?</p>
                            <div className="flex gap-4">
                                <button onClick={() => setDeleteModal({ open: false, id: null })} className="flex-1 py-3 rounded-xl bg-gray-100 font-bold text-gray-500">Cancel</button>
                                <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/30">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notification;