import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC2EsjDjbZG2Ycz3R4y2CYi0mBGHUIGNY",
  authDomain: "edutrack-pro-c00f7.firebaseapp.com",
  projectId: "edutrack-pro-c00f7",
  storageBucket: "edutrack-pro-c00f7.appspot.com",
  messagingSenderId: "997794547268",
  appId: "1:997794547268:web:48beb47705d249b7c7de11",
  measurementId: "G-1H93V31GN"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);