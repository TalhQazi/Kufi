import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Activity,
  Users,
  BarChart3,
  CreditCard,
  Bell,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Activity", icon: Activity },
  { label: "User Management", icon: Users },
  { label: "Analytics", icon: BarChart3 },
  { label: "Payments & Finance", icon: CreditCard },
  { label: "System Notification", icon: Bell },
];

const Sidebar = ({ activePage, onSelect, onLogout, onHomeClick, isVisible }) => {
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

  return (
    <>
      {/* Mobile top nav */}
      <aside className="md:hidden w-full bg-[#704b24] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
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
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-white/80" /> : <Menu className="w-5 h-5 text-white/80" />}
        </button>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        ref={menuRef}
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-[#704b24] text-white z-50 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-white/10">
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
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-3 flex-1 px-4 space-y-2 pb-4 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activePage === item.label ||
                (item.label === "Activity" && activePage.startsWith("Activity"));
              return (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition ${isActive
                    ? "bg-white text-[#704b24] font-semibold rounded-2xl shadow-sm"
                    : "text-white/80 hover:bg-white/10 rounded-2xl"
                    }`}
                  onClick={() => {
                    onSelect?.(item.label);
                    setMobileMenuOpen(false);
                  }}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-[#704b24]" : "text-white/80"
                      }`}
                  />
                  <span className="ml-1">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="px-4 pb-4 border-t border-white/10 pt-4">
            <button
              onClick={() => {
                if (onLogout) {
                  onLogout();
                }
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 rounded-2xl transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="ml-1">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col bg-[#704b24] text-white h-screen sticky top-0 overflow-y-auto transition-all duration-300 ${isVisible ? "w-64 opacity-100" : "w-0 opacity-0 pointer-events-none"
        }`}>
        <div className="min-w-[256px]">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
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

          {/* Navigation */}
          <nav className="mt-3 flex-1 px-4 space-y-2 pb-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                activePage === item.label ||
                (item.label === "Activity" && activePage.startsWith("Activity"));
              return (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition ${isActive
                    ? "bg-white text-[#704b24] font-semibold rounded-2xl shadow-sm"
                    : "text-white/80 hover:bg-white/10 rounded-2xl"
                    }`}
                  onClick={() => onSelect?.(item.label)}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-[#704b24]" : "text-white/80"
                      }`}
                  />
                  <span className="ml-1">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="px-4 pb-4">
            <button
              onClick={() => {
                if (onLogout) {
                  onLogout();
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 rounded-2xl transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="ml-1">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
