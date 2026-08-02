import * as React from "react";
import type { WalletTransaction } from "@/lib/types";

interface DoctorWalletPageProps {
  walletBalance: number;
  withdrawAmount: string;
  onWithdrawAmountChange: (value: string) => void;
  withdrawing: boolean;
  onWithdraw: () => void;
  receivedPayments: WalletTransaction[];
  withdrawals: WalletTransaction[];
}

function formatDate(value: any): string {
  try {
    if (value?.toDate) return value.toDate().toLocaleString("en-IN");
    if (value) return new Date(value).toLocaleString("en-IN");
  } catch {
    return "-";
  }
  return "-";
}

export default function DoctorWalletPage({
  walletBalance,
  withdrawAmount,
  onWithdrawAmountChange,
  withdrawing,
  onWithdraw,
  receivedPayments,
  withdrawals,
}: DoctorWalletPageProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Doctor Wallet</h2>
            <p className="text-slate-500 text-sm mt-1">Manage earnings and withdraw balance</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Available Earnings</p>
            <p className="text-2xl font-bold text-emerald-600">Rs {walletBalance.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="number"
            min="1"
            step="1"
            value={withdrawAmount}
            onChange={(e) => onWithdrawAmountChange(e.target.value)}
            placeholder="Enter withdraw amount"
            className="w-52 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={onWithdraw}
            disabled={withdrawing}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-60"
          >
            {withdrawing ? "Withdrawing..." : "Withdraw Earnings"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-800">Recent Payments Received</h3>
        {receivedPayments.length === 0 ? (
          <p className="text-sm text-slate-500 mt-4">No payments received yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {receivedPayments.slice(0, 12).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-700">Received Rs {tx.amount}</p>
                  <p className="text-xs text-slate-500">{formatDate(tx.createdAt)}</p>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                  {tx.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-800">Withdrawal History</h3>
        {withdrawals.length === 0 ? (
          <p className="text-sm text-slate-500 mt-4">No withdrawals yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {withdrawals.slice(0, 12).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-700">Withdrawn Rs {tx.amount}</p>
                  <p className="text-xs text-slate-500">{formatDate(tx.createdAt)}</p>
                </div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                  {tx.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
