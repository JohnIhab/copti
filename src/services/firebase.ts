// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKX3hqWttYnjfT-_xCSL8PHyKGO8fRUn8",
  authDomain: "cherch-8aa60.firebaseapp.com",
  projectId: "cherch-8aa60",
  storageBucket: "cherch-8aa60.firebasestorage.app",
  messagingSenderId: "762937902013",
  appId: "1:762937902013:web:2f37af13181777e55988d4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Auth functions
export { signInWithEmailAndPassword, signOut, onAuthStateChanged };

export default app;