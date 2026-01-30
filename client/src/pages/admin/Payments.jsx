import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Download,
} from "lucide-react";
import api from "../../utils/api";
import AdminTable from "../../components/admin/AdminTable";
import AdminStatCard from "../../components/admin/AdminStatCard";

const Payments = () => {
  // Mock data for trends and visuals as per instructions
  const { data: stats } = useQuery({
    queryKey: ["admin-payments-stats"],
    queryFn: async () => {
      const res = await api.get("/admin/payments/stats");
      return res.data;
    },
  });
  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ["admin-payments-transactions"],
    queryFn: async () => {
      const res = await api.get("/admin/payments/transactions");
      return res.data.transactions;
    },
  });
 

const monthlyGrowth =
  stats?.lastMonthRevenue > 0
    ? Math.round(
        ((stats.monthlyRevenue - stats.lastMonthRevenue) /
          stats.lastMonthRevenue) * 100
      )
    : null;
console.log("Monthly Growth:", monthlyGrowth);
const statItems = [
  {
    label: 'Total Revenue',
    value: stats ? `$${stats.totalRevenue.toLocaleString()}` : '—',
    icon: DollarSign,
    color: 'blue'
  },
  monthlyGrowth !== null && {
    label: 'Monthly Growth',
    value: `${monthlyGrowth}%`,
    icon: TrendingUp,
    color: 'green'
  }
].filter(Boolean);

console.log("Stat Items:", statItems);
  const headers = [
    "Transaction ID",
    "Student",
    "Course",
    "Amount",
    "Status",
    "Date"
  ];

  const renderRow = (txn) => (
    <>
      <td className="px-6 py-4">
        <span className="font-mono text-xs font-bold text-slate-400">
          {txn.id}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-slate-900">
          {txn.student}
        </span>
      </td>
      <td className="px-6 py-4">
        <span
          className="text-sm text-slate-600 truncate max-w-[150px]"
          title={txn.course}
        >
          {txn.course}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-bold text-slate-900">${txn.amount}</span>
      </td>
      <td className="px-6 py-4">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            txn.status === "completed"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {txn.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs text-slate-400">
          {new Date(txn.date).toLocaleDateString()}
        </span>
      </td>
    </>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard size={28} className="text-indigo-600" />
            Financial Overview
          </h1>
          <p className="text-slate-500">
            Track and manage all platform transactions and payouts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statItems.map((item, idx) => (
          <AdminStatCard key={idx} {...item} />
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Recent Transactions
          </h2>
          {/* <div className="flex items-center gap-2 text-sm text-indigo-600 font-semibold cursor-pointer hover:underline">
            View all <Calendar size={16} />
          </div> */}
        </div>
        <AdminTable
  headers={headers}
  data={transactions}
  loading={txLoading}
  renderRow={renderRow}
/>

      </div>

      {/* Stripe Test Mode Banner */}
      {/* <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
          <CreditCard size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-900 uppercase tracking-tight">
            Stripe Test Mode Active
          </h4>
          <p className="text-xs text-amber-700 mt-0.5">
            Only test card numbers can be used for platform-wide simulated
            transactions. Live payments are currently disabled.
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default Payments;
