
import React from 'react';
import { ContentType } from '../types';
import { HANDBOOK_CONTENT } from '../constants';
import { LogOut, X, ExternalLink } from 'lucide-react';
import firebase from 'firebase/compat/app';
import { trackEvent } from '../utils/firebase';

interface SidebarProps {
  activeSection: ContentType;
  setActiveSection: (id: ContentType) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isAdmin: boolean;
  onLogin: () => void;
  onLogout: () => void;
  user: firebase.User | null;
}

// 6. Magnetic Button Component - Motion Removed (Simplified to standard interaction)
const NavItem: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  target?: string;
  rel?: string;
}> = ({ children, onClick, className, style, href, ...props }) => {
  const Component = href ? 'a' : 'button';

  return (
    // @ts-ignore
    <Component
      className={className}
      onClick={onClick}
      href={href}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  setActiveSection, 
  isMobileOpen, 
  setIsMobileOpen,
  isAdmin, 
  onLogin, 
  onLogout 
}) => {
  return (
    <>
      {/* 모바일용 오버레이 (배경 어둡게) */}
      <div 
        className={`mobile-overlay ${isMobileOpen ? 'active' : ''}`} 
        onClick={() => setIsMobileOpen(false)}
      />

      <aside className={`sidebar-container ${isMobileOpen ? 'open' : ''}`}>
        {/* 모바일 닫기 버튼 */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', display: isMobileOpen ? 'block' : 'none', zIndex: 101 }}>
          <button className="nav-button" onClick={() => setIsMobileOpen(false)} style={{ color: '#fff', width: 'auto', padding: '8px' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '40px 32px', marginBottom: '20px' }}>
          <img 
            src="https://www.frum.co.kr/images/frum-logo-white.svg" 
            alt="FRUM" 
            style={{ height: '24px', cursor: 'pointer' }}
            onClick={() => { 
              trackEvent('click_menu', { menu_name: 'Logo', menu_id: 'logo' });
              setActiveSection(ContentType.WELCOME); 
              setIsMobileOpen(false); 
            }}
          />
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {HANDBOOK_CONTENT.map((section) => {
            if (section.id === ContentType.WELCOME) return null;
            const isActive = activeSection === section.id;
            const Icon = section.icon;
            return (
              <NavItem
                key={section.id}
                className={`nav-button ${isActive ? 'active' : ''}`}
                onClick={() => { 
                  trackEvent('click_menu', { menu_name: section.title, menu_id: section.id });
                  setActiveSection(section.id); 
                  setIsMobileOpen(false); 
                }}
              >
                <Icon size={18} />
                <span className={isActive ? 'font-mono' : ''} style={{ letterSpacing: isActive ? '-0.02em' : 'normal' }}>
                  {section.title}
                </span>
              </NavItem>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <NavItem 
            href="https://lunch-solution-center.vercel.app/" 
            target="_blank" 
            rel="noreferrer"
            className="nav-button"
            style={{ textDecoration: 'none' }}
            onClick={() => {
              trackEvent('click_outbound', { 
                link_name: 'Lunch Solution Center', 
                link_url: 'https://lunch-solution-center.vercel.app/',
                location: 'sidebar' 
              });
            }}
          >
            <ExternalLink size={18} />
            Lunch Solution Center
          </NavItem>
          
          {isAdmin ? (
            <NavItem 
              className="nav-button"
              onClick={onLogout} 
              style={{ color: '#666' }}
            >
              <LogOut size={18} /> Admin Logout
            </NavItem>
          ) : (
            <NavItem 
              className="nav-button"
              onClick={() => {
                trackEvent('click_login', { method: 'google_popup' });
                onLogin();
              }} 
              style={{ color: '#666' }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#666' }}></div> Admin Login
            </NavItem>
          )}
        </div>
      </aside>
    </>
  );
};
