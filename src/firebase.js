// Back-compat re-exports.
// Many parts of the app import `db` from "@/firebase".
// The canonical Firebase initialization lives in `src/lib/firebase.ts`.
import app, { analytics, db, auth } from "./lib/firebase";

export { app, analytics, db, auth };