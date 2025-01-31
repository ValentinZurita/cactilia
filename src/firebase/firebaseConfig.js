// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQOrKPUJtkt0uZqGynhS-vmqQu5y96iCA",
  authDomain: "cactilia-3678a.firebaseapp.com",
  projectId: "cactilia-3678a",
  storageBucket: "cactilia-3678a.firebasestorage.app",
  messagingSenderId: "605518414596",
  appId: "1:605518414596:web:df5c85d4476d12eff68651",
  measurementId: "G-Q1YGR7LE2L"
};

// Initialize Firebase
export const FirebaseApp = initializeApp(firebaseConfig);
export const FirebaseAuth = getAuth(FirebaseApp);
export const FirebaseDB = getFirestore(FirebaseApp);