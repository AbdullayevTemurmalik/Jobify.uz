import React from "react";
import { useLocation, Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Sidebar from "../Sidebar/Sidebar";
import { useTheme } from "../../talent/Context/ThemeContext";

const Layout = () => {
  const { settings } = useTheme();
  const location = useLocation();

  const dashboardPaths = [
    "/company/dashboard", "/company/my-company", "/company/talents",
    "/company/faq", "/company/contacts", "/company/my-jobs",
    "/company/job-detail", "/company/settings", "/company/post-job",
    "/company/notification"
  ];

  const isDashboard = dashboardPaths.some(path => location.pathname.startsWith(path));

  // Dark mode holatiga qarab ranglar
  const bgColor = settings.darkMode ? "bg-[#121212]" : "bg-[#F8F9FA]";
  const textColor = settings.darkMode ? "text-white" : "text-black";

  return (
    <div className={`min-h-screen transition-all duration-300 ${bgColor} ${textColor}`}>
      {isDashboard ? (
        <div className="flex flex-col md:flex-row min-h-screen">
          <aside className="md:sticky md:top-0 md:h-screen shrink-0 z-50 order-2 md:order-1">
            <Sidebar />
          </aside>
          <main className="flex-1 min-w-0 overflow-y-auto order-1 md:order-2 p-4 md:p-6 lg:p-10">
            {/* Sahifalar uchun maxsus wrapper */}
            <div className="max-w-[1400px] mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Outlet />
          </main>
          <Footer />
        </div>
      )}
    </div>
  );
};

export default Layout;