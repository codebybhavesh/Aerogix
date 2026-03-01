import { Star, Clock, Building2, Stethoscope, CheckCircle, XCircle } from "lucide-react";

export const doctors = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    specialization: "Cardiologist",
    experience: "12 years",
    hospital: "Apollo Hospitals",
    slots: ["09:00 AM", "11:00 AM", "02:00 PM", "04:30 PM"],
    available: true,
    rating: 4.9,
    avatar: "PS",
    color: "from-rose-400 to-pink-600",
  },
  {
    id: 2,
    name: "Dr. Arjun Mehta",
    specialization: "Dermatologist",
    experience: "8 years",
    hospital: "Fortis Healthcare",
    slots: ["10:00 AM", "12:00 PM", "03:00 PM"],
    available: true,
    rating: 4.7,
    avatar: "AM",
    color: "from-violet-400 to-purple-600",
  },
  {
    id: 3,
    name: "Dr. Kavitha Nair",
    specialization: "Neurologist",
    experience: "15 years",
    hospital: "AIIMS Delhi",
    slots: ["11:30 AM", "03:30 PM"],
    available: false,
    rating: 4.8,
    avatar: "KN",
    color: "from-amber-400 to-orange-600",
  },
  {
    id: 4,
    name: "Dr. Suresh Patel",
    specialization: "Orthopedic",
    experience: "10 years",
    hospital: "Manipal Hospital",
    slots: ["09:30 AM", "01:00 PM", "05:00 PM"],
    available: true,
    rating: 4.6,
    avatar: "SP",
    color: "from-teal-400 to-cyan-600",
  },
];

export default function DoctorAvailability({ onBookClick }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Available Doctors</h2>
        <p className="text-slate-400 text-sm mt-1">Browse and book appointments with our specialists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {doctors.map((doc) => (
          <div key={doc.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${doc.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {doc.avatar}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{doc.name}</h3>
                    <p className="text-teal-600 text-xs font-medium flex items-center gap-1 mt-0.5">
                      <Stethoscope size={11} /> {doc.specialization}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
                    doc.available
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-500"
                  }`}>
                    {doc.available ? <CheckCircle size={11} /> : <XCircle size={11} />}
                    {doc.available ? "Available" : "Busy"}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Clock size={11} /> {doc.experience}</span>
                  <span className="flex items-center gap-1"><Building2 size={11} /> {doc.hospital}</span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <Star size={11} fill="currentColor" /> {doc.rating}
                  </span>
                </div>

                {/* Time slots */}
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

                <button
                  onClick={() => onBookClick(doc)}
                  disabled={!doc.available}
                  className={`mt-4 w-full py-2 px-4 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    doc.available
                      ? "bg-teal-500 hover:bg-teal-600 text-white shadow-sm hover:shadow"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {doc.available ? "Book Appointment" : "Not Available"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}