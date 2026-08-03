import * as React from "react";
import { UserCircle, ChevronDown } from "lucide-react";
import NotificationDropdown from "@/components/notification/NotificationDropdown";

interface PatientTopBarProps {
  patientName?: string;
}

export default function PatientTopBar({ patientName = "Ramesh" }: PatientTopBarProps) {
  return (
    <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-slate-800 font-semibold text-xl">
          Welcome back, <span className="text-teal-600">{patientName}</span> 👋
        </h1>
        <p className="text-slate-400 text-sm">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <NotificationDropdown userRole="patient" />

        {/* Profile */}
        <button className="flex items-center gap-2 pl-2 pr-3 py-2 rounded-xl hover:bg-slate-100 transition-colors">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-full flex items-center justify-center">
            <UserCircle size={20} className="text-white" />
          </div>
          <span className="text-sm font-medium text-slate-700">{patientName} Kumar</span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>
      </div>
    </header>
  );
}