
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

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
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Login failed:", error);
    if (error.code === 'auth/unauthorized-domain') {
      alert("도메인 인증 오류: 현재 앱이 실행 중인 도메인이 Firebase Console의 승인된 도메인 목록(Authorized domains)에 없습니다. 개발자에게 문의하세요.");
    } else if (error.code !== 'auth/popup-closed-by-user') {
      alert(`로그인 실패: ${error.message}`);
    }
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

// Helper to track menu clicks
export const trackMenuClick = (menuName: string) => {
  try {
    logEvent(analytics, 'select_content', {
      content_type: 'menu',
      item_id: menuName
    });
    console.log(`[Analytics] Tracked click: ${menuName}`);
  } catch (e) {
    console.warn("[Analytics] Failed to log event", e);
  }
};
