import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA3VYFqmxbCVxvITyW32DCam-T1zmPWqz8",
  authDomain: "torvex-market.firebaseapp.com",
  projectId: "torvex-market",
  storageBucket: "torvex-market.firebasestorage.app",
  messagingSenderId: "833011729259",
  appId: "1:833011729259:web:29bae1c40f1d7ce503422e",
  measurementId: "G-P0B3JB8WLQ"
};

// initializeApp faqat bir marta chaqirilishi kerak
const app = initializeApp(firebaseConfig);
 export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;