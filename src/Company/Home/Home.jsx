import Header from "../Header/Header.jsx";

import Footer from "../Footer/Footer.jsx";



import { MdWork } from "react-icons/md";

import { IoMdChatboxes } from "react-icons/io";

import { BsPersonPlusFill } from "react-icons/bs";

import { CiSearch } from "react-icons/ci";



import imgHome from "../../assets/imgHome.png";



function Home() {

    return (

        <div className="w-full min-h-screen lg:h-[1580px] flex items-center justify-between flex-col bg-white overflow-x-hidden">

            <Header />



            <section className="w-full lg:h-auto flex items-center justify-between flex-col">



                {/* Hero Section - flex-shrink va min-width bilan mustahkamlandi */}

                <section className="relative px-4 sm:px-8 md:px-16 lg:px-24 py-10 md:py-20 lg:pt-10 lg:pb-20 flex justify-center items-center flex-col lg:flex-row max-w-[1440px] mx-auto gap-12 w-full">



                    {/* Matn qismi: flex-1 va min-w-0 siqilishni oldini oladi */}

                    <div className="w-full lg:w-1/2 z-10 text-center lg:text-left order-2 lg:order-1 flex flex-col items-center lg:items-start flex-1 min-w-0">

                        <h2 className="text-3xl sm:text-4xl lg:text-[50px] font-semibold text-[#343C44] mb-4 leading-tight">

                            Find aspiring talents <br className="hidden md:block" /> and great employers

                        </h2>



                        <p className="text-gray-500 text-sm md:text-base mb-6 md:mb-8 max-w-sm leading-relaxed">

                            Finding the best candidate is always hard. Tell us what you are

                            looking for and choose one from among the best.

                        </p>

                    </div>



                    {/* Rasm qismi: Kenglikni qat'iy saqlash uchun konteyner */}

                    <div className="w-full lg:w-1/2 flex justify-center items-center order-1 lg:order-2 relative px-4 flex-1">

                        <div className="absolute inset-0 rounded-full blur-[80px] md:blur-[100px] opacity-30 scale-90 md:scale-110 mx-auto bg-blue-50/50"></div>



                        {/* Rasm konteyneri: Refreshda joy saqlab turishi uchun */}

                        <div className="w-full max-w-[320px] sm:max-w-[450px] md:max-w-[650px] lg:max-w-[750px] relative z-10">

                            <img

                                src={imgHome}

                                alt="Hero"

                                // 'eager' yuklash tezligini oshiradi

                                loading="eager"

                                className="w-full h-auto object-contain transition-transform duration-500 hover:scale-105 mx-auto block"

                                // Rasm balandligini taxminiy belgilab qo'yamiz (sakrashni yo'qotadi)

                                style={{ minHeight: '300px' }}

                            />

                        </div>

                    </div>

                </section>



                {/* Features Section - sening asl dizayning */}

                <div className="w-full max-w-[1128px] px-6 py-20 lg:py-10 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:justify-between gap-10 lg:gap-0">



                    {/* Har bir cardga 'hover:-translate-y-2' va 'hover:scale-105' qo'shildi */}

                    <div className="w-full lg:w-[210px] flex flex-col lg:mt-[20px] group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-105">

                        <BsPersonPlusFill className="text-[35px] text-[#C2C2C2] group-hover:text-[#343C44] transition-colors duration-300" />

                        <div className="text-xl text-[#343C44] font-normal pt-[10px]">

                            Professional <br className="hidden lg:block" /> recruiter

                        </div>

                        <div className="text-base text-[#AAAAAA] font-normal pt-[10px]">

                            Finding the best candidate is always hard.

                        </div>

                    </div>



                    <div className="w-full lg:w-[210px] flex flex-col lg:mt-[20px] group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-105">

                        <MdWork className="text-[35px] text-[#C2C2C2] group-hover:text-[#343C44] transition-colors duration-300" />

                        <div className="text-xl text-[#343C44] font-normal pt-[10px]">

                            Find the right job you want fast

                        </div>

                        <div className="text-base text-[#AAAAAA] font-normal pt-[10px]">

                            Launch your career on Jobify.

                        </div>

                    </div>



                    <div className="w-full lg:w-[210px] flex flex-col lg:mt-[20px] group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-105">

                        <IoMdChatboxes className="text-[35px] text-[#C2C2C2] group-hover:text-[#343C44] transition-colors duration-300" />

                        <div className="text-xl text-[#343C44] font-normal pt-[10px]">

                            All professionals need some help

                        </div>

                        <div className="text-base text-[#AAAAAA] font-normal pt-[10px]">

                            As a pro recruiter, you need various skills to hire a great talent.

                        </div>

                    </div>



                    <div className="w-full lg:w-[210px] flex flex-col lg:mt-[20px] group cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-105">

                        <CiSearch className="text-[35px] text-[#C2C2C2] group-hover:text-[#343C44] transition-colors duration-300" />

                        <div className="text-xl text-[#343C44] font-normal pt-[10px]">

                            Searching a job may be long and boring

                        </div>

                        <div className="text-base text-[#AAAAAA] font-normal pt-[10px]">

                            Landing a good gig can be hard, when you have a strong competition.

                        </div>

                    </div>



                </div>



            </section>



            <Footer />

        </div>

    );

}



export default Home;