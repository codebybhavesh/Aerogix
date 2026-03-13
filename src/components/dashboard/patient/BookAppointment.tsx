import * as React from "react";
import { useState, useEffect } from "react";
import { CalendarPlus, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Appointment, Doctor } from "@/lib/types";
import { db } from "@/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

interface BookAppointmentProps {
  preSelectedDoctor: Doctor | null;
  onAppointmentBooked: (apt: Appointment) => void;
  patientName?: string;
}

export default function BookAppointment({ preSelectedDoctor, onAppointmentBooked, patientName = "Patient" }: BookAppointmentProps) {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(preSelectedDoctor);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [problem, setProblem] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "doctors"));
        const doctorsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.Name || data.name || "Unknown Doctor",
            specialization: data.Specialization?.trim() || data.specialization?.trim() || "Specialist",
            experience: data.Experience ? `${data.Experience} Years` : data.experience || "N/A",
            consultationFee: data['Consultation Fee'] || data['Consultaion Fee'] || data['Consulation Fee'] || data.consultationFee || 0,
            available: true,
            availabilityText: data.Availability?.trim() || data.Avaiblity?.trim() || data.availability?.trim() || "Not Specified",
            rating: data.Rating || data.Ration || data.rating || 0,
            slots: data.slots || ["09:00 AM", "11:00 AM", "01:00 PM", "04:00 PM"],
            hospital: data.hospital || "Arogix Clinic"
          };
        }) as Doctor[];
        setDoctors(doctorsData);

        if (!preSelectedDoctor && doctorsData.length > 0) {
          const firstAvailable = doctorsData.find(d => d.available);
          setSelectedDoctor(firstAvailable || doctorsData[0]);
        }
      } catch (err: any) {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [preSelectedDoctor]);

  const availableDoctors = doctors.filter((d) => d.available);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedSlot || !problem.trim() || !user) {
      if (!user) {
        setSubmitError("You must be logged in to book an appointment.");
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const appointmentData: Omit<Appointment, "id"> = {
        doctorId: selectedDoctor.id,
        patientId: user.uid,
        patientName: patientName,
        doctorName: selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        consultationFee: Number(selectedDoctor.consultationFee || 0),
        paymentStatus: "unpaid",
        date: selectedDate,
        time: selectedSlot,
        problem,
        status: "Pending",
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "appointments"), appointmentData);

      const newAppointment: Appointment = {
        id: docRef.id as any, // Cast to any to bypass type error if id expects number, will fix type later if needed
        ...appointmentData
      };

      onAppointmentBooked(newAppointment);
      setSuccess(true);
      setSelectedDate("");
      setSelectedSlot("");
      setProblem("");

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error booking appointment:", err);
      setSubmitError("Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-teal-500 animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Loading appointment form...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

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
        {doctors.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-400 italic text-sm">No doctors available to book.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {submitError && (
              <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                <AlertCircle size={18} />
                <p className="text-sm font-medium">{submitError}</p>
              </div>
            )}

            {/* Doctor Select */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select Doctor</label>
              <select
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50 disabled:opacity-50"
                value={selectedDoctor?.id || ""}
                onChange={(e) => {
                  const doc = availableDoctors.find((d) => d.id.toString() === e.target.value);
                  if (doc) {
                    setSelectedDoctor(doc);
                    setSelectedSlot("");
                  }
                }}
                disabled={isSubmitting}
              >
                {!selectedDoctor && <option value="">Select a doctor</option>}
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
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50 disabled:opacity-50"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Time Slot */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select Time Slot</label>
              <div className="flex flex-wrap gap-2">
                {selectedDoctor?.slots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    disabled={isSubmitting}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-50 ${selectedSlot === slot
                      ? "bg-teal-500 text-white border-teal-500 shadow"
                      : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"
                      }`}
                  >
                    {slot}
                  </button>
                )) || <p className="text-xs text-slate-400 italic">Please select a doctor to see available slots</p>}
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
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50 resize-none disabled:opacity-50"
                required
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={!selectedDoctor || isSubmitting}
              className={`w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-all shadow-sm ${selectedDoctor && !isSubmitting
                ? "bg-teal-500 hover:bg-teal-600 text-white"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Booking...
                </>
              ) : (
                <>
                  <CalendarPlus size={18} />
                  Confirm Appointment
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
