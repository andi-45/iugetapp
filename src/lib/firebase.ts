import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
    apiKey: "AIzaSyAl6HpFgh1qa3toIaExy9ctnN-mxcq3Gc4",
    authDomain: "onbush-df5af.firebaseapp.com",
    projectId: "onbush-df5af",
    storageBucket: "onbush-df5af.firebasestorage.app",
    messagingSenderId: "824666553967",
    appId: "1:824666553967:web:f620ee04187a6baad8979a"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
