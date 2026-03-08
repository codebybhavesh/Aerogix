import * as React from "react";
import { Clock, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Appointment } from "@/lib/types";
import socket from "@/socket/socket";

const statusConfig: Record<string, { label: string; color: string }> = {
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700" },
  Accepted: { label: "Accepted", color: "bg-blue-100 text-blue-700" },
  "in-progress": { label: "In Progress", color: "bg-emerald-100 text-emerald-700" },
  upcoming: { label: "Upcoming", color: "bg-violet-100 text-violet-700" },
};

interface ScheduledAppointmentsProps {
  appointments: Appointment[];
  doctorId: string;
  doctorName: string;
}

const ScheduledAppointments = ({
  appointments,
  doctorId,
  doctorName,
}: ScheduledAppointmentsProps) => {
  const navigate = useNavigate();

  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h2
            className="text-base font-bold text-slate-800"
            style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
          >
            Scheduled Appointments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{appointments.length} confirmed</p>
        </div>
        <button className="text-xs text-blue-600 font-semibold hover:underline">View All</button>
      </div>

      {appointments.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <Clock size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No appointments scheduled yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {appointments.map((appt) => {
            const status = statusConfig[appt.status] || statusConfig["confirmed"];
            const displayName = appt.patientName || appt.name || appt.patientId || "Patient";

            return (
              <div
                key={appt.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/60 transition-colors duration-150"
              >
                {/* Time column */}
                <div className="w-14 flex-shrink-0 text-center">
                  <p className="text-sm font-bold text-slate-700">{appt.time}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{appt.date}</p>
                </div>

                <div className="w-px h-10 bg-slate-200 flex-shrink-0" />

                {/* Patient Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800 text-sm truncate">{displayName}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{appt.problem}</p>
                </div>

                {/* Start Call Button */}
                <button
                  onClick={() => handleStartCall(appt)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex-shrink-0"
                >
                  <Video size={13} />
                  Start
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScheduledAppointments;