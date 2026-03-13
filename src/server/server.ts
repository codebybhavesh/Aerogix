// server/index.ts
// Install: npm install socket.io cors
// Install dev: npm install -D typescript ts-node @types/node @types/cors
// Run: npx ts-node server/index.ts

import { createServer } from "http";
import { Server, Socket } from "socket.io";

interface StartCallData {
  roomId: string;
  doctorName: string;
  doctorId: string;
  patientId: string;
}

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000" },
});

io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  socket.on("start-call", (data: StartCallData) => {
    console.log("Call started:", data);
    socket.broadcast.emit("incoming-call", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});