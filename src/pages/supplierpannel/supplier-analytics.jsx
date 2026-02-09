import api from "../../api";
import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import { Search, CalendarDays, Bell, Settings } from "lucide-react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

const SupplierAnalytics = ({ darkMode }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const [bookingsRes, activitiesRes] = await Promise.all([
          api.get('/supplier/bookings'),
          api.get('/supplier/activities'),
        ]);

        const bookingsRaw = Array.isArray(bookingsRes?.data)
          ? bookingsRes.data
          : (bookingsRes?.data?.bookings || bookingsRes?.data?.data || []);
        const allBookings = Array.isArray(bookingsRaw) ? bookingsRaw : [];

        const activitiesRaw = Array.isArray(activitiesRes?.data)
          ? activitiesRes.data
          : (activitiesRes?.data?.activities || activitiesRes?.data?.data || []);
        const allActivities = Array.isArray(activitiesRaw) ? activitiesRaw : [];

        const normalizeStatus = (value) => String(value || '').trim().toLowerCase();

        const confirmedBookings = allBookings.filter((b) => {
          const s = normalizeStatus(b?.status);
          return s === 'confirmed' || s === 'accepted';
        });

        const totalRevenue = confirmedBookings.reduce((sum, b) => {
          const budget =
            b?.tripDetails?.budget ??
            b?.budget ??
            b?.amount ??
            b?.totalAmount ??
            b?.price ??
            0;
          const n = Number(budget);
          return Number.isFinite(n) ? sum + n : sum;
        }, 0);

        const ratings = allActivities
          .map((a) => Number(a?.rating))
          .filter((n) => Number.isFinite(n) && n > 0);
        const avgRating = ratings.length > 0
          ? (ratings.reduce((sum, n) => sum + n, 0) / ratings.length).toFixed(1)
          : '0.0';

        const monthKey = (date) => {
          const d = date instanceof Date ? date : new Date(date);
          if (!Number.isFinite(d.getTime())) return null;
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        };

        const monthLabel = (key) => {
          const [y, m] = String(key || '').split('-');
          const d = new Date(Number(y), Number(m) - 1, 1);
          if (!Number.isFinite(d.getTime())) return String(key || '');
          return d.toLocaleString(undefined, { month: 'short' });
        };

        const getLastMonths = (count) => {
          const now = new Date();
          const list = [];
          for (let i = count - 1; i >= 0; i -= 1) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            list.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
          }
          return list;
        };

        const last6 = getLastMonths(6);
        const revenueByMonth = confirmedBookings.reduce((acc, b) => {
          const key = monthKey(b?.createdAt || b?.date || b?.updatedAt);
          if (!key) return acc;
          const budget =
            b?.tripDetails?.budget ??
            b?.budget ??
            b?.amount ??
            b?.totalAmount ??
            b?.price ??
            0;
          const n = Number(budget);
          if (!Number.isFinite(n)) return acc;
          acc[key] = (acc[key] || 0) + n;
          return acc;
        }, {});

        const revenueTrend = last6.map((key) => ({
          month: monthLabel(key),
          value: Number(revenueByMonth[key] || 0),
        }));

        const bookingsByExperienceMap = allBookings.reduce((acc, b) => {
          const title =
            (Array.isArray(b?.items) && b.items.length > 0
              ? b.items.map((it) => it?.activity?.title || it?.title).filter(Boolean).join(', ')
              : (b?.experience || b?.title || b?.activity || 'Booking'));
          acc[title] = (acc[title] || 0) + 1;
          return acc;
        }, {});

        const bookingsByExperience = Object.entries(bookingsByExperienceMap)
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8);

        setAnalyticsData({
          totalRevenue,
          totalBookings: allBookings.length,
          avgRating,
          revenueTrend,
          bookingsByExperience,
        });
      } catch (error) {
        console.error("Error fetching supplier analytics:", error);
        setAnalyticsData({
          totalRevenue: 0,
          totalBookings: 0,
          avgRating: '0.0',
          revenueTrend: [],
          bookingsByExperience: [],
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const revenueData = analyticsData?.revenueTrend || [
    { month: "Jan", value: 0 },
    { month: "Feb", value: 0 },
    { month: "Mar", value: 0 },
    { month: "Apr", value: 0 },
    { month: "May", value: 0 },
    { month: "Jun", value: 0 },
  ];

  const bookingsByExperience = analyticsData?.bookingsByExperience || [];

  const revenueChartData = {
    labels: revenueData.map((d) => d.month),
    datasets: [
      {
        label: "revenue",
        data: revenueData.map((d) => d.value),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.08)",
        tension: 0.35,
        fill: false,
        pointRadius: 4,
        pointBackgroundColor: "#2563eb",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
    ],
  };

  const bookingsChartData = {
    labels: bookingsByExperience.map((d) => d.label || d.title),
    datasets: [
      {
        label: "bookings",
        data: bookingsByExperience.map((d) => d.value || d.count),
        backgroundColor: "#2563eb",
        borderRadius: 4,
        barThickness: 36,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a26e35]"></div>
      </div>
    );
  }
  const chartTextColor = darkMode ? "#94a3b8" : "#6b7280";
  const chartGridColor = darkMode ? "#334155" : "#e5e7eb";

  const revenueChartOptions = {
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
          color: chartGridColor,
          borderDash: [4, 4],
        },
        ticks: {
          font: { size: 11 },
          color: chartTextColor,
        },
      },
      y: {
        grid: {
          color: chartGridColor,
          borderDash: [4, 4],
        },
        ticks: {
          font: { size: 11 },
          color: chartTextColor,
          callback: (value) => `${value}`,
        },
      },
    },
  };

  const bookingsChartOptions = {
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
          color: chartGridColor,
          borderDash: [4, 4],
        },
        ticks: {
          font: { size: 11 },
          color: chartTextColor,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: chartGridColor,
          borderDash: [4, 4],
        },
        ticks: {
          font: { size: 11 },
          color: chartTextColor,
        },
      },
    },
  };

  return (
    <div className={`space-y-6 transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
      {/* Page heading */}
      <div className="flex flex-col gap-1">
        <h1 className={`text-xl font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Analytics</h1>
        <p className={`text-sm transition-colors ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
          Track your performance and insights
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            label: "Total Revenue",
            value: analyticsData?.totalRevenue ? `$${analyticsData.totalRevenue}` : "$0",
            trend: analyticsData?.revenueTrend_percent || "0% from last month"
          },
          {
            label: "Total Bookings",
            value: analyticsData?.totalBookings || "0",
            trend: analyticsData?.bookingsTrend_percent || "0% from last month"
          },
          {
            label: "Average Rating",
            value: analyticsData?.avgRating || "0.0",
            trend: analyticsData?.ratingTrend || "No change"
          },
        ].map((stat, i) => (
          <div key={i} className={`rounded-2xl border px-5 py-4 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <p className={`text-xs font-medium transition-colors ${darkMode ? "text-slate-500" : "text-gray-500"}`}>{stat.label}</p>
            <p className={`mt-2 text-2xl font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>{stat.value}</p>
            <p className="mt-1 text-[11px] font-medium text-emerald-500">{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* Revenue trend card */}
      <div className={`rounded-2xl border px-5 py-5 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Revenue Trend</h2>
        </div>

        <div className={`h-64 w-full rounded-xl border px-4 py-4 transition-colors ${darkMode ? "bg-slate-800/50 border-slate-800" : "bg-gray-50/60 border-gray-100"}`}>
          <Line data={revenueChartData} options={revenueChartOptions} />
        </div>

        <div className={`mt-2 flex items-center justify-center gap-2 text-[11px] transition-colors ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
          <span className="h-2 w-4 rounded-full bg-[#2563eb]" />
          <span>revenue</span>
        </div>
      </div>

      {/* Bookings by experience card */}
      <div className={`rounded-2xl border px-5 py-5 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className={`text-sm font-semibold transition-colors ${darkMode ? "text-white" : "text-slate-900"}`}>Bookings by Experience</h2>
        </div>

        <div className={`h-64 w-full rounded-xl border px-4 py-4 transition-colors ${darkMode ? "bg-slate-800/50 border-slate-800" : "bg-gray-50/60 border-gray-100"}`}>
          <Bar data={bookingsChartData} options={bookingsChartOptions} />
        </div>

        <div className={`mt-2 flex items-center justify-center gap-2 text-[11px] transition-colors ${darkMode ? "text-slate-500" : "text-gray-500"}`}>
          <span className="h-2 w-4 rounded-full bg-[#2563eb]" />
          <span>bookings</span>
        </div>
      </div>
    </div>
  );
};

export default SupplierAnalytics;
