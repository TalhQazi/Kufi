import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";

const tabs = ["All Users", "All Suppliers", "Active", "Suspended", "Disputes", "Reviews"];

const users = [
  {
    name: "John Doe",
    email: "john@example.com",
    type: "Traveler",
    joinDate: "2025-01-15",
    activity: "12 bookings",
    status: "active",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    type: "Supplier",
    joinDate: "2025-11-20",
    activity: "8 listings",
    status: "active",
  },
  {
    name: "Mike Johnson",
    email: "mike@example.com",
    type: "Traveler",
    joinDate: "2025-02-10",
    activity: "5 bookings",
    status: "suspended",
  },
];

const StatusBadge = ({ status }) => {
  const isActive = status === "active";
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${isActive
        ? "bg-emerald-100 text-emerald-600"
        : "bg-rose-100 text-rose-600"
        }`}
    >
      {status}
    </span>
  );
};

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("All Users");
  const [query, setQuery] = useState("");
  const [userList, setUserList] = useState(users);
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return userList.filter((user) => {
      const matchesStatus =
        activeTab === "All Users"
          ? true
          : activeTab === "All Suppliers"
            ? user.type === "Supplier"
            : user.status === activeTab.toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [activeTab, query, userList]);

  const handleView = (user) => setSelectedUser({ ...user, mode: "view" });

  const handleEdit = (user) => {
    setSelectedUser({
      ...user,
      mode: "edit",
      pendingType: user.type,
      pendingActivity: user.activity,
    });
  };

  const handleSaveEdit = () => {
    if (!selectedUser) return;
    setUserList((prev) =>
      prev.map((user) =>
        user.email === selectedUser.email
          ? { ...user, type: selectedUser.pendingType, activity: selectedUser.pendingActivity }
          : user,
      ),
    );
    setSelectedUser(null);
  };

  const handleSuspend = (user) => {
    setUserList((prev) =>
      prev.map((item) =>
        item.email === user.email
          ? { ...item, status: item.status === "suspended" ? "active" : "suspended" }
          : item,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
        <p className="text-sm text-gray-500">
          Manage travelers, suppliers, disputes, and reviews
        </p>
      </div>

      <div className="bg-white rounded-2xl card-shadow border border-gray-100 p-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full">
            <p className="text-xs uppercase tracking-[0.2em] text-[#b88a4a] font-semibold">
              Travelers
            </p>
            <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${tab === activeTab
                    ? "bg-[#a26e35] text-white"
                    : "border border-gray-200 text-gray-500"
                    }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-3 py-2 text-sm text-gray-500 w-full lg:w-64">
            <Search className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search users..."
              className="flex-1 bg-transparent outline-none w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-6 py-3 font-semibold">User</th>
                <th className="text-left px-6 py-3 font-semibold">Type</th>
                <th className="text-left px-6 py-3 font-semibold">Join Date</th>
                <th className="text-left px-6 py-3 font-semibold">Activity</th>
                <th className="text-left px-6 py-3 font-semibold">Status</th>
                <th className="text-left px-6 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <React.Fragment key={user.email}>
                  <tr className={`transition-colors ${selectedUser?.email === user.email ? "bg-gray-50/50" : "hover:bg-gray-50/70"}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-sm font-semibold shrink-0">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-none">{user.name}</p>
                          <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.type}</td>
                    <td className="px-6 py-4 text-gray-600">{user.joinDate}</td>
                    <td className="px-6 py-4 text-gray-600">{user.activity}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <button
                          className={`hover:underline ${selectedUser?.email === user.email && selectedUser.mode === "view" ? "text-[#a26e35]" : "text-blue-500"}`}
                          onClick={() => handleView(user)}
                        >
                          View
                        </button>
                        <button
                          className={`hover:underline ${selectedUser?.email === user.email && selectedUser.mode === "edit" ? "text-[#a26e35]" : "text-orange-500"}`}
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-500 hover:underline"
                          onClick={() => handleSuspend(user)}
                        >
                          {user.status === "suspended" ? "Restore" : "Suspend"}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {selectedUser?.email === user.email && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900">
                              {selectedUser.mode === "view" ? "User Details" : "Edit User"}
                            </h3>
                            <button
                              className="text-xs text-gray-400 hover:text-gray-600"
                              onClick={() => setSelectedUser(null)}
                            >
                              Close
                            </button>
                          </div>
                          {selectedUser.mode === "view" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                              <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Name</p>
                                <p className="font-semibold text-slate-700">{selectedUser.name}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Email</p>
                                <p className="font-semibold text-slate-700">{selectedUser.email}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Member Since</p>
                                <p className="font-semibold text-slate-700">{selectedUser.joinDate}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">User Type</p>
                                <p className="font-semibold text-slate-700">{selectedUser.type}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total Activity</p>
                                <p className="font-semibold text-slate-700">{selectedUser.activity}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                                  Type
                                </label>
                                <input
                                  type="text"
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#a26e35] outline-none"
                                  value={selectedUser.pendingType}
                                  onChange={(e) =>
                                    setSelectedUser((prev) => ({ ...prev, pendingType: e.target.value }))
                                  }
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                                  Activity
                                </label>
                                <input
                                  type="text"
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#a26e35] outline-none"
                                  value={selectedUser.pendingActivity}
                                  onChange={(e) =>
                                    setSelectedUser((prev) => ({
                                      ...prev,
                                      pendingActivity: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
                                <button
                                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100"
                                  onClick={() => setSelectedUser(null)}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#a26e35] text-white hover:bg-[#8c5c2c]"
                                  onClick={handleSaveEdit}
                                >
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-sm text-gray-500 py-8"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.email} className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-sm font-semibold shrink-0">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-y border-gray-50 py-3">
                <div>
                  <p className="text-gray-400 font-medium mb-1">Type</p>
                  <p className="text-slate-700 font-semibold">{user.type}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium mb-1">Status</p>
                  <StatusBadge status={user.status} />
                </div>
                <div>
                  <p className="text-gray-400 font-medium mb-1">Join Date</p>
                  <p className="text-slate-700 font-semibold">{user.joinDate}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium mb-1">Activity</p>
                  <p className="text-slate-700 font-semibold">{user.activity}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  className="flex-1 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition"
                  onClick={() => handleView(user)}
                >
                  View Detail
                </button>
                <button
                  className="flex-1 py-2 rounded-xl bg-orange-50 text-orange-600 text-xs font-bold hover:bg-orange-100 transition"
                  onClick={() => handleEdit(user)}
                >
                  Edit
                </button>
                <button
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${user.status === "suspended"
                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                    }`}
                  onClick={() => handleSuspend(user)}
                >
                  {user.status === "suspended" ? "Restore" : "Suspend"}
                </button>
              </div>

              {/* Mobile Inline Details/Edit */}
              {selectedUser?.email === user.email && (
                <div className="mt-4 pt-4 border-t border-gray-50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      {selectedUser.mode === "view" ? "User Details" : "Edit User"}
                    </h3>
                  </div>
                  {selectedUser.mode === "view" ? (
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-gray-400 font-bold mb-0.5">Type</p>
                        <p className="text-slate-700">{selectedUser.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-bold mb-0.5">Joined</p>
                        <p className="text-slate-700">{selectedUser.joinDate}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-400 font-bold mb-0.5">Total Activity</p>
                        <p className="text-slate-700">{selectedUser.activity}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Type</label>
                        <input
                          type="text"
                          className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#a26e35] outline-none"
                          value={selectedUser.pendingType}
                          onChange={(e) => setSelectedUser(prev => ({ ...prev, pendingType: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Activity</label>
                        <input
                          type="text"
                          className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#a26e35] outline-none"
                          value={selectedUser.pendingActivity}
                          onChange={(e) => setSelectedUser(prev => ({ ...prev, pendingActivity: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="flex-1 py-2 rounded-lg bg-[#a26e35] text-white text-xs font-bold"
                          onClick={handleSaveEdit}
                        >
                          Save
                        </button>
                        <button
                          className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold"
                          onClick={() => setSelectedUser(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-sm text-gray-500">
              No users found.
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default UserManagement;

