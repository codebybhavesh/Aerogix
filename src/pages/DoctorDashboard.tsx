import * as React from "react";
import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/doctor/Sidebar";
import TopBar from "@/components/dashboard/doctor/TopBar";
import StatsCards from "@/components/dashboard/doctor/StatsCards";
import AppointmentRequests from "@/components/dashboard/doctor/AppointmentRequests";
import ScheduledAppointments from "@/components/dashboard/doctor/ScheduledAppointments";
import LabReports from "@/components/dashboard/doctor/LabReports";
import ConsultationModal from "@/components/dashboard/doctor/ConsultationModal";
import { Appointment, Doctor } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [requests, setRequests] = useState<Appointment[]>([]);
  const [scheduled, setScheduled] = useState<Appointment[]>([]);
  const [consultationPatient, setConsultationPatient] = useState<Appointment | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);

  useEffect(() => {
    if (!user) return;

    // Listen to doctor profile
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

    // Listen to appointments where doctorId matches the current user
    const q = query(collection(db, "appointments"), where("doctorId", "==", user.uid));

    const unsubscribeAppts = onSnapshot(q, (snapshot) => {
      const appointmentsData: Appointment[] = [];
      snapshot.forEach((doc) => {
        appointmentsData.push({ id: doc.id, ...doc.data() } as Appointment);
      });

      // Filter and separate appointments
      setRequests(appointmentsData.filter(appt => appt.status === "Pending"));
      // Only include Accepted/Confirmed or similar statuses for scheduled
      setScheduled(appointmentsData.filter(appt => appt.status !== "Pending" && appt.status !== "Rejected"));
    });

    return () => {
      unsubDoc();
      unsubscribeAppts();
    };
  }, [user]);

  const handleAcceptRequest = async (id: string) => {
    try {
      const apptRef = doc(db, "appointments", id);
      await updateDoc(apptRef, {
        status: "Accepted"
      });
    } catch (error) {
      console.error("Error accepting appointment:", error);
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      const apptRef = doc(db, "appointments", id);
      await updateDoc(apptRef, {
        status: "Rejected"
      });
    } catch (error) {
      console.error("Error rejecting appointment:", error);
    }
  };

  // Compute Stats
  const todayDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const todayAppointmentsCount = scheduled.filter(appt => appt.date === todayDate).length;
  // Fallback for demo: if our dates in Firestore are formatted differently (e.g., YYYY-MM-DD from the input picker)
  // we count those that match the current day or we just count all scheduled for simplicity if format doesn't match perfectly yet.

  const computedStats = {
    totalPatients: scheduled.length + requests.length, // Simplified total metric
    todayAppointments: scheduled.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length || scheduled.length, // Fallback if dates mismatch
    pendingRequests: requests.length,
    completedConsultations: scheduled.filter(a => a.status === "completed").length
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar doctor={doctorProfile} />

        <main className="flex-1 overflow-y-auto px-8 py-7 space-y-7">
          {/* Page Title */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Dashboard Overview
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Today's summary</p>
          </div>

          {/* Stats Row */}
          <StatsCards statsData={computedStats} />

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AppointmentRequests
              requests={requests}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
            />
            <ScheduledAppointments
              appointments={scheduled}
              onStartConsultation={setConsultationPatient}
            />
          </div>

          {/* Lab Reports */}
          <LabReports />
        </main>
      </div>

      {/* Consultation Modal */}
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