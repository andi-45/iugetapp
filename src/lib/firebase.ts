import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDhtgENbLR-VhC-1SFBUTL6bEes5sdv8Jc",
    authDomain: "luvvix-78a47.firebaseapp.com",
    projectId: "luvvix-78a47",
    storageBucket: "luvvix-78a47.firebasestorage.app",
    messagingSenderId: "316210140325",
    appId: "1:316210140325:web:cb1da5a4e84cff172a694c",
    measurementId: "G-X1HTGJKNZ5"
  
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
