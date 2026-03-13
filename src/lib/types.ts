export interface Appointment {
    id: string;
    doctorId: string;
    patientId: string;
    doctorName?: string;
    specialization?: string;
    date: string;
    time: string;
    problem: string;
    status: "Pending" | "Accepted" | "Rejected" | "completed" | "in-progress" | string;
    createdAt?: string;

    // For backwards compatibility or joined data (optional)
    patientName?: string;
    name?: string;
    age?: number;
    village?: string;

    // Video call fields
    callStatus?: "started" | "joined" | "ended";
    callDoctorName?: string;
    roomId?: string;
    callStartedAt?: string;
    consultationFee?: number;
    paymentStatus?: "unpaid" | "paid";
    paymentTransactionId?: string;
    paidAt?: any;

    // Prescription flag — set to true by doctor after saving prescription
    hasPrescription?: boolean;
}

export interface Doctor {
    id: string;
    name: string;
    specialization: string;
    available: boolean;
    slots: string[];
    experience?: string;
    hospital?: string;
    rating?: number;
    avatar?: string;
    color?: string;
    consultationFee?: string | number;
    availabilityText?: string;
}

export interface AppUserProfile {
    id: string;
    name: string;
    email?: string;
    role: "doctor" | "patient";
    walletBalance?: number;
    createdAt?: string;
}

export interface LabReport {
    id: string; // Firestore document ID
    patientId: string;
    patientName: string;
    doctorId: string;
    reportName: string;
    reportUrl: string;
    uploadDate?: any; // Firestore Timestamp (serverTimestamp)
}

export interface MedicineEntry {
    id: string;
    name: string;
    dosage: string;
    frequency: string;       // e.g. "1-0-1", "1-1-1", "SOS"
    duration: string;        // e.g. "5 days", "1 month"
    instructions: string;    // e.g. "After meals", "Before sleep"
}

export interface Prescription {
    id: string;              // Firestore document ID
    appointmentId: string;
    patientId: string;
    patientName: string;
    doctorName: string;
    date: string;            // formatted date string e.g. "08/03/2026"
    problem: string;
    medicines: MedicineEntry[];
    notes: string;
    createdAt?: any;         // Firestore Timestamp — use .toDate() to convert
}

export interface WalletTransaction {
    id: string;
    senderId: string;
    receiverId: string;
    senderRole: "patient" | "doctor";
    receiverRole: "patient" | "doctor" | "system";
    amount: number;
    type: "consultation" | "payment" | "withdrawal";
    status: "completed";
    createdAt?: any; // Firestore Timestamp
}
