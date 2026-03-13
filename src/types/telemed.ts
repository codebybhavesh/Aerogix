// src/types/telemed.ts
export interface CallData {
  appointmentId: string;
  doctorName: string;
  patientId: string;
  roomId: string; // Generated from appointmentId
}

export interface IncomingCall extends CallData {
  hostSocketId: string;
}