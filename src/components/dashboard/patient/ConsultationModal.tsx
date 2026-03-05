import * as React from "react";
import { useState } from "react";
import { X, Video, MessageSquare, PhoneOff, Mic, MicOff, VideoOff, Send } from "lucide-react";
import { Appointment } from "@/lib/types";

interface ConsultationModalProps {
  appointment: Appointment;
  type: string;
  onClose: () => void;
}

export default function ConsultationModal({ appointment, type, onClose }: ConsultationModalProps) {
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { from: "doctor", text: "Hello! How can I help you today?", time: "10:01 AM" },
    { from: "patient", text: "I've been having chest discomfort since morning.", time: "10:02 AM" },
    { from: "doctor", text: "I see. Can you describe the pain — is it sharp or dull?", time: "10:03 AM" },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages([...messages, { from: "patient", text: message, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setMessage("");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white font-semibold text-sm">
              {type === "video" ? "Video" : "1:1"} Consultation — {appointment.doctorName}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex h-[500px]">
          {/* Video Area */}
          <div className="flex-1 bg-slate-800 relative flex flex-col items-center justify-center">
            {type === "video" ? (
              <>
                {/* Doctor video (main) */}
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white text-3xl font-bold mb-3">
                    {appointment.doctorName?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <p className="text-white font-medium">{appointment.doctorName}</p>
                  <p className="text-slate-400 text-sm">{videoOff ? "Camera Off" : "Connected"}</p>
                </div>

                {/* Patient video (PiP) */}
                <div className="absolute bottom-4 right-4 w-32 h-24 bg-slate-600 rounded-xl border-2 border-slate-500 flex items-center justify-center">
                  <p className="text-slate-400 text-xs">Your Camera</p>
                </div>

                {/* Controls */}
                <div className="absolute bottom-4 left-0 right-0 mx-auto flex items-center justify-center gap-3">
                  <button
                    onClick={() => setMuted(!muted)}
                    className={`p-3 rounded-full transition-colors ${muted ? "bg-red-500 text-white" : "bg-slate-700 text-white hover:bg-slate-600"}`}
                  >
                    {muted ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                  <button
                    onClick={() => setVideoOff(!videoOff)}
                    className={`p-3 rounded-full transition-colors ${videoOff ? "bg-red-500 text-white" : "bg-slate-700 text-white hover:bg-slate-600"}`}
                  >
                    {videoOff ? <VideoOff size={16} /> : <Video size={16} />}
                  </button>
                  <button
                    onClick={onClose}
                    className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                  >
                    <PhoneOff size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center px-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold">
                  {appointment.doctorName?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <p className="text-white font-semibold">{appointment.doctorName}</p>
                <div className="flex gap-1 mt-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-6 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
                  ))}
                </div>
                <p className="text-slate-400 text-sm mt-2">Voice consultation in progress...</p>
                <button onClick={onClose} className="mt-4 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                  <PhoneOff size={15} /> End Call
                </button>
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="w-80 border-l border-slate-100 flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <MessageSquare size={16} className="text-teal-500" />
              <span className="text-sm font-semibold text-slate-700">Chat</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "patient" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${msg.from === "patient"
                      ? "bg-teal-500 text-white rounded-tr-sm"
                      : "bg-slate-100 text-slate-700 rounded-tl-sm"
                    }`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.from === "patient" ? "text-teal-100" : "text-slate-400"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-100 flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <button
                onClick={sendMessage}
                className="p-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl transition-colors"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}