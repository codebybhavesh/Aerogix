import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBoY3LEVjXTXlRJaJnTXMwgYBv7g6pUx0w",
    authDomain: "aerogix-e4613.firebaseapp.com",
    projectId: "aerogix-e4613",
    storageBucket: "aerogix-e4613.firebasestorage.app",
    messagingSenderId: "74882456106",
    appId: "1:74882456106:web:cf628c403e996c878a0153",
    measurementId: "G-RPPR97GEP2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence for Firestore
if (typeof window !== "undefined") {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a time
            console.warn('Firestore persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
            // Browser doesn't support persistence
            console.warn('Firestore persistence not supported by this browser');
        }
    });
}

export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
