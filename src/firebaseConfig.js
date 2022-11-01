// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBltbJNbl7ry3i2uoyRl3TlCNSmbZdu-Bg",
  authDomain: "promnight-4bbc8.firebaseapp.com",
  databaseURL: "https://promnight-4bbc8.firebaseio.com",
  projectId: "promnight-4bbc8",
  storageBucket: "promnight-4bbc8.appspot.com",
  messagingSenderId: "531659250736",
  appId: "1:531659250736:web:1b58b97ab5cc60abc461f5",
  measurementId: "G-7VSLT0YK8Y",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// if (getApps().length === 0) {
//   app = initializeApp(firebaseConfig);
// } else {
//   app = getApps()[0];
// }

export { auth };
