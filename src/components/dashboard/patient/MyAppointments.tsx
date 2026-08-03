import * as React from "react";
import { Video, Phone, X, Calendar, Clock, Stethoscope } from "lucide-react";
import { Appointment } from "@/lib/types";

const statusConfig: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-600 border-amber-200",
  Accepted: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Confirmed: "bg-emerald-50 text-emerald-600 border-emerald-200",
  "in-progress": "bg-blue-50 text-blue-600 border-blue-200",
  Completed: "bg-blue-50 text-blue-600 border-blue-200",
  Cancelled: "bg-red-50 text-red-600 border-red-200",
  Rejected: "bg-slate-50 text-slate-500 border-slate-200",
};

interface MyAppointmentsProps {
  appointments: Appointment[];
  onConsultation: (apt: Appointment, type: string) => void;
  onCancel: (id: string | number) => void;
}

export default function MyAppointments({ appointments, onConsultation, onCancel }: MyAppointmentsProps) {
  if (appointments.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">My Appointments</h2>
          <p className="text-slate-400 text-sm mt-1">Track and manage your upcoming consultations</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Calendar size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No appointments yet</p>
          <p className="text-slate-300 text-sm mt-1">Book your first appointment to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">My Appointments</h2>
        <p className="text-slate-400 text-sm mt-1">Track and manage your upcoming consultations</p>
      </div>

      <div className="space-y-4">
        {appointments.map((apt) => (
          <div key={apt.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {apt.doctorName?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">{apt.doctorName}</h3>
                  <p className="text-teal-600 text-xs flex items-center gap-1 mt-0.5">
                    <Stethoscope size={11} /> {apt.specialization}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {new Date(apt.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {apt.time}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      Fee: Rs {Number(apt.consultationFee || 0)}
                    </span>
                  </div>
                  <p className={`mt-1 text-[11px] font-medium ${(apt.paymentStatus || "unpaid") === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                    Payment: {(apt.paymentStatus || "unpaid") === "paid" ? "Paid" : "Pending"}
                  </p>
                  {apt.problem && (
                    <p className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5 max-w-xs truncate">
                      {apt.problem}
                    </p>
                  )}
                </div>
              </div>

              <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex-shrink-0 ${statusConfig[apt.status] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
                {apt.status}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => onConsultation(apt, "1on1")}
                className="flex items-center gap-1.5 text-xs font-medium bg-teal-50 hover:bg-teal-100 text-teal-600 px-3 py-2 rounded-lg transition-colors"
              >
                <Phone size={13} /> 1:1 Consultation
              </button>
              <button
                onClick={() => onConsultation(apt, "video")}
                disabled={(apt.paymentStatus || "unpaid") !== "paid"}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
                  (apt.paymentStatus || "unpaid") === "paid"
                    ? "bg-blue-50 hover:bg-blue-100 text-blue-600"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Video size={13} /> Video Consultation
              </button>
              {!["Completed", "Cancelled", "Rejected"].includes(apt.status) && (
                <button
                  onClick={() => onCancel(apt.id)}
                  className="ml-auto flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <X size={13} /> Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
