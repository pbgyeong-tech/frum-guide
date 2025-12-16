
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, AlertCircle, Link, Hash, Trophy, Calendar } from 'lucide-react';
import { SubSection } from '../types';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SubSection) => void;
  initialData?: SubSection;
  onDirty?: (dirty: boolean) => void;
}

// Helper to safely parse JSON
const safeJsonParse = (str: string | undefined) => {
  if (!str) return {};
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};

const ARCHIVE_SLUGS = ['aicontest', 'frum-dining', 'coffee-chat'];

export const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, initialData, onDirty }) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [link, setLink] = useState('');
  const [disclaimer, setDisclaimer] = useState('');

  // Contest/Archive Specific State
  const [isArchiveMode, setIsArchiveMode] = useState(false);
  const [contestData, setContestData] = useState<any>({});
  const [cYear, setCYear] = useState(2025);
  const [cMonth, setCMonth] = useState(new Date().getMonth() + 1);
  const [cTitle, setCTitle] = useState('');
  const [cWinner, setCWinner] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cImage, setCImage] = useState('');

  // Track if initial load is done to avoid setting dirty on open
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setSlug(initialData.slug || '');
        
        // Detect Archive Mode based on slug
        const isArchive = ARCHIVE_SLUGS.includes(initialData.slug || '');
        setIsArchiveMode(isArchive);

        let contentArr = Array.isArray(initialData.content) 
          ? [...initialData.content] 
          : [initialData.content];
        
        if (initialData.disclaimer) {
          setDisclaimer(initialData.disclaimer);
        } else {
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

        // Load Contest Data from codeBlock if in archive mode
        if (isArchive) {
           const parsedData = safeJsonParse(initialData.codeBlock);
           setContestData(parsedData);
           // Load current selection
           const y = 2025;
           const m = new Date().getMonth() + 1;
           setCYear(y);
           setCMonth(m);
           const currentEntry = parsedData[y]?.[m] || {};
           setCTitle(currentEntry.title || '');
           setCWinner(currentEntry.winner || '');
           setCDesc(currentEntry.description || '');
           setCImage(currentEntry.imageUrl || '');
        }

      } else {
        // Reset for new item
        setTitle('');
        setSlug('');
        setContent('');
        setMediaUrl('');
        setLink('');
        setDisclaimer('');
        setIsArchiveMode(false);
        setContestData({});
      }
      setLoaded(true);
      onDirty?.(false);
    } else {
      setLoaded(false);
    }
  }, [isOpen, initialData]);

  // Handle Input Changes
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    if (loaded && onDirty) onDirty(true);
  };

  const handleSlugChange = (value: string) => {
    const formatted = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    handleInputChange(setSlug, formatted);
    const isArchive = ARCHIVE_SLUGS.includes(formatted);
    setIsArchiveMode(isArchive);
  };

  const handleTitleBlur = () => {
    if (!slug.trim() && title.trim()) {
      const suggested = title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      handleInputChange(setSlug, suggested);
      const isArchive = ARCHIVE_SLUGS.includes(suggested);
      setIsArchiveMode(isArchive);
    }
  };

  // Contest Data Handling
  const handleYearMonthChange = (year: number, month: number) => {
      setCYear(year);
      setCMonth(month);
      const entry = contestData[year]?.[month] || {};
      setCTitle(entry.title || '');
      setCWinner(entry.winner || '');
      setCDesc(entry.description || '');
      setCImage(entry.imageUrl || '');
  };

  // Update local contest state (does not save to DB yet)
  const updateContestEntry = (field: string, value: string) => {
    if (field === 'title') setCTitle(value);
    if (field === 'winner') setCWinner(value);
    if (field === 'desc') setCDesc(value);
    if (field === 'image') setCImage(value);

    setContestData((prev: any) => {
        // Deep clone the year structure to ensure immutability
        const newYearData = { ...(prev[cYear] || {}) };
        const newMonthData = { ...(newYearData[cMonth] || {}) };
        
        // Update the specific field
        newMonthData[field === 'desc' ? 'description' : (field === 'image' ? 'imageUrl' : field)] = value;
        newYearData[cMonth] = newMonthData;
        
        return {
            ...prev,
            [cYear]: newYearData
        };
    });
    
    if (loaded && onDirty) onDirty(true);
  };

  if (!isOpen) return null;

  const handleSave = () => {
    const contentArray = content.split('\n').filter(line => line.trim() !== '');
    const uuid = initialData?.uuid || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2));

    let finalCodeBlock = initialData?.codeBlock;
    if (isArchiveMode) {
        // Prepare the final JSON. 
        const newData = { ...contestData };
        // Ensure structure exists
        if (!newData[cYear]) newData[cYear] = {};
        const newYearData = { ...newData[cYear] };
        
        // Update current month with current input values (allow saving empty strings if user cleared them)
        newYearData[cMonth] = {
            title: cTitle,
            winner: cWinner,
            description: cDesc,
            imageUrl: cImage
        };
        newData[cYear] = newYearData;
        
        finalCodeBlock = JSON.stringify(newData);
    }

    const newData: SubSection = {
      uuid,
      slug: slug.trim() || undefined,
      title,
      content: contentArray,
      imagePlaceholder: mediaUrl.trim() || undefined,
      link: link.trim() || undefined,
      disclaimer: disclaimer.trim() || undefined,
      codeBlock: finalCodeBlock,
      keywords: title.split(' ') 
    };

    onSave(newData);
    onDirty?.(false);
    onClose();
  };

  const handleClose = () => {
    onDirty?.(false);
    onClose();
  };

  const isValid = title.trim().length > 0 && slug.trim().length > 0;
  const showWinnerInput = slug === 'aicontest';

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
      <div onClick={handleClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }} />
      
      <div className="animate-enter" style={{
        position: 'relative',
        background: '#121212',
        border: '1px solid #333',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>{initialData ? 'Edit Content Block' : 'Add Content Block'}</h3>
          <button onClick={handleClose} style={{ color: '#666' }}><X size={24} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Title */}
          <div>
            <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem' }}>Title</label>
            <input type="text" value={title} onChange={(e) => handleInputChange(setTitle, e.target.value)} onBlur={handleTitleBlur} placeholder="Enter section title" style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', outline: 'none' }} />
          </div>

          {/* Slug */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E70012', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}><Hash size={14} /> URL ID (Slug) *</label>
            <div style={{ position: 'relative' }}>
              <input type="text" value={slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="e.g. wifi-setup (lowercase, numbers, hyphen only)" style={{ width: '100%', padding: '12px', background: 'rgba(231,0,18,0.05)', border: slug.trim() ? '1px solid rgba(231,0,18,0.3)' : '1px solid #E70012', borderRadius: '8px', color: '#fff', outline: 'none', fontFamily: 'monospace' }} />
            </div>
            {isArchiveMode && <p style={{ marginTop: '6px', fontSize: '0.8rem', color: '#4ade80' }}>✨ Archive/Contest Mode Active: Using extended calendar editor.</p>}
          </div>

          {/* Body Content */}
          <div>
            <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem' }}>Body Content (Description)</label>
            <textarea value={content} onChange={(e) => handleInputChange(setContent, e.target.value)} placeholder="Enter main description..." rows={6} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', outline: 'none', resize: 'vertical', lineHeight: '1.5' }} />
          </div>

          {/* CONTEST SPECIFIC UI */}
          {isArchiveMode && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(231,0,18,0.3)', borderRadius: '12px', padding: '20px' }}>
                  <h4 style={{ color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Trophy size={16} color="#E70012"/> Archive Entry Management</h4>
                  
                  {/* Selector */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <select 
                        value={cYear} 
                        onChange={(e) => handleYearMonthChange(Number(e.target.value), cMonth)}
                        style={{ background: '#000', color: '#fff', border: '1px solid #333', padding: '8px', borderRadius: '6px' }}
                      >
                          {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}년</option>)}
                      </select>
                      <select 
                        value={cMonth} 
                        onChange={(e) => handleYearMonthChange(cYear, Number(e.target.value))}
                        style={{ background: '#000', color: '#fff', border: '1px solid #333', padding: '8px', borderRadius: '6px' }}
                      >
                          {Array.from({length:12},(_,i)=>i+1).map(m => <option key={m} value={m}>{m}월</option>)}
                      </select>
                  </div>

                  <div style={{ display: 'grid', gap: '12px' }}>
                      <input type="text" placeholder="Entry Title (e.g. October Gathering)" value={cTitle} onChange={(e) => updateContestEntry('title', e.target.value)} style={{ width: '100%', padding: '10px', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} />
                      
                      {/* Only show Winner for aicontest */}
                      {showWinnerInput && (
                        <input type="text" placeholder="Winner Name (e.g. Creative Sol. Team)" value={cWinner} onChange={(e) => updateContestEntry('winner', e.target.value)} style={{ width: '100%', padding: '10px', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} />
                      )}

                      <input type="text" placeholder="Image URL" value={cImage} onChange={(e) => updateContestEntry('image', e.target.value)} style={{ width: '100%', padding: '10px', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} />
                      <textarea placeholder="Description (Supports Markdown)" rows={6} value={cDesc} onChange={(e) => updateContestEntry('desc', e.target.value)} style={{ width: '100%', padding: '10px', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} />
                  </div>
              </div>
          )}

          {/* Standard Fields (Hidden or less emphasized in contest mode if needed, but keeping for compatibility) */}
          {!isArchiveMode && (
            <>
              <div>
                <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem' }}>Media (Image/Video URL)</label>
                <input type="text" value={mediaUrl} onChange={(e) => handleInputChange(setMediaUrl, e.target.value)} placeholder="https://example.com/image.jpg" style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem' }}>External Link</label>
                <input type="text" value={link} onChange={(e) => handleInputChange(setLink, e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffaaaa', marginBottom: '8px', fontSize: '0.9rem' }}><AlertCircle size={14} /> Disclaimer / Note</label>
                <input type="text" value={disclaimer} onChange={(e) => handleInputChange(setDisclaimer, e.target.value)} placeholder="Important note or warning text" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid #444', borderRadius: '8px', color: '#ffaaaa', outline: 'none' }} />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={handleClose} style={{ padding: '10px 20px', borderRadius: '8px', color: '#ccc', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={!isValid} style={{ padding: '10px 24px', borderRadius: '8px', background: isValid ? '#E70012' : '#333', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: isValid ? 'pointer' : 'not-allowed', opacity: isValid ? 1 : 0.5 }}><Save size={18} /> Save Content</button>
        </div>
      </div>
    </div>,
    document.body
  );
};
