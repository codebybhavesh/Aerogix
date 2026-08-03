import { Link, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    ClipboardList,
    Settings,
    LogOut,
    Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";

interface ChemistSidebarProps {
    onNavigate: (view: "overview" | "inventory" | "orders") => void;
    currentView: string;
}

const ChemistSidebar: React.FC<ChemistSidebarProps> = ({ onNavigate, currentView }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate("/");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div className="w-64 bg-white border-r border-slate-200 h-full flex flex-col custom-scrollbar">
            <div className="p-6">
                <Link to="/" className="flex flex-col gap-1 mb-8 hover:opacity-90 transition-opacity">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg gradient-vitality flex items-center justify-center shadow-lg shadow-primary/20">
                            <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900">
                            Aerogix
                        </span>
                    </div>
                    <span className="text-xs font-semibold text-primary tracking-wider uppercase ml-[42px]">
                        Chemist Portal
                    </span>
                </Link>

                <nav className="space-y-2 flex-grow">
                    <button
                        onClick={() => onNavigate("overview")}
                        className={`w-full flex items-center justify-start gap-3 p-3 rounded-xl transition-all ${
                            currentView === "overview"
                                ? "bg-primary/10 text-primary font-semibold relative after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:h-8 after:w-1 after:bg-primary after:rounded-r-full"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                        <LayoutDashboard className={`w-5 h-5 ${currentView === "overview" ? "text-primary" : "text-slate-400"}`} />
                        Overview
                    </button>
                    <button
                        onClick={() => onNavigate("inventory")}
                        className={`w-full flex items-center justify-start gap-3 p-3 rounded-xl transition-all ${
                            currentView === "inventory"
                                ? "bg-primary/10 text-primary font-semibold relative after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:h-8 after:w-1 after:bg-primary after:rounded-r-full"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                        <Package className={`w-5 h-5 ${currentView === "inventory" ? "text-primary" : "text-slate-400"}`} />
                        Inventory
                    </button>
                    <button
                        onClick={() => onNavigate("orders")}
                        className={`w-full flex items-center justify-start gap-3 p-3 rounded-xl transition-all ${
                            currentView === "orders"
                                ? "bg-primary/10 text-primary font-semibold relative after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:h-8 after:w-1 after:bg-primary after:rounded-r-full"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                        <ClipboardList className={`w-5 h-5 ${currentView === "orders" ? "text-primary" : "text-slate-400"}`} />
                        Prescriptions & Orders
                    </button>
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-slate-100">
                <Button 
                    variant="ghost" 
                    className="w-full flex items-center justify-start gap-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl"
                    onClick={handleLogout}
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </Button>
            </div>
        </div>
    );
};

export default ChemistSidebar;
