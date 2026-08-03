import * as React from "react";
import { Star, Clock, Stethoscope, CheckCircle, XCircle } from "lucide-react";
import { Doctor } from "@/lib/types";

interface DoctorListProps {
  doctors: Doctor[];
  onBookClick: (doc: Doctor) => void;
  emptyMessage?: string;
}

export default function DoctorList({ doctors, onBookClick, emptyMessage = "No doctors found." }: DoctorListProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
      {doctors.length === 0 ? (
        <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-400 italic">{emptyMessage}</p>
        </div>
      ) : (
        doctors.map((doc) => (
          <div key={doc.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${doc.color || 'from-teal-400 to-cyan-600'} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {doc.avatar || (doc.name ? doc.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DR')}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{doc.name}</h3>
                    <p className="text-teal-600 text-xs font-medium flex items-center gap-1 mt-0.5">
                      <Stethoscope size={11} /> {doc.specialization}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${doc.available
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-500"
                    }`}>
                    {doc.available ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {doc.availabilityText || (doc.available ? "Available" : "Busy")}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Clock size={11} /> {doc.experience}</span>
                  <span className="flex items-center gap-1 font-medium text-slate-600">₹{doc.consultationFee}</span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <Star size={11} fill="currentColor" /> {doc.rating}
                  </span>
                </div>

                {/* Time slots */}
                {doc.slots && doc.slots.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 mb-2">Available Slots</p>
                    <div className="flex flex-wrap gap-1.5">
                      {doc.slots.map((slot: string) => (
                        <span key={slot} className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1 rounded-lg">
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onBookClick(doc)}
                  disabled={!doc.available}
                  className={`mt-4 w-full py-2 px-4 rounded-xl text-xs font-semibold transition-all duration-150 ${doc.available
                    ? "bg-teal-500 hover:bg-teal-600 text-white shadow-sm hover:shadow"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                >
                  {doc.available ? "Book Appointment" : "Not Available"}
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
