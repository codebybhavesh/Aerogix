import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBoY3LEVjXTXlRJaJnTXMwgYBv7g6pUx0w",
    authDomain: "aerogix-e4613.firebaseapp.com",
    projectId: "aerogix-e4613",
    storageBucket: "aerogix-e4613.firebasestorage.app",
    messagingSenderId: "74882456106",
    appId: "1:74882456106:web:cf628c403e996c878a0153",
    measurementId: "G-RPPR97GEP2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };