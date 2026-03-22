import React, { createContext, useState, useEffect, useContext } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem("user-settings");
    return savedSettings
      ? JSON.parse(savedSettings)
      : { website: true, telegram: true, email: true, darkMode: false };
  });

  useEffect(() => {
    localStorage.setItem("user-settings", JSON.stringify(settings));
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [settings]);

  const toggleSwitch = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ThemeContext.Provider value={{ settings, toggleSwitch }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
