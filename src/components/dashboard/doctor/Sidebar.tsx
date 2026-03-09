import * as React from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  FlaskConical,
  Wallet,
  Users,
  Settings,
  LogOut,
  Stethoscope,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "requests", label: "Requests", icon: ClipboardList },
  { id: "lab", label: "Lab Reports", icon: FlaskConical },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "patients", label: "Patients", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  activeSection: string;
  setActiveSection: (id: string) => void;
  pendingRequests?: number;
}

const Sidebar = ({ activeSection, setActiveSection, pendingRequests = 0 }: SidebarProps) => {
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
    <aside className="w-64 min-h-screen bg-[#0f1f3d] flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-blue-900/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
            <Stethoscope size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight tracking-wide" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              MediDesk
            </p>
            <p className="text-blue-400 text-[10px] uppercase tracking-widest">Pro Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                : "text-slate-400 hover:bg-blue-900/40 hover:text-white"
                }`}
            >
              <Icon size={18} className={isActive ? "text-white" : "text-slate-500"} />
              {label}
              {id === "requests" && pendingRequests > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendingRequests}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom logout */}
      <div className="px-3 py-4 border-t border-blue-900/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-all duration-200"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
