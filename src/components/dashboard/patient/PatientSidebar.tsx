import * as React from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  FlaskConical,
  FileText,
  UserCircle,
  Wallet,
  LogOut,
  Heart,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "book", label: "Book Appointment", icon: CalendarPlus },
  { id: "appointments", label: "My Appointments", icon: CalendarCheck },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "labs", label: "Lab Reports", icon: FlaskConical },
  { id: "prescriptions", label: "Prescriptions", icon: FileText },
  { id: "profile", label: "Profile", icon: UserCircle },
];

interface PatientSidebarProps {
  activeSection: string;
  setActiveSection: (id: string) => void;
}

export default function PatientSidebar({ activeSection, setActiveSection }: PatientSidebarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center">
            <Heart size={18} className="text-slate-900" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">MediCare</span>
        </div>
        <p className="text-slate-400 text-xs mt-1 ml-10">Patient Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${active
                ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
