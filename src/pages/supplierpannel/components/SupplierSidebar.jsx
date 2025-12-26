import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Luggage,
  CalendarCheck,
  BarChart3,
  User,
  ClipboardList,
  Moon,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const SupplierSidebar = ({ activeSection, onSelectSection, onLogout, darkMode, onToggleDarkMode, onHomeClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Experience", icon: Luggage },
    { label: "Booking", icon: CalendarCheck },
    { label: "Analytics", icon: BarChart3 },
    { label: "Profile", icon: User },
    { label: "Requests", icon: ClipboardList },
  ];

  return (
    <>
      {/* Mobile top bar */}
      <aside className={`md:hidden w-full px-4 py-3 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300 ${darkMode ? "bg-slate-950 border-b border-slate-800" : "bg-white border-b border-gray-100"}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onHomeClick) {
                onHomeClick()
              } else {
                window.location.hash = '#home'
              }
            }}
            className="h-12 w-20 sm:h-[66px] sm:w-28 block cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img src="/assets/navbar.png" alt="Kufi Travel" className="w-full h-full object-contain" />
          </button>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-gray-100 text-gray-700"}`}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        ref={menuRef}
        className={`md:hidden fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out shadow-xl ${darkMode ? "bg-slate-900 border-r border-slate-800" : "bg-white"} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center justify-between gap-3 px-6 py-5 border-b transition-colors duration-300 ${darkMode ? "border-slate-800" : "border-gray-100"}`}>
            <button
              onClick={() => {
                if (onHomeClick) {
                  onHomeClick()
                } else {
                  window.location.hash = '#home'
                }
                setMobileMenuOpen(false)
              }}
              className="h-12 w-20 sm:h-[66px] sm:w-28 block cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img src="/assets/navbar.png" alt="Kufi Travel" className="w-full h-full object-contain" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-gray-100 text-gray-700"}`}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-3 flex-1 px-4 space-y-1.5 pb-4 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.label;
              return (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-sm transition ${isActive
                    ? "bg-[#a26e35] text-white font-semibold shadow-sm"
                    : (darkMode ? "text-slate-400 hover:bg-slate-800" : "text-[#a26e35] hover:bg-[#f9f1e7]")
                    }`}
                  onClick={() => {
                    onSelectSection?.(item.label);
                    setMobileMenuOpen(false);
                  }}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-white" : "text-[#a26e35]"
                      }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Dark mode toggle */}
          <div className={`px-4 pb-4 border-t pt-4 transition-colors duration-300 ${darkMode ? "border-slate-800" : "border-gray-100"}`}>
            <button
              type="button"
              onClick={onToggleDarkMode}
              className={`w-full flex items-center justify-between rounded-full px-4 py-2 text-sm transition-colors duration-300 ${darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-[#f7f7f8] text-gray-600 hover:bg-[#efe9e0]"}`}
            >
              <div className={`inline-flex items-center gap-2 ${darkMode ? "text-amber-500" : "text-[#a26e35]"}`}>
                <Moon className="w-4 h-4" />
                <span>Dark Mode</span>
              </div>
              <div
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${darkMode ? "bg-amber-500" : "bg-gray-300"
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${darkMode ? "translate-x-[18px]" : "translate-x-[2px]"
                    }`}
                />
              </div>
            </button>
          </div>

          {/* Logout */}
          <div className="px-4 pb-4">
            <button
              onClick={() => {
                if (onLogout) {
                  onLogout();
                }
                setMobileMenuOpen(false);
              }}
              className={`w-full rounded-2xl text-sm py-2.5 flex items-center gap-2 justify-center transition-colors duration-300 ${darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-[#f7f7f8] text-gray-600 hover:bg-[#e8e8e9]"}`}
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col w-64 h-screen sticky top-0 border-r py-6 px-6 transition-colors duration-300 ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => {
              if (onHomeClick) {
                onHomeClick()
              } else {
                window.location.hash = '#home'
              }
            }}
            className="h-12 w-20 sm:h-[66px] sm:w-28 block cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img src="/assets/navbar.png" alt="Kufi Travel" className="w-full h-full object-contain" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="space-y-1.5 flex-1 pb-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.label;
            return (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-sm transition ${isActive
                  ? "bg-[#a26e35] text-white font-semibold shadow-sm"
                  : (darkMode ? "text-slate-400 hover:bg-slate-800" : "text-[#a26e35] hover:bg-[#f9f1e7]")
                  }`}
                onClick={() => onSelectSection?.(item.label)}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-white" : "text-[#a26e35]"
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
          className={`mt-6 flex items-center justify-between rounded-full px-4 py-2 text-sm transition-colors duration-300 ${darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-[#f7f7f8] text-gray-600 hover:bg-[#efe9e0]"}`}
        >
          <div className={`inline-flex items-center gap-2 ${darkMode ? "text-amber-500" : "text-[#a26e35]"}`}>
            <Moon className="w-4 h-4" />
            <span>Dark Mode</span>
          </div>
          <div
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${darkMode ? "bg-amber-500" : "bg-gray-300"
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${darkMode ? "translate-x-[18px]" : "translate-x-[2px]"
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
          className={`mt-6 w-full rounded-2xl text-sm py-2.5 flex items-center gap-2 justify-center transition-colors duration-300 ${darkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-[#f7f7f8] text-gray-600 hover:bg-[#e8e8e9]"}`}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
};

export default SupplierSidebar;
