import * as React from "react";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { Prescription, MedicineEntry } from "@/lib/types";
import {
  FileText, Download, Calendar,
  ChevronDown, ChevronUp, Stethoscope, Pill
} from "lucide-react";

const buildPrescriptionHTML = (p: Prescription) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Prescription — ${p.patientName}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Georgia', serif; color: #1e293b; background: #fff; padding: 48px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 2px solid #0ea5e9; padding-bottom:20px; margin-bottom:28px; }
    .clinic-name { font-size:22px; font-weight:700; color:#0284c7; }
    .clinic-sub { font-size:12px; color:#64748b; margin-top:3px; }
    .rx-badge { font-size:48px; font-weight:900; color:#e0f2fe; line-height:1; }
    .meta { display:grid; grid-template-columns:1fr 1fr; gap:12px; background:#f8fafc; border-radius:10px; padding:16px; margin-bottom:28px; font-size:13px; }
    .meta-item label { font-size:10px; text-transform:uppercase; letter-spacing:0.8px; color:#94a3b8; display:block; margin-bottom:2px; }
    .meta-item span { font-weight:600; }
    .section-title { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; margin-bottom:12px; }
    .medicine-row { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:8px; padding:12px; border:1px solid #e2e8f0; border-radius:8px; margin-bottom:8px; }
    .medicine-name { font-weight:700; font-size:14px; }
    .medicine-detail { font-size:12px; color:#475569; }
    .medicine-label { font-size:10px; color:#94a3b8; margin-bottom:2px; text-transform:uppercase; }
    .instructions-box { background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:6px 8px; margin-top:6px; font-size:11px; color:#92400e; }
    .notes-section { margin-top:24px; border-top:1px dashed #cbd5e1; padding-top:20px; }
    .notes-text { font-size:13px; color:#475569; line-height:1.7; }
    .footer { margin-top:40px; display:flex; justify-content:space-between; align-items:flex-end; }
    .signature-line { border-top:1px solid #334155; width:180px; padding-top:8px; font-size:12px; color:#475569; text-align:center; }
    .watermark { font-size:11px; color:#cbd5e1; }
    @media print { body { padding: 24px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="clinic-name">Arogix Medical</div>
      <div class="clinic-sub">Digital Health Consultation Platform</div>
    </div>
    <div class="rx-badge">℞</div>
  </div>
  <div class="meta">
    <div class="meta-item"><label>Patient</label><span>${p.patientName}</span></div>
    <div class="meta-item"><label>Date</label><span>${p.date}</span></div>
    <div class="meta-item"><label>Physician</label><span>Dr. ${p.doctorName}</span></div>
    <div class="meta-item"><label>Diagnosis</label><span>${p.problem || "General Consultation"}</span></div>
  </div>
  <div class="section-title">Prescribed Medicines</div>
  ${p.medicines.map((m: MedicineEntry) => `
    <div class="medicine-row">
      <div>
        <div class="medicine-label">Medicine</div>
        <div class="medicine-name">${m.name}</div>
        ${m.instructions ? `<div class="instructions-box">⚠ ${m.instructions}</div>` : ""}
      </div>
      <div><div class="medicine-label">Dosage</div><div class="medicine-detail">${m.dosage}</div></div>
      <div><div class="medicine-label">Frequency</div><div class="medicine-detail">${m.frequency}</div></div>
      <div><div class="medicine-label">Duration</div><div class="medicine-detail">${m.duration}</div></div>
    </div>`).join("")}
  ${p.notes ? `
    <div class="notes-section">
      <div class="section-title">Doctor's Notes</div>
      <div class="notes-text">${p.notes}</div>
    </div>` : ""}
  <div class="footer">
    <div class="watermark">Generated via Arogix · ${new Date().toLocaleString()}</div>
    <div class="signature-line">Dr. ${p.doctorName}<br/>Digital Signature</div>
  </div>
</body>
</html>`;

const handleDownload = (p: Prescription) => {
  const url = URL.createObjectURL(new Blob([buildPrescriptionHTML(p)], { type: "text/html" }));
  const win = window.open(url, "_blank");
  if (win) win.onload = () => win.print();
};

export default function PrescriptionSection() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "prescriptions"), where("patientId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Prescription));
      data.sort((a, b) => {
        const ta = a.createdAt?.toDate?.()?.getTime?.() ?? 0;
        const tb = b.createdAt?.toDate?.()?.getTime?.() ?? 0;
        return tb - ta;
      });
      setPrescriptions(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-violet-200 border-t-violet-500 animate-spin" />
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Prescriptions</h2>
          <p className="text-slate-400 text-sm mt-1">View and download your prescriptions from consultations</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
            <FileText size={28} className="text-violet-400" />
          </div>
          <p className="text-slate-700 font-semibold">No prescriptions yet</p>
          <p className="text-slate-400 text-sm mt-1">Prescriptions will appear here after your consultation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">My Prescriptions</h2>
        <p className="text-slate-400 text-sm mt-1">
          {prescriptions.length} prescription{prescriptions.length !== 1 ? "s" : ""} on record
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {prescriptions.map((p) => {
          const isExpanded = expandedId === p.id;
          const visibleMeds = isExpanded ? p.medicines : p.medicines.slice(0, 2);
          const hiddenCount = p.medicines.length - 2;

          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Dr. {p.doctorName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{p.problem || "General Consultation"}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(p)}
                  className="text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 p-2 rounded-lg transition-colors flex-shrink-0"
                  title="Download prescription"
                >
                  <Download size={16} />
                </button>
              </div>

              {/* Meta */}
              <div className="px-5 pt-4 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar size={12} />{p.date}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Pill size={12} />
                  {p.medicines.length} medicine{p.medicines.length !== 1 ? "s" : ""}
                </div>
              </div>

              {/* Medicines */}
              <div className="px-5 pt-3 pb-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Prescribed Medicines
                </p>
                <ul className="space-y-2">
                  {visibleMeds.map((med, idx) => (
                    <li key={med.id || idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
                      <span>
                        <span className="font-medium">{med.name}</span>
                        {med.dosage && <span className="text-slate-500"> {med.dosage}</span>}
                        {med.frequency && <span className="text-slate-400"> · {med.frequency}</span>}
                        {med.duration && <span className="text-slate-400"> · {med.duration}</span>}
                        {med.instructions && (
                          <span className="ml-1.5 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
                            {med.instructions}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                  {!isExpanded && hiddenCount > 0 && (
                    <li className="text-xs text-slate-400 pl-3.5">
                      +{hiddenCount} more medicine{hiddenCount !== 1 ? "s" : ""}
                    </li>
                  )}
                </ul>
              </div>

              {/* Doctor's notes (expanded only) */}
              {isExpanded && p.notes && (
                <div className="px-5 pt-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Stethoscope size={11} /> Doctor's Notes
                  </p>
                  <p className="text-sm text-slate-600 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {p.notes}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="px-5 py-4 mt-2 flex items-center gap-2">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {isExpanded ? "Show Less" : "View Details"}
                </button>
                <button
                  onClick={() => handleDownload(p)}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors"
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}