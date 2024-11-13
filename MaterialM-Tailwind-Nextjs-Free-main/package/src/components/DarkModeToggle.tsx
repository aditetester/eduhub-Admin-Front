"use client";
import { useTheme } from 'next-themes';
import { Icon } from "@iconify/react";

const DarkModeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-darkgray-800"
    >
      {theme === 'dark' ? (
        <Icon icon="mdi:weather-sunny" className="w-5 h-5 text-yellow-500" />
      ) : (
        <Icon icon="mdi:weather-night" className="w-5 h-5 text-blue-500" />
      )}
    </button>
  );
};

export default DarkModeToggle; 