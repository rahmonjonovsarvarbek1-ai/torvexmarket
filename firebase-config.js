

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 

    signInWithPopup, 
    signInWithRedirect, 
    getRedirectResult, 
    onAuthStateChanged,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDc-kYemWOasjaYyLc5x0TVDxe93Jls2z8",
    authDomain: "torvex-market.firebaseapp.com",
    projectId: "torvex-market",
    storageBucket: "torvex-market.firebasestorage.app",
    messagingSenderId: "999014412743",
    appId: "1:999014412743:web:1f061f466263c7b86769e2"
};

const app = initializeApp(firebaseConfig);

// Firestore sozlamasi (Ulanish xatolarini o'ldirish uchun)
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false
});

export const auth = getAuth(app);





export const googleProvider = new GoogleAuthProvider();


// SCRIPT.JS QIDIRAYOTGAN BARCHA FUNKSIYALARNI EKSPORT QILAMIZ
export { 
    signInWithPopup, 
    signInWithRedirect, 
    getRedirectResult, 
    onAuthStateChanged,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    signOut 
};