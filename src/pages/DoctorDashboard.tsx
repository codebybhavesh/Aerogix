import * as React from "react";
import { useState, useEffect } from "react";
import { Clock, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/dashboard/doctor/Sidebar";
import TopBar from "@/components/dashboard/doctor/TopBar";
import StatsCards from "@/components/dashboard/doctor/StatsCards";
import AppointmentRequests from "@/components/dashboard/doctor/AppointmentRequests";
import LabReports from "@/components/dashboard/doctor/LabReports";
import ConsultationModal from "@/components/dashboard/doctor/ConsultationModal";
import { Appointment, Doctor } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";

const statusConfig: Record<string, { label: string; color: string }> = {
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700" },
  Accepted: { label: "Accepted", color: "bg-blue-100 text-blue-700" },
  "in-progress": { label: "In Progress", color: "bg-emerald-100 text-emerald-700" },
  upcoming: { label: "Upcoming", color: "bg-violet-100 text-violet-700" },
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [requests, setRequests] = useState<Appointment[]>([]);
  const [scheduled, setScheduled] = useState<Appointment[]>([]);
  const [consultationPatient, setConsultationPatient] = useState<Appointment | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [startingCallId, setStartingCallId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubDoc = onSnapshot(doc(db, "doctors", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDoctorProfile({
          id: docSnap.id,
          name: data.Name || data.name || "Unknown Doctor",
          specialization: data.Specialization?.trim() || data.specialization?.trim() || "Specialist",
          experience: data.Experience ? `${data.Experience} Years` : data.experience || "N/A",
          consultationFee: data['Consultation Fee'] || data['Consultaion Fee'] || data['Consulation Fee'] || data.consultationFee || 0,
          available: true,
          availabilityText: data.Availability?.trim() || data.Avaiblity?.trim() || data.availability?.trim() || "Not Specified",
          rating: data.Rating || data.Ration || data.rating || 0,
          slots: data.slots || ["09:00 AM", "11:00 AM", "01:00 PM", "04:00 PM"],
          hospital: data.hospital || "Arogix Clinic"
        } as Doctor);
      }
    });

    const q = query(collection(db, "appointments"), where("doctorId", "==", user.uid));
    const unsubscribeAppts = onSnapshot(q, (snapshot) => {
      const appointmentsData: Appointment[] = [];
      snapshot.forEach((doc) => {
        appointmentsData.push({ id: doc.id, ...doc.data() } as Appointment);
      });
      setRequests(appointmentsData.filter(appt => appt.status === "Pending"));
      setScheduled(appointmentsData.filter(appt => appt.status !== "Pending" && appt.status !== "Rejected"));
    });

    return () => {
      unsubDoc();
      unsubscribeAppts();
    };
  }, [user]);

  const handleAcceptRequest = async (id: string) => {
    try {
      await updateDoc(doc(db, "appointments", id), { status: "Accepted" });
    } catch (error) {
      console.error("Error accepting appointment:", error);
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      await updateDoc(doc(db, "appointments", id), { status: "Rejected" });
    } catch (error) {
      console.error("Error rejecting appointment:", error);
    }
  };

  /**
   * handleStartCall:
   * 1. Writes callStatus + doctor info to the appointment doc in Firestore.
   * 2. Patient's onSnapshot picks this up and shows the join notification.
   * 3. Doctor navigates to /video-call/:appointmentId (roomId = appointmentId).
   */
  const handleStartCall = async (appt: Appointment) => {
    setStartingCallId(appt.id);
    try {
      await updateDoc(doc(db, "appointments", appt.id), {
        callStatus: "started",
        callStartedAt: new Date().toISOString(),
        callDoctorName: doctorProfile?.name || "Doctor",
        roomId: appt.id, // roomId = appointmentId, simple and unique
      });
      navigate(`/doctor/video-call/${appt.id}`);
    } catch (error) {
      console.error("Error starting call:", error);
    } finally {
      setStartingCallId(null);
    }
  };

  const computedStats = {
    totalPatients: scheduled.length + requests.length,
    todayAppointments: scheduled.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length || scheduled.length,
    pendingRequests: requests.length,
    completedConsultations: scheduled.filter(a => a.status === "completed").length
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar doctor={doctorProfile} />

        <main className="flex-1 overflow-y-auto px-8 py-7 space-y-7">
          <div>
            <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Dashboard Overview
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Today's summary</p>
          </div>

          <StatsCards statsData={computedStats} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AppointmentRequests
              requests={requests}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
            />

            {/* Scheduled Appointments */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                    Scheduled Appointments
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">{scheduled.length} confirmed</p>
                </div>
                <button className="text-xs text-blue-600 font-semibold hover:underline">View All</button>
              </div>

              {scheduled.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Clock size={40} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No appointments scheduled yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {scheduled.map((appt) => {
                    const status = statusConfig[appt.status] || statusConfig["confirmed"];
                    const displayName = appt.patientName || appt.name || appt.patientId || "Patient";
                    const isStarting = startingCallId === appt.id;

                    return (
                      <div
                        key={appt.id}
                        className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/60 transition-colors duration-150"
                      >
                        <div className="w-14 flex-shrink-0 text-center">
                          <p className="text-sm font-bold text-slate-700">{appt.time}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{appt.date}</p>
                        </div>

                        <div className="w-px h-10 bg-slate-200 flex-shrink-0" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-800 text-sm truncate">{displayName}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{appt.problem}</p>
                        </div>

                        <button
                          onClick={() => handleStartCall(appt)}
                          disabled={isStarting}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Video size={13} />
                          {isStarting ? "Starting..." : "Start"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <LabReports />
        </main>
      </div>

      {consultationPatient && (
        <ConsultationModal
          patient={consultationPatient}
          onClose={() => setConsultationPatient(null)}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;