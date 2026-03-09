import * as React from "react";
import type { WalletTransaction } from "@/lib/types";

interface WalletEarningsProps {
  walletBalance: number;
  transactions: WalletTransaction[];
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

export default function WalletEarnings({ walletBalance, transactions }: WalletEarningsProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Wallet Earnings</h3>
          <p className="text-xs text-slate-500 mt-1">Total balance and recent payments received</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Total Balance</p>
          <p className="text-2xl font-bold text-emerald-600">Rs {walletBalance.toFixed(2)}</p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-slate-500 mt-4">No payments received yet.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {transactions.slice(0, 8).map((tx) => (
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
  );
}
