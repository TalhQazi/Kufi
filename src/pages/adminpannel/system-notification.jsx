import React from "react";
import { Bell, UserCheck, Users, Clock4, DollarSign, AlertTriangle } from "lucide-react";

const notifications = [
  {
    icon: Bell,
    iconBg: "bg-emerald-50 text-emerald-500",
    title: "New supplier registration awaiting approval",
    time: "2 hours ago",
  },
  {
    icon: Users,
    iconBg: "bg-blue-50 text-blue-500",
    title: "Traveler booking request submitted to Supplier A",
    time: "4 hours ago",
  },
  {
    icon: UserCheck,
    iconBg: "bg-teal-50 text-teal-500",
    title: "Supplier shared new itinerary with Traveler",
    time: "6 hours ago",
  },
  {
    icon: UserCheck,
    iconBg: "bg-emerald-50 text-emerald-500",
    title: "Traveler accepted itinerary and completed payment",
    time: "8 hours ago",
  },
  {
    icon: Clock4,
    iconBg: "bg-indigo-50 text-indigo-500",
    title: "Supplier marked tour as completed",
    time: "1 day ago",
  },
  {
    icon: Clock4,
    iconBg: "bg-indigo-50 text-indigo-500",
    title: "Supplier marked tour as completed",
    time: "1 day ago",
  },
  {
    icon: Clock4,
    iconBg: "bg-indigo-50 text-indigo-500",
    title: "Supplier marked tour as completed",
    time: "1 day ago",
  },
];

const stats = [
  {
    label: "Total Suppliers",
    value: "248",
    change: "+12%",
    positive: true,
    icon: Users,
    iconBg: "bg-emerald-50 text-emerald-500",
  },
  {
    label: "Active Travelers",
    value: "1,429",
    change: "+8%",
    positive: true,
    icon: Users,
    iconBg: "bg-blue-50 text-blue-500",
  },
  {
    label: "Pending Requests",
    value: "34",
    change: "-5%",
    positive: false,
    icon: Clock4,
    iconBg: "bg-amber-50 text-amber-500",
  },
  {
    label: "Total Revenue",
    value: "$124.5K",
    change: "+23%",
    positive: true,
    icon: DollarSign,
    iconBg: "bg-emerald-50 text-emerald-500",
  },
  {
    label: "Reported Issues",
    value: "7",
    change: "+2",
    positive: false,
    icon: AlertTriangle,
    iconBg: "bg-rose-50 text-rose-500",
  },
];

const SystemNotification = ({ onViewDetails }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          System Notifications & Activities
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Recent updates and activities across the platform
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(260px,0.85fr)] gap-6">
        {/* Notifications list */}
        <div className="space-y-3">
          {notifications.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-between bg-white rounded-lg border border-gray-100 card-shadow px-5 h-[93px]"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-0.5 h-10 w-10 rounded-2xl flex items-center justify-center ${item.iconBg}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 leading-snug">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                  </div>
                </div>
                <button
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                  onClick={onViewDetails}
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>

        {/* Right side stats */}
        <aside className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            System Statistics
          </h2>
          <div className="space-y-4">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="bg-white rounded-2xl border border-gray-100 card-shadow px-6 py-5 flex items-center justify-between min-h-[138px]"
                >
                  <div className="flex flex-col gap-3">
                    <div
                      className={`h-10 w-10 rounded-2xl flex items-center justify-center ${item.iconBg}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-slate-900 leading-tight">
                        {item.value}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {item.label}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      item.positive ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {item.change}
                  </span>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SystemNotification;
