import * as React from "react";
import { useState } from "react";
import { MapPin, Calendar, Clock, User, CheckCheck, X, ChevronRight } from "lucide-react";
import { Appointment } from "@/lib/types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

interface AppointmentRequestsProps {
  requests: Appointment[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

const AppointmentRequests = ({ requests, onAccept, onReject }: AppointmentRequestsProps) => {


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
          {requests.map((req) => {
            // Use patientName, or fallback to name, or "Patient" string
            const displayName = req.patientName || req.name || req.patientId || "Patient";

            return (
              <div key={req.id} className="px-6 py-4 hover:bg-slate-50/60 transition-colors duration-150">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 uppercase">
                    {displayName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800 text-sm">{displayName}</p>
                      {req.age && (
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {req.age} yrs
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                      {req.village && (
                        <>
                          <MapPin size={11} />
                          <span>{req.village}</span>
                          <span className="mx-1">·</span>
                        </>
                      )}
                      <Calendar size={11} />
                      <span>{req.date} {req.time}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-600 bg-blue-50 px-2.5 py-1.5 rounded-lg border-l-2 border-blue-400">
                      <span className="font-semibold text-blue-700">Complaint: </span>{req.problem}
                    </p>

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => onAccept(req.id as string)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <CheckCheck size={13} />
                        Accept
                      </button>
                      <button
                        onClick={() => onReject(req.id as string)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                      >
                        <X size={13} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppointmentRequests;