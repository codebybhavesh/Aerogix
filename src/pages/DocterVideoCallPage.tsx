import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc, updateDoc, onSnapshot, collection,
  query, where, addDoc, serverTimestamp
} from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";
import { getReportOpenUrl } from "@/lib/reportUrl";
import {
  PhoneOff, FileText, Pill, Plus, Trash2,
  Download, ChevronRight, FlaskConical, CheckCircle,
  AlertCircle, Loader2, User, Clock, Stethoscope
} from "lucide-react";

declare global {
  interface Window { JitsiMeetExternalAPI: any; }
}

interface MedicineEntry {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface LabReport {
  id: string;
  fileName?: string;
  fileUrl?: string;
  reportName?: string;
  reportUrl?: string;
  uploadedAt?: string;
  uploadDate?: any;
  type?: string;
}

interface AppointmentData {
  patientId: string;
  patientName?: string;
  doctorName?: string;
  callDoctorName?: string;
  date?: string;
  time?: string;
  problem?: string;
  age?: number;
}

type TabType = "reports" | "prescription";

const buildPrescriptionHTML = (
  patientName: string,
  doctorName: string,
  date: string,
  problem: string,
  medicines: MedicineEntry[],
  notes: string
) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Prescription</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Georgia', serif; color: #1e293b; background: #fff; padding: 48px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 2px solid #0ea5e9; padding-bottom:20px; margin-bottom:28px; }
    .clinic-name { font-size:22px; font-weight:700; color:#0284c7; }
    .clinic-sub { font-size:12px; color:#64748b; margin-top:3px; }
    .rx-badge { font-size:48px; font-weight:900; color:#e0f2fe; line-height:1; }
    .meta { display:grid; grid-template-columns:1fr 1fr; gap:12px; background:#f8fafc; border-radius:10px; padding:16px; margin-bottom:28px; font-size:13px; }
    .meta-item label { font-size:10px; text-transform:uppercase; letter-spacing:0.8px; color:#94a3b8; display:block; margin-bottom:2px; }
    .meta-item span { font-weight:600; color:#1e293b; }
    .section-title { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; margin-bottom:12px; }
    .medicine-row { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:8px; padding:12px; border:1px solid #e2e8f0; border-radius:8px; margin-bottom:8px; }
    .medicine-name { font-weight:700; font-size:14px; color:#0f172a; }
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
    <div><div class="clinic-name">Arogix Medical</div><div class="clinic-sub">Digital Health Consultation Platform</div></div>
    <div class="rx-badge">℞</div>
  </div>
  <div class="meta">
    <div class="meta-item"><label>Patient</label><span>${patientName}</span></div>
    <div class="meta-item"><label>Date</label><span>${date}</span></div>
    <div class="meta-item"><label>Physician</label><span>Dr. ${doctorName}</span></div>
    <div class="meta-item"><label>Diagnosis</label><span>${problem || "General Consultation"}</span></div>
  </div>
  <div class="section-title">Prescribed Medicines</div>
  ${medicines.map(m => `
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
  ${notes ? `<div class="notes-section"><div class="section-title">Doctor's Notes</div><div class="notes-text">${notes}</div></div>` : ""}
  <div class="footer">
    <div class="watermark">Generated via Arogix · ${new Date().toLocaleString()}</div>
    <div class="signature-line">Dr. ${doctorName}<br/>Digital Signature</div>
  </div>
</body>
</html>`;

// ─────────────────────────────────────────────────────────────────
const DoctorVideoCallPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const jitsiContainer = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  const [tab, setTab] = useState<TabType>("reports");
  const [apptData, setApptData] = useState<AppointmentData | null>(null);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [medicines, setMedicines] = useState<MedicineEntry[]>([
    { id: "1", name: "", dosage: "", frequency: "1-0-1", duration: "5 days", instructions: "" }
  ]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setCallDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  };

  // Appointment listener
  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, "appointments", roomId), snap => {
      if (snap.exists()) setApptData(snap.data() as AppointmentData);
    });
    return () => unsub();
  }, [roomId]);

  // Lab reports listener
  useEffect(() => {
    if (!apptData?.patientId) return;
    const q = query(collection(db, "labReports"), where("patientId", "==", apptData.patientId));
    const unsub = onSnapshot(q, snap => {
      setLabReports(snap.docs.map(d => ({ id: d.id, ...d.data() } as LabReport)));
    });
    return () => unsub();
  }, [apptData?.patientId]);

  // Jitsi init — only fires once on mount
  useEffect(() => {
    const loadJitsi = () => new Promise<void>(resolve => {
      if (window.JitsiMeetExternalAPI) { resolve(); return; }
      const s = document.createElement("script");
      s.src = "https://meet.jit.si/external_api.js";
      s.onload = () => resolve();
      document.body.appendChild(s);
    });

    const init = async () => {
      await loadJitsi();
      if (!jitsiContainer.current || !roomId) return;
      if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null; }

      apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName: `arogix-${roomId}`,
        parentNode: jitsiContainer.current,
        width: "100%",
        height: "100%",
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
          // ── Remove the thumbnail filmstrip completely ──
          filmstrip: { disabled: true },
          disableFilmstripAutohiding: true,
          disableSelfView: true,
          disableSelfViewSettings: true,
          toolbarButtons: ["microphone", "camera", "desktop", "chat", "tileview", "fullscreen", "hangup"],
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          DEFAULT_BACKGROUND: "#0b1120",
          TOOLBAR_ALWAYS_VISIBLE: false,
          // ── Zero out filmstrip height via interface config ──
          FILM_STRIP_MAX_HEIGHT: 0,
          VERTICAL_FILMSTRIP: false,
          HIDE_INVITE_MORE_HEADER: true,
        },
        userInfo: {
          displayName: `Dr. ${apptData?.callDoctorName || user?.displayName || "Doctor"}`,
        },
      });

      apiRef.current.addEventListener("videoConferenceLeft", handleEndCall);
      apiRef.current.addEventListener("readyToClose", handleEndCall);
    };

    init();
    return () => { if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // Medicine helpers
  const addMedicine = () => setMedicines(p => [...p, { id: Date.now().toString(), name: "", dosage: "", frequency: "1-0-1", duration: "5 days", instructions: "" }]);
  const updateMedicine = (id: string, field: keyof MedicineEntry, value: string) =>
    setMedicines(p => p.map(m => m.id === id ? { ...m, [field]: value } : m));
  const removeMedicine = (id: string) => setMedicines(p => p.filter(m => m.id !== id));

  const savePrescription = async () => {
    if (!roomId || !apptData) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "prescriptions"), {
        appointmentId: roomId,
        patientId: apptData.patientId,
        patientName: apptData.patientName || "Patient",
        doctorName: apptData.callDoctorName || apptData.doctorName || "Doctor",
        date: new Date().toLocaleDateString("en-IN"),
        problem: apptData.problem || "",
        medicines,
        notes,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "appointments", roomId), { hasPrescription: true });
      setSaved(true);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const downloadPrescription = () => {
    const html = buildPrescriptionHTML(
      apptData?.patientName || "Patient",
      apptData?.callDoctorName || apptData?.doctorName || "Doctor",
      new Date().toLocaleDateString("en-IN"),
      apptData?.problem || "",
      medicines, notes
    );
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const win = window.open(url, "_blank");
    if (win) win.onload = () => win.print();
  };

  const handleEndCall = async () => {
    if (roomId) {
      try { await updateDoc(doc(db, "appointments", roomId), { callStatus: "ended", status: "completed" }); }
      catch (e) { console.error(e); }
    }
    if (apiRef.current) { apiRef.current.dispose(); apiRef.current = null; }
    navigate(-1);
  };

  const patientName = apptData?.patientName || "Patient";

  // ── Shared input/select style ──
  const fieldStyle: React.CSSProperties = {
    width: "100%", padding: "8px 10px", borderRadius: 8,
    background: "#0f1a2e", border: "1px solid #1e3a5f",
    color: "#e2e8f0", fontSize: 12, outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 10, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" };

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#0b1120", fontFamily: "'DM Sans','Segoe UI',sans-serif", overflow: "hidden" }}>

      {/* ── Top Bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", background: "#0f1a2e", borderBottom: "1px solid #1e3a5f", flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", display: "inline-block" }} />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Arogix</span>
            <span style={{ color: "#64748b", fontSize: 12 }}>Live Consultation</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: "#1e3a5f", color: "#7dd3fc", fontSize: 12, fontFamily: "monospace", fontWeight: 700 }}>
            <Clock size={11} />{formatDuration(callDuration)}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 12 }}>
            <User size={13} />{patientName}
          </div>
          <button onClick={handleEndCall} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 16px", borderRadius: 10, background: "#ef4444", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
            <PhoneOff size={14} /> End Call
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

        {/* Video — fills remaining space */}
        <div style={{ flex: 1, minWidth: 0, position: "relative", overflow: "hidden", background: "#000" }}>
          {/*
            Absolutely positioned so the Jitsi iframe is fully contained
            and cannot bleed over the side panel
          */}
          <div
            ref={jitsiContainer}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />
        </div>

        {/* Side panel — fixed 400 px, never shrinks */}
        <div style={{ width: 400, flexShrink: 0, display: "flex", flexDirection: "column", background: "#0f1a2e", borderLeft: "1px solid #1e3a5f", overflow: "hidden" }}>

          {/* Patient strip */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#0b1120", borderBottom: "1px solid #1e3a5f", flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#0ea5e9,#6366f1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {patientName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "#fff", fontWeight: 600, fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{patientName}</p>
              <p style={{ color: "#64748b", fontSize: 11, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{apptData?.problem || "General Consultation"}</p>
            </div>
            <span style={{ padding: "2px 8px", borderRadius: 20, background: "#052e16", color: "#4ade80", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>Active</span>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #1e3a5f", flexShrink: 0 }}>
            {([
              { key: "reports" as TabType, label: "Lab Reports", Icon: FlaskConical },
              { key: "prescription" as TabType, label: "Prescription", Icon: Pill },
            ]).map(({ key, label, Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 0", fontSize: 12, fontWeight: 700, color: tab === key ? "#38bdf8" : "#64748b", background: "transparent", border: "none", borderBottom: `2px solid ${tab === key ? "#38bdf8" : "transparent"}`, cursor: "pointer", transition: "all 0.15s" }}>
                <Icon size={13} />{label}
              </button>
            ))}
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>

            {/* ── Lab Reports ── */}
            {tab === "reports" && (
              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {labReports.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", textAlign: "center" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                      <FlaskConical size={22} color="#38bdf8" />
                    </div>
                    <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, margin: 0 }}>No lab reports uploaded</p>
                    <p style={{ color: "#475569", fontSize: 11, marginTop: 4 }}>Patient hasn't shared any reports yet</p>
                  </div>
                ) : labReports.map(r => {
                  const reportUrl = getReportOpenUrl(r);
                  return (
                  <a key={r.id} href={reportUrl || "#"} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => { if (!reportUrl) e.preventDefault(); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: 11, borderRadius: 11, background: "#0b1120", border: "1px solid #1e3a5f", textDecoration: "none" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FileText size={17} color="#38bdf8" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 12, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reportName || r.fileName || "Lab Report"}</p>
                      <p style={{ color: "#64748b", fontSize: 10, marginTop: 2 }}>{r.type || "Lab Report"} · {r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString("en-IN") : (r.uploadDate?.toDate ? r.uploadDate.toDate().toLocaleDateString("en-IN") : "—")}</p>
                    </div>
                    <ChevronRight size={14} color="#475569" style={{ flexShrink: 0 }} />
                  </a>
                  );
                })}
              </div>
            )}

            {/* ── Prescription ── */}
            {tab === "prescription" && (
              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>

                {medicines.map((med, idx) => (
                  <div key={med.id} style={{ borderRadius: 11, overflow: "hidden", background: "#0b1120", border: "1px solid #1e3a5f" }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 11px", background: "#0f1a2e", borderBottom: "1px solid #1e3a5f" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#1e3a5f", color: "#38bdf8", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{idx + 1}</span>
                        <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700 }}>{med.name || "Medicine"}</span>
                      </div>
                      {medicines.length > 1 && (
                        <button onClick={() => removeMedicine(med.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                          <Trash2 size={12} color="#ef4444" />
                        </button>
                      )}
                    </div>
                    {/* Fields */}
                    <div style={{ padding: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={labelStyle}>Medicine Name</label>
                        <input type="text" placeholder="e.g. Paracetamol 500mg" value={med.name}
                          onChange={e => updateMedicine(med.id, "name", e.target.value)} style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Dosage</label>
                        <input type="text" placeholder="500mg" value={med.dosage}
                          onChange={e => updateMedicine(med.id, "dosage", e.target.value)} style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Frequency</label>
                        <select value={med.frequency} onChange={e => updateMedicine(med.id, "frequency", e.target.value)} style={fieldStyle}>
                          {["1-0-0","0-1-0","0-0-1","1-0-1","1-1-1","1-1-1-1","SOS"].map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Duration</label>
                        <select value={med.duration} onChange={e => updateMedicine(med.id, "duration", e.target.value)} style={fieldStyle}>
                          {["3 days","5 days","7 days","10 days","14 days","1 month","3 months","Ongoing"].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>Timing</label>
                        <select value={med.instructions} onChange={e => updateMedicine(med.id, "instructions", e.target.value)} style={fieldStyle}>
                          <option value="">None</option>
                          {["Before meals","After meals","With meals","Before sleep","Empty stomach"].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add */}
                <button onClick={addMedicine}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "9px 0", borderRadius: 11, border: "1px dashed #1e3a5f", color: "#38bdf8", background: "transparent", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  <Plus size={14} /> Add Medicine
                </button>

                {/* Notes */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 5, ...labelStyle, marginBottom: 6 }}>
                    <Stethoscope size={10} /> Doctor's Notes
                  </label>
                  <textarea rows={3} placeholder="Follow up in 7 days. Avoid cold water. Rest advised..."
                    value={notes} onChange={e => setNotes(e.target.value)}
                    style={{ ...fieldStyle, resize: "none", borderRadius: 10, fontFamily: "inherit", lineHeight: 1.5 }} />
                </div>

                {/* Actions */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <button onClick={savePrescription} disabled={saving || saved}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 11, background: saved ? "#052e16" : "#0ea5e9", color: saved ? "#4ade80" : "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: saving || saved ? "default" : "pointer", opacity: saving ? 0.7 : 1 }}>
                    {saving ? <Loader2 size={13} /> : <CheckCircle size={13} />}
                    {saving ? "Saving..." : saved ? "Saved!" : "Save"}
                  </button>
                  <button onClick={downloadPrescription}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 11, background: "#1e3a5f", color: "#38bdf8", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer" }}>
                    <Download size={13} /> Download
                  </button>
                </div>

                {saved && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 11, borderRadius: 11, background: "#052e16", border: "1px solid #166534", color: "#86efac", fontSize: 12 }}>
                    <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                    Prescription saved. Patient can view and download it from their dashboard.
                  </div>
                )}

                <div style={{ height: 12 }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorVideoCallPage;
