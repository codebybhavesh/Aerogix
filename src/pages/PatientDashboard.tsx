import * as React from "react";
import { useState, useEffect } from "react";
import PatientSidebar from "@/components/dashboard/patient/PatientSidebar";
import PatientTopBar from "@/components/dashboard/patient/PatientTopBar";
import DoctorAvailability from "@/components/dashboard/patient/DoctorAvailability";
import BookAppointment from "@/components/dashboard/patient/BookAppointment";
import MyAppointments from "@/components/dashboard/patient/MyAppointments";
import ConsultationModal from "@/components/dashboard/patient/ConsultationModal";
import PrescriptionSection from "@/components/dashboard/patient/PrescriptionSection";
import UploadLabReport from "@/components/dashboard/patient/UploadLabReport";
import CallNotificationBanner from "@/components/dashboard/patient/CallNotificationBanner";
import { Activity, CalendarCheck, FlaskConical, Stethoscope } from "lucide-react";
import { Appointment } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [patientName, setPatientName] = useState<string>("Patient");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [labReports, setLabReports] = useState<any[]>([]);
  const [consultation, setConsultation] = useState<{ appointment: Appointment; type: string } | null>(null);
  const [bookingDoctor, setBookingDoctor] = useState<any>(null);

  // Active incoming call notification state
  const [incomingCall, setIncomingCall] = useState<{
    appointmentId: string;
    doctorName: string;
  } | null>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.name) setPatientName(data.name);
          }
        } catch (error) {
          console.error("Error fetching patient data:", error);
        }
      }
    };
    fetchPatientData();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apts = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as unknown as Appointment[];

      apts.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });

      setAppointments(apts);

      // ── Detect incoming call ──
      // Find any appointment where the doctor just set callStatus = "started"
      const activeCall = apts.find(
        (apt) => (apt as any).callStatus === "started"
      );

      if (activeCall) {
        const doctorName = (activeCall as any).callDoctorName || "your doctor";
        setIncomingCall({ appointmentId: activeCall.id, doctorName });
      } else {
        // Clear if call ended/joined
        setIncomingCall(null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleBookDoctor = (doctor: any) => {
    setBookingDoctor(doctor);
    setActiveSection("book");
  };

  const handleAppointmentBooked = (apt: Appointment) => {
    setActiveSection("appointments");
  };

  const handleCancelAppointment = (id: string) => {
    // Handle cancellation via Firestore if needed
  };

  const handleConsultation = (apt: Appointment, type: string) => {
    setConsultation({ appointment: apt, type });
  };

  const handleUploadReport = (report: any) => {
    setLabReports((prev) => [report, ...prev]);
  };

  const stats = [
    { label: "Total Appointments", value: appointments.length, icon: CalendarCheck, color: "bg-teal-500" },
    { label: "Lab Reports", value: labReports.length, icon: FlaskConical, color: "bg-blue-500" },
    { label: "Prescriptions", value: 3, icon: Stethoscope, color: "bg-violet-500" },
    { label: "Health Score", value: "87%", icon: Activity, color: "bg-emerald-500" },
  ];

  const initials = patientName
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "PT";

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <PatientSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PatientTopBar patientName={patientName} />

        <main className="flex-1 overflow-y-auto p-8">
          {activeSection === "dashboard" && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                    <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                      <s.icon size={18} className="text-white" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <DoctorAvailability onBookClick={handleBookDoctor} />
            </div>
          )}

          {activeSection === "book" && (
            <BookAppointment
              preSelectedDoctor={bookingDoctor}
              onAppointmentBooked={handleAppointmentBooked}
              patientName={patientName}
            />
          )}

          {activeSection === "appointments" && (
            <MyAppointments
              appointments={appointments}
              onConsultation={handleConsultation}
              onCancel={handleCancelAppointment as any}
            />
          )}

          {activeSection === "labs" && (
            <UploadLabReport
              labReports={labReports}
              onUpload={handleUploadReport}
            />
          )}

          {activeSection === "prescriptions" && <PrescriptionSection />}

          {activeSection === "profile" && (
            <div className="max-w-xl">
              <h2 className="text-xl font-bold text-slate-800 mb-6">My Profile</h2>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold">
                    {initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{patientName}</h3>
                    <p className="text-sm text-slate-400">Patient ID: PT-{user?.uid?.substring(0, 6).toUpperCase() || "GUEST"}</p>
                  </div>
                </div>
                {[
                  ["Email", user?.email || "Not provided"],
                  ["Status", "Active"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-slate-400 font-medium">{label}</span>
                    <span className="text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Incoming call notification banner ── */}
      {incomingCall && (
        <CallNotificationBanner
          appointmentId={incomingCall.appointmentId}
          doctorName={incomingCall.doctorName}
          onDismiss={() => setIncomingCall(null)}
        />
      )}

      {consultation && (
        <ConsultationModal
          appointment={consultation.appointment}
          type={consultation.type}
          onClose={() => setConsultation(null)}
        />
      )}
    </div>
  );
}