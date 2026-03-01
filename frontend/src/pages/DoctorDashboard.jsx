import React, { useState } from "react";
import Sidebar from "../components/DoctorDashboardComponents/Sidebar";
import TopBar from "../components/DoctorDashboardComponents/TopBar";
import StatsCards from "../components/DoctorDashboardComponents/StatsCards";
import AppointmentRequests from "../components/DoctorDashboardComponents/AppointmentRequests";
import ScheduledAppointments from "../components/DoctorDashboardComponents/ScheduledAppointments";
import LabReports from "../components/DoctorDashboardComponents/LabReports";
import ConsultationModal from "../components/DoctorDashboardComponents/ConsultationModal";

const initialRequests = [
  {
    id: 1,
    name: "Rahul Mehta",
    age: 34,
    village: "Varanasi, UP",
    problem: "Chest pain and shortness of breath for 2 days",
    requestedDate: "Mar 2, 2026",
  },
  {
    id: 2,
    name: "Kavita Singh",
    age: 52,
    village: "Lucknow, UP",
    problem: "High blood pressure, dizziness, and fatigue",
    requestedDate: "Mar 2, 2026",
  },
  {
    id: 3,
    name: "Deepak Nair",
    age: 28,
    village: "Kanpur, UP",
    problem: "Irregular heartbeat noticed during exercise",
    requestedDate: "Mar 3, 2026",
  },
];

const initialScheduled = [
  {
    id: 101,
    name: "Meera Joshi",
    time: "10:00 AM",
    date: "Mar 1",
    problem: "Follow-up: Hypertension Management",
    status: "in-progress",
  },
  {
    id: 102,
    name: "Arjun Kapoor",
    time: "11:30 AM",
    date: "Mar 1",
    problem: "Post-surgery cardiac evaluation",
    status: "upcoming",
  },
  {
    id: 103,
    name: "Sunita Das",
    time: "02:00 PM",
    date: "Mar 1",
    problem: "Palpitations and anxiety screening",
    status: "confirmed",
  },
];

const DoctorDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [requests, setRequests] = useState(initialRequests);
  const [scheduled, setScheduled] = useState(initialScheduled);
  const [consultationPatient, setConsultationPatient] = useState(null);

  const handleAcceptRequest = (request, date, time) => {
    const newAppt = {
      id: Date.now(),
      name: request.name,
      time: time,
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      problem: request.problem,
      status: "confirmed",
    };
    setScheduled((prev) => [...prev, newAppt]);
    setRequests((prev) => prev.filter((r) => r.id !== request.id));
  };

  const handleRejectRequest = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-y-auto px-8 py-7 space-y-7">
          {/* Page Title */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Dashboard Overview
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Sunday, March 1, 2026 · Today's summary</p>
          </div>

          {/* Stats Row */}
          <StatsCards />

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