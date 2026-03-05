import * as React from "react";
import { FileText, Download, ExternalLink, Calendar, User } from "lucide-react";

export default function PrescriptionSection() {
  const prescriptions = [
    {
      id: 1,
      doctorName: "Dr. Priya Sharma",
      specialization: "Cardiologist",
      date: "Mar 5, 2026",
      diagnosis: "Mild Hypertension",
      medicines: ["Amlodipine 5mg (1-0-1)", "Telmisartan 40mg (0-0-1)"],
    },
    {
      id: 2,
      doctorName: "Dr. Arjun Mehta",
      specialization: "Dermatologist",
      date: "Feb 20, 2026",
      diagnosis: "Contact Dermatitis",
      medicines: ["Hydrocortisone Cream (Topical)", "Cetirizine 10mg (0-0-1)"],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">My Prescriptions</h2>
        <p className="text-slate-400 text-sm mt-1">View and download your latest prescriptions from doctors</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {prescriptions.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{p.doctorName}</h3>
                  <p className="text-xs text-slate-500">{p.specialization}</p>
                </div>
              </div>
              <button className="text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 p-2 rounded-lg transition-colors">
                <Download size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Calendar size={14} /> {p.date}
                </div>
                <div className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                  {p.diagnosis}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Prescribed Medicines</p>
                <ul className="space-y-2">
                  {p.medicines.map((med, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                      {med}
                    </li>
                  ))}
                </ul>
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                <ExternalLink size={14} /> View Detailed Summary
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}