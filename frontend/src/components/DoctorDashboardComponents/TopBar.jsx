import React, { useState } from "react";
import { Bell, ChevronDown, Wifi, WifiOff } from "lucide-react";

const TopBar = () => {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
      {/* Left: Doctor Info */}
      <div>
        <h1 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          Good morning, Dr. Sarah Mitchell 👋
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Cardiologist · Apollo Medical Center</p>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-4">
        {/* Online Toggle */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border-2 ${
            isOnline
              ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
          }`}
        >
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Wifi size={14} />
              Online
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <WifiOff size={14} />
              Offline
            </>
          )}
        </button>

        {/* Notification Bell */}
        <button className="relative w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors duration-200">
          <Bell size={18} className="text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* Avatar */}
        <button className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors duration-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
            SM
          </div>
          <span className="text-sm font-medium text-slate-700">Dr. Mitchell</span>
          <ChevronDown size={14} className="text-slate-500" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;