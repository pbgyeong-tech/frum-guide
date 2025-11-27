// firebase.ts (위치는 App.tsx 와 같은 곳)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 👇 아까 복사해둔 본인의 키값들을 넣어주세요!
const firebaseConfig = {
    apiKey: "AIzaSyBYgoSMNixrSwARPh3uhbPARE91eZHO48E",
    authDomain: "frum-onboarding-guide.firebaseapp.com",
    projectId: "frum-onboarding-guide",
    storageBucket: "frum-onboarding-guide.firebasestorage.app",
    messagingSenderId: "312195963654",
    appId: "1:312195963654:web:a0a9b2ab4cb79f0011dc87",
    measurementId: "G-Q50NVK8GZT"            
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// DB(Firestore) 내보내기
export const db = getFirestore(app);