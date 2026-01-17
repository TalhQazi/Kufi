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

import api from "../../api";
import { useState, useEffect } from "react";

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

const Analytics = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/analytics/admin');
        setData(response.data);
      } catch (error) {
        console.error("Error fetching admin analytics:", error);
        // Fallback to structure that prevents crashes but indicates no data
        setData({
          statCards: [
            { label: "Total Traffic", value: "0", change: "0%", icon: Users, color: "bg-blue-500" },
            { label: "Active Users", value: "0", change: "0%", icon: Users, color: "bg-green-500" },
            { label: "Revenue", value: "$0", change: "0%", icon: DollarSign, color: "bg-purple-500" },
            { label: "Conversion Rate", value: "0%", change: "0%", icon: Percent, color: "bg-orange-500" },
          ],
          trafficData: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [
              { label: "Visitors", data: [0, 0, 0, 0, 0, 0, 0], borderColor: "#22c55e", backgroundColor: "rgba(34,197,94,0.1)", tension: 0.4 },
              { label: "Page Views", data: [0, 0, 0, 0, 0, 0, 0], borderColor: "#3b82f6", backgroundColor: "rgba(59,130,246,0.1)", tension: 0.4 }
            ]
          },
          bookingsData: {
            labels: ["Accommodation", "Tours", "Dining", "Transportation"],
            datasets: [{ data: [0, 0, 0, 0], backgroundColor: ["#2563eb", "#22c55e", "#f97316", "#facc15"] }]
          },
          engagementMetrics: [
            { label: "Avg. Session Duration", value: "0m 0s", change: "0%", color: "bg-blue-500", changeColor: "text-gray-400" },
            { label: "Pages per Session", value: "0", change: "0%", color: "bg-green-500", changeColor: "text-gray-400" },
            { label: "Bounce Rate", value: "0%", change: "0%", color: "bg-purple-500", changeColor: "text-gray-400" },
          ],
          topListings: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a26e35]"></div>
      </div>
    );
  }

  const { statCards, trafficData, bookingsData, engagementMetrics, topListings } = data || {};

  const trafficOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
  return (
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
};

export default Analytics;

