import { useState } from "react";
import { doctors } from "./DoctorAvailability";
import { CalendarPlus, CheckCircle2 } from "lucide-react";

export default function BookAppointment({ preSelectedDoctor, onAppointmentBooked }) {
  const [selectedDoctor, setSelectedDoctor] = useState(preSelectedDoctor || doctors[0]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [problem, setProblem] = useState("");
  const [success, setSuccess] = useState(false);

  const availableDoctors = doctors.filter((d) => d.available);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !problem.trim()) return;

    const appointment = {
      id: Date.now(),
      doctorName: selectedDoctor.name,
      specialization: selectedDoctor.specialization,
      date: selectedDate,
      time: selectedSlot,
      problem,
      status: "Pending",
    };

    onAppointmentBooked(appointment);
    setSuccess(true);
    setSelectedDate("");
    setSelectedSlot("");
    setProblem("");

    setTimeout(() => setSuccess(false), 3000);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Book an Appointment</h2>
        <p className="text-slate-400 text-sm mt-1">Schedule a consultation with your preferred doctor</p>
      </div>

      {success && (
        <div className="mb-5 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl">
          <CheckCircle2 size={18} />
          <p className="text-sm font-medium">Appointment booked successfully! Check My Appointments.</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Doctor Select */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Doctor</label>
            <select
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50"
              value={selectedDoctor.id}
              onChange={(e) => {
                const doc = availableDoctors.find((d) => d.id === parseInt(e.target.value));
                setSelectedDoctor(doc);
                setSelectedSlot("");
              }}
            >
              {availableDoctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} — {doc.specialization}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Date</label>
            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50"
              required
            />
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Time Slot</label>
            <div className="flex flex-wrap gap-2">
              {selectedDoctor.slots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    selectedSlot === slot
                      ? "bg-teal-500 text-white border-teal-500 shadow"
                      : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Problem */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Problem Description</label>
            <textarea
              rows={4}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Describe your symptoms or concern..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50 resize-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
          >
            <CalendarPlus size={18} />
            Confirm Appointment
          </button>
        </form>
      </div>
    </div>
  );
}