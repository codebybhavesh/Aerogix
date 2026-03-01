import { useState } from "react";
import PatientSidebar from "../components/PatientDashboardComponents/PatientSidebar";
import PatientTopBar from "../components/PatientDashboardComponents/PatientTopBar";
import DoctorAvailability from "../components/PatientDashboardComponents/DoctorAvailability";
import BookAppointment from "../components/PatientDashboardComponents/BookAppointment";
import MyAppointments from "../components/PatientDashboardComponents/MyAppointments";
import ConsultationModal from "../components/PatientDashboardComponents/ConsultationModal";
import PrescriptionSection from "../components/PatientDashboardComponents/PrescriptionSection";
import UploadLabReport from "../components/PatientDashboardComponents/UploadLabReport";
import { Activity, CalendarCheck, FlaskConical, Stethoscope } from "lucide-react";

const initialAppointments = [
  {
    id: 1,
    doctorName: "Dr. Priya Sharma",
    specialization: "Cardiologist",
    date: "2025-03-05",
    time: "09:00 AM",
    problem: "Chest pain and shortness of breath",
    status: "Confirmed",
  },
  {
    id: 2,
    doctorName: "Dr. Arjun Mehta",
    specialization: "Dermatologist",
    date: "2025-03-10",
    time: "11:00 AM",
    problem: "Skin rash on arms",
    status: "Pending",
  },
];

export default function PatientDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [appointments, setAppointments] = useState(initialAppointments);
  const [labReports, setLabReports] = useState([]);
  const [consultation, setConsultation] = useState(null); // { appointment, type }
  const [bookingDoctor, setBookingDoctor] = useState(null);

  const handleBookDoctor = (doctor) => {
    setBookingDoctor(doctor);
    setActiveSection("book");
  };

  const handleAppointmentBooked = (apt) => {
    setAppointments((prev) => [apt, ...prev]);
  };

  const handleCancelAppointment = (id) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleConsultation = (apt, type) => {
    setConsultation({ appointment: apt, type });
  };

  const handleUploadReport = (report) => {
    setLabReports((prev) => [report, ...prev]);
  };

  const stats = [
    { label: "Total Appointments", value: appointments.length, icon: CalendarCheck, color: "bg-teal-500" },
    { label: "Lab Reports", value: labReports.length, icon: FlaskConical, color: "bg-blue-500" },
    { label: "Prescriptions", value: 3, icon: Stethoscope, color: "bg-violet-500" },
    { label: "Health Score", value: "87%", icon: Activity, color: "bg-emerald-500" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <PatientSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PatientTopBar patientName="Ramesh" />

        <main className="flex-1 overflow-y-auto p-8">
          {/* Dashboard Home */}
          {activeSection === "dashboard" && (
            <div>
              {/* Stats */}
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

              {/* Doctor List */}
              <DoctorAvailability onBookClick={handleBookDoctor} />
            </div>
          )}

          {activeSection === "book" && (
            <BookAppointment
              preSelectedDoctor={bookingDoctor}
              onAppointmentBooked={handleAppointmentBooked}
            />
          )}

          {activeSection === "appointments" && (
            <MyAppointments
              appointments={appointments}
              onConsultation={handleConsultation}
              onCancel={handleCancelAppointment}
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
                    RK
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Ramesh Kumar</h3>
                    <p className="text-sm text-slate-400">Patient ID: PT-2024-0042</p>
                  </div>
                </div>
                {[
                  ["Date of Birth", "14 March 1985"],
                  ["Blood Group", "O+"],
                  ["Phone", "+91 98765 43210"],
                  ["Email", "ramesh.kumar@gmail.com"],
                  ["Address", "12, MG Road, Pune, Maharashtra"],
                  ["Emergency Contact", "Sita Kumar — +91 91234 56789"],
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

      {/* Consultation Modal */}
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