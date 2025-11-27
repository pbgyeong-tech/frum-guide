import React from 'react';
import { ContentType, SectionData } from '../types';
import { X, ExternalLink, Utensils } from 'lucide-react'; // 🟢 아이콘 추가

interface SidebarProps {
  data: SectionData[];
  activeSection: ContentType;
  setActiveSection: (id: ContentType) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  data, 
  activeSection, 
  setActiveSection,
  isMobileOpen,
  setIsMobileOpen
}) => {
  
  const guideEditSection = data.find(s => s.id === ContentType.GUIDE_EDIT);
  const GuideIcon = guideEditSection ? guideEditSection.icon : null;

  return (
    <>
      <style>{`
        .sidebar-container {
          position: fixed;
          top: 0;
          left: 0;
          height: 100%;
          width: var(--sidebar-width);
          background: var(--bg-main);
          border-right: 1px solid var(--border-color);
          z-index: 90;
          display: flex;
          flex-direction: column;
          padding: 40px 0;
          transition: transform 0.4s var(--easing);
        }
        
        @media (max-width: 768px) {
          .sidebar-container {
            transform: translateX(${isMobileOpen ? '0' : '-100%'});
            box-shadow: 20px 0 50px rgba(0,0,0,0.5);
          }
          .mobile-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.8);
            z-index: 80;
            backdrop-filter: blur(5px);
            opacity: ${isMobileOpen ? 1 : 0};
            pointer-events: ${isMobileOpen ? 'auto' : 'none'};
            transition: opacity 0.4s;
          }
        }
        @media (min-width: 769px) {
           .sidebar-container {
             position: relative;
             transform: none !important;
           }
           .mobile-overlay { display: none; }
        }

        .nav-button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 32px;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          position: relative;
          text-decoration: none; /* 링크용 */
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
        }

        .nav-button:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.03);
        }

        .nav-button.active {
          color: var(--text-primary);
          background: rgba(255,255,255,0.05);
        }
        
        .nav-button.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--accent-color);
        }

        .nav-group-title {
          padding: 24px 32px 12px 32px;
          color: #666;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>

      {/* Mobile Overlay */}
      <div className="mobile-overlay" onClick={() => setIsMobileOpen(false)} />

      <aside className="sidebar-container">
        {/* Header / Logo */}
        <div style={{ padding: '0 32px 40px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={() => {
              setActiveSection(ContentType.WELCOME);
              setIsMobileOpen(false);
            }}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}
          >
            <img src="https://www.frum.co.kr/images/frum-logo-white.svg" alt="FRUM" width="100" />
            
            {/* 🟢 [수정됨] Onboarding Guide 뱃지 추가 */}
            <span style={{ 
              fontSize: '10px', 
              color: '#888', 
              background: 'rgba(255,255,255,0.08)', 
              padding: '2px 6px', 
              borderRadius: '4px', 
              letterSpacing: '0.05em',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              Onboarding Guide
            </span>
          </button>
          
          <button 
            onClick={() => setIsMobileOpen(false)} 
            style={{ color: 'white', display: isMobileOpen ? 'block' : 'none', background: 'none', border: 'none' }}
            className="md-hidden"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto' }}>
          {data
            .filter(section => section.id !== ContentType.WELCOME && section.id !== ContentType.GUIDE_EDIT)
            .map((section) => {
            const Icon = section.icon;
            
            if (section.children && section.children.length > 0) {
              return (
                <div key={section.id}>
                  <div className="nav-group-title">
                    <Icon size={14} />
                    <span>{section.title}</span>
                  </div>
                  {section.children.map(child => {
                    const isChildActive = activeSection === child.id;
                    return (
                      <button
                        key={child.id}
                        onClick={() => {
                          setActiveSection(child.id);
                          setIsMobileOpen(false);
                        }}
                        className={`nav-button ${isChildActive ? 'active' : ''}`}
                        style={{ paddingLeft: '56px' }}
                      >
                         <span>{child.title}</span>
                      </button>
                    );
                  })}
                </div>
              );
            }

            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  setIsMobileOpen(false);
                }}
                className={`nav-button ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>{section.title}</span>
              </button>
            );
          })}

          {/* 🟢 [수정됨] Lunch Solution 외부 링크 추가 */}
          <div style={{ margin: '20px 0', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
            <a 
              href="https://lunch-solution-center.vercel.app/" 
              target="_blank" 
              rel="noreferrer"
              className="nav-button"
              style={{ color: '#aaa' }} // 약간 다른 색상으로 구분
            >
              <Utensils size={18} />
              <span style={{ flex: 1 }}>Lunch Solution</span>
              <ExternalLink size={14} style={{ opacity: 0.5 }} />
            </a>
          </div>

        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border-color)' }}>
           {guideEditSection && GuideIcon && (
             <button
               onClick={() => {
                 setActiveSection(guideEditSection.id);
                 setIsMobileOpen(false);
               }}
               className={`nav-button ${activeSection === guideEditSection.id ? 'active' : ''}`}
               style={{ color: '#666', fontSize: '12px', padding: '16px 32px' }}
             >
               <GuideIcon size={16} />
               <span>{guideEditSection.title}</span>
             </button>
           )}
           
           <div style={{ padding: '20px 32px 32px 32px', fontSize: '10px', color: '#444', lineHeight: '1.5' }}>
             FRUM<br/>CREATIVE SOLUTION CENTER
           </div>
        </div>
      </aside>
    </>
  );
};