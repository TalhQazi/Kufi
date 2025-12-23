import React from "react";
import { Users, BarChart, DollarSign, Percent } from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const statCards = [
  { label: "Total Traffic", value: "45.2K", change: "+12.5%", icon: Users, color: "bg-blue-500" },
  { label: "Active Users", value: "12.5K", change: "+8.2%", icon: Users, color: "bg-green-500" },
  { label: "Revenue", value: "$67.8K", change: "+23.1%", icon: DollarSign, color: "bg-purple-500" },
  { label: "Conversion Rate", value: "3.2%", change: "+1.2%", icon: Percent, color: "bg-orange-500" },
];

const trafficData = {
  labels: ["Mar 1", "Mar 2", "Mar 3", "Mar 4", "Mar 5", "Mar 6", "Mar 7"],
  datasets: [
    {
      label: "Visitors",
      data: [2300, 2500, 2100, 3200, 3400, 3800, 4200],
      borderColor: "#22c55e",
      backgroundColor: "rgba(34,197,94,0.1)",
      tension: 0.4,
      pointRadius: 3,
    },
    {
      label: "Page Views",
      data: [900, 1100, 1000, 1500, 1800, 1600, 1900],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59,130,246,0.1)",
      tension: 0.4,
      pointRadius: 3,
    },
  ],
};

const trafficOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: { color: "#e5e7eb", drawTicks: false },
      ticks: { color: "#6b7280" },
    },
    y: {
      grid: { color: "#e5e7eb", borderDash: [6, 3], drawTicks: false },
      ticks: { color: "#6b7280" },
    },
  },
};

const bookingsData = {
  labels: ["Accommodation: 45%", "Tours: 30%", "Dining: 10%", "Transportation: 15%"],
  datasets: [
    {
      data: [45, 30, 10, 15],
      backgroundColor: ["#2563eb", "#22c55e", "#f97316", "#facc15"],
      borderColor: "#fff",
      borderWidth: 2,
      hoverOffset: 4,
    },
  ],
};

const engagementMetrics = [
  {
    label: "Avg. Session Duration",
    value: "5m 32s",
    change: "+15% from last week",
    color: "bg-blue-500",
    changeColor: "text-green-500",
  },
  {
    label: "Pages per Session",
    value: "4.2",
    change: "+8% from last week",
    color: "bg-green-500",
    changeColor: "text-green-500",
  },
  {
    label: "Bounce Rate",
    value: "32.5%",
    change: "-5% from last week",
    color: "bg-purple-500",
    changeColor: "text-red-500",
  },
];

const topListings = [
  { listing: "Luxury Villa in Bali", views: 2340, bookings: 45, revenue: "$11,250", conversion: "1.9%" },
  { listing: "City Tour Package", views: 1890, bookings: 38, revenue: "$4,560", conversion: "2.0%" },
  { listing: "Beach Resort Stay", views: 1550, bookings: 32, revenue: "$12,800", conversion: "1.9%" },
];

const Analytics = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Analytics & Reporting</h1>
      <p className="text-sm text-gray-500">
        Real-time insights into your platform performance
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex items-center justify-between card-shadow"
        >
          <div className="flex items-center gap-4">
            <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shrink-0 ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
                {card.label}
              </p>
              <p className="text-xl sm:text-2xl font-semibold text-slate-900 mt-1">{card.value}</p>
              <p className="text-xs text-green-600 mt-0.5">{card.change}</p>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 card-shadow">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-slate-900">Traffic Overview</h2>
        </div>
        <div className="h-64">
          <Line data={trafficData} options={trafficOptions} />
        </div>
        <div className="flex items-center gap-6 mt-4 text-sm font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border border-blue-500 bg-white relative">
              <span className="absolute inset-1 rounded-full bg-blue-500" />
            </span>
            <span className="text-blue-500">Visitors</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border border-green-500 bg-white relative">
              <span className="absolute inset-1 rounded-full bg-green-500" />
            </span>
            <span className="text-green-500">Page Views</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 card-shadow">
        <h2 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider text-[11px]">
          Bookings by Category
        </h2>
        <div className="h-64 sm:h-72 flex items-center justify-center">
          <Doughnut
            data={bookingsData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: "bottom",
                  labels: {
                    usePointStyle: true,
                    color: "#1f2937",
                    padding: 15,
                    font: { size: 10 }
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 p-6 card-shadow">
      <h2 className="text-lg font-semibold text-slate-900">User Engagement Metrics</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {engagementMetrics.map((metric) => (
          <div key={metric.label} className="flex items-start gap-4">
            <span className={`w-1 rounded-full h-14 ${metric.color}`} />
            <div>
              <p className="text-sm text-gray-500">{metric.label}</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">{metric.value}</p>
              <p className={`text-sm mt-1 ${metric.changeColor}`}>{metric.change}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-3xl border border-gray-100 card-shadow p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Top Performing Listings
      </h2>

      {/* Mobile: Card View */}
      <div className="md:hidden space-y-4">
        {topListings.map((listing) => (
          <div key={listing.listing} className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 space-y-2">
            <p className="font-semibold text-slate-900 text-sm">{listing.listing}</p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-wider">Views</p>
                <p className="text-slate-700 font-medium text-xs">{listing.views}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-wider">Bookings</p>
                <p className="text-slate-700 font-medium text-xs">{listing.bookings}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-wider">Revenue</p>
                <p className="text-[#a26e35] font-bold text-xs">{listing.revenue}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-wider">Conversion</p>
                <p className="text-emerald-600 font-bold text-xs">{listing.conversion}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-gray-400 border-t border-b border-gray-100">
            <tr>
              <th className="text-left py-3 font-medium">Listing</th>
              <th className="text-left py-3 font-medium">Views</th>
              <th className="text-left py-3 font-medium">Bookings</th>
              <th className="text-left py-3 font-medium">Revenue</th>
              <th className="text-left py-3 font-medium">Conversion</th>
            </tr>
          </thead>
          <tbody>
            {topListings.map((listing) => (
              <tr key={listing.listing} className="border-b border-gray-100 last:border-b-0">
                <td className="py-4 text-slate-900 font-semibold">{listing.listing}</td>
                <td className="py-4 text-gray-600">{listing.views}</td>
                <td className="py-4 text-gray-600">{listing.bookings}</td>
                <td className="py-4 text-gray-600">{listing.revenue}</td>
                <td className="py-4 text-gray-600">{listing.conversion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default Analytics;

