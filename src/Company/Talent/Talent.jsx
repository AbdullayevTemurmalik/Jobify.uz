import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { talentApi } from '../../services/api';

import { HiOutlineLocationMarker } from "react-icons/hi";

import toast from 'react-hot-toast';



function Talents() {

    const [talents, setTalents] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    const [expandedAbout, setExpandedAbout] = useState({});

    const navigate = useNavigate();



    useEffect(() => {

        const fetchTalents = async () => {

            try {

                setLoading(true);

                const response = await talentApi.getAll();

                setTalents(response.data || []);

            } catch (err) {

                console.error('API Error:', err);

                setError("Ma'lumotlarni yuklashda xatolik yuz berdi");

            } finally {

                setLoading(false);

            }

        };

        fetchTalents();

    }, []);



    // --- TUZATILGAN FUNKSIYA ---

    const handleViewProfile = (talentId) => {

        const token = localStorage.getItem("token") || sessionStorage.getItem("token");



        if (!token) {

            // 1. Toast xabarini chiqarish

            toast.error("Profilni ko'rish uchun ro'yxatdan o'ting!", {

                duration: 4000,

                position: 'top-center',

            });



            // 2. Login sahifasiga yo'naltirish (sizning loyihangizga qarab pathni to'g'rilang)

            // Masalan: navigate('/company/signin') yoki navigate('/roleSelection')

            navigate('/roleSelection');



            return;

        }



        // Token bo'lsa profilga o'tadi

        navigate(`/talents/${talentId}`);

    };

    // ---------------------------



    const toggleExpand = (id) => {

        setExpandedAbout(prev => ({ ...prev, [id]: !prev[id] }));

    };



    const formatCount = (count) => new Intl.NumberFormat('de-DE').format(count);



    const formatPrice = (price) => {

        const value = price || 0;

        return new Intl.NumberFormat('en-US', {

            style: 'currency',

            currency: 'USD',

            minimumFractionDigits: 2,

        }).format(value);

    };



    const parseSkills = (skillsStr) => {

        try {

            if (!skillsStr) return [];

            const parsed = JSON.parse(skillsStr);

            return Array.isArray(parsed) ? parsed : [];

        } catch (e) { return []; }

    };



    const getInitials = (firstName, lastName) => {

        const f = firstName ? firstName.charAt(0).toUpperCase() : '';

        const l = lastName ? lastName.charAt(0).toUpperCase() : '';

        return (f + l) || '?';

    };



    const SkeletonCard = () => (

        <div className="bg-white border border-gray-100 rounded-xl shadow-md overflow-hidden animate-pulse">

            <div className="p-5 md:p-7">

                <div className="flex flex-col md:flex-row justify-between items-start gap-6">

                    <div className="flex items-center gap-4 md:gap-5 w-full">

                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 shrink-0"></div>

                        <div className="flex-1 space-y-3">

                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>

                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>

                        </div>

                    </div>

                </div>

                <div className="mt-6 space-y-2">

                    <div className="h-4 bg-gray-200 rounded w-full"></div>

                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>

                </div>

            </div>

            <div className="p-5 md:p-8 border-t border-gray-50">

                <div className="h-10 bg-gray-200 rounded w-full md:w-1/3 ml-auto"></div>

            </div>

        </div>

    );



    if (error) return <div className="flex justify-center items-center min-h-screen text-red-500 font-medium">{error}</div>;



    return (

        <div className="bg-[#fcfcfc] min-h-screen p-4 md:p-8 font-sans">

            <div className="max-w-6xl mx-auto">

                <div className="mb-6">

                    <div className="flex items-baseline gap-2 pb-3">

                        <span className="text-[20px] md:text-[25px] font-medium text-[#404040]">

                            {loading ? "..." : formatCount(talents.length)}

                        </span>

                        <span className="text-[20px] md:text-[25px] font-medium text-[#404040] lowercase">

                            talents

                        </span>

                    </div>

                    <div className="h-[1.5px] w-full bg-[#e5e7eb]"></div>

                </div>



                <div className="space-y-5">

                    {loading ? (

                        [1, 2, 3].map((i) => <SkeletonCard key={i} />)

                    ) : (

                        talents.map((talent) => {

                            const skills = parseSkills(talent.skils);

                            const isExpanded = expandedAbout[talent.id];

                            const aboutText = talent.about || "Experience and passion in building great products...";



                            return (

                                <div key={talent.id} className="bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">

                                    <div className="p-5 md:p-7">

                                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">

                                            <div className="flex items-center gap-4 md:gap-5">

                                                <div className="relative shrink-0 w-16 h-16 md:w-20 md:h-20">

                                                    {talent.image ? (

                                                        <img

                                                            src={talent.image}

                                                            alt={talent.first_name}

                                                            className="w-full h-full rounded-full object-cover border border-gray-100"

                                                            onError={(e) => {

                                                                e.target.style.display = 'none';

                                                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';

                                                            }}

                                                        />

                                                    ) : null}

                                                    <div

                                                        className="w-full h-full rounded-full bg-[#e6e7e9] flex items-center justify-center text-[#2e5897] text-xl md:text-3xl font-bold"

                                                        style={{ display: talent.image ? 'none' : 'flex' }}

                                                    >

                                                        {getInitials(talent.first_name, talent.last_name)}

                                                    </div>

                                                </div>

                                                <div>

                                                    <h2 className="text-lg md:text-2xl font-bold text-[#3a3a3a] leading-tight">

                                                        {talent.specialty || talent.occupation || "Designer"}

                                                    </h2>

                                                    <p className="text-gray-700 text-[16px] md:text-[20px] font-medium mt-1">

                                                        {talent.first_name} {talent.last_name}

                                                    </p>

                                                </div>

                                            </div>



                                            <div className="flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">

                                                <div className="flex items-center gap-1 text-[#4b5563] text-sm md:text-lg font-semibold">

                                                    <HiOutlineLocationMarker className="text-[#8b8d8f]" size={22} />

                                                    {talent.city || talent.location || "Uzbekistan"}

                                                </div>

                                                <div className="text-[18px] md:text-[25px] font-bold text-[#343434] mt-2">

                                                    {formatPrice(talent.minimum_salary)}

                                                </div>

                                            </div>

                                        </div>



                                        <div className="mt-6">

                                            <div

                                                className={`text-[#484f57] text-[15px] md:text-[18px] leading-relaxed transition-all duration-300 ${isExpanded ? 'max-h-[150px] overflow-y-auto pr-2' : 'line-clamp-2'

                                                    }`}

                                            >

                                                {aboutText}

                                            </div>

                                            {aboutText.length > 120 && (

                                                <button

                                                    onClick={() => toggleExpand(talent.id)}

                                                    className="text-[#1D3D54] font-bold text-sm mt-1 hover:underline cursor-pointer"

                                                >

                                                    {isExpanded ? "show less" : "...more"}

                                                </button>

                                            )}

                                        </div>

                                    </div>



                                    <div className="border-t border-gray-100 mx-6"></div>



                                    <div className="p-5 md:p-8">

                                        <div className="flex flex-col space-y-6">

                                            <div>

                                                <h4 className="text-[#6e7074] text-[14px] md:text-[22px] font-semibold mb-4">Skills</h4>

                                                <div className="flex flex-wrap gap-2 md:gap-2.5">

                                                    {skills.length > 0 ? (

                                                        skills.map((s, idx) => (

                                                            <span key={idx} className="px-3 py-1.5 bg-[#f1f5f9] text-[#475569] text-sm md:text-base font-medium rounded-lg">

                                                                {s.skill} ({s.experience_years})

                                                            </span>

                                                        ))

                                                    ) : (

                                                        <span className="text-gray-400 text-xs italic">No skills specified</span>

                                                    )}

                                                </div>

                                            </div>



                                            <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4 mt-2">

                                                <button

                                                    onClick={() => handleViewProfile(talent.id)}

                                                    className="px-6 md:px-[60px] py-3 bg-[#1D3D54] text-white font-[650] rounded-lg text-center"

                                                >

                                                    View profile

                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            );

                        })

                    )}

                </div>



                {talents.length === 0 && !loading && (

                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 mt-5">

                        <p className="text-gray-400 font-medium">Hozircha talentlar mavjud emas.</p>

                    </div>

                )}

            </div>

        </div>

    );

}



export default Talents;