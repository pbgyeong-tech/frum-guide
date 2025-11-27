import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ContentRenderer } from './components/ContentRenderer';
import { ContentType, SectionData } from './types';
import { Menu } from 'lucide-react';
import { useData } from './context/DataContext'; // 변경됨

const App: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<ContentType>(ContentType.WELCOME);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data } = useData(); // 변경됨: 이제 데이터를 Context에서 가져옴

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
          <img src="https://www.frum.co.kr/images/frum-logo-white.svg" alt="FRUM" height="20" />
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