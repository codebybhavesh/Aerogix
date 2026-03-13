import * as React from "react";
import { Video, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

interface CallNotificationBannerProps {
  appointmentId: string;
  doctorName: string;
  canJoin: boolean;
  onDismiss: () => void;
}

const CallNotificationBanner: React.FC<CallNotificationBannerProps> = ({
  appointmentId,
  doctorName,
  canJoin,
  onDismiss,
}) => {
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!canJoin) {
      window.alert("Please pay consultation fee from Wallet before joining video consultation.");
      return;
    }

    // Mark that patient has joined
    try {
      await updateDoc(doc(db, "appointments", appointmentId), {
        callStatus: "joined",
      });
    } catch (e) {
      console.error("Failed to update join status:", e);
    }
    navigate(`/video-call/${appointmentId}`);
    onDismiss();
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-md mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
        {/* Blue accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />

        <div className="flex items-center gap-4 px-5 py-4">
          {/* Pulsing icon */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Video size={22} className="text-blue-600" />
            </div>
            <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
            <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800">Video Call Starting</p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              Dr. {doctorName} has started your consultation
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleJoin}
              disabled={!canJoin}
              className={`px-4 py-2 text-white text-xs font-bold rounded-xl transition-colors shadow-sm ${
                canJoin ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-400 cursor-not-allowed"
              }`}
            >
              {canJoin ? "Join Now" : "Pay First"}
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallNotificationBanner;
