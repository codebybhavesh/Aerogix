import React, { useState } from "react";
import { MapPin, Calendar, Clock, User, CheckCheck, X, ChevronRight } from "lucide-react";

const AppointmentRequests = ({ requests, onAccept, onReject }) => {
  const [schedulingId, setSchedulingId] = useState(null);
  const [dateTime, setDateTime] = useState({ date: "", time: "" });

  const handleAcceptClick = (id) => {
    setSchedulingId(id);
    setDateTime({ date: "", time: "" });
  };

  const handleConfirm = (request) => {
    if (!dateTime.date || !dateTime.time) return;
    onAccept(request, dateTime.date, dateTime.time);
    setSchedulingId(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Appointment Requests
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{requests.length} pending</p>
        </div>
        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
          Needs Review
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <CheckCheck size={40} className="text-emerald-400 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">All requests reviewed!</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {requests.map((req) => (
            <div key={req.id} className="px-6 py-4 hover:bg-slate-50/60 transition-colors duration-150">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {req.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-800 text-sm">{req.name}</p>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {req.age} yrs
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                    <MapPin size={11} />
                    <span>{req.village}</span>
                    <span className="mx-1">·</span>
                    <Calendar size={11} />
                    <span>{req.requestedDate}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600 bg-blue-50 px-2.5 py-1.5 rounded-lg border-l-2 border-blue-400">
                    <span className="font-semibold text-blue-700">Complaint: </span>{req.problem}
                  </p>

                  {/* Schedule picker */}
                  {schedulingId === req.id && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Set Appointment Time</p>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={dateTime.date}
                          onChange={(e) => setDateTime((p) => ({ ...p, date: e.target.value }))}
                          className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                        <input
                          type="time"
                          value={dateTime.time}
                          onChange={(e) => setDateTime((p) => ({ ...p, time: e.target.value }))}
                          className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleConfirm(req)}
                          disabled={!dateTime.date || !dateTime.time}
                          className="flex-1 text-xs bg-blue-600 text-white py-1.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Confirm Appointment
                        </button>
                        <button
                          onClick={() => setSchedulingId(null)}
                          className="px-3 text-xs bg-slate-200 text-slate-600 py-1.5 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {schedulingId !== req.id && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAcceptClick(req.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <CheckCheck size={13} />
                        Accept
                      </button>
                      <button
                        onClick={() => onReject(req.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                      >
                        <X size={13} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentRequests;