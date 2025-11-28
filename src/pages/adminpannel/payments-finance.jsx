import React, { useState } from "react";
import { DollarSign, BarChart3, WalletCards, ReceiptText } from "lucide-react";

const summaryCards = [
  {
    label: "Total Revenue",
    value: "$67,890",
    icon: DollarSign,
    bg: "bg-emerald-500",
  },
  {
    label: "Commission Earned",
    value: "$6,789",
    icon: BarChart3,
    bg: "bg-blue-500",
  },
  {
    label: "Pending Payouts",
    value: "$2,340",
    icon: WalletCards,
    bg: "bg-amber-500",
  },
  {
    label: "Transactions",
    value: "892",
    icon: ReceiptText,
    bg: "bg-purple-500",
  },
];

const tabs = [
  { label: "All Transactions", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
];

const transactions = [
  {
    id: "TXN-001",
    user: "John Doe",
    listing: "Luxury Villa in Bali",
    amount: "$250.00",
    commission: "$25.00",
    date: "2025-03-15",
    status: "completed",
  },
  {
    id: "TXN-002",
    user: "Jane Smith",
    listing: "City Tour Package",
    amount: "$120.00",
    commission: "$12.00",
    date: "2025-03-14",
    status: "pending",
  },
  {
    id: "TXN-003",
    user: "Mike Johnson",
    listing: "Beach Resort Stay",
    amount: "$400.00",
    commission: "$40.00",
    date: "2025-03-13",
    status: "completed",
  },
  {
    id: "TXN-004",
    user: "Sarah Williams",
    listing: "Desert Safari Experience",
    amount: "$180.00",
    commission: "$18.00",
    date: "2025-03-12",
    status: "failed",
  },
];

const StatusBadge = ({ status }) => {
  const map = {
    completed: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    failed: "bg-rose-100 text-rose-700",
  };

  return (
    <span
      className={`px-3 py-1 text-[11px] font-semibold rounded-full capitalize ${
        map[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

const PaymentsFinance = () => {
  const [activeTab, setActiveTab] = useState("all");

  const filteredTransactions =
    activeTab === "all"
      ? transactions
      : transactions.filter((tx) => tx.status === activeTab);

  const handleExport = () => {
    // Always export all transactions, regardless of current filter
    const headers = [
      "Transaction ID",
      "User",
      "Listing",
      "Amount",
      "Commission",
      "Date",
      "Status",
    ];

    const rows = transactions.map((tx) => [
      tx.id,
      tx.user,
      tx.listing,
      tx.amount,
      tx.commission,
      tx.date,
      tx.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "payments-transactions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Payment & Finance
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage commissions, transactions, and invoices
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-gray-100 px-10 py-6 card-shadow flex flex-col items-start justify-between min-h-[168px]"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bg}`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="mt-6 flex flex-col">
                <p className="text-sm font-medium text-gray-500">
                  {card.label}
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 card-shadow p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#c18c4d] font-semibold">
              Transactions
            </p>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            <span>Export</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition ${{
                true: "",
              }} ${
                activeTab === tab.value
                  ? "bg-[#a26e35] text-white shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 mt-2">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-6 py-3 font-semibold">
                  Transaction ID
                </th>
                <th className="text-left px-6 py-3 font-semibold">User</th>
                <th className="text-left px-6 py-3 font-semibold">Listing</th>
                <th className="text-left px-6 py-3 font-semibold">Amount</th>
                <th className="text-left px-6 py-3 font-semibold">Commission</th>
                <th className="text-left px-6 py-3 font-semibold">Date</th>
                <th className="text-left px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/80">
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {tx.id}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{tx.user}</td>
                  <td className="px-6 py-4 text-gray-700">{tx.listing}</td>
                  <td className="px-6 py-4 text-gray-700">{tx.amount}</td>
                  <td className="px-6 py-4 text-emerald-600 font-semibold">
                    {tx.commission}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{tx.date}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={tx.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-500">
              No transactions in this state.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsFinance;
