
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, AlertCircle } from 'lucide-react';
import { SubSection } from '../types';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SubSection) => void;
  initialData?: SubSection;
  onDirty?: (dirty: boolean) => void;
}

export const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, initialData, onDirty }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [link, setLink] = useState('');
  const [disclaimer, setDisclaimer] = useState('');

  // Track if initial load is done to avoid setting dirty on open
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        
        let contentArr = Array.isArray(initialData.content) 
          ? [...initialData.content] 
          : [initialData.content];
        
        // 1. Check for explicit disclaimer field first
        if (initialData.disclaimer) {
          setDisclaimer(initialData.disclaimer);
        } 
        // 2. Legacy fallback: Check for '👉' in content (if data hasn't been migrated yet)
        else {
          const disclaimerIdx = contentArr.findIndex(c => c.trim().startsWith('👉'));
          if (disclaimerIdx !== -1) {
            setDisclaimer(contentArr[disclaimerIdx].replace(/^👉\s*/, ''));
            contentArr.splice(disclaimerIdx, 1);
          } else {
            setDisclaimer('');
          }
        }

        setContent(contentArr.join('\n'));
        setMediaUrl(initialData.imagePlaceholder || '');
        setLink(initialData.link || '');
      } else {
        setTitle('');
        setContent('');
        setMediaUrl('');
        setLink('');
        setDisclaimer('');
      }
      setLoaded(true);
      // Reset dirty status on open
      onDirty?.(false);
    } else {
      setLoaded(false);
    }
  }, [isOpen, initialData]);

  // Handle Input Changes
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (loaded && onDirty) {
      onDirty(true);
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    const contentArray = content.split('\n').filter(line => line.trim() !== '');
    
    // NOTE: Disclaimer is now saved as a separate field, NOT appended to content with '👉'.
    
    const uuid = initialData?.uuid || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2));

    const newData: SubSection = {
      uuid,
      title,
      content: contentArray,
      imagePlaceholder: mediaUrl.trim() || undefined,
      link: link.trim() || undefined,
      disclaimer: disclaimer.trim() || undefined,
      keywords: title.split(' ') 
    };

    onSave(newData);
    onDirty?.(false); // Clear dirty on save
    onClose();
  };

  const handleClose = () => {
    onDirty?.(false); // Clear dirty on close/cancel
    onClose();
  };

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
      <div 
        onClick={handleClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(5px)'
        }}
      />
      
      <div className="animate-enter" style={{
        position: 'relative',
        background: '#121212',
        border: '1px solid #333',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>
            {initialData ? 'Edit Content Block' : 'Add Content Block'}
          </h3>
          <button onClick={handleClose} style={{ color: '#666' }}><X size={24} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Title */}
          <div>
            <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem' }}>Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => handleInputChange(setTitle, e.target.value)}
              placeholder="Enter section title"
              style={{
                width: '100%',
                padding: '12px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                outline: 'none'
              }}
            />
          </div>

          {/* Content */}
          <div>
            <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem' }}>Body Content</label>
            <textarea 
              value={content}
              onChange={(e) => handleInputChange(setContent, e.target.value)}
              placeholder="Enter main text content... (Use • for bullets, - for sub-bullets)"
              rows={6}
              style={{
                width: '100%',
                padding: '12px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                outline: 'none',
                resize: 'vertical',
                lineHeight: '1.5'
              }}
            />
          </div>

          {/* Media URL */}
          <div>
            <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem' }}>Media (Image/Video URL)</label>
            <input 
              type="text" 
              value={mediaUrl}
              onChange={(e) => handleInputChange(setMediaUrl, e.target.value)}
              placeholder="https://example.com/image.jpg"
              style={{
                width: '100%',
                padding: '12px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                outline: 'none'
              }}
            />
          </div>

          {/* External Link */}
          <div>
            <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem' }}>External Link</label>
            <input 
              type="text" 
              value={link}
              onChange={(e) => handleInputChange(setLink, e.target.value)}
              placeholder="https://..."
              style={{
                width: '100%',
                padding: '12px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                outline: 'none'
              }}
            />
          </div>

          {/* Disclaimer */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E70012', marginBottom: '8px', fontSize: '0.9rem' }}>
              <AlertCircle size={14} /> Disclaimer / Note
            </label>
            <input 
              type="text" 
              value={disclaimer}
              onChange={(e) => handleInputChange(setDisclaimer, e.target.value)}
              placeholder="Important note or warning text"
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(231,0,18,0.05)',
                border: '1px solid rgba(231,0,18,0.3)',
                borderRadius: '8px',
                color: '#ffaaaa',
                outline: 'none'
              }}
            />
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #333',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button 
            onClick={handleClose}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              color: '#ccc',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!title.trim()}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              background: title.trim() ? '#E70012' : '#333',
              color: '#fff',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: title.trim() ? 'pointer' : 'not-allowed',
              opacity: title.trim() ? 1 : 0.5
            }}
          >
            <Save size={18} />
            Save Content
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
