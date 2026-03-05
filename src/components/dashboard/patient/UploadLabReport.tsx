import * as React from "react";
import { useState, useRef } from "react";
import { Upload, FileCheck, Trash2, FlaskConical, CheckCircle2 } from "lucide-react";

interface LabReport {
  id: number;
  name: string;
  size: string;
  uploadedAt: string;
  type: string;
}

interface UploadLabReportProps {
  labReports: LabReport[];
  onUpload: (report: LabReport) => void;
}

export default function UploadLabReport({ labReports, onUpload }: UploadLabReportProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (file) setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    onUpload({
      id: Date.now(),
      name: selectedFile.name,
      size: (selectedFile.size / 1024).toFixed(1) + " KB",
      uploadedAt: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      type: selectedFile.type || "application/pdf",
    });
    setSelectedFile(null);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
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
          disabled={!selectedFile}
          className={`mt-4 w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${selectedFile
              ? "bg-teal-500 hover:bg-teal-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }`}
        >
          <Upload size={16} /> Upload Report
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
            {labReports.map((report: LabReport) => (
              <div key={report.id} className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FlaskConical size={16} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{report.name}</p>
                  <p className="text-xs text-slate-400">{report.size} · Uploaded on {report.uploadedAt}</p>
                </div>
                <button className="text-xs text-teal-600 hover:text-teal-700 font-medium bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors">
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}