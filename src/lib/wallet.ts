import {
  addDoc,
  collection,
  doc,
  getDoc,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type WalletTransferInput = {
  senderId: string;
  receiverId: string;
  senderRole: "patient" | "doctor";
  receiverRole: "patient" | "doctor";
  amount: number;
  type: "consultation" | "payment";
  appointmentId?: string;
};

export async function getWalletBalance(userId: string): Promise<number> {
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return 0;
  return Number((snap.data() as any)?.walletBalance || 0);
}

export async function addDemoMoney(userId: string, amount: number): Promise<number> {
  if (!userId) throw new Error("User not authenticated");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid amount");

  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("User profile not found");

  const current = Number((snap.data() as any).walletBalance || 0);
  const next = current + amount;
  await updateDoc(userRef, { walletBalance: next });
  return next;
}

export async function transferWalletPayment(input: WalletTransferInput): Promise<{ transactionId: string }> {
  const { senderId, receiverId, senderRole, receiverRole, amount, type } = input;

  if (!senderId || !receiverId) throw new Error("Invalid sender or receiver");
  if (senderId === receiverId) throw new Error("Sender and receiver cannot be the same");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid transfer amount");
  if (type === "consultation" && !input.appointmentId) {
    throw new Error("Consultation payment requires appointment reference");
  }

  const result = await runTransaction(db, async (tx) => {
    const senderRef = doc(db, "users", senderId);
    const receiverRef = doc(db, "users", receiverId);
    const transactionRef = doc(collection(db, "transactions"));
    const appointmentRef = input.appointmentId ? doc(db, "appointments", input.appointmentId) : null;

    const readPromises: Array<Promise<any>> = [tx.get(senderRef), tx.get(receiverRef)];
    if (appointmentRef) readPromises.push(tx.get(appointmentRef));
    const [senderSnap, receiverSnap, appointmentSnap] = await Promise.all(readPromises);
    if (!senderSnap.exists()) throw new Error("Sender profile not found");
    if (!receiverSnap.exists()) throw new Error("Receiver profile not found");

    const senderData = senderSnap.data() as any;
    const receiverData = receiverSnap.data() as any;
    const senderActualRole = (senderData.role || "").toString().toLowerCase();
    const receiverActualRole = (receiverData.role || "").toString().toLowerCase();
    if (senderActualRole !== senderRole) throw new Error("Sender role mismatch");
    if (receiverActualRole !== receiverRole) throw new Error("Receiver role mismatch");
    if (type === "consultation" && (senderRole !== "patient" || receiverRole !== "doctor")) {
      throw new Error("Consultation payment must be patient to doctor");
    }

    const senderBalance = Number(senderData.walletBalance || 0);
    const receiverBalance = Number(receiverData.walletBalance || 0);

    if (senderBalance < amount) throw new Error("Insufficient wallet balance");

    if (appointmentRef) {
      if (!appointmentSnap.exists()) throw new Error("Appointment not found");

      const appointment = appointmentSnap.data() as any;
      if (appointment.patientId !== senderId || appointment.doctorId !== receiverId) {
        throw new Error("Appointment payment mapping mismatch");
      }
      if ((appointment.paymentStatus || "unpaid") === "paid") {
        throw new Error("This appointment is already paid");
      }
      const expectedFee = Number(appointment.consultationFee || 0);
      if (expectedFee <= 0) throw new Error("Invalid consultation fee for this appointment");
      if (expectedFee !== amount) throw new Error("Payment amount must match consultation fee");

      tx.update(appointmentRef, {
        paymentStatus: "paid",
        paymentTransactionId: transactionRef.id,
        paidAt: serverTimestamp(),
      });
    }

    tx.update(senderRef, { walletBalance: senderBalance - amount });
    tx.update(receiverRef, { walletBalance: receiverBalance + amount });
    tx.set(transactionRef, {
      senderId,
      receiverId,
      senderRole,
      receiverRole,
      amount,
      type,
      status: "completed",
      createdAt: serverTimestamp(),
    });

    return { transactionId: transactionRef.id };
  });

  return result;
}

export function patientTransactionsQuery(patientId: string) {
  return query(collection(db, "transactions"), where("senderId", "==", patientId));
}

export function doctorTransactionsQuery(doctorId: string) {
  return query(collection(db, "transactions"), where("receiverId", "==", doctorId));
}

export function doctorSentTransactionsQuery(doctorId: string) {
  return query(collection(db, "transactions"), where("senderId", "==", doctorId));
}

export async function withdrawDoctorEarnings(doctorId: string, amount: number): Promise<{ transactionId: string }> {
  if (!doctorId) throw new Error("Doctor not authenticated");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid withdraw amount");

  const result = await runTransaction(db, async (tx) => {
    const doctorRef = doc(db, "users", doctorId);
    const transactionRef = doc(collection(db, "transactions"));

    const doctorSnap = await tx.get(doctorRef);
    if (!doctorSnap.exists()) throw new Error("Doctor profile not found");

    const doctorData = doctorSnap.data() as any;
    const role = (doctorData.role || "").toString().toLowerCase();
    if (role !== "doctor") throw new Error("Only doctors can withdraw earnings");

    const currentBalance = Number(doctorData.walletBalance || 0);
    if (currentBalance < amount) throw new Error("Insufficient earnings balance");

    tx.update(doctorRef, { walletBalance: currentBalance - amount });
    tx.set(transactionRef, {
      senderId: doctorId,
      receiverId: "system",
      senderRole: "doctor",
      receiverRole: "system",
      amount,
      type: "withdrawal",
      status: "completed",
      createdAt: serverTimestamp(),
    });

    return { transactionId: transactionRef.id };
  });

  return result;
}

export async function addManualTransactionRecord(payload: {
  senderId: string;
  receiverId: string;
  senderRole: "patient" | "doctor";
  receiverRole: "patient" | "doctor" | "system";
  amount: number;
  type: "consultation" | "payment" | "withdrawal";
}) {
  await addDoc(collection(db, "transactions"), {
    ...payload,
    status: "completed",
    createdAt: serverTimestamp(),
  });
}
