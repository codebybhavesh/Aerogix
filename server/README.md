# Standalone Socket.io signaling server

`server.ts` is a **separate Node.js process** used for call signaling
(`initiate-call` / `incoming-call` events). It is not part of the Vite
frontend build and is **not deployed to Vercel** — Vercel's serverless
functions do not support the long-lived, stateful connections that
Socket.io needs.

To use call notifications in production:

1. Deploy `server.ts` to a platform that supports long-running Node
   processes, e.g. Render, Railway, Fly.io, or a small VM.
   ```bash
   npm install socket.io cors
   npx ts-node server.ts
   ```
2. Update the CORS `origin` in `server.ts` to your deployed frontend URL
   (currently set to `http://localhost:3000` for local development).
3. In your Vercel project settings, add an environment variable
   `VITE_SOCKET_URL` pointing at the deployed server's URL
   (e.g. `https://your-socket-server.onrender.com`).

`server.example.js` is a rough sketch/snippet (not a runnable file) kept
for reference only.
