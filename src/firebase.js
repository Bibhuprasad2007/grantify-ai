import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBl3m7dScdMdNaNIM91SKeTgxAOKLuJooI",
  authDomain: "edufinanceai.firebaseapp.com",
  projectId: "edufinanceai",
  storageBucket: "edufinanceai.firebasestorage.app",
  messagingSenderId: "204754376591",
  appId: "1:204754376591:web:5e058c799f9936c3115dfa"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
