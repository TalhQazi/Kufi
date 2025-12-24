import React from "react";
import { Users, Trello, DollarSign, BookOpen, Check, RefreshCw, Eye, Send } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

const stats = [
  {
    title: "Total Users",
    value: "12,543",
    change: "+12.5%",
    positive: true,
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Active Listings",
    value: "1,234",
    change: "+8.2%",
    positive: true,
    icon: Trello,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-500",
  },
  {
    title: "Revenue",
    value: "$67,890",
    change: "+23.1%",
    positive: true,
    icon: DollarSign,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Bookings",
    value: "892",
    change: "-3.2%",
    positive: false,
    icon: BookOpen,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
  },
];

const recentActivity = [
  {
    action: "New supplier registration",
    user: "John Doe",
    time: "5 minutes ago",
  },
  {
    action: "Listing approved",
    user: "Jane Smith",
    time: "12 minutes ago",
  },
  {
    action: "Payment processed",
    user: "Mike Johnson",
    time: "1 hour ago",
  },
  {
    action: "Review reported",
    user: "Sarah Williams",
    time: "2 hours ago",
  },
];

const StatCard = ({
  title,
  value,
  change,
  positive,
  icon: Icon,
  iconBg,
  iconColor,
}) => {
  const changeColor = positive ? "text-emerald-500" : "text-red-500";
  const arrow = positive ? "▲" : "▼";

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 px-4 sm:px-5 py-3 sm:py-4">
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center ${iconBg}`}
        >
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
        </div>
        <div className={`flex items-center text-xs font-semibold ${changeColor}`}>
          {arrow}
          <span className="ml-1">{change}</span>
        </div>
      </div>

      <p className="mt-4 sm:mt-5 text-xs sm:text-sm font-medium text-gray-500">{title}</p>
      <p className="text-xl sm:text-2xl font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  );
};

const revenueData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Revenue",
      data: [45000, 52000, 48000, 61000, 55000, 67000],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.15)",
      tension: 0.35,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: "#3b82f6",
    },
  ],
};

const revenueOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: "index",
      intersect: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: { size: 11 },
        color: "#6b7280",
      },
    },
    y: {
      grid: {
        color: "#e5e7eb",
      },
      ticks: {
        font: { size: 11 },
        color: "#6b7280",
        callback: (value) => `${value / 1000}k`,
      },
    },
  },
};

const bookingsData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Bookings",
      data: [45, 52, 47, 61, 58, 73, 69],
      backgroundColor: "#10b981",
      borderRadius: 4,
    },
  ],
};

const bookingsOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: "index",
      intersect: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: { size: 11 },
        color: "#6b7280",
      },
    },
    y: {
      grid: {
        color: "#e5e7eb",
      },
      ticks: {
        font: { size: 11 },
        color: "#6b7280",
      },
    },
  },
};

const ActivityItem = ({ action, user, time, isLast }) => (
  <div
    className={`flex items-center justify-between py-3 ${isLast ? "" : "border-b border-gray-100"
      }`}
  >
    <div>
      <p className="text-sm font-medium text-slate-800">{action}</p>
      <p className="text-xs text-gray-500 mt-0.5">{user}</p>
    </div>
    <span className="text-[11px] text-gray-400">{time}</span>
  </div>
);

const QuickActionButton = ({ icon: Icon, label, bgColor, onClick }) => (
  <button
    onClick={onClick}
    className={`${bgColor} hover:opacity-90 transition-all flex items-center gap-3 px-4 sm:px-6 py-4 rounded-xl text-white font-medium w-full shadow-md active:scale-[0.98] group`}
  >
    <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
      <Icon className="w-5 h-5" />
    </div>
    <span className="text-sm sm:text-base leading-tight text-left">{label}</span>
  </button>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="bg-white rounded-xl card-shadow px-4 sm:px-5 py-4 sm:py-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs sm:text-sm font-semibold text-slate-900">
              Revenue Trend
            </h2>
          </div>
          <div className="h-48 sm:h-64">
            <Line data={revenueData} options={revenueOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl card-shadow px-4 sm:px-5 py-4 sm:py-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs sm:text-sm font-semibold text-slate-900">
              Weekly Bookings
            </h2>
          </div>
          <div className="h-48 sm:h-64">
            <Bar data={bookingsData} options={bookingsOptions} />
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl card-shadow px-4 sm:px-6 py-4 sm:py-5 border border-gray-100">
        <h2 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider text-[11px]">
          Recent Activity
        </h2>
        <div className="divide-y divide-gray-50">
          {recentActivity.map((item, index) => (
            <ActivityItem
              key={item.action}
              {...item}
              isLast={index === recentActivity.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickActionButton
          icon={Check}
          label="Approve/Reject Supplier Registration"
          bgColor="bg-[#0D9488]"
          onClick={() => console.log("Approve/Reject clicked")}
        />
        <QuickActionButton
          icon={RefreshCw}
          label="Manage Refunds"
          bgColor="bg-[#2563EB]"
          onClick={() => console.log("Manage Refunds clicked")}
        />
        <QuickActionButton
          icon={Eye}
          label="View Disputes"
          bgColor="bg-[#EA580C]"
          onClick={() => console.log("View Disputes clicked")}
        />
        <QuickActionButton
          icon={Send}
          label="Send Notifications"
          bgColor="bg-[#0F766E]"
          onClick={() => console.log("Send Notifications clicked")}
        />
      </div>
    </div>
  );
};

export default Dashboard;


