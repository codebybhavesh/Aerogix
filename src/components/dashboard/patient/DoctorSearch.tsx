import * as React from "react";
import { useState, useEffect } from "react";
import { Loader2, Search } from "lucide-react";
import { Doctor } from "@/lib/types";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import DoctorList from "./DoctorList";

interface DoctorSearchProps {
  onBookClick: (doc: Doctor) => void;
}

export default function DoctorSearch({ onBookClick }: DoctorSearchProps) {
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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
        setAllDoctors(doctorsData);
      } catch (err: any) {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = allDoctors.filter(doc => {
    const term = searchTerm.toLowerCase();
    return (
      doc.name?.toLowerCase().includes(term) ||
      doc.specialization?.toLowerCase().includes(term) ||
      (doc as any).category?.toLowerCase().includes(term) // Optional if category is an extra field
    );
  });

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
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Search Doctors</h2>
        <p className="text-slate-400 text-sm mt-1">Find the right specialist for your needs</p>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-colors"
          placeholder="Search doctors by name or specialization... (e.g. Cardiologist, Dr Rajesh Singh)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <DoctorList 
        doctors={filteredDoctors} 
        onBookClick={onBookClick} 
        emptyMessage={searchTerm ? `No doctors found matching "${searchTerm}".` : "No doctors found."} 
      />
    </div>
  );
}
