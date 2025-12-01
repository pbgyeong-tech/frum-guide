
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ContentRenderer } from './components/ContentRenderer';
import { HANDBOOK_CONTENT } from './constants';
import { ContentType, SectionData, SubSection } from './types';
import { Menu } from 'lucide-react';
import { seedDB, saveContent } from './utils/db';
import { trackMenuClick, auth, loginWithGoogle, logout } from './utils/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const App: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<ContentType>(ContentType.WELCOME);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  // DB에서 불러온 데이터를 관리하는 State
  const [contentData, setContentData] = useState<SectionData[]>(HANDBOOK_CONTENT);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Domain check
        if (currentUser.email && currentUser.email.endsWith('@frum.co.kr')) {
          setUser(currentUser);
        } else {
          // If domain doesn't match, sign out immediately
          alert("사내 계정(@frum.co.kr)만 편집 권한을 가질 수 있습니다.");
          logout();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Is Admin if user is logged in (domain check is already done above)
  const isAdmin = !!user;

  // 앱 시작 시 DB에서 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const dbData = await seedDB();
        
        // [수정] DB 데이터와 로컬 상수 데이터(HANDBOOK_CONTENT)를 병합
        // 새로운 메뉴(예: Expense)가 코드에는 추가되었지만 DB에 없을 경우를 처리
        const mergedData = HANDBOOK_CONTENT.map(localSection => {
          // DB에서 해당 ID를 가진 섹션을 찾음
          const dbSection = dbData.find(d => d.id === localSection.id);
          // DB에 있으면 DB 데이터를 사용(수정사항 반영), 없으면 로컬 초기 데이터를 사용
          return dbSection || localSection;
        });

        setContentData(mergedData);
      } catch (e) {
        console.error("DB Load Error", e);
        // DB 연결 실패 시 로컬 상수로 폴백
        setContentData(HANDBOOK_CONTENT);
      }
    };
    loadData();
  }, []);

  // Prevent browser close/refresh if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Standard for Chrome/modern browsers to trigger alert
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Safe Navigation Handler
  const handleNavigate = (id: ContentType) => {
    if (activeSectionId === id) return;
    
    if (isDirty) {
      if (window.confirm("저장하지 않은 내용이 있습니다. 정말 이동하시겠습니까?")) {
        setIsDirty(false);
        setActiveSectionId(id);
        setIsMobileMenuOpen(false);
        window.scrollTo(0, 0);
      }
    } else {
      setActiveSectionId(id);
      setIsMobileMenuOpen(false);
      window.scrollTo(0, 0);
    }
  };

  // 재귀적으로 섹션 데이터를 찾는 헬퍼 함수
  const findSection = (sections: SectionData[], id: ContentType): SectionData | undefined => {
    for (const section of sections) {
      if (section.id === id) return section;
      if (section.children) {
        const found = findSection(section.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const activeData = findSection(contentData, activeSectionId) || contentData[0];

  // ContentRenderer에서 수정/삭제/추가 발생 시 호출되는 핸들러
  const handleContentUpdate = async (newSubSections: SubSection[]) => {
    if (!isAdmin) {
      alert("편집 권한이 없습니다.");
      return;
    }

    // 1. React State 업데이트 (화면에 즉시 반영)
    const updatedContent = contentData.map(section => {
      if (section.id === activeSectionId) {
        return { ...section, subSections: newSubSections };
      }
      return section;
    });
    setContentData(updatedContent);

    // 2. Firestore DB에 저장
    const sectionToUpdate = updatedContent.find(s => s.id === activeSectionId);
    if (sectionToUpdate) {
      try {
        await saveContent(sectionToUpdate);
        setIsDirty(false); // 저장 성공 시 dirty 해제
      } catch (e) {
        console.error("Failed to save to DB", e);
        alert("저장에 실패했습니다. 네트워크 상태나 권한을 확인해주세요.");
      }
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSectionId}
        setActiveSection={handleNavigate}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        isAdmin={isAdmin}
        onLogin={loginWithGoogle}
        onLogout={logout}
        user={user}
      />

      {/* Main Content */}
      <main className="main-content">
        {/* Mobile Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(5,5,5,0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #333'
        }} className="mobile-header md-hidden">
          <style>{`
            @media (min-width: 769px) { .mobile-header { display: none !important; } }
          `}</style>
          
          <button 
            onClick={() => {
              trackMenuClick('Logo (Mobile)');
              handleNavigate(ContentType.WELCOME);
            }}
            style={{ 
              background: 'none', 
              border: 'none', 
              padding: 0, 
              cursor: 'pointer', 
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <img src="https://www.frum.co.kr/images/frum-logo-white.svg" alt="FRUM" height="20" />
          </button>

          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu color="white" />
          </button>
        </div>

        <div className="content-wrapper">
          <ContentRenderer
            key={activeSectionId} // Force remount on navigation to reset local edit state
            data={activeData}
            allContent={contentData}
            onNavigate={handleNavigate}
            onUpdateContent={handleContentUpdate}
            setIsDirty={setIsDirty}
            isAdmin={isAdmin}
            user={user}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
