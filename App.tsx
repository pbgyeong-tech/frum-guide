import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ContentRenderer } from './components/ContentRenderer';
import { ContentType, SectionData } from './types';
import { Menu } from 'lucide-react';
import { useData } from './context/DataContext';

const App: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<ContentType>(ContentType.WELCOME);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data } = useData();

  // Helper to find data recursively
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

  // Find data for active section
  const activeData = findSection(data, activeSectionId) || data[0];

  return (
    <div className="app-container">
      {/* Sidebar - data prop 전달 */}
      <Sidebar
        data={data} 
        activeSection={activeSectionId}
        setActiveSection={setActiveSectionId}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <main className="main-content">
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
          
          {/* 🟢 [수정됨] 모바일 로고 클릭 시 홈으로 이동 */}
          <button 
            onClick={() => {
              setActiveSectionId(ContentType.WELCOME);
              setIsMobileMenuOpen(false);
            }}
            style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <img src="https://www.frum.co.kr/images/frum-logo-white.svg" alt="FRUM" height="20" />
            {/* 모바일에서도 뱃지를 보여주고 싶다면 아래 주석 해제 */}
            {/* <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', color: '#aaa', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>Guide</span> */}
          </button>

          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu color="white" />
          </button>
        </div>

        <div className="content-wrapper">
          <ContentRenderer
            data={activeData}
            onNavigate={setActiveSectionId}
          />
        </div>
      </main>
    </div>
  );
};

export default App;