import * as React from "react";
import { useState, useEffect } from "react";
import { Clock, Video, Users, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/dashboard/doctor/Sidebar";
import TopBar from "@/components/dashboard/doctor/TopBar";
import StatsCards from "@/components/dashboard/doctor/StatsCards";
import AppointmentRequests from "@/components/dashboard/doctor/AppointmentRequests";
import LabReports from "@/components/dashboard/doctor/LabReports";
import ConsultationModal from "@/components/dashboard/doctor/ConsultationModal";
import DoctorWalletPage from "@/components/dashboard/doctor/DoctorWalletPage";
import { Appointment, Doctor, WalletTransaction } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { doctorSentTransactionsQuery, doctorTransactionsQuery, withdrawDoctorEarnings } from "@/lib/wallet";

const statusConfig: Record<string, { label: string; color: string }> = {
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700" },
  Accepted: { label: "Accepted", color: "bg-blue-100 text-blue-700" },
  "in-progress": { label: "In Progress", color: "bg-emerald-100 text-emerald-700" },
  upcoming: { label: "Upcoming", color: "bg-violet-100 text-violet-700" },
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [requests, setRequests] = useState<Appointment[]>([]);
  const [scheduled, setScheduled] = useState<Appointment[]>([]);
  const [consultationPatient, setConsultationPatient] = useState<Appointment | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [startingCallId, setStartingCallId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [receivedTransactions, setReceivedTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawalTransactions, setWithdrawalTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<string>("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubDoc = onSnapshot(doc(db, "doctors", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDoctorProfile({
          id: docSnap.id,
          name: data.Name || data.name || "Unknown Doctor",
          specialization: data.Specialization?.trim() || data.specialization?.trim() || "Specialist",
          experience: data.Experience ? `${data.Experience} Years` : data.experience || "N/A",
          consultationFee: data['Consultation Fee'] || data['Consultaion Fee'] || data['Consulation Fee'] || data.consultationFee || 0,
          available: true,
          availabilityText: data.Availability?.trim() || data.Avaiblity?.trim() || data.availability?.trim() || "Not Specified",
          rating: data.Rating || data.Ration || data.rating || 0,
          slots: data.slots || ["09:00 AM", "11:00 AM", "01:00 PM", "04:00 PM"],
          hospital: data.hospital || "Arogix Clinic"
        } as Doctor);
      }
    });

    const q = query(collection(db, "appointments"), where("doctorId", "==", user.uid));
    const unsubscribeAppts = onSnapshot(q, (snapshot) => {
      const appointmentsData: Appointment[] = [];
      snapshot.forEach((doc) => {
        appointmentsData.push({ id: doc.id, ...doc.data() } as Appointment);
      });
      setRequests(appointmentsData.filter(appt => appt.status === "Pending"));
      setScheduled(
        appointmentsData.filter(
          (appt) => !["Pending", "Rejected", "Cancelled", "Canceled"].includes(appt.status)
        )
      );
    });

    return () => {
      unsubDoc();
      unsubscribeAppts();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const unsubWallet = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (!snap.exists()) return;
      const balance = Number((snap.data() as any).walletBalance || 0);
      setWalletBalance(balance);
    });

    const txQuery = doctorTransactionsQuery(user.uid);
    const unsubTransactions = onSnapshot(txQuery, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as WalletTransaction[];
      items.sort((a: any, b: any) => {
        const aMs = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bMs = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bMs - aMs;
      });
      setReceivedTransactions(items);
    });

    const sentTxQuery = doctorSentTransactionsQuery(user.uid);
    const unsubSentTransactions = onSnapshot(sentTxQuery, (snapshot) => {
      const items = snapshot.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) }))
        .filter((tx: any) => tx.type === "withdrawal") as WalletTransaction[];
      items.sort((a: any, b: any) => {
        const aMs = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bMs = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bMs - aMs;
      });
      setWithdrawalTransactions(items);
    });

    return () => {
      unsubWallet();
      unsubTransactions();
      unsubSentTransactions();
    };
  }, [user]);

  const handleWithdraw = async () => {
    if (!user) return;
    const amount = Number(withdrawAmountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      window.alert("Enter a valid withdraw amount");
      return;
    }

    setIsWithdrawing(true);
    try {
      await withdrawDoctorEarnings(user.uid, amount);
      setWithdrawAmountInput("");
      window.alert("Withdrawal completed");
    } catch (error: any) {
      console.error("Withdrawal failed:", error);
      window.alert(error?.message || "Withdrawal failed");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleAcceptRequest = async (id: string) => {
    try {
      await updateDoc(doc(db, "appointments", id), { status: "Accepted" });
    } catch (error) {
      console.error("Error accepting appointment:", error);
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      await updateDoc(doc(db, "appointments", id), { status: "Rejected" });
    } catch (error) {
      console.error("Error rejecting appointment:", error);
    }
  };

  /**
   * handleStartCall:
   * 1. Writes callStatus + doctor info to the appointment doc in Firestore.
   * 2. Patient's onSnapshot picks this up and shows the join notification.
   * 3. Doctor navigates to /video-call/:appointmentId (roomId = appointmentId).
   */
  const handleStartCall = async (appt: Appointment) => {
    if ((appt.paymentStatus || "unpaid") !== "paid") {
      window.alert("Consultation fee is not paid yet. You cannot start video consultation.");
      return;
    }

    setStartingCallId(appt.id);
    try {
      await updateDoc(doc(db, "appointments", appt.id), {
        callStatus: "started",
        callStartedAt: new Date().toISOString(),
        callDoctorName: doctorProfile?.name || "Doctor",
        roomId: appt.id, // roomId = appointmentId, simple and unique
      });
      navigate(`/doctor/video-call/${appt.id}`);
    } catch (error) {
      console.error("Error starting call:", error);
    } finally {
      setStartingCallId(null);
    }
  };

  const computedStats = {
    totalPatients: scheduled.length + requests.length,
    todayAppointments: scheduled.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length || scheduled.length,
    pendingRequests: requests.length,
    completedConsultations: scheduled.filter(a => a.status === "completed").length
  };

  const patientRows = React.useMemo(() => {
    const byId = new Map<string, { id: string; name: string; lastVisit: string; totalAppointments: number }>();
    [...scheduled, ...requests].forEach((appt) => {
      const id = appt.patientId || appt.id;
      const name = appt.patientName || appt.name || appt.patientId || "Patient";
      const existing = byId.get(id);
      if (!existing) {
        byId.set(id, {
          id,
          name,
          lastVisit: appt.date || "N/A",
          totalAppointments: 1,
        });
      } else {
        existing.totalAppointments += 1;
        if (appt.date) existing.lastVisit = appt.date;
      }
    });
    return Array.from(byId.values());
  }, [scheduled, requests]);

  const renderScheduledAppointmentsCard = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Scheduled Appointments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{scheduled.length} confirmed</p>
        </div>
        <button
          onClick={() => setActiveSection("appointments")}
          className="text-xs text-blue-600 font-semibold hover:underline"
        >
          View All
        </button>
      </div>

      {scheduled.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <Clock size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No appointments scheduled yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {scheduled.map((appt) => {
            const status = statusConfig[appt.status] || statusConfig["confirmed"];
            const displayName = appt.patientName || appt.name || appt.patientId || "Patient";
            const isStarting = startingCallId === appt.id;
            const isPaid = (appt.paymentStatus || "unpaid") === "paid";

            return (
              <div
                key={appt.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/60 transition-colors duration-150"
              >
                <div className="w-14 flex-shrink-0 text-center">
                  <p className="text-sm font-bold text-slate-700">{appt.time}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{appt.date}</p>
                </div>

                <div className="w-px h-10 bg-slate-200 flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800 text-sm truncate">{displayName}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{appt.problem}</p>
                  <p className={`text-[11px] mt-1 font-medium ${isPaid ? "text-emerald-600" : "text-amber-600"}`}>
                    Payment: {isPaid ? "Paid" : "Pending"}
                  </p>
                </div>

                <button
                  onClick={() => handleStartCall(appt)}
                  disabled={isStarting || !isPaid}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed ${
                    isPaid ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-400"
                  }`}
                >
                  <Video size={13} />
                  {isStarting ? "Starting..." : isPaid ? "Start" : "Pay Pending"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderMainContent = () => {
    if (activeSection === "dashboard") {
      return (
        <>
          <div>
            <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Dashboard Overview
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Today's summary</p>
          </div>

          <StatsCards statsData={computedStats} />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AppointmentRequests
              requests={requests}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
            />
            {renderScheduledAppointmentsCard()}
          </div>

          <LabReports />
        </>
      );
    }

    if (activeSection === "wallet") {
      return (
        <>
          <div>
            <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Wallet
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Track earnings and withdraw your available balance</p>
          </div>
          <DoctorWalletPage
            walletBalance={walletBalance}
            withdrawAmount={withdrawAmountInput}
            onWithdrawAmountChange={setWithdrawAmountInput}
            withdrawing={isWithdrawing}
            onWithdraw={handleWithdraw}
            receivedPayments={receivedTransactions}
            withdrawals={withdrawalTransactions}
          />
        </>
      );
    }

    if (activeSection === "appointments") {
      return (
        <>
          <div>
            <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Appointments
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Manage all confirmed and active appointments</p>
          </div>
          {renderScheduledAppointmentsCard()}
        </>
      );
    }

    if (activeSection === "requests") {
      return (
        <>
          <div>
            <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Appointment Requests
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Review and accept or reject patient requests</p>
          </div>
          <AppointmentRequests
            requests={requests}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
          />
        </>
      );
    }

    if (activeSection === "lab") {
      return (
        <>
          <div>
            <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Lab Reports
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">View uploaded reports from your patients</p>
          </div>
          <LabReports />
        </>
      );
    }

    if (activeSection === "patients") {
      return (
        <>
          <div>
            <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Patients
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Your current patient list</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Users size={16} className="text-slate-500" />
              <p className="text-sm font-semibold text-slate-700">{patientRows.length} patients</p>
            </div>
            {patientRows.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-500 text-sm">No patients found yet.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {patientRows.map((p) => (
                  <div key={p.id} className="px-6 py-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                      <p className="text-xs text-slate-500">Last visit: {p.lastVisit}</p>
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {p.totalAppointments} appointment{p.totalAppointments > 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      );
    }

    return (
      <>
        <div>
          <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Settings
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Profile and account preferences</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon size={16} className="text-slate-500" />
            <p className="text-sm font-semibold text-slate-700">Doctor Profile</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Name</p>
              <p className="text-slate-800 font-medium">{doctorProfile?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-slate-500">Specialization</p>
              <p className="text-slate-800 font-medium">{doctorProfile?.specialization || "N/A"}</p>
            </div>
            <div>
              <p className="text-slate-500">Availability</p>
              <p className="text-slate-800 font-medium">{doctorProfile?.availabilityText || "N/A"}</p>
            </div>
            <div>
              <p className="text-slate-500">Consultation Fee</p>
              <p className="text-slate-800 font-medium">Rs {doctorProfile?.consultationFee ?? "N/A"}</p>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        pendingRequests={requests.length}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar doctor={doctorProfile} />

        <main className="flex-1 overflow-y-auto px-8 py-7 space-y-7">
          {renderMainContent()}
        </main>
      </div>

      {consultationPatient && (
        <ConsultationModal
          patient={consultationPatient}
          onClose={() => setConsultationPatient(null)}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
