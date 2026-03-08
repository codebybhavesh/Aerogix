// server.js (Node/Express snippet)
const userSocketMap = new Map(); // Map<userId, socketId>

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap.set(userId, socket.id);

  socket.on("initiate-call", (data) => {
    const patientSocketId = userSocketMap.get(data.patientId);
    if (patientSocketId) {
      // Notify only the specific patient
      io.to(patientSocketId).emit("incoming-call", {
        ...data,
        hostSocketId: socket.id,
      });
    }
  });

  socket.on("disconnect", () => {
    userSocketMap.forEach((value, key) => {
      if (value === socket.id) userSocketMap.delete(key);
    });
  });
});