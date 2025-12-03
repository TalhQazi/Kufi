import React from "react";
import {
  LayoutDashboard,
  Activity,
  Users,
  BarChart3,
  CreditCard,
  Bell,
  Menu,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Activity", icon: Activity },
  { label: "User Management", icon: Users },
  { label: "Analytics", icon: BarChart3 },
  { label: "Payments & Finance", icon: CreditCard },
  { label: "System Notification", icon: Bell },
  { label: "Supplier Dashboard", icon: LayoutDashboard },
];

const Sidebar = ({ activePage, onSelect, onLogout }) => {
  return (
    <>
      {/* Mobile top nav */}
      <aside className="md:hidden w-full bg-[#704b24] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-white/10 flex items-center justify-center text-[10px] font-semibold tracking-[0.18em]">
            KUFI
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Kufi</span>
            <span className="text-[11px] text-white/70">Travel</span>
          </div>
        </div>
        <Menu className="w-5 h-5 text-white/80" />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col bg-[#704b24] text-white w-64 h-screen sticky top-0 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="h-9 w-9 rounded bg-white/10 flex items-center justify-center text-xs font-semibold tracking-[0.2em]">
            KUFI
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Kufi</span>
            <span className="text-[11px] text-white/70">Travel</span>
          </div>
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
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-white text-[#704b24] font-semibold rounded-2xl shadow-sm"
                    : "text-white/80 hover:bg-white/10 rounded-2xl"
                }`}
                onClick={() => onSelect?.(item.label)}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-[#704b24]" : "text-white/80"
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
      </aside>
    </>
  );
};

export default Sidebar;
