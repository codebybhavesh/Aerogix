import * as React from "react";
import { Users, CalendarCheck, ClipboardList, CheckCircle2 } from "lucide-react";

interface StatsData {
  totalPatients: number;
  todayAppointments: number;
  pendingRequests: number;
  completedConsultations: number;
}

interface StatsCardsProps {
  statsData?: StatsData;
}

const StatsCards = ({ statsData }: StatsCardsProps) => {
  // Use passed stats or fallback to 0 if loading
  const safeStats = statsData || {
    totalPatients: 0,
    todayAppointments: 0,
    pendingRequests: 0,
    completedConsultations: 0
  };

  const dynamicStats = [
    {
      label: "Total Patients",
      value: safeStats.totalPatients.toString(),
      change: "Lifetime overall",
      positive: true,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
      maxRatio: 50 // for progress bar scaling
    },
    {
      label: "Today's Appointments",
      value: safeStats.todayAppointments.toString(),
      change: "Scheduled for today",
      positive: true,
      icon: CalendarCheck,
      color: "from-violet-500 to-violet-600",
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
      maxRatio: 15
    },
    {
      label: "Pending Requests",
      value: safeStats.pendingRequests.toString(),
      change: safeStats.pendingRequests > 0 ? "Needs attention" : "All clear!",
      positive: safeStats.pendingRequests === 0,
      icon: ClipboardList,
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
      maxRatio: 10
    },
    {
      label: "Completed Consultations",
      value: safeStats.completedConsultations.toString(),
      change: "Historical record",
      positive: true,
      icon: CheckCircle2,
      color: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      maxRatio: 30
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {dynamicStats.map((stat) => {
        const Icon = stat.icon;

        // Ensure progress bar stays between 0 and 100%
        const numValue = parseInt(stat.value.replace(/,/g, "")) || 0;
        const progressWidth = `${Math.min(100, (numValue / stat.maxRatio) * 100)}%`;

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
                className={`h-full rounded-full bg-gradient-to-r ${stat.color} transition-all duration-1000 ease-out`}
                style={{ width: progressWidth, maxWidth: "100%" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;