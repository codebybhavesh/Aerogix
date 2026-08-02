import * as React from "react";
import { Reservation } from "@/lib/types";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Pill, 
  User, 
  Calendar,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReservationOrderCardProps {
  reservation: Reservation;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

const ReservationOrderCard: React.FC<ReservationOrderCardProps> = ({ 
  reservation, 
  onAccept, 
  onReject 
}) => {
  const isPending = reservation.status === "Pending";

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 mb-4 group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-500 transition-colors">
            <User size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-800 text-lg">Order #{reservation.id.substring(0, 8).toUpperCase()}</h3>
              <Badge 
                className={`border-none px-2 py-0 text-[10px] uppercase font-black tracking-widest ${
                  reservation.status === "Pending" ? "bg-amber-100 text-amber-700" :
                  reservation.status === "Confirmed" ? "bg-emerald-100 text-emerald-700" :
                  "bg-rose-100 text-rose-700"
                }`}
              >
                {reservation.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Calendar size={14} className="text-slate-400" />
                {new Date(reservation.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} className="text-slate-400" />
                {new Date(reservation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
        
        <button className="p-2 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
          <MessageSquare size={20} />
        </button>
      </div>

      <div className="bg-slate-50/50 rounded-2xl p-5 mb-6 border border-slate-100/50">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Pill size={12} /> Medicines Requested
        </p>
        <div className="flex flex-wrap gap-2">
          {reservation.medicines.map((med, idx) => (
            <span key={idx} className="text-xs bg-white text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 font-bold shadow-sm">
              {med}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {isPending ? (
          <>
            <Button 
              onClick={() => onReject(reservation.id)}
              variant="outline"
              className="flex-1 rounded-2xl py-6 border-slate-200 text-slate-500 font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
            >
              <XCircle size={18} className="mr-2" />
              Not Available
            </Button>
            <Button 
              onClick={() => onAccept(reservation.id)}
              className="flex-[2] rounded-2xl py-6 bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-lg shadow-violet-100 transition-all border-none"
            >
              <CheckCircle2 size={18} className="mr-2" />
              Accept & Lock Deal
            </Button>
          </>
        ) : (
          <Button 
            disabled
            className={`w-full rounded-2xl py-6 font-bold flex items-center justify-center gap-2 ${
              reservation.status === "Confirmed" 
                ? "bg-emerald-50 text-emerald-700 opacity-100 border border-emerald-100" 
                : "bg-rose-50 text-rose-700 opacity-100 border border-rose-100"
            }`}
          >
            {reservation.status === "Confirmed" ? (
              <>
                <CheckCircle2 size={18} />
                Order Confirmed
              </>
            ) : (
              <>
                <XCircle size={18} />
                Order Rejected
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReservationOrderCard;
