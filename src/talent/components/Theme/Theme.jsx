import React from "react";
import { TbMoon } from "react-icons/tb";
import { useTheme } from "../../Context/ThemeContext";

const Theme = ({ CustomToggle, SettingItem }) => {
  const { settings, toggleSwitch } = useTheme();

  return (
    <div className="mt-8">
      <h2
        className={`text-[16px] md:text-[18px] font-bold mb-4 md:mb-5 ${
          settings.darkMode ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Theme settings
      </h2>
      <SettingItem
        icon={<TbMoon />}
        title="Dark mode"
        desc="Use the platform in a mode that is convenient for you"
        isOn={settings.darkMode}
        onToggle={() => toggleSwitch("darkMode")}
        CustomToggle={CustomToggle}
        isDark={settings.darkMode}
      />
    </div>
  );
};

export default Theme;
