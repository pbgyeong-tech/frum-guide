
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ContentRenderer } from './components/ContentRenderer';
import { HANDBOOK_CONTENT } from './constants';
import { ContentType, SectionData, SubSection } from './types';
import { Menu } from 'lucide-react';
import { seedDB, saveContent } from './utils/db';
import { auth, loginWithGoogle, logout, trackScreenView, trackMenuClick } from './utils/firebase';
import { AdminRestoreButton } from './components/AdminRestoreButton';
import { SEO } from './components/SEO';
import firebase from 'firebase/compat/app';

// Helper: Find Data recursively
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

// MainLayout Component
const MainLayout: React.FC<{
  contentData: SectionData[];
  onUpdateContent: (id: ContentType, newSubSections: SubSection[]) => void;
  setIsDirty: (dirty: boolean) => void;
  isAdmin: boolean;
  user: firebase.User | null;
  onNavigate: (id: ContentType) => void;
}> = ({ contentData, onUpdateContent, setIsDirty, isAdmin, user, onNavigate }) => {
  const { sectionId } = useParams<{ sectionId: string }>();
  
  const isValidSection = (id: string | undefined): id is ContentType => {
    return Object.values(ContentType).includes(id as ContentType);
  };

  // Redirect invalid IDs to Welcome
  if (!isValidSection(sectionId)) {
    return <Navigate to={`/${ContentType.WELCOME}`} replace />;
  }

  const currentId = sectionId as ContentType;
  const activeData = findSection(contentData, currentId) || contentData[0];

  useEffect(() => {
    if (activeData) {
      trackScreenView(activeData.title, currentId);
    }
  }, [activeData, currentId]);

  const handleContentUpdate = (id: ContentType, newSubSections: SubSection[]) => {
    onUpdateContent(id, newSubSections);
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      <SEO 
        title={activeData.title}
        description={activeData.description || `${activeData.title}에 대한 상세 가이드입니다.`}
        image={activeData.heroImage}
        url={currentUrl}
      />
      <ContentRenderer
        key={`${currentId}-${contentData.find(s => s.id === currentId)?.subSections?.length || 0}-${user?.uid || 'guest'}`}
        data={activeData}
        allContent={contentData}
        onNavigate={onNavigate}
        onUpdateContent={handleContentUpdate}
        setIsDirty={setIsDirty}
        isAdmin={isAdmin}
        user={user}
      />
    </>
  );
};

// Root App Component
const App: React.FC = () => {
  const [contentData, setContentData] = useState<SectionData[]>(HANDBOOK_CONTENT);
  const [user, setUser] = useState<firebase.User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const mainContentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const hashPath = typeof window !== 'undefined' 
    ? window.location.hash.replace(/^#\//, '').split(/[?#]/)[0] 
    : '';

  const activeSectionId = Object.values(ContentType).includes(hashPath as ContentType) 
    ? (hashPath as ContentType) 
    : ContentType.WELCOME;

  const isAdmin = !!user;

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
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

  // 2. DB Load
  useEffect(() => {
    const loadData = async () => {
      try {
        const mergedData = await seedDB();
        setContentData(mergedData);
      } catch (e) {
        console.error("DB Load Error", e);
        setContentData(HANDBOOK_CONTENT);
      }
    };
    loadData();
  }, []);

  // 3. Before Unload Warning
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

  // 4. Scroll Reset
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
    setScrollProgress(0);
  }, [location.pathname]);

  const handleScroll = () => {
    if (mainContentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = mainContentRef.current;
      const total = scrollHeight - clientHeight;
      const progress = total > 0 ? (scrollTop / total) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  const handleNavigate = (id: ContentType) => {
    if (activeSectionId === id) return;
    
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

  const handleUpdateContent = async (id: ContentType, newSubSections: SubSection[]) => {
    if (!isAdmin) {
      alert("편집 권한이 없습니다.");
      return;
    }

    // Update Local State with fresh array reference
    setContentData(prevData => {
      const updated = prevData.map(section => {
        if (section.id === id) {
          return { ...section, subSections: [...newSubSections] };
        }
        return section;
      });
      
      // Persist the specific section to DB
      const target = updated.find(s => s.id === id);
      if (target) {
        saveContent(target).then(() => {
          setIsDirty(false);
        }).catch(err => {
          console.error("Save Error", err);
          alert("저장에 실패했습니다.");
        });
      }
      return updated;
    });
  };

  return (
    <div className="app-container">
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
        activeSection={activeSectionId}
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
        <style>{`
          @media (min-width: 769px) { .mobile-header { display: none !important; } }
        `}</style>
        
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
            onClick={() => {
              trackMenuClick('Logo (Mobile)');
              navigate('/');
              window.scrollTo(0, 0);
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

          <button onClick={() => setIsMobileMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <Menu color="white" />
          </button>
        </div>

        <Routes>
          <Route path="/" element={<Navigate to={`/${ContentType.WELCOME}`} replace />} />
          <Route path="/:sectionId" element={
            <MainLayout 
              contentData={contentData}
              onUpdateContent={handleUpdateContent}
              setIsDirty={setIsDirty}
              isAdmin={isAdmin}
              user={user}
              onNavigate={handleNavigate}
            />
          } />
          <Route path="*" element={<Navigate to={`/${ContentType.WELCOME}`} replace />} />
        </Routes>

        <AdminRestoreButton user={user} />
      </main>
    </div>
  );
};

export default App;
