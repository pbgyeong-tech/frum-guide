import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ContentRenderer } from './components/ContentRenderer';
import { HANDBOOK_CONTENT } from './constants';
import { ContentType, SectionData, SubSection } from './types';
import { Menu } from 'lucide-react';
import { seedDB, saveContent } from './utils/db';
import { trackMenuClick, auth, loginWithGoogle, logout, trackScreenView } from './utils/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { AdminRestoreButton } from './components/AdminRestoreButton';
import { GeminiAssistant } from './components/GeminiAssistant';

const MainLayout: React.FC = () => {
  // URL Parameter Hook
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [contentData, setContentData] = useState<SectionData[]>(HANDBOOK_CONTENT);
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Validate ID from URL
  const isValidSection = (id: string | undefined): id is ContentType => {
    return Object.values(ContentType).includes(id as ContentType);
  };

  // Determine active section from URL or fallback to WELCOME
  const currentSectionId = isValidSection(sectionId) ? sectionId : ContentType.WELCOME;

  // Effect: Redirect to /welcome if URL contains invalid ID
  // Note: Root path '/' is handled by <Route> in App component, this handles invalid /:sectionId
  useEffect(() => {
    if (sectionId && !isValidSection(sectionId)) {
      navigate('/welcome', { replace: true });
    }
  }, [sectionId, navigate]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        if (currentUser.email && currentUser.email.endsWith('@frum.co.kr')) {
          setUser(currentUser);
        } else {
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

  const isAdmin = !!user;

  // DB Load
  useEffect(() => {
    const loadData = async () => {
      try {
        const dbData = await seedDB();
        const mergedData = HANDBOOK_CONTENT.map(localSection => {
          const dbSection = dbData.find(d => d.id === localSection.id);
          return dbSection || localSection;
        });
        setContentData(mergedData);
      } catch (e) {
        console.error("DB Load Error", e);
        setContentData(HANDBOOK_CONTENT);
      }
    };
    loadData();
  }, []);

  // Before Unload Warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Find Section Data Helper
  const findSection = (sections: SectionData[], id: string): SectionData | undefined => {
    for (const section of sections) {
      if (section.id === id) return section;
      if (section.children) {
        const found = findSection(section.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  // Resolve Active Data
  const activeData = findSection(contentData, currentSectionId) || findSection(contentData, ContentType.WELCOME) || contentData[0];

  // Side Effects for View (Scroll reset, Title, Analytics)
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
    setScrollProgress(0);
  }, [currentSectionId]);

  useEffect(() => {
    if (activeData) {
      document.title = `${activeData.title} | FRUM Onboarding`;
      trackScreenView(activeData.title, currentSectionId);
    }
  }, [activeData, currentSectionId]);

  const handleScroll = () => {
    if (mainContentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = mainContentRef.current;
      const total = scrollHeight - clientHeight;
      const progress = total > 0 ? (scrollTop / total) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  // Navigation Handler using useNavigate
  const handleNavigate = (id: ContentType) => {
    if (currentSectionId === id) return;
    
    const performNavigation = () => {
      navigate(`/${id}`);
      setIsMobileMenuOpen(false);
    };

    if (isDirty) {
      if (window.confirm("저장하지 않은 내용이 있습니다. 정말 이동하시겠습니까?")) {
        setIsDirty(false);
        performNavigation();
      }
    } else {
      performNavigation();
    }
  };

  const handleContentUpdate = async (newSubSections: SubSection[]) => {
    if (!isAdmin) {
      alert("편집 권한이 없습니다.");
      return;
    }
    const updatedContent = contentData.map(section => {
      if (section.id === currentSectionId) {
        return { ...section, subSections: newSubSections };
      }
      return section;
    });
    setContentData(updatedContent);

    const sectionToUpdate = updatedContent.find(s => s.id === currentSectionId);
    if (sectionToUpdate) {
      try {
        await saveContent(sectionToUpdate);
        setIsDirty(false);
      } catch (e) {
        console.error("Failed to save", e);
        alert("저장 실패");
      }
    }
  };

  return (
    <div className="app-container">
      {/* Scroll Progress Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${scrollProgress}%`,
        height: '3px',
        background: '#E70012',
        zIndex: 9999,
        transition: 'width 0.1s linear',
        boxShadow: '0 0 10px rgba(231,0,18,0.7)',
        pointerEvents: 'none'
      }} />

      <Sidebar
        activeSection={currentSectionId}
        setActiveSection={handleNavigate}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        isAdmin={isAdmin}
        onLogin={loginWithGoogle}
        onLogout={logout}
        user={user}
      />

      <main 
        className="main-content" 
        ref={mainContentRef} 
        onScroll={handleScroll}
      >
        {/* Mobile Header Style */}
        <style>{`
          @media (min-width: 769px) { .mobile-header { display: none !important; } }
        `}</style>
        
        {/* Mobile Header */}
        <div className="mobile-header" style={{
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
        }}>
          <button 
            onClick={() => handleNavigate(ContentType.WELCOME)}
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

          <button onClick={() => setIsMobileMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <Menu color="white" />
          </button>
        </div>

        <div className="content-wrapper">
          <ContentRenderer
            key={currentSectionId}
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

      <AdminRestoreButton user={user} />
      <GeminiAssistant />
    </div>
  );
};

// Main Router Configuration
const App: React.FC = () => {
  return (
    <Routes>
      {/* Root Path -> Redirect to /welcome */}
      <Route path="/" element={<Navigate to="/welcome" replace />} />
      
      {/* Dynamic Section Route */}
      <Route path="/:sectionId" element={<MainLayout />} />
      
      {/* Catch-all 404 handling -> Redirect to /welcome */}
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
};

export default App;