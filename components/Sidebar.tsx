
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
  
  const sidebarStyles = {
    wrapper: `
      position: fixed;
      top: 0;
      left: 0;
      height: 100%;
      width: var(--sidebar-width);
      background: var(--bg-main);
      border-right: 1px solid var(--border-color);
      z-index: 100;
      display: flex;
      flex-direction: column;
      transition: transform 0.5s var(--easing);
    `,
    // In CSS file we would handle media queries, here we do inline for dynamic state
    transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
    // We'll override the transform for desktop in the style tag below
  };

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
          {HANDBOOK_CONTENT.filter(section => section.id !== ContentType.WELCOME).map((section) => {
            const Icon = section.icon;
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
        <div style={{ padding: '32px', borderTop: '1px solid var(--border-color)' }}>
           <div style={{ fontSize: '10px', color: '#888', lineHeight: '1.5' }}>
             FRUM<br/>CREATIVE SOLUTION CENTER
           </div>
        </div>
      </aside>
    </>
  );
};
