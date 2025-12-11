import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, AlertCircle, Link, Hash } from 'lucide-react';
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
  const [slug, setSlug] = useState('');
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
        setSlug(initialData.slug || ''); // Load slug
        
        let contentArr = Array.isArray(initialData.content) 
          ? [...initialData.content] 
          : [initialData.content];
        
        // 1. Check for explicit disclaimer field first
        if (initialData.disclaimer) {
          setDisclaimer(initialData.disclaimer);
        } 
        // 2. Legacy fallback
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
        // Reset for new item
        setTitle('');
        setSlug('');
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

  // Helper: Slug Validation & Formatting
  // Only allows lowercase, numbers, and hyphens.
  const handleSlugChange = (value: string) => {
    const formatted = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    handleInputChange(setSlug, formatted);
  };

  // Helper: Auto-generate Slug from Title (if slug is empty)
  const handleTitleBlur = () => {
    if (!slug.trim() && title.trim()) {
      // Create a simple slug from title: 'My Title!' -> 'my-title'
      // 1. Trim whitespace
      // 2. Convert to lowercase
      // 3. Replace spaces with hyphens
      // 4. Remove special characters
      const suggested = title.trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      
      handleInputChange(setSlug, suggested);
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    const contentArray = content.split('\n').filter(line => line.trim() !== '');
    
    const uuid = initialData?.uuid || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2));

    const newData: SubSection = {
      uuid,
      slug: slug.trim() || undefined,
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

  // Validation for save button
  const isValid = title.trim().length > 0 && slug.trim().length > 0;

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
          alignItems: 'center',
          flexShrink: 0
        }}>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>
            {initialData ? 'Edit Content Block' : 'Add Content Block'}
          </h3>
          <button onClick={handleClose} style={{ color: '#666' }}><X size={24} /></button>
        </div>

        {/* Body */}
        <div style={{ 
            padding: '24px', 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px',
            flex: 1, // Ensure this consumes available space for scrolling
            minHeight: 0
        }}>
          
          {/* Title */}
          <div>
            <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem' }}>Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => handleInputChange(setTitle, e.target.value)}
              onBlur={handleTitleBlur} // Auto-suggest slug on blur
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

          {/* Slug (URL ID) */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E70012', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
              <Hash size={14} /> URL ID (Slug) *
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="e.g. wifi-setup (lowercase, numbers, hyphen only)"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(231,0,18,0.05)',
                  border: slug.trim() ? '1px solid rgba(231,0,18,0.3)' : '1px solid #E70012', // Highlight error if empty
                  borderRadius: '8px',
                  color: '#fff',
                  outline: 'none',
                  fontFamily: 'monospace'
                }}
              />
              {!slug.trim() && (
                 <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#E70012', fontSize: '0.8rem' }}>Required</span>
              )}
            </div>
            <p style={{ marginTop: '6px', fontSize: '0.8rem', color: '#666' }}>
              Used for URL anchor links. Example: <code>.../company#wifi-setup</code>
            </p>
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
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffaaaa', marginBottom: '8px', fontSize: '0.9rem' }}>
              <AlertCircle size={14} /> Disclaimer / Note
            </label>
            <textarea 
              value={disclaimer}
              onChange={(e) => handleInputChange(setDisclaimer, e.target.value)}
              placeholder="Important note or warning text"
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid #444',
                borderRadius: '8px',
                color: '#ffaaaa',
                outline: 'none',
                resize: 'vertical',
                lineHeight: '1.5'
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
          gap: '12px',
          flexShrink: 0
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
            disabled={!isValid}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              background: isValid ? '#E70012' : '#333',
              color: '#fff',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: isValid ? 'pointer' : 'not-allowed',
              opacity: isValid ? 1 : 0.5
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