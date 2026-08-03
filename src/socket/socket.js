// src/socket/socket.ts

import { io } from "socket.io-client";

// Uses VITE_SOCKET_URL when provided (set this in Vercel Project Settings ->
// Environment Variables to the URL of your deployed Socket.io server, e.g.
// https://your-socket-server.onrender.com). Falls back to localhost for local
// development. Vercel serverless functions cannot host a persistent
// Socket.io server, so this server must be deployed separately (Render,
// Railway, Fly.io, a VM, etc.).
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

export default socket;