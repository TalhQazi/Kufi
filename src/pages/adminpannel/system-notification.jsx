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
        const response = await api.get('/notifications/system');
        setNotifications(response.data.notifications || []);

        // Map backend icons if necessary or use defaults based on type
        const iconMap = {
          bell: Bell,
          users: Users,
          userCheck: UserCheck,
          clock: Clock4,
          dollar: DollarSign,
          alert: AlertTriangle
        };

        const enrichedStats = (response.data.stats || []).map(stat => ({
          ...stat,
          icon: iconMap[stat.iconType] || Bell
        }));

        setStats(enrichedStats);
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
