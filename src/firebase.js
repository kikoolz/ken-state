// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "ken-state.firebaseapp.com",
  projectId: "ken-state",
  storageBucket: "ken-state.firebasestorage.app",
  messagingSenderId: "363250945074",
  appId: "1:363250945074:web:732bd84b0d5cb72e09c02b",
  measurementId: "G-1C2PF9N4QW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the app instance
export { app };
