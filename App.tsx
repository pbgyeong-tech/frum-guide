
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ContentRenderer } from './components/ContentRenderer';
import { HANDBOOK_CONTENT } from './constants';
import { ContentType, SectionData, SubSection } from './types';
import { Menu } from 'lucide-react';
import { seedDB, saveContent } from './utils/db';

const App: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<ContentType>(ContentType.WELCOME);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Lift content to state to allow editing
  const [contentData, setContentData] = useState<SectionData[]>(HANDBOOK_CONTENT);

  // Load data from DB on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await seedDB();
        // Restore original sort order based on constants
        const orderMap = HANDBOOK_CONTENT.map(c => c.id);
        const sortedData = data.sort((a, b) => orderMap.indexOf(a.id) - orderMap.indexOf(b.id));
        setContentData(sortedData);
      } catch (e) {
        console.error("DB Load Error", e);
        setContentData(HANDBOOK_CONTENT);
      }
    };
    loadData();
  }, []);

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
  const activeData = findSection(contentData, activeSectionId) || contentData[0];

  // Handler for content updates
  const handleContentUpdate = async (newSubSections: SubSection[]) => {
    const updatedContent = contentData.map(section => {
      if (section.id === activeSectionId) {
        return { ...section, subSections: newSubSections };
      }
      return section;
    });

    // Optimistic UI update
    setContentData(updatedContent);

    // Save to DB
    const sectionToUpdate = updatedContent.find(s => s.id === activeSectionId);
    if (sectionToUpdate) {
      try {
        await saveContent(sectionToUpdate);
      } catch (e) {
        console.error("Failed to save to DB", e);
        alert("저장에 실패했습니다.");
      }
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSectionId}
        setActiveSection={setActiveSectionId}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
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
          <img src="https://www.frum.co.kr/images/frum-logo-white.svg" alt="FRUM" height="20" />
          <button onClick={() => setIsMobileMenuOpen(true)}>
            <Menu color="white" />
          </button>
        </div>

        <div className="content-wrapper">
          <ContentRenderer
            data={activeData}
            allContent={contentData}
            onNavigate={setActiveSectionId}
            onUpdateContent={handleContentUpdate}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
