import React from "react";
import { Users, CalendarCheck, ClipboardList, CheckCircle2 } from "lucide-react";

const stats = [
  {
    label: "Total Patients",
    value: "1,284",
    change: "+12 this month",
    positive: true,
    icon: Users,
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    label: "Today's Appointments",
    value: "14",
    change: "3 remaining",
    positive: true,
    icon: CalendarCheck,
    color: "from-violet-500 to-violet-600",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    label: "Pending Requests",
    value: "3",
    change: "Needs attention",
    positive: false,
    icon: ClipboardList,
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    label: "Completed Consultations",
    value: "11",
    change: "+2 vs yesterday",
    positive: true,
    icon: CheckCircle2,
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  {stat.value}
                </p>
                <p className={`text-xs mt-1.5 font-medium ${stat.positive ? "text-emerald-600" : "text-amber-600"}`}>
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <Icon size={22} className={stat.iconColor} />
              </div>
            </div>
            <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
                style={{ width: `${Math.min(100, parseInt(stat.value.replace(",", "")) / 15)}%`, maxWidth: "90%" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;