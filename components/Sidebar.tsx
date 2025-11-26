
import React from 'react';
import { HANDBOOK_CONTENT } from '../constants';
import { ContentType } from '../types';
import { X } from 'lucide-react';

interface SidebarProps {
  activeSection: ContentType;
  setActiveSection: (id: ContentType) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  setActiveSection,
  isMobileOpen,
  setIsMobileOpen
}) => {
  
  const guideEditSection = HANDBOOK_CONTENT.find(s => s.id === ContentType.GUIDE_EDIT);

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
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
          >
            <img src="https://www.frum.co.kr/images/frum-logo-white.svg" alt="FRUM" width="100" />
          </button>
          
          <button 
            onClick={() => setIsMobileOpen(false)} 
            style={{ color: 'white', display: isMobileOpen ? 'block' : 'none' }}
            className="md-hidden"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto' }}>
          {HANDBOOK_CONTENT
            .filter(section => section.id !== ContentType.WELCOME && section.id !== ContentType.GUIDE_EDIT)
            .map((section) => {
            const Icon = section.icon;
            
            // Check for nested children
            if (section.children && section.children.length > 0) {
              return (
                <div key={section.id}>
                  <div className="nav-group-title">
                    <Icon size={14} />
                    <span>{section.title}</span>
                  </div>
                  {section.children.map(child => {
                    const ChildIcon = child.icon;
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
                         {/* Optional child icon, or just text */}
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
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border-color)' }}>
           {/* Guide Edit Link */}
           {guideEditSection && (
             <button
               onClick={() => {
                 setActiveSection(guideEditSection.id);
                 setIsMobileOpen(false);
               }}
               className={`nav-button ${activeSection === guideEditSection.id ? 'active' : ''}`}
               style={{ color: '#666', fontSize: '12px', padding: '16px 32px' }}
             >
               <guideEditSection.icon size={16} />
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