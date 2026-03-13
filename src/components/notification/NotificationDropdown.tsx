import * as React from "react";
import { Bell, CheckCircle2, Clock3, AlertCircle } from "lucide-react";

type UserRole = "doctor" | "patient" | string;

interface NotificationDropdownProps {
  userRole?: UserRole;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "info" | "success" | "warning";
}

const getDefaultNotifications = (role: UserRole): NotificationItem[] => {
  if (role === "doctor") {
    return [
      {
        id: "1",
        title: "New consultation request",
        description: "You have a new appointment request from a patient.",
        time: "Just now",
        type: "info",
      },
      {
        id: "2",
        title: "Payout available",
        description: "Your recent consultation earnings are ready to withdraw.",
        time: "2h ago",
        type: "success",
      },
    ];
  }

  if (role === "patient") {
    return [
      {
        id: "1",
        title: "Upcoming appointment",
        description: "Your consultation is scheduled soon. Please be ready on time.",
        time: "Today",
        type: "info",
      },
      {
        id: "2",
        title: "Report uploaded",
        description: "Your latest lab report has been added to your records.",
        time: "Yesterday",
        type: "success",
      },
    ];
  }

  return [
    {
      id: "1",
      title: "Notifications",
      description: "You will see important updates here.",
      time: "—",
      type: "info",
    },
  ];
};

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ userRole = "patient" }) => {
  const [open, setOpen] = React.useState(false);
  const notifications = React.useMemo(() => getDefaultNotifications(userRole), [userRole]);

  const hasNotifications = notifications.length > 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {hasNotifications && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-[10px] font-semibold text-white">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[18rem] bg-white border border-slate-200 rounded-xl shadow-lg z-50">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Notifications</p>
              <p className="text-[11px] text-slate-400">
                {userRole === "doctor"
                  ? "Stay updated with your patients."
                  : "Stay updated with your doctors."}
              </p>
            </div>
            {hasNotifications && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-medium text-slate-600">
                {notifications.length} new
              </span>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {hasNotifications ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="mt-0.5">
                    {n.type === "success" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                    {n.type === "warning" && (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                    {n.type === "info" && (
                      <Clock3 className="w-4 h-4 text-sky-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
                      {n.description}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">{n.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-slate-400">
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;