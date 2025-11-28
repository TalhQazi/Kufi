import React from "react";
import { Bell, ChevronDown, Settings } from "lucide-react";

const Header = ({ onBellClick }) => {
  return (
    <header className="h-16 bg-white flex items-center justify-between px-6 md:px-10 border-b border-gray-100">
      {/* Left: hamburger */}
      <button className="flex flex-col justify-center gap-1 p-2 rounded-md hover:bg-gray-100 text-gray-500">
        <span className="block w-5 h-[2px] bg-current" />
        <span className="block w-5 h-[2px] bg-current" />
        <span className="block w-5 h-[2px] bg-current" />
      </button>

      {/* Right: notification + settings + user */}
      <div className="flex items-center gap-4">
        <button
          className="relative p-2 rounded-full hover:bg-gray-100"
          onClick={onBellClick}
        >
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <button className="p-2 rounded-full hover:bg-gray-100">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-semibold text-white">
            A
          </div>
          <div className="hidden sm:flex flex-col leading-tight mr-1">
            <span className="text-xs font-semibold text-gray-900">
              Admin User
            </span>
            <span className="text-[11px] text-gray-400">Administrator</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;
