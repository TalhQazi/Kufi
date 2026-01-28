import React, { useState, useEffect, useRef } from "react";
import { Bell, ChevronDown, Settings, LogOut, Moon, Sun } from "lucide-react";
import ProfilePic from "../../../components/ui/ProfilePic";

const Header = ({ onBellClick, onLogout, onMenuClick, isDarkMode, onThemeToggle }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <header className={`h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 md:px-10 border-b sticky top-0 z-40 transition-colors duration-300 ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
      {/* Left: hamburger - hidden on mobile since sidebar has its own menu */}
      <button
        onClick={onMenuClick}
        className={`hidden md:flex flex-col justify-center gap-1 p-2 rounded-md transition-colors ${isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
      >
        <span className="block w-5 h-[2px] bg-current" />
        <span className="block w-5 h-[2px] bg-current" />
        <span className="block w-5 h-[2px] bg-current" />
      </button>

      {/* Right: notification + settings + user */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className={`p-2 rounded-full transition-colors ${isDarkMode ? "hover:bg-gray-800 text-yellow-400" : "hover:bg-gray-100 text-gray-600"}`}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        <button
          className={`relative p-2 rounded-full transition-colors ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
          onClick={onBellClick}
          aria-label="Notifications"
        >
          <Bell className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <button className={`hidden sm:block p-2 rounded-full transition-colors ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`} aria-label="Settings">
          <Settings className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
          >
            <ProfilePic user={JSON.parse(localStorage.getItem('currentUser'))} size="sm" />
            <div className="hidden lg:flex flex-col leading-tight mr-1">
              <span className={`text-xs font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Admin User
              </span>
              <span className={`text-[11px] ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Administrator</span>
            </div>
            <ChevronDown className={`hidden sm:block w-4 h-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`} />
          </button>

          {showDropdown && (
            <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-2 z-50 ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
              <div className={`px-4 py-2 text-xs font-semibold cursor-pointer ${isDarkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-50"}`}>
                Profile
              </div>
              <div className={`px-4 py-2 text-xs font-semibold cursor-pointer ${isDarkMode ? "text-gray-300 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-50"}`}>
                Settings
              </div>
              <div className={`border-t my-1 ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}></div>
              <div
                className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-2"
                onClick={() => {
                  if (onLogout) {
                    onLogout();
                  }
                  setShowDropdown(false);
                }}
              >
                <LogOut className="w-3 h-3" />
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
