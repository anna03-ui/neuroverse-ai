import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import config from "../firebase-applet-config.json";

const firebaseConfig = {
  apiKey: "AIzaSyDK-9ZhV_ZD1gWfxDMQviGJsIoIixc9-WA",
  authDomain: "neuroverse-ai-eb3fd.firebaseapp.com",
  projectId: "neuroverse-ai-eb3fd",
  storageBucket: "neuroverse-ai-eb3fd.firebasestorage.app",
  messagingSenderId: "398836890239",
  appId: "1:398836890239:web:a4701800e0fbf717879d4a",
  measurementId: "G-Z5W7X43NBP"
};

// Initialize App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom Database ID
export const db = getFirestore(app, config.firestoreDatabaseId || "(default)");

// Initialize Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});
export { app };
