
import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "삭제 확인", 
  message = "선택한 콘텐츠 블록을 정말 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다." 
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(5px)'
        }}
      />
      
      {/* Modal Content */}
      <div className="animate-enter" style={{
        position: 'relative',
        background: '#121212',
        border: '1px solid #333',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            background: 'rgba(231,0,18,0.1)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: '#E70012'
          }}>
            <AlertTriangle size={24} />
          </div>
          
          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
            {title}
          </h3>
          
          <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div style={{ 
          display: 'flex', 
          borderTop: '1px solid #333'
        }}>
          <button 
            onClick={onClose}
            style={{
              flex: 1,
              padding: '16px',
              background: 'transparent',
              color: '#ccc',
              fontWeight: 600,
              cursor: 'pointer',
              borderRight: '1px solid #333',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            취소
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              flex: 1,
              padding: '16px',
              background: 'rgba(231,0,18,0.1)',
              color: '#ff5555',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(231,0,18,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(231,0,18,0.1)'}
          >
            삭제
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};