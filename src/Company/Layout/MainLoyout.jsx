import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";
import { useTheme } from "../../talent/Context/ThemeContext";

const MainLayout = () => {
  const { settings } = useTheme();

  return (
    <div
      className={`flex min-h-screen transition-colors duration-500 ${settings.darkMode ? "bg-[#121212]" : "bg-[#F8F9FA]"
        }`}
    >
      <aside className="sticky top-0 h-screen shrink-0 z-50">
        <Sidebar />
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8 talent-sidebar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;