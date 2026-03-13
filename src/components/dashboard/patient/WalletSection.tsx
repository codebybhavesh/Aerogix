import * as React from "react";
import type { WalletTransaction } from "@/lib/types";

type DoctorPayee = {
  id: string;
  name: string;
};

interface WalletSectionProps {
  walletBalance: number;
  doctors: DoctorPayee[];
  transactions: WalletTransaction[];
  paymentLoadingDoctorId: string | null;
  addingAmount: number | null;
  onAddMoney: (amount: number) => void;
  onPayDoctor: (doctorId: string, amount: number) => void;
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

export default function WalletSection({
  walletBalance,
  doctors,
  transactions,
  paymentLoadingDoctorId,
  addingAmount,
  onAddMoney,
  onPayDoctor,
}: WalletSectionProps) {
  return (
    <div className="space-y-6 mb-8">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Wallet</h2>
            <p className="text-slate-500 text-sm mt-1">Pay doctors securely from your wallet</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Current Balance</p>
            <p className="text-2xl font-bold text-emerald-600">Rs {walletBalance.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {[500, 1000].map((amount) => (
            <button
              key={amount}
              onClick={() => onAddMoney(amount)}
              disabled={addingAmount !== null}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-60"
            >
              {addingAmount === amount ? "Adding..." : `Add Rs ${amount}`}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-800">Pay Doctors</h3>
        <p className="text-xs text-slate-500 mt-1">Demo consultation amount: Rs 200</p>
        {doctors.length === 0 ? (
          <p className="text-sm text-slate-500 mt-4">No doctors available.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="flex items-center justify-between gap-3 p-3 border border-slate-100 rounded-xl">
                <p className="text-sm font-medium text-slate-700">{doctor.name}</p>
                <button
                  onClick={() => onPayDoctor(doctor.id, 200)}
                  disabled={paymentLoadingDoctorId !== null}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-60"
                >
                  {paymentLoadingDoctorId === doctor.id ? "Processing..." : "Pay Rs 200"}
                </button>
              </div>
            ))}
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
