import api from "../../api";
import { useState, useEffect } from "react";
import { Bell, UserCheck, Users, Clock4, DollarSign, AlertTriangle } from "lucide-react";

const SystemNotification = ({ onViewDetails }) => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        setIsLoading(true);
        const [activityRes, statsRes] = await Promise.all([
          api.get('/admin/activity'),
          api.get('/admin/stats')
        ])

        const iconMap = {
          bell: Bell,
          users: Users,
          userCheck: UserCheck,
          clock: Clock4,
          dollar: DollarSign,
          alert: AlertTriangle
        };

        const feed = Array.isArray(activityRes?.data?.activities) ? activityRes.data.activities : []
        const normalizedNotifications = feed.map((item) => {
          const Icon = iconMap[item?.iconType] || Bell
          return {
            title: item?.title || 'System update',
            time: item?.time || '',
            icon: Icon,
            iconBg: item?.iconBg || 'bg-slate-50 text-slate-600'
          }
        })
        setNotifications(normalizedNotifications)

        const s = statsRes?.data || {}
        const money = Number(s?.revenue || 0)
        const formattedRevenue = money >= 1000 ? `$${(money / 1000).toFixed(1)}K` : `$${money}`

        const normalizedStats = [
          {
            label: 'Total Suppliers',
            value: String(s?.suppliers ?? 0),
            change: '+12%',
            positive: true,
            icon: Users,
            iconBg: 'bg-emerald-50 text-emerald-600'
          },
          {
            label: 'Active Travelers',
            value: String(s?.users ?? 0),
            change: '+8%',
            positive: true,
            icon: UserCheck,
            iconBg: 'bg-blue-50 text-blue-600'
          },
          {
            label: 'Pending Requests',
            value: String(s?.pendingRequests ?? 0),
            change: '-5%',
            positive: false,
            icon: Clock4,
            iconBg: 'bg-orange-50 text-orange-600'
          },
          {
            label: 'Total Revenue',
            value: formattedRevenue,
            change: '+23%',
            positive: true,
            icon: DollarSign,
            iconBg: 'bg-emerald-50 text-emerald-600'
          },
          {
            label: 'Reported Issues',
            value: String(s?.reportedIssues ?? 0),
            change: '+2',
            positive: true,
            icon: AlertTriangle,
            iconBg: 'bg-rose-50 text-rose-600'
          }
        ]
        setStats(normalizedStats)
      } catch (error) {
        console.error("Error fetching system notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSystemData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a26e35]"></div>
      </div>
    );
  }
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
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500 bg-gray-50/30 rounded-xl border border-gray-100">
              No activities to show yet
            </div>
          ) : (
            notifications.map((item, index) => {
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
            })
          )}
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
                    className={`text-xs font-semibold ${item.positive ? "text-emerald-500" : "text-rose-500"
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
