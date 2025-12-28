// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAv0kp-L8f6fR7Opu4HApNOJ_bb4_TZ_OE",
  authDomain: "maltepe-gyos.firebaseapp.com",
  projectId: "maltepe-gyos",
  storageBucket: "maltepe-gyos.firebasestorage.app",
  messagingSenderId: "397069595508",
  appId: "1:397069595508:web:1bcaac4d38cc52d0147221"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);