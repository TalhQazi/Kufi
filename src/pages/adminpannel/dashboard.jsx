import React, { useState, useEffect } from "react";
import { Users, Trello, DollarSign, BookOpen, Check, RefreshCw, Eye, Send } from "lucide-react";
import api from "../../api";
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

const defaultStats = [
  { title: "Total Users", value: "0", change: "Live", positive: true, icon: Users, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { title: "Total Activities", value: "0", change: "Live", positive: true, icon: Trello, iconBg: "bg-emerald-100", iconColor: "text-emerald-500" },
  { title: "Total Countries", value: "0", change: "Live", positive: true, icon: DollarSign, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  { title: "Total Cities", value: "0", change: "Live", positive: true, icon: BookOpen, iconBg: "bg-orange-100", iconColor: "text-orange-500" },
];

const revenueData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [{
    label: "Revenue",
    data: [0, 0, 0, 0, 0, 0],
    borderColor: "#3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    fill: true,
    tension: 0.35,
    pointRadius: 4,
    pointBackgroundColor: "#3b82f6"
  }],
};

const bookingsData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [{
    label: "Bookings",
    data: [0, 0, 0, 0, 0, 0, 0],
    backgroundColor: "#10b981",
    borderRadius: 4
  }],
};

const recentActivity = [];

const StatCard = ({
  title,
  value,
  change,
  positive,
  icon: Icon,
  iconBg,
  iconColor,
  onClick,
}) => {
  const changeColor = positive ? "text-emerald-500" : "text-red-500";
  const arrow = positive ? "▲" : "▼";

  return (
    <div
      className={`bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 px-4 sm:px-5 py-3 sm:py-4 transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:border-[#704b24]/30' : ''}`}
      onClick={onClick}
    >
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

const Dashboard = ({ onNavigate }) => {
  const [statsData, setStatsData] = useState(defaultStats);
  const [activityData, setActivityData] = useState([]);
  const [revData, setRevData] = useState(revenueData);
  const [bookData, setBookData] = useState(bookingsData);
  const [loading, setLoading] = useState(true);

  const fetchUsersCount = async () => {
    const extractUserList = (raw) => {
      if (Array.isArray(raw)) return raw
      if (!raw || typeof raw !== 'object') return []
      if (Array.isArray(raw.users)) return raw.users
      if (Array.isArray(raw.allUsers)) return raw.allUsers
      if (raw.data && typeof raw.data === 'object') {
        if (Array.isArray(raw.data)) return raw.data
        if (Array.isArray(raw.data.users)) return raw.data.users
        if (Array.isArray(raw.data.allUsers)) return raw.data.allUsers
        if (Array.isArray(raw.data.data)) return raw.data.data
        if (raw.data.data && typeof raw.data.data === 'object') {
          if (Array.isArray(raw.data.data.users)) return raw.data.data.users
          if (Array.isArray(raw.data.data.allUsers)) return raw.data.data.allUsers
        }
      }
      return []
    }

    const endpoints = ['/admin/users', '/auth/users', '/users']
    for (const url of endpoints) {
      try {
        const res = await api.get(url)
        const list = extractUserList(res?.data)
        if (Array.isArray(list) && list.length >= 0) return list.length
      } catch {
        continue
      }
    }
    return 0
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data
        const results = await Promise.allSettled([
          fetchUsersCount(),                // Total Users
          api.get('/activities'),           // Total Activities
          api.get('/countries'),            // Total Countries
          api.get('/cities'),               // Total Cities
          api.get('/admin/analytics').catch(() => ({ data: [] })) // Analytics data
        ]);

        // Process Users
        let usersCount = 0;
        if (results[0].status === 'fulfilled') {
          usersCount = Number(results[0].value) || 0
        }

        // Process Activities
        let activitiesCount = 0;
        if (results[1].status === 'fulfilled') {
          const activitiesData = results[1].value.data;
          activitiesCount = Array.isArray(activitiesData) ? activitiesData.length : (activitiesData.activities?.length || 0);
        }

        // Process Countries
        let countriesCount = 0;
        if (results[2].status === 'fulfilled') {
          const countriesData = results[2].value.data;
          countriesCount = Array.isArray(countriesData) ? countriesData.length : (countriesData.countries?.length || 0);
        }

        // Process Cities
        let citiesCount = 0;
        if (results[3].status === 'fulfilled') {
          const citiesData = results[3].value.data;
          citiesCount = Array.isArray(citiesData) ? citiesData.length : (citiesData.cities?.length || 0);
        }

        // Update stats with actual counts
        setStatsData([
          { title: "Total Users", value: usersCount.toString(), change: "Live", positive: true, icon: Users, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
          { title: "Total Activities", value: activitiesCount.toString(), change: "Live", positive: true, icon: Trello, iconBg: "bg-emerald-100", iconColor: "text-emerald-500" },
          { title: "Total Countries", value: countriesCount.toString(), change: "Live", positive: true, icon: DollarSign, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
          { title: "Total Cities", value: citiesCount.toString(), change: "Live", positive: true, icon: BookOpen, iconBg: "bg-orange-100", iconColor: "text-orange-500" },
        ]);

        // Process Analytics data
        if (results[4].status === 'fulfilled' && results[4].value.data) {
          const analytics = results[4].value.data;
          const analyticsArray = Array.isArray(analytics) ? analytics : (analytics.data || []);
          
          if (analyticsArray.length > 0) {
            const labels = analyticsArray.map(a => a.day || a.date || a.label);
            const data = analyticsArray.map(a => a.count || a.value || 0);

            setRevData(prev => ({
              ...prev,
              labels: labels,
              datasets: [{ ...prev.datasets[0], data: data, label: 'Daily Revenue' }]
            }));

            setBookData(prev => ({
              ...prev,
              labels: labels,
              datasets: [{ ...prev.datasets[0], data: data, label: 'Daily Bookings' }]
            }));
          }
        }

        // Sample activity data
        setActivityData([
          { action: 'New User Registration', user: 'System Update', time: new Date().toLocaleDateString() },
          { action: 'New Activity Listed', user: 'Supplier Activity', time: new Date().toLocaleDateString() },
          { action: 'New Booking Created', user: 'User Activity', time: new Date().toLocaleDateString() },
        ]);

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        {statsData.map((item) => {
          let targetPage = null;
          if (item.title === "Total Users") targetPage = "User Management";
          if (item.title === "Total Activities") targetPage = "Activity";
          if (item.title === "Total Countries") targetPage = "Manage Countries";
          if (item.title === "Total Cities") targetPage = "Manage Cities";

          return (
            <StatCard
              key={item.title}
              {...item}
              onClick={targetPage ? () => onNavigate?.(targetPage) : undefined}
            />
          );
        })}
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
            <Line data={revData} options={revenueOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl card-shadow px-4 sm:px-5 py-4 sm:py-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs sm:text-sm font-semibold text-slate-900">
              Weekly Bookings
            </h2>
          </div>
          <div className="h-48 sm:h-64">
            <Bar data={bookData} options={bookingsOptions} />
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl card-shadow px-4 sm:px-6 py-4 sm:py-5 border border-gray-100">
        <h2 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider text-[11px]">
          Recent Activity
        </h2>
        <div className="divide-y divide-gray-50">
          {activityData.map((item, index) => (
            <ActivityItem
              key={item.action}
              {...item}
              isLast={index === activityData.length - 1}
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
          onClick={() => onNavigate?.("User Management")}
        />
        <QuickActionButton
          icon={RefreshCw}
          label="Manage Refunds"
          bgColor="bg-[#2563EB]"
          onClick={() => onNavigate?.("Payments & Finance")}
        />
        <QuickActionButton
          icon={Eye}
          label="View Disputes"
          bgColor="bg-[#EA580C]"
          onClick={() => onNavigate?.("User Management")}
        />
        <QuickActionButton
          icon={Send}
          label="Send Notifications"
          bgColor="bg-[#0F766E]"
          onClick={() => onNavigate?.("System Notification")}
        />
      </div>
    </div>
  );
};

export default Dashboard;


