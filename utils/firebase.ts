
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIt20kjrVkUFVn1f63ON58XjRTifQ3KcM",
  authDomain: "frum-onboarding-guide.firebaseapp.com",
  projectId: "frum-onboarding-guide",
  storageBucket: "frum-onboarding-guide.firebasestorage.app",
  messagingSenderId: "312195963654",
  appId: "1:312195963654:web:a0a9b2ab4cb79f0011dc87",
  measurementId: "G-Q50NVK8GZT"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
