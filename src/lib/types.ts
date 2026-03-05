export interface Appointment {
    id: string; // Firestore document ID is a string
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
