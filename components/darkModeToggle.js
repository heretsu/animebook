import { useState, useEffect, useContext } from "react";
import { UserContext } from "@/lib/userContext";
import supabase from "@/hooks/authenticateUser";
import PageLoadOptions from "@/hooks/pageLoadOptions";
export default function DarkModeToggle() {
  const { fullPageReload } = PageLoadOptions();
  const { darkMode, setDarkMode, userData } = useContext(UserContext);

  const toggleMode = async () => {
    if (!darkMode) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
      document.documentElement.style.backgroundColor = "black";
      await supabase
        .from("users")
        .update({ theme: "dark" })
        .eq("id", userData.id);
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
      document.documentElement.style.backgroundColor = "white";
      await supabase
        .from("users")
        .update({ theme: null })
        .eq("id", userData.id);
    }
    // fullPageReload('/home', 'window')
  };

  return (
    userData && (
      <div
        className={`cursor-pointer relative py-1 rounded transition-colors duration-300 border ${
          darkMode ? "bg-[#27292F] border-[#32353C]" : "bg-[#EEEDEF] border-[#EEEDEF]"
        }`}
        onClick={toggleMode}
      >
        <div className="flex justify-between items-center px-1">
          <svg
            fill={darkMode ? "gray" : "black"}
            width="15px"
            height="15px"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={darkMode ? "" : "bg-white rounded"}
          >
            <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
          </svg>

          <svg
            fill={darkMode ? "white" : "#000000"}
            width="15px"
            height="15px"
            viewBox="0 0 36 36"
            xmlns="http://www.w3.org/2000/svg"
            className={darkMode ? "bg-[#33353D] rounded" : ""}
          >
            <path d="M29.2,26.72A12.07,12.07,0,0,1,22.9,4.44,13.68,13.68,0,0,0,19.49,4a14,14,0,0,0,0,28,13.82,13.82,0,0,0,10.9-5.34A11.71,11.71,0,0,1,29.2,26.72Z" />
          </svg>
        </div>
      </div>
    )
  );
}
