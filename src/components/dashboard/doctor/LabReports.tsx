import * as React from "react";
import { useEffect, useState } from "react";
import { FlaskConical, Eye, FileText, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { collection, deleteDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import { getReportOpenUrl } from "@/lib/reportUrl";
import type { LabReport } from "@/lib/types";

const LabReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<LabReport[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "labReports"), where("doctorId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as LabReport[];
      items.sort((a: any, b: any) => {
        const aMs = a.uploadDate?.toMillis ? a.uploadDate.toMillis() : 0;
        const bMs = b.uploadDate?.toMillis ? b.uploadDate.toMillis() : 0;
        return bMs - aMs;
      });
      setReports(items);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Lab Reports
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{reports.length} reports</p>
          </div>
          <FlaskConical size={18} className="text-slate-400" />
        </div>

        {reports.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <FileText size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No lab reports uploaded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {reports.map((report) => {
              const viewUrl = getReportOpenUrl(report);
              return (
                <div
                  key={report.id}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{report.patientName}</p>
                    <p className="text-xs text-slate-500 truncate">{(report as any).reportName || (report as any).fileName || "Lab Report"}</p>
                  </div>
                  <a
                    href={viewUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!viewUrl) e.preventDefault();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-100 text-slate-600 font-semibold rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors flex-shrink-0"
                  >
                    <Eye size={12} />
                    View Report
                  </a>
                  <button
                    onClick={async () => {
                      try {
                        await deleteDoc(doc(db, "labReports", report.id));
                      } catch (e) {
                        console.error("Failed to delete lab report:", e);
                      }
                    }}
                    className="ml-1 text-xs text-slate-400 hover:text-red-500 px-2 py-1 rounded-lg transition-colors"
                    title="Delete report"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default LabReports;
