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
let analytics: firebase.analytics.Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = firebase.analytics();
}

console.log(
  '[FirebaseConfig] projectId =',
  (firebase.app().options as any).projectId
);

export const db = firebase.firestore();
export const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// 여기가 수정된 부분입니다 (GA 사용자 식별 기능 추가)
export const loginWithGoogle = async () => {
  try {
    const result = await auth.signInWithPopup(googleProvider);
    const user = result.user;

    // GA에 사용자 정보 등록 (로그인 성공 시)
    if (user && analytics) {
      // 1. User ID 설정 (GA 보고서에서 개별 사용자 식별용)
      analytics.setUserId(user.uid);
      
      // 2. User Properties 설정 (이메일, 이름 등 필터링용)
      analytics.setUserProperties({
        username: user.displayName,
        email: user.email,
        company: 'FRUM' // 나중에 회사 사람만 필터링할 때 유용
      });
      
      console.log("[Analytics] User identified:", user.email);
    }

    return user;
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
    // 로그아웃 시 GA 추적 정보도 초기화하는 것이 좋음 (선택사항)
    if (analytics) {
      analytics.setUserId(null);
      analytics.setUserProperties({ username: null, email: null });
    }
    await auth.signOut();
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

// Generic Event Tracker
export const trackEvent = (eventName: string, params?: { [key: string]: any }) => {
  try {
    if (analytics) {
      analytics.logEvent(eventName, params);
      // 개발 중에만 로그 확인 (배포 시 주석 처리해도 됨)
      console.log(`[Analytics] ${eventName}:`, params);
    }
  } catch (e) {
    console.warn("[Analytics] Error logging event:", e);
  }
};

// Helper to track menu clicks
export const trackMenuClick = (menuName: string) => {
  trackEvent('select_content', {
    content_type: 'menu',
    item_id: menuName
  });
};

// Helper to track screen views (SPA Page Views)
export const trackScreenView = (screenName: string, screenClass: string) => {
  trackEvent('screen_view', {
    firebase_screen: screenName,
    firebase_screen_class: screenClass
  });
};

// Helper to track anchor (hash) views
export const trackAnchorView = (pageId: string, anchorId: string) => {
  trackEvent('view_content_anchor', {
    page: pageId,
    anchor_id: anchorId
  });
  
};