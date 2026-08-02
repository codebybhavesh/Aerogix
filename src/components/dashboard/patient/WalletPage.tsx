import * as React from "react";
import type { Appointment, WalletTransaction } from "@/lib/types";

interface WalletPageProps {
  walletBalance: number;
  addAmount: string;
  onAddAmountChange: (value: string) => void;
  adding: boolean;
  onAddMoney: () => void;
  appointments: Appointment[];
  payingAppointmentId: string | null;
  onPayAppointment: (appointment: Appointment) => void;
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

export default function WalletPage({
  walletBalance,
  addAmount,
  onAddAmountChange,
  adding,
  onAddMoney,
  appointments,
  payingAppointmentId,
  onPayAppointment,
  transactions,
}: WalletPageProps) {
  const payableAppointments = appointments.filter(
    (a) => (a.status === "Accepted" || a.status === "confirmed" || a.status === "in-progress") && (a.paymentStatus || "unpaid") !== "paid"
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Wallet</h2>
            <p className="text-slate-500 text-sm mt-1">Manage your balance and pay consultation fees</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Current Balance</p>
            <p className="text-2xl font-bold text-emerald-600">Rs {walletBalance.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            type="number"
            min="1"
            step="1"
            value={addAmount}
            onChange={(e) => onAddAmountChange(e.target.value)}
            placeholder="Enter amount"
            className="w-40 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <button
            onClick={onAddMoney}
            disabled={adding}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-60"
          >
            {adding ? "Adding..." : "Add Money"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-800">Pay Consultation Fees</h3>
        <p className="text-xs text-slate-500 mt-1">Video consultation is enabled only after fee payment.</p>

        {payableAppointments.length === 0 ? (
          <p className="text-sm text-slate-500 mt-4">No pending fees right now.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {payableAppointments.map((apt) => {
              const fee = Number(apt.consultationFee || 0);
              return (
                <div key={apt.id} className="flex items-center justify-between gap-3 p-3 border border-slate-100 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{apt.doctorName || "Doctor"}</p>
                    <p className="text-xs text-slate-500">{apt.date} · {apt.time}</p>
                  </div>
                  <button
                    onClick={() => onPayAppointment(apt)}
                    disabled={payingAppointmentId !== null || fee <= 0}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-60"
                  >
                    {payingAppointmentId === apt.id ? "Processing..." : `Pay Rs ${fee}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-800">Transaction History</h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-slate-500 mt-4">No transactions yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    Paid Rs {tx.amount} ({tx.type})
                  </p>
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
    </div>
  );
}
