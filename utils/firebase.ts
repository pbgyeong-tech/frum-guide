import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDIt20kjrVkUFVn1f63ON58XjRTifQ3KcM",
  authDomain: "frum-onboarding-guide.firebaseapp.com",
  projectId: "frum-onboarding-guide",
  storageBucket: "frum-onboarding-guide.firebasestorage.app",
  messagingSenderId: "312195963654",
  appId: "1:312195963654:web:a0a9b2ab4cb79f0011dc87",
  measurementId: "G-Q50NVK8GZT"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = firebase.app();
let analytics;
if (typeof window !== 'undefined') {
  analytics = firebase.analytics();
}

export const db = firebase.firestore();
export const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await auth.signInWithPopup(googleProvider);
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
    await auth.signOut();
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

// Helper to track menu clicks
export const trackMenuClick = (menuName: string) => {
  try {
    if (analytics) {
      analytics.logEvent('select_content', {
        content_type: 'menu',
        item_id: menuName
      });
    }
    console.log(`[Analytics] Tracked click: ${menuName}`);
  } catch (e) {
    console.warn("[Analytics] Failed to log event", e);
  }
};

// Helper to track screen views (SPA Page Views)
export const trackScreenView = (screenName: string, screenClass: string) => {
  try {
    if (analytics) {
      analytics.logEvent('screen_view', {
        firebase_screen: screenName,
        firebase_screen_class: screenClass
      });
    }
  } catch (e) {
    console.warn("[Analytics] Failed to log screen_view", e);
  }
};