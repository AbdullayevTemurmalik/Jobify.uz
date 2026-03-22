import React, { useState, useEffect } from "react";

import {

  FaBriefcase,

  FaSuitcase,

  FaIdCard,

  FaLightbulb,

  FaLanguage,

  FaChartBar,

  FaTimes,

} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import toast, { Toaster } from "react-hot-toast";

import Header from "../../../Company/Header/Header";

import Footer from "../../../Company/Footer/Footer";



export default function RegistrationFormStepTwo() {

  const navigate = useNavigate();



  const [occupation, setOccupation] = useState("");

  const [specialty, setSpecialty] = useState("");

  const [skils, setskils] = useState([{ skill: "", experience_years: "" }]);

  const [languages, setLanguages] = useState([{ language: "", level: "" }]);



  const [showOccupationDropdown, setShowOccupationDropdown] = useState(false);

  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);

  const [showSkillDropdown, setShowSkillDropdown] = useState([false]);

  const [showExpDropdown, setShowExpDropdown] = useState([false]);

  const [showLangDropdown, setShowLangDropdown] = useState([false]);

  const [showLevelDropdown, setShowLevelDropdown] = useState([false]);



  const occupations = [

    "Designer",

    "Programmer",

    "Businessman",

    "Manager"

  ];

  const specialtyMap = {

    Manager: [

      "Product Manager",

      "Project Manager",

      "Operations Manager",

      "Sales Manager",

      "HR Manager",

    ],

    Programmer: [

      "Frontend Developer",

      "Backend Developer",

      "Fullstack Developer",

      "Mobile Developer",

      "DevOps",

    ],

    Designer: [

      "UX/UI Designer",

      "Graphic Designer",

      "Motion Designer",

      "3D Artist",

    ],

  };

  const skilsList = [
    // Frontend
    "HTML5",
    "CSS3",
    "JavaScript",
    "TypeScript",
    "React",
    "Vue.js",
    "Next.js",
    "Angular",
    "Tailwind CSS",
    "SASS/SCSS",
    "Redux Toolkit",
    "Zustand",
    "React Query",

    // Backend
    "Node.js",
    "Express.js",
    "NestJS",
    "Python",
    "Django",
    "FastAPI",
    "PHP",
    "Laravel",
    "Go",
    "Java",
    "Spring Boot",
    "C#",
    ".NET Core",

    // Database & Infrastructure
    "PostgreSQL",
    "MongoDB",
    "MySQL",
    "Redis",
    "Firebase",
    "Docker",
    "Kubernetes",
    "AWS",
    "Google Cloud",

    // Mobile & Desktop
    "React Native",
    "Flutter",
    "Dart",
    "Electron",

    // Design & Tools
    "Figma",
    "Adobe XD",
    "Photoshop",
    "Illustrator",

    // DevOps & Others
    "Git",
    "GitHub",
    "CI/CD",
    "GraphQL",
    "REST API",
    "Unit Testing",
    "Linux",

    // Project Manager
    "Scrum",
    "Agile",
    "Jira",
    "ClickUp",
    "Trello",
    "Asana",
    "Sprint Planning",
  ];

  const expList = ["1 year", "2 years", "3 years", "4 years", "5+ years"];

  const levels = ["Beginner", "Intermediate", "Advanced", "Native"];

  const popularLanguages = [

    "Uzbek",

    "English",

    "Russian",

    "German",

    "Turkish",

    "French",

    "Chinese",

  ];



  const getFiltered = (list, query) => {

    const filtered = list.filter((item) =>

      item.toLowerCase().includes(query.toLowerCase())

    );

    return filtered.length > 0 ? filtered : ["Other"];

  };



  useEffect(() => {

    const savedData = localStorage.getItem("talent_step2");

    if (savedData) {

      try {

        const parsed = JSON.parse(savedData);

        setOccupation(parsed.occupation || "");

        setSpecialty(parsed.specialty || "");

        if (parsed.skils?.length) setskils(parsed.skils);

        if (parsed.language?.length) setLanguages(parsed.language);

      } catch (e) {

        console.error(e);

      }

    }

  }, []);



  const addSkill = () => {

    if (skils.length < 5) {

      setskils([...skils, { skill: "", experience_years: "" }]);

      setShowSkillDropdown([...showSkillDropdown, false]);

      setShowExpDropdown([...showExpDropdown, false]);

    } else {

      toast.error("Maximum 5 skills allowed");

    }

  };



  const addLanguage = () => {

    if (languages.length < 3) {

      setLanguages([...languages, { language: "", level: "" }]);

      setShowLangDropdown([...showLangDropdown, false]);

      setShowLevelDropdown([...showLevelDropdown, false]);

    } else {

      toast.error("Maximum 3 languages allowed");

    }

  };



  const handleNext = () => {

    if (!occupation) return toast.error("Please select an occupation");

    if (!specialty) return toast.error("Please select a specialty");

    if (!skils[0].skill) return toast.error("Please enter at least one skill");

    if (!languages[0].language)

      return toast.error("Please enter at least one language");



    const step2Data = { occupation, specialty, skils, language: languages };

    localStorage.setItem("talent_step2", JSON.stringify(step2Data));

    toast.success("Saved successfully!");

    setTimeout(() => navigate("/talent/registration/step-3"), 1000);

  };



  const handleBack = () => {

    const step2Data = {

      occupation,

      specialty,

      skils,

      language: languages,

    };

    localStorage.setItem("talent_step2", JSON.stringify(step2Data));

    toast.success("Returned to previous step!");

    setTimeout(() => navigate("/talent/registration/step-1"), 1000);

  };



  return (

    <div className="flex flex-col min-h-screen">

      <Toaster position="top-right" />

      <Header />

      <main className="flex-grow bg-gray-50 flex items-center justify-center px-3 xs:px-4 sm:px-6 py-6 sm:py-8 md:py-10">

        <div className="w-full max-w-4xl">

          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 xs:p-6 sm:p-8 md:p-10 lg:p-12">

            <div className="flex flex-col items-center mb-8 sm:mb-10">

              <h2 className="text-xl xs:text-2xl sm:text-3xl font-extrabold text-[#163D5C] mb-4 sm:mb-6 text-center">

                Professional Details

              </h2>

              <div className="flex items-center gap-2 sm:gap-3 w-full max-w-xs sm:max-w-md">

                <div className="w-3 h-3 rounded-full bg-[#163D5C] flex-shrink-0"></div>

                <div className="w-12 xs:w-16 sm:w-20 md:w-32 h-1 bg-[#163D5C] rounded flex-1"></div>

                <div className="w-5 h-5 rounded-full bg-[#163D5C] ring-2 sm:ring-4 ring-blue-100 flex-shrink-0"></div>

                <div className="w-12 xs:w-16 sm:w-20 md:w-32 h-1 bg-gray-200 rounded flex-1"></div>

                <div className="w-3 h-3 rounded-full bg-gray-200 flex-shrink-0"></div>

              </div>

            </div>



            <div className="space-y-6 sm:space-y-8">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">

                <div className="relative">

                  <label className="block text-xs xs:text-sm font-semibold text-gray-700 mb-2">

                    Occupation *

                  </label>

                  <div className="relative">

                    <FaBriefcase className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2 text-[#163D5C] text-sm xs:text-base" />

                    <input

                      type="text"

                      value={occupation}

                      onChange={(e) => {

                        setOccupation(e.target.value);

                        setShowOccupationDropdown(true);

                      }}

                      onFocus={() => setShowOccupationDropdown(true)}

                      onBlur={() =>

                        setTimeout(() => setShowOccupationDropdown(false), 200)

                      }

                      className="w-full pl-9 xs:pl-10 sm:pl-12 pr-3 xs:pr-4 py-2.5 xs:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl outline-none focus:ring-2 focus:ring-[#163D5C] text-sm xs:text-base"

                      placeholder="Search occupation"

                    />

                    {showOccupationDropdown && (

                      <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg sm:rounded-xl shadow-xl max-h-36 xs:max-h-48 overflow-y-auto">

                        {getFiltered(occupations, occupation).map((item, i) => (

                          <div

                            key={i}

                            onMouseDown={() => setOccupation(item)}

                            className="px-4 xs:px-5 py-2 hover:bg-blue-50 cursor-pointer text-gray-700 text-sm xs:text-base"

                          >

                            {item}

                          </div>

                        ))}

                      </div>

                    )}

                  </div>

                </div>



                <div className="relative">

                  <label className="block text-xs xs:text-sm font-semibold text-gray-700 mb-2">

                    Specialty *

                  </label>

                  <div className="relative">

                    <FaSuitcase className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2 text-[#163D5C] text-sm xs:text-base" />

                    <input

                      type="text"

                      value={specialty}

                      onChange={(e) => {

                        setSpecialty(e.target.value);

                        setShowSpecialtyDropdown(true);

                      }}

                      onFocus={() => setShowSpecialtyDropdown(true)}

                      onBlur={() =>

                        setTimeout(() => setShowSpecialtyDropdown(false), 200)

                      }

                      className="w-full pl-9 xs:pl-10 sm:pl-12 pr-3 xs:pr-4 py-2.5 xs:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl outline-none focus:ring-2 focus:ring-[#163D5C] text-sm xs:text-base"

                      placeholder="Search specialty"

                    />

                    {showSpecialtyDropdown && (

                      <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg sm:rounded-xl shadow-xl max-h-36 xs:max-h-48 overflow-y-auto">

                        {getFiltered(

                          specialtyMap[occupation] || [

                            "Generalist",

                            "Specialist",

                          ],

                          specialty

                        ).map((item, i) => (

                          <div

                            key={i}

                            onMouseDown={() => setSpecialty(item)}

                            className="px-4 xs:px-5 py-2 hover:bg-blue-50 cursor-pointer text-gray-700 text-sm xs:text-base"

                          >

                            {item}

                          </div>

                        ))}

                      </div>

                    )}

                  </div>

                </div>

              </div>



              <div className="space-y-3 sm:space-y-4">

                <h3 className="text-base xs:text-lg font-bold text-gray-800">

                  Skills & Experience

                </h3>

                {skils.map((s, index) => (

                  <div

                    key={index}

                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4 items-end"

                  >

                    <div className="relative">

                      <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">

                        Skill {index === 0 ? "*" : ""}

                      </label>

                      <div className="relative">

                        <FaIdCard className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2 text-[#163D5C] text-sm xs:text-base" />

                        <input

                          type="text"

                          value={s.skill}

                          onChange={(e) => {

                            const updated = [...skils];

                            updated[index].skill = e.target.value;

                            setskils(updated);

                          }}

                          onFocus={() => {

                            let arr = [...showSkillDropdown];

                            arr[index] = true;

                            setShowSkillDropdown(arr);

                          }}

                          onBlur={() =>

                            setTimeout(() => {

                              let arr = [...showSkillDropdown];

                              arr[index] = false;

                              setShowSkillDropdown(arr);

                            }, 200)

                          }

                          className="w-full pl-9 xs:pl-10 sm:pl-12 pr-3 xs:pr-4 py-2.5 xs:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl outline-none text-sm xs:text-base"

                          placeholder="Type skill"

                        />

                        {showSkillDropdown[index] && (

                          <div className="absolute z-40 w-full mt-1 bg-white border rounded-lg sm:rounded-xl shadow-lg max-h-28 xs:max-h-32 overflow-y-auto">

                            {getFiltered(skilsList, s.skill).map((item, i) => (

                              <div

                                key={i}

                                onMouseDown={() => {

                                  const updated = [...skils];

                                  updated[index].skill = item;

                                  setskils(updated);

                                }}

                                className="px-3 xs:px-4 py-2 hover:bg-gray-100 cursor-pointer text-xs xs:text-sm"

                              >

                                {item}

                              </div>

                            ))}

                          </div>

                        )}

                      </div>

                    </div>



                    <div className="relative flex items-end gap-2">

                      <div className="flex-1 relative">

                        <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">

                          Experience

                        </label>

                        <div className="relative">

                          <FaLightbulb className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2 text-[#163D5C] text-sm xs:text-base" />

                          <input

                            type="text"

                            value={s.experience_years}

                            readOnly

                            onFocus={() => {

                              let arr = [...showExpDropdown];

                              arr[index] = true;

                              setShowExpDropdown(arr);

                            }}

                            onBlur={() =>

                              setTimeout(() => {

                                let arr = [...showExpDropdown];

                                arr[index] = false;

                                setShowExpDropdown(arr);

                              }, 200)

                            }

                            className="w-full pl-9 xs:pl-10 sm:pl-12 pr-3 xs:pr-4 py-2.5 xs:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl cursor-pointer text-sm xs:text-base"

                            placeholder="Select"

                          />

                          {showExpDropdown[index] && (

                            <div className="absolute z-40 w-full mt-1 bg-white border rounded-lg sm:rounded-xl shadow-lg">

                              {expList.map((item, i) => (

                                <div

                                  key={i}

                                  onMouseDown={() => {

                                    const updated = [...skils];

                                    updated[index].experience_years = item;

                                    setskils(updated);

                                  }}

                                  className="px-3 xs:px-4 py-2 hover:bg-gray-100 cursor-pointer text-xs xs:text-sm"

                                >

                                  {item}

                                </div>

                              ))}

                            </div>

                          )}

                        </div>

                      </div>

                      {index > 0 && (

                        <button

                          onClick={() =>

                            setskils(skils.filter((_, i) => i !== index))

                          }

                          className="p-2 xs:p-3 text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl mb-[2px]"

                          aria-label="Remove skill"

                        >

                          <FaTimes className="text-sm xs:text-base" />

                        </button>

                      )}

                    </div>

                  </div>

                ))}



                {skils.length < 5 && (

                  <div className="flex justify-end pt-2">

                    <button

                      onClick={addSkill}

                      className="text-xs xs:text-sm font-bold text-white bg-[#4AD395] px-4 xs:px-6 py-1.5 xs:py-2 rounded-full hover:bg-[#3bc07f] transition-colors"

                    >

                      + Add Skill

                    </button>

                  </div>

                )}

              </div>



              <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t border-gray-100">

                <h3 className="text-base xs:text-lg font-bold text-gray-800">

                  Languages

                </h3>

                {languages.map((l, index) => (

                  <div

                    key={index}

                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4 items-end"

                  >

                    <div className="relative">

                      <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">

                        Language {index === 0 ? "*" : ""}

                      </label>

                      <div className="relative">

                        <FaLanguage className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2 text-[#163D5C] text-base xs:text-lg" />

                        <input

                          type="text"

                          value={l.language}

                          onChange={(e) => {

                            const updated = [...languages];

                            updated[index].language = e.target.value;

                            setLanguages(updated);

                            let arr = [...showLangDropdown];

                            arr[index] = true;

                            setShowLangDropdown(arr);

                          }}

                          onFocus={() => {

                            let arr = [...showLangDropdown];

                            arr[index] = true;

                            setShowLangDropdown(arr);

                          }}

                          onBlur={() =>

                            setTimeout(() => {

                              let arr = [...showLangDropdown];

                              arr[index] = false;

                              setShowLangDropdown(arr);

                            }, 200)

                          }

                          className="w-full pl-10 xs:pl-11 sm:pl-12 pr-3 xs:pr-4 py-2.5 xs:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl outline-none text-sm xs:text-base"

                          placeholder="Search language"

                        />

                        {showLangDropdown[index] && (

                          <div className="absolute z-40 w-full mt-1 bg-white border rounded-lg sm:rounded-xl shadow-lg max-h-28 xs:max-h-32 overflow-y-auto">

                            {getFiltered(popularLanguages, l.language).map(

                              (item, i) => (

                                <div

                                  key={i}

                                  onMouseDown={() => {

                                    const updated = [...languages];

                                    updated[index].language = item;

                                    setLanguages(updated);

                                  }}

                                  className="px-3 xs:px-4 py-2 hover:bg-gray-100 cursor-pointer text-xs xs:text-sm"

                                >

                                  {item}

                                </div>

                              )

                            )}

                          </div>

                        )}

                      </div>

                    </div>



                    <div className="relative flex items-end gap-2">

                      <div className="flex-1 relative">

                        <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1">

                          Level

                        </label>

                        <div className="relative">

                          <FaChartBar className="absolute left-3 xs:left-4 top-1/2 -translate-y-1/2 text-[#163D5C] text-sm xs:text-base" />

                          <input

                            type="text"

                            value={l.level}

                            readOnly

                            onFocus={() => {

                              let arr = [...showLevelDropdown];

                              arr[index] = true;

                              setShowLevelDropdown(arr);

                            }}

                            onBlur={() =>

                              setTimeout(() => {

                                let arr = [...showLevelDropdown];

                                arr[index] = false;

                                setShowLevelDropdown(arr);

                              }, 200)

                            }

                            className="w-full pl-9 xs:pl-10 sm:pl-12 pr-3 xs:pr-4 py-2.5 xs:py-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl cursor-pointer text-sm xs:text-base"

                            placeholder="Select Level"

                          />

                          {showLevelDropdown[index] && (

                            <div className="absolute z-40 w-full mt-1 bg-white border rounded-lg sm:rounded-xl shadow-lg">

                              {levels.map((item, i) => (

                                <div

                                  key={i}

                                  onMouseDown={() => {

                                    const updated = [...languages];

                                    updated[index].level = item;

                                    setLanguages(updated);

                                  }}

                                  className="px-3 xs:px-4 py-2 hover:bg-gray-100 cursor-pointer text-xs xs:text-sm"

                                >

                                  {item}

                                </div>

                              ))}

                            </div>

                          )}

                        </div>

                      </div>

                      {index > 0 && (

                        <button

                          onClick={() =>

                            setLanguages(

                              languages.filter((_, i) => i !== index)

                            )

                          }

                          className="p-2 xs:p-3 text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl mb-[2px]"

                          aria-label="Remove language"

                        >

                          <FaTimes className="text-sm xs:text-base" />

                        </button>

                      )}

                    </div>

                  </div>

                ))}



                {languages.length < 3 && (

                  <div className="flex justify-end pt-2">

                    <button

                      onClick={addLanguage}

                      className="text-xs xs:text-sm font-bold text-white bg-[#4AD395] px-4 xs:px-6 py-1.5 xs:py-2 rounded-full hover:bg-[#3bc07f] transition-colors"

                    >

                      + Add Language

                    </button>

                  </div>

                )}

              </div>



              {/* Navigation Buttons */}

              <div className="flex gap-3 sm:gap-4 pt-6 sm:pt-8 md:pt-10">

                <button

                  onClick={handleBack}

                  className="flex-1 py-3 xs:py-4 border-2 border-[#163D5C] text-[#163D5C] rounded-xl sm:rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm xs:text-base"

                >

                  Previous Step

                </button>

                <button

                  onClick={handleNext}

                  className="flex-1 py-3 xs:py-4 bg-[#163D5C] text-white rounded-xl sm:rounded-2xl font-bold hover:bg-[#1a4d73] shadow-lg transition-all text-sm xs:text-base"

                >

                  Next Step

                </button>

              </div>

            </div>

          </div>

        </div>

      </main>

      <Footer />

    </div>

  );

}