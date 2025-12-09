import React from "react";
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

const revenueData = [
  { month: "Jan", value: 4000 },
  { month: "Feb", value: 5200 },
  { month: "Mar", value: 6700 },
  { month: "Apr", value: 7100 },
  { month: "May", value: 8800 },
  { month: "Jun", value: 9800 },
];

const bookingsByExperience = [
  { label: "Mountain Hiking", value: 45 },
  { label: "Kayaking Tour", value: 70 },
  { label: "Wine Tasting", value: 95 },
  { label: "City Walking", value: 32 },
  { label: "Cooking Class", value: 60 },
];

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
        color: "#e5e7eb",
        borderDash: [4, 4],
      },
      ticks: {
        font: { size: 11 },
        color: "#6b7280",
      },
    },
    y: {
      grid: {
        color: "#e5e7eb",
        borderDash: [4, 4],
      },
      ticks: {
        font: { size: 11 },
        color: "#6b7280",
        callback: (value) => `${value}`,
      },
    },
  },
};

const bookingsChartData = {
  labels: bookingsByExperience.map((d) => d.label),
  datasets: [
    {
      label: "bookings",
      data: bookingsByExperience.map((d) => d.value),
      backgroundColor: "#2563eb",
      borderRadius: 4,
      barThickness: 36,
    },
  ],
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
        color: "#e5e7eb",
        borderDash: [4, 4],
      },
      ticks: {
        font: { size: 11 },
        color: "#6b7280",
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "#e5e7eb",
        borderDash: [4, 4],
      },
      ticks: {
        font: { size: 11 },
        color: "#6b7280",
      },
    },
  },
};

const SupplierAnalytics = () => {

  return (
    <div className="space-y-6">
      {/* Top bar: search + date + icons */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full rounded-full border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a26e35]/30"
          />
        </div>

        {/* Right controls */}
        <div className="flex items-center justify-end gap-2">
          <button className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 shadow-sm">
            <CalendarDays className="h-4 w-4 text-gray-500" />
            <span>Wed, 29 May 2025</span>
          </button>

          <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
          </button>

          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500">
            <Settings className="h-4 w-4" />
          </button>

          <div className="h-9 w-9 rounded-full bg-gray-300" />
        </div>
      </div>

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your performance and insights
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4">
          <p className="text-xs font-medium text-gray-500">Total Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">$42,750</p>
          <p className="mt-1 text-[11px] font-medium text-emerald-500">
            +15.3% from last month
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4">
          <p className="text-xs font-medium text-gray-500">Total Bookings</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">291</p>
          <p className="mt-1 text-[11px] font-medium text-emerald-500">
            +8.2% from last month
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4">
          <p className="text-xs font-medium text-gray-500">Average Rating</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">4.8</p>
          <p className="mt-1 text-[11px] font-medium text-emerald-500">
            +0.2 from last month
          </p>
        </div>
      </div>

      {/* Revenue trend card */}
      <div className="rounded-2xl border border-gray-100 bg-white px-5 py-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Revenue Trend</h2>
        </div>

        <div className="h-64 w-full rounded-xl bg-gray-50/60 border border-gray-100 px-4 py-4">
          <Line data={revenueChartData} options={revenueChartOptions} />
        </div>

        <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-gray-500">
          <span className="h-2 w-4 rounded-full bg-[#2563eb]" />
          <span>revenue</span>
        </div>
      </div>

      {/* Bookings by experience card */}
      <div className="rounded-2xl border border-gray-100 bg-white px-5 py-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Bookings by Experience</h2>
        </div>

        <div className="h-64 w-full rounded-xl bg-gray-50/60 border border-gray-100 px-4 py-4">
          <Bar data={bookingsChartData} options={bookingsChartOptions} />
        </div>

        <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-gray-500">
          <span className="h-2 w-4 rounded-full bg-[#2563eb]" />
          <span>bookings</span>
        </div>
      </div>
    </div>
  );
};

export default SupplierAnalytics;
