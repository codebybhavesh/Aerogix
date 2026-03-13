import * as React from "react";
import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/context/AuthContext";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const VideoCallPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const jitsiContainer = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    // Load Jitsi script dynamically if not already loaded
    const loadJitsi = () => {
      return new Promise<void>((resolve) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    };

    const initJitsi = async () => {
      await loadJitsi();

      if (!jitsiContainer.current || !roomId) return;

      apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName: `arogix-${roomId}`,
        parentNode: jitsiContainer.current,
        width: "100%",
        height: "100%",
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          prejoinPageEnabled: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            "microphone", "camera", "closedcaptions", "desktop",
            "fullscreen", "fodeviceselection", "hangup", "chat",
            "settings", "raisehand", "videoquality", "tileview",
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
          DEFAULT_BACKGROUND: "#1e293b",
        },
        userInfo: {
          displayName: user?.displayName || user?.email || "User",
        },
      });

      apiRef.current.addEventListener("readyToClose", handleEndCall);
      apiRef.current.addEventListener("videoConferenceLeft", handleEndCall);
    };

    initJitsi();

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, [roomId]);

  const handleEndCall = async () => {
    // Clear callStatus in Firestore when call ends
    if (roomId) {
      try {
        await updateDoc(doc(db, "appointments", roomId), {
          callStatus: "ended",
        });
      } catch (e) {
        console.error("Failed to update call status:", e);
      }
    }
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-semibold text-sm">Arogix Video Consultation</span>
        </div>
        <button
          onClick={handleEndCall}
          className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          End Call
        </button>
      </div>

      {/* Jitsi Container */}
      <div ref={jitsiContainer} className="flex-1 w-full" />
    </div>
  );
};

export default VideoCallPage;