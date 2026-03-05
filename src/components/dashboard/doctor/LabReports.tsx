import * as React from "react";
import { useState } from "react";
import { FlaskConical, Eye, X, FileText, TrendingUp, TrendingDown, Minus } from "lucide-react";

const labReports = [
  {
    id: 1,
    patient: "Ramesh Gupta",
    test: "Complete Blood Count (CBC)",
    date: "Feb 28, 2026",
    status: "Normal",
    details: [
      { name: "Hemoglobin", value: "14.2 g/dL", range: "13.5–17.5", trend: "normal" },
      { name: "WBC Count", value: "7,200 /μL", range: "4,500–11,000", trend: "normal" },
      { name: "Platelet Count", value: "185,000 /μL", range: "150,000–400,000", trend: "normal" },
      { name: "RBC Count", value: "5.1 M/μL", range: "4.5–5.9", trend: "normal" },
    ],
  },
  {
    id: 2,
    patient: "Priya Sharma",
    test: "Lipid Profile",
    date: "Feb 27, 2026",
    status: "Abnormal",
    details: [
      { name: "Total Cholesterol", value: "245 mg/dL", range: "<200 mg/dL", trend: "high" },
      { name: "LDL Cholesterol", value: "162 mg/dL", range: "<100 mg/dL", trend: "high" },
      { name: "HDL Cholesterol", value: "38 mg/dL", range: ">40 mg/dL", trend: "low" },
      { name: "Triglycerides", value: "190 mg/dL", range: "<150 mg/dL", trend: "high" },
    ],
  },
  {
    id: 3,
    patient: "Anjali Verma",
    test: "Thyroid Function (TSH, T3, T4)",
    date: "Feb 26, 2026",
    status: "Normal",
    details: [
      { name: "TSH", value: "2.1 mIU/L", range: "0.4–4.0", trend: "normal" },
      { name: "T3 (Triiodothyronine)", value: "1.2 ng/mL", range: "0.8–2.0", trend: "normal" },
      { name: "T4 (Thyroxine)", value: "7.8 μg/dL", range: "5.0–12.0", trend: "normal" },
    ],
  },
  {
    id: 4,
    patient: "Suresh Patel",
    test: "Blood Glucose (HbA1c)",
    date: "Feb 25, 2026",
    status: "Critical",
    details: [
      { name: "Fasting Glucose", value: "186 mg/dL", range: "70–100 mg/dL", trend: "high" },
      { name: "HbA1c", value: "9.2%", range: "<5.7%", trend: "high" },
      { name: "Post-Prandial Glucose", value: "248 mg/dL", range: "<140 mg/dL", trend: "high" },
    ],
  },
];

const trendIcon = (trend: string) => {
  if (trend === "high") return <TrendingUp size={13} className="text-red-500" />;
  if (trend === "low") return <TrendingDown size={13} className="text-amber-500" />;
  return <Minus size={13} className="text-emerald-500" />;
};

const statusColor: Record<string, string> = {
  Normal: "bg-emerald-100 text-emerald-700",
  Abnormal: "bg-amber-100 text-amber-700",
  Critical: "bg-red-100 text-red-700",
};

const LabReports = () => {
  const [selectedReport, setSelectedReport] = useState<any>(null);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Lab Reports
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{labReports.length} recent reports</p>
          </div>
          <FlaskConical size={18} className="text-slate-400" />
        </div>

        <div className="divide-y divide-slate-50">
          {labReports.map((report) => (
            <div key={report.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/60 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{report.patient}</p>
                <p className="text-xs text-slate-500 truncate">{report.test} · {report.date}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor[report.status]}`}>
                {report.status}
              </span>
              <button
                onClick={() => setSelectedReport(report)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-100 text-slate-600 font-semibold rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors flex-shrink-0"
              >
                <Eye size={12} />
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-lg" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  {selectedReport.test}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">Patient: {selectedReport.patient} · {selectedReport.date}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="flex items-center gap-2 mb-5">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[selectedReport.status]}`}>
                  {selectedReport.status}
                </span>
                <span className="text-xs text-slate-400">Overall Status</span>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="text-xs text-slate-400 uppercase tracking-wider pb-3">Parameter</th>
                    <th className="text-xs text-slate-400 uppercase tracking-wider pb-3">Value</th>
                    <th className="text-xs text-slate-400 uppercase tracking-wider pb-3">Normal Range</th>
                    <th className="text-xs text-slate-400 uppercase tracking-wider pb-3 text-right">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {selectedReport.details.map((item: any, i: number) => (
                    <tr key={i} className={item.trend !== "normal" ? "bg-red-50/50" : ""}>
                      <td className="py-2.5 font-medium text-slate-700 text-xs">{item.name}</td>
                      <td className={`py-2.5 font-bold text-xs ${item.trend === "high" ? "text-red-600" : item.trend === "low" ? "text-amber-600" : "text-slate-800"}`}>
                        {item.value}
                      </td>
                      <td className="py-2.5 text-slate-400 text-xs">{item.range}</td>
                      <td className="py-2.5 text-right">{trendIcon(item.trend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-5 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
                <span className="font-semibold">Doctor's Note: </span>
                {selectedReport.status === "Critical"
                  ? "Immediate intervention required. Please schedule a follow-up consultation."
                  : selectedReport.status === "Abnormal"
                    ? "Some values are outside normal range. Recommend dietary changes and follow-up in 4 weeks."
                    : "All values within normal limits. Continue current regimen."}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 text-sm bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LabReports;