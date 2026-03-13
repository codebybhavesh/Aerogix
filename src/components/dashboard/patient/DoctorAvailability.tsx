import * as React from "react";
import { useState, useEffect } from "react";
import { Star, Clock, Building2, Stethoscope, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Doctor } from "@/lib/types";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

interface DoctorAvailabilityProps {
  onBookClick: (doc: Doctor) => void;
}

export default function DoctorAvailability({ onBookClick }: DoctorAvailabilityProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            specialization: data.Specialization || data.specialization || "Specialist",
            experience: data.Experience ? `${data.Experience} Years` : data.experience || "N/A",
            consultationFee: data['Consultation Fee'] || data['Consultaion Fee'] || data['Consulation Fee'] || data.consultationFee || 0,
            available: true,
            availabilityText: data.Availability || data.Avaiblity || data.availability || "Not Specified",
            rating: data.Rating || data.Ration || data.rating || 0,
            slots: data.slots || ["09:00 AM", "11:00 AM", "01:00 PM", "04:00 PM"],
            hospital: data.hospital || "Arogix Clinic"
          };
        }) as Doctor[];
        setDoctors(doctorsData);
      } catch (err: any) {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-teal-500 animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Loading available doctors...</p>
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
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Available Doctors</h2>
        <p className="text-slate-400 text-sm mt-1">Browse and book appointments with our specialists</p>
      </div>

      <div id="doctorList" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {doctors.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 italic">No doctors found in the database.</p>
          </div>
        ) : (
          doctors.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${doc.color || 'from-teal-400 to-cyan-600'} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {doc.avatar || (doc.name ? doc.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DR')}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">{doc.name}</h3>
                      <p className="text-teal-600 text-xs font-medium flex items-center gap-1 mt-0.5">
                        <Stethoscope size={11} /> {doc.specialization}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${doc.available
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-500"
                      }`}>
                      {doc.available ? <CheckCircle size={11} /> : <XCircle size={11} />}
                      {doc.availabilityText || (doc.available ? "Available" : "Busy")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock size={11} /> {doc.experience}</span>
                    <span className="flex items-center gap-1 font-medium text-slate-600">₹{doc.consultationFee}</span>
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star size={11} fill="currentColor" /> {doc.rating}
                    </span>
                  </div>

                  {/* Time slots */}
                  {doc.slots && doc.slots.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-slate-400 mb-2">Available Slots</p>
                      <div className="flex flex-wrap gap-1.5">
                        {doc.slots.map((slot) => (
                          <span key={slot} className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2 py-1 rounded-lg">
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => onBookClick(doc)}
                    disabled={!doc.available}
                    className={`mt-4 w-full py-2 px-4 rounded-xl text-xs font-semibold transition-all duration-150 ${doc.available
                      ? "bg-teal-500 hover:bg-teal-600 text-white shadow-sm hover:shadow"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                  >
                    {doc.available ? "Book Appointment" : "Not Available"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}