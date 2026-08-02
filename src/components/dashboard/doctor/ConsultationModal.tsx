import * as React from "react";
import { useState } from "react";
import { X, User, Phone, MapPin, ClipboardList, Send, Pill } from "lucide-react";
import { Appointment } from "@/lib/types";

interface ConsultationModalProps {
  patient: Appointment;
  onClose: () => void;
}

const ConsultationModal = ({ patient, onClose }: ConsultationModalProps) => {
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [showPrescription, setShowPrescription] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!patient) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
          <div>
            <p className="text-blue-200 text-xs uppercase tracking-widest font-semibold mb-1">Active Consultation</p>
            <h3 className="text-white text-xl font-bold" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              {patient.name}
            </h3>
            <p className="text-blue-200 text-sm mt-0.5">{patient.problem}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Patient Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <User size={15} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Patient</p>
                <p className="text-sm font-semibold text-slate-700">{patient.name}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                <ClipboardList size={15} className="text-violet-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Complaint</p>
                <p className="text-sm font-semibold text-slate-700 truncate">{patient.problem}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Phone size={15} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Time</p>
                <p className="text-sm font-semibold text-slate-700">{patient.time}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <MapPin size={15} className="text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Date</p>
                <p className="text-sm font-semibold text-slate-700">{patient.date}</p>
              </div>
            </div>
          </div>

          {/* Consultation Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Consultation Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter examination findings, observations, diagnosis details..."
              rows={4}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Prescription Section */}
          {showPrescription ? (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Prescription
              </label>
              <textarea
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="e.g. Tab. Metoprolol 25mg - 1 tab BD x 30 days&#10;Tab. Aspirin 75mg - 1 tab OD x 30 days&#10;Advice: Low-sodium diet, regular BP monitoring"
                rows={4}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
              />
            </div>
          ) : (
            <button
              onClick={() => setShowPrescription(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-300 text-blue-600 font-semibold text-sm rounded-xl hover:bg-blue-50 transition-colors"
            >
              <Pill size={16} />
              Write Prescription
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2 text-sm text-white rounded-xl font-semibold transition-all ${saved ? "bg-emerald-500" : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            <Send size={14} />
            {saved ? "Saved!" : "Save & Complete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationModal;