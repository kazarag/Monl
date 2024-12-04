//firebase.js//
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from 'firebase/auth';
const firebaseConfig = {
  apiKey: "AIzaSyBTwtUDln1T6Vh1i-l8Tb_4EleMxHXP-Hw",
  authDomain: "monl-bfbb8.firebaseapp.com",
  databaseURL: "https://monl-bfbb8-default-rtdb.firebaseio.com",
  projectId: "monl-bfbb8",
  storageBucket: "monl-bfbb8.appspot.com",
  messagingSenderId: "413571630868",
  appId: "1:413571630868:web:b6c9a77fdfa0489506e401",
  measurementId: "G-8BSGYERT5P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
