import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, FileCheck, Trash2, FlaskConical, CheckCircle2, AlertCircle, Loader2, Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { uploadLabReportToCloudinary } from "@/lib/cloudinary";
import { getReportOpenUrl } from "@/lib/reportUrl";
import type { LabReport } from "@/lib/types";

type DoctorOption = { id: string; name: string };

interface UploadLabReportProps {
  labReports: LabReport[];
  patientName: string;
  defaultDoctorId?: string;
}

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = new Set(["application/pdf", "image/jpeg", "image/png"]);

function formatUploadDate(uploadDate: any) {
  try {
    if (uploadDate?.toDate) {
      return uploadDate.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    }
  } catch { /* ignore */ }
  return "";
}

export default function UploadLabReport({ labReports, patientName, defaultDoctorId }: UploadLabReportProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [doctorId, setDoctorId] = useState<string>(defaultDoctorId || "");
  const [doctorOptions, setDoctorOptions] = useState<DoctorOption[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    setDoctorId(defaultDoctorId || "");
  }, [defaultDoctorId]);

  useEffect(() => {
    // Fallback: if we can't infer doctorId from latest appointment, let user pick a doctor.
    const loadDoctors = async () => {
      try {
        const snap = await getDocs(collection(db, "doctors"));
        const docs = snap.docs.map((d) => {
          const data = d.data() as any;
          return { id: d.id, name: data.Name || data.name || "Doctor" } as DoctorOption;
        });
        setDoctorOptions(docs);
        if (!doctorId && docs.length > 0) setDoctorId(docs[0].id);
      } catch (e) {
        // non-fatal
        console.warn("Failed to load doctors list for lab report upload", e);
      }
    };
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canUpload = useMemo(() => !!selectedFile && !!user && !!doctorId && !uploading, [selectedFile, user, doctorId, uploading]);

  const handleFile = (file: File | undefined) => {
    setError(null);
    setSuccess(false);
    if (!file) return;

    if (file.size > MAX_BYTES) {
      setError("File too large. Please upload a file up to 10MB.");
      return;
    }

    // Some browsers may not provide MIME reliably; accept by extension via <input accept>,
    // but still enforce common MIME types when present.
    if (file.type && !ALLOWED_MIME.has(file.type)) {
      setError("Invalid file type. Please upload PDF, JPG, or PNG.");
      return;
    }

    setSelectedFile(file);
  };

  const inferDoctorIdFromAppointments = async (): Promise<string | null> => {
    if (!user) return null;
    try {
      const snap = await getDocs(query(collection(db, "appointments"), where("patientId", "==", user.uid)));
      const appts = snap.docs.map((d) => d.data() as any);
      appts.sort((a, b) => {
        const aMs = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bMs = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bMs - aMs;
      });
      const latest = appts[0];
      return latest?.doctorId || null;
    } catch (e) {
      return null;
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);
    if (!selectedFile) return;
    if (!user) {
      setError("You must be logged in to upload a lab report.");
      return;
    }

    let finalDoctorId = doctorId;
    if (!finalDoctorId) {
      const inferred = await inferDoctorIdFromAppointments();
      if (inferred) {
        finalDoctorId = inferred;
        setDoctorId(inferred);
      }
    }

    if (!finalDoctorId) {
      setError("Please select a doctor (or book an appointment) before uploading a report.");
      return;
    }

    setUploading(true);
    try {
      const cloudinaryRes = await uploadLabReportToCloudinary(selectedFile);
      const reportUrl = cloudinaryRes.secure_url;
      const reportResourceType = cloudinaryRes.resource_type || "auto";

      await addDoc(collection(db, "labReports"), {
        patientId: user.uid,
        patientName: patientName || "Patient",
        doctorId: finalDoctorId,
        reportName: selectedFile.name,
        reportUrl,
        reportResourceType,
        uploadDate: serverTimestamp(),
      });

      setSelectedFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      console.error("Lab report upload failed:", e);
      setError(e?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Lab Reports</h2>
        <p className="text-slate-400 text-sm mt-1">Upload and manage your medical reports</p>
      </div>

      {/* Upload Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <h3 className="font-semibold text-slate-700 text-sm mb-4">Upload New Report</h3>

        {success && (
          <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
            <CheckCircle2 size={16} /> Report uploaded successfully!
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Doctor Select (fallback) */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 mb-2">Doctor</label>
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50 disabled:opacity-60"
            disabled={uploading}
          >
            {doctorOptions.length === 0 && <option value={doctorId || ""}>Loading doctors...</option>}
            {doctorOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-slate-400">This doctor will be able to view your uploaded report.</p>
        </div>

        {/* Drop Zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e: React.DragEvent) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e: React.DragEvent) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragOver
              ? "border-teal-400 bg-teal-50"
              : "border-slate-200 hover:border-teal-300 hover:bg-slate-50"
            }`}
        >
          <Upload size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Click to upload or drag & drop</p>
          <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG — up to 10MB</p>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0])}
          />
        </div>

        {selectedFile && (
          <div className="mt-4 flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
            <FileCheck size={18} className="text-teal-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-teal-700">{selectedFile.name}</p>
              <p className="text-xs text-teal-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-400 transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canUpload}
          className={`mt-4 w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${selectedFile
              ? "bg-teal-500 hover:bg-teal-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }`}
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? "Uploading..." : "Upload Lab Report"}
        </button>
      </div>

      {/* Reports List */}
      <div>
        <h3 className="font-semibold text-slate-700 text-sm mb-3">Uploaded Reports</h3>
        {labReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
            <FlaskConical size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No reports uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {labReports.map((report: LabReport) => {
              const viewUrl = getReportOpenUrl(report);
              return (
                <div
                  key={report.id}
                  className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3"
                >
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FlaskConical size={16} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{(report as any).reportName || (report as any).fileName || "Lab Report"}</p>
                    <p className="text-xs text-slate-400">
                      {report.uploadDate ? `Uploaded on ${formatUploadDate(report.uploadDate)}` : ""}
                    </p>
                  </div>
                  <a
                    href={viewUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!viewUrl) {
                        e.preventDefault();
                        setError("This report does not have a valid file URL.");
                      }
                    }}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <Eye size={12} />
                    View
                  </a>
                  <button
                    onClick={async () => {
                      try {
                        await deleteDoc(doc(db, "labReports", report.id));
                      } catch (e) {
                        console.error("Failed to delete lab report:", e);
                        setError("Failed to delete report. Please try again.");
                      }
                    }}
                    className="text-xs text-slate-400 hover:text-red-500 px-2 py-1 rounded-lg transition-colors"
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
    </div>
  );
}
