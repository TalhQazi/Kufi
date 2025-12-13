import React from "react";
import {
  LayoutDashboard,
  Luggage,
  CalendarCheck,
  BarChart3,
  User,
  MessageSquare,
  Moon,
  LogOut,
} from "lucide-react";

const SupplierSidebar = ({ activeSection, onSelectSection, onLogout, darkMode, onToggleDarkMode }) => {
  return (
    <>
      {/* Mobile top bar */}
      <aside className="md:hidden w-full bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-12 w-20 sm:h-[66px] sm:w-28 block">
            <img src="/assets/navbar.png" alt="Kufi Travel" className="w-full h-full object-contain" />
          </div>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col bg-white w-64 h-screen sticky top-0 border-r border-gray-100 py-6 px-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-20 sm:h-[66px] sm:w-28 block">
            <img src="/assets/navbar.png" alt="Kufi Travel" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Nav items */}
        <nav className="space-y-1.5 flex-1 pb-4">
          {[
            { label: "Dashboard", icon: LayoutDashboard },
            { label: "Experience", icon: Luggage },
            { label: "Booking", icon: CalendarCheck },
            { label: "Analytics", icon: BarChart3 },
            { label: "Profile", icon: User },
            { label: "Requests", icon: MessageSquare },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.label;
            return (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-sm transition ${
                  isActive
                    ? "bg-[#a26e35] text-white font-semibold shadow-sm"
                    : "text-[#a26e35] hover:bg-[#f9f1e7]"
                }`}
                onClick={() => onSelectSection?.(item.label)}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-white" : "text-[#a26e35]"
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Dark mode toggle */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="mt-6 flex items-center justify-between rounded-full bg-[#f7f7f8] px-4 py-2 text-sm text-gray-600 hover:bg-[#efe9e0] transition-colors"
        >
          <div className="inline-flex items-center gap-2 text-[#a26e35]">
            <Moon className="w-4 h-4" />
            <span>Dark Mode</span>
          </div>
          <div
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              darkMode ? "bg-[#a26e35]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                darkMode ? "translate-x-[18px]" : "translate-x-[2px]"
              }`}
            />
          </div>
        </button>

        {/* Logout */}
        <button 
          onClick={() => {
            if (onLogout) {
              onLogout();
            }
          }}
          className="mt-6 w-full rounded-2xl bg-[#f7f7f8] text-gray-600 text-sm py-2.5 flex items-center gap-2 justify-center hover:bg-[#e8e8e9] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
};

export default SupplierSidebar;
