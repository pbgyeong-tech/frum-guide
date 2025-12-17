
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, AlertCircle, Hash, Trophy, Bold, Italic, Underline, List, ListOrdered, Quote, Code, Terminal } from 'lucide-react';
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

// --- List Logic Helpers ---
const ROMAN_VALS = [10, 9, 5, 4, 1];
const ROMAN_KEYS = ["x", "ix", "v", "iv", "i"];
const toRoman = (n: number) => {
    let res = "";
    let num = n;
    for(let i=0; i<ROMAN_VALS.length; i++) {
        while(num >= ROMAN_VALS[i]) { res += ROMAN_KEYS[i]; num -= ROMAN_VALS[i]; }
    }
    return res || "i";
};
const fromRoman = (s: string) => {
    const map: Record<string, number> = {i:1, ii:2, iii:3, iv:4, v:5, vi:6, vii:7, viii:8, ix:9, x:10};
    return map[s.toLowerCase()] || 1;
};
const nextChar = (c: string) => String.fromCharCode(c.charCodeAt(0) + 1);

const getLineListInfo = (line: string) => {
    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1].length : 0;
    // 2 spaces = 1 indent level
    const level = Math.floor(indent / 2);

    // Unordered
    const unMatch = line.match(/^(\s*)([-*•])\s/);
    if (unMatch) return { type: 'unordered', val: unMatch[2], level, prefix: unMatch[0] };

    // Strict Hierarchy Check based on regex and levels
    // Level 0: Numeric (1.)
    // Level 1: Alpha (a.)
    // Level 2: Roman (i.)
    
    // Check specific markers
    const numMatch = line.match(/^(\s*)(\d+)\.\s/);
    const alphaMatch = line.match(/^(\s*)([a-z])\.\s/);
    const romanMatch = line.match(/^(\s*)([ivx]+)\.\s/);

    if (numMatch) return { type: 'numeric', val: parseInt(numMatch[2], 10), level, prefix: numMatch[0] };
    
    // Roman check requires caution (conflicts with 'i', 'v', 'x' in alpha)
    // We prioritize Roman if level >= 2 OR if it matches Roman-only patterns like ii, iii, iv
    if (romanMatch) {
       const str = romanMatch[2];
       const isMultiCharRoman = str.length > 1; // ii, iii, iv, vi... clearly roman
       if (level >= 2 || isMultiCharRoman || str === 'i') { 
          // Note: 'i' at level 0/1 is ambiguous, but if it's 'i.' it usually starts a roman list or is just item 'i' of alpha.
          // However, assuming hierarchy 1 -> a -> i:
          // 'i' at level 2 is definitely Roman.
          // 'i' at level 1 is 'h'->'i' (Alpha).
          // We'll let the level guide us.
          if (level >= 2) return { type: 'roman', val: fromRoman(str), level, prefix: romanMatch[0] };
       }
    }

    if (alphaMatch) return { type: 'alpha', val: alphaMatch[2], level, prefix: alphaMatch[0] };

    return null;
};

// Toolbar Button Component
const ToolbarBtn = ({ icon: Icon, onClick, title }: { icon: any, onClick: () => void, title: string }) => (
  <button 
    onClick={onClick}
    title={title}
    type="button"
    style={{ 
      background: 'transparent', 
      border: 'none', 
      color: '#aaa', 
      cursor: 'pointer', 
      padding: '6px', 
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.background = 'transparent'; }}
  >
    <Icon size={16} />
  </button>
);

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

  // Ref for Body Content Textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
          // Legacy support: if disclaimer was inside content prefixed with 👉
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

  // --- Toolbar Logic ---
  const insertFormat = (startTag: string, endTag: string = '') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const currentText = content;
    
    const before = currentText.substring(0, start);
    const selected = currentText.substring(start, end);
    const after = currentText.substring(end);
    
    const newText = before + startTag + selected + endTag + after;
    
    handleInputChange(setContent, newText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        // Select the text inside the tags
        textareaRef.current.setSelectionRange(start + startTag.length, end + startTag.length);
      }
    }, 0);
  };

  const insertLinePrefix = (prefix: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const currentText = content;
    
    // Find the beginning of the current line
    const lineStart = currentText.lastIndexOf('\n', start - 1) + 1;
    
    const before = currentText.substring(0, lineStart);
    const after = currentText.substring(lineStart);
    
    const newText = before + prefix + after;
    
    handleInputChange(setContent, newText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = start + prefix.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // --- Smart List & Editing Logic (Slack-like) ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;

    const target = e.currentTarget;
    const { selectionStart, selectionEnd, value } = target;

    // Line detection
    const currentLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const nextNewLine = value.indexOf('\n', selectionStart);
    const currentLineEnd = nextNewLine === -1 ? value.length : nextNewLine;
    const currentLine = value.substring(currentLineStart, currentLineEnd);
    const textBeforeCursor = value.substring(currentLineStart, selectionStart);

    // List Info Detection
    const listInfo = getLineListInfo(currentLine);

    // --- ENTER Key ---
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter = Normal line break (no list logic)
        return;
      }

      if (listInfo) {
        // We are in a list
        e.preventDefault();

        // Check if item is logically empty (e.g., "1. " or "  a. ")
        const contentAfterMarker = currentLine.substring(listInfo.prefix.length).trim();
        
        if (!contentAfterMarker && selectionStart === currentLineEnd) {
          // Exit list: Remove the marker
          const newValue = value.substring(0, currentLineStart) + value.substring(currentLineEnd);
          handleInputChange(setContent, newValue);
          requestAnimationFrame(() => {
            target.selectionStart = target.selectionEnd = currentLineStart;
          });
          return;
        }

        // Continue list: Calculate next marker
        let nextMarker = '';
        const indentStr = ' '.repeat(listInfo.level * 2);

        if (listInfo.type === 'numeric') {
          nextMarker = `${(listInfo.val as number) + 1}. `;
        } else if (listInfo.type === 'alpha') {
          nextMarker = `${nextChar(listInfo.val as string)}. `;
        } else if (listInfo.type === 'roman') {
          nextMarker = `${toRoman((listInfo.val as number) + 1)}. `;
        } else if (listInfo.type === 'unordered') {
          nextMarker = `${listInfo.val} `;
        }

        const insertion = `\n${indentStr}${nextMarker}`;
        const newValue = value.substring(0, selectionStart) + insertion + value.substring(selectionEnd);
        handleInputChange(setContent, newValue);
        requestAnimationFrame(() => {
            target.selectionStart = target.selectionEnd = selectionStart + insertion.length;
        });
        return;
      }
    }

    // --- TAB Key (Indent/Outdent) ---
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const allLines = value.split('\n');
      const lineIndex = value.substring(0, currentLineStart).split('\n').length - 1;
      
      if (listInfo && (listInfo.type === 'numeric' || listInfo.type === 'alpha' || listInfo.type === 'roman')) {
          // Ordered list handling
          let newLevel = listInfo.level;
          let newType = listInfo.type;
          
          if (!e.shiftKey) {
             // Indent -> Increase Level
             newLevel++;
          } else {
             // Outdent -> Decrease Level
             if (newLevel > 0) newLevel--;
             else return; // Can't outdent past 0
          }

          // Strict Hierarchy: 0=Numeric, 1=Alpha, 2=Roman
          if (newLevel === 0) newType = 'numeric';
          else if (newLevel === 1) newType = 'alpha';
          else if (newLevel === 2) newType = 'roman';
          else newType = 'numeric'; // Default fallback

          // Determine sequence value
          // Start fresh at 1 or 'a' or 'i' unless we want to find a sibling. 
          // Slack logic: When you indent, you start a NEW sublist (a.), so start at 'a'.
          // When you outdent, you return to the parent's sequence.
          
          let newVal: string | number = (newType === 'alpha' ? 'a' : 1);
          if (newType === 'roman') newVal = 1;

          if (e.shiftKey) {
              // Outdent: Try to find previous sibling at new level to continue sequence
              for (let i = lineIndex - 1; i >= 0; i--) {
                  const siblingInfo = getLineListInfo(allLines[i]);
                  if (!siblingInfo) continue;
                  
                  if (siblingInfo.level === newLevel) {
                      // Found preceding sibling
                      if (newType === 'numeric' && siblingInfo.type === 'numeric') newVal = (siblingInfo.val as number) + 1;
                      else if (newType === 'alpha' && siblingInfo.type === 'alpha') newVal = nextChar(siblingInfo.val as string);
                      else if (newType === 'roman' && siblingInfo.type === 'roman') newVal = (siblingInfo.val as number) + 1;
                      break; 
                  }
                  if (siblingInfo.level < newLevel) {
                      // Found parent, start fresh
                      break;
                  }
              }
          } else {
             // Indent: Start new sublist. Always start at 1/a/i.
             // Unless we are indenting into an EXISTING sublist? 
             // Slack starts fresh 'a.' when indenting '1.'.
             // But if lines are:
             // 1. Item
             //   a. Item
             // 2. Item (Tab here) -> should become b.
             // We'll scan back for same level.
              for (let i = lineIndex - 1; i >= 0; i--) {
                  const siblingInfo = getLineListInfo(allLines[i]);
                  if (!siblingInfo) continue;
                  
                  if (siblingInfo.level === newLevel) {
                      // Found preceding sibling at same new level
                       if (newType === 'numeric' && siblingInfo.type === 'numeric') newVal = (siblingInfo.val as number) + 1;
                      else if (newType === 'alpha' && siblingInfo.type === 'alpha') newVal = nextChar(siblingInfo.val as string);
                      else if (newType === 'roman' && siblingInfo.type === 'roman') newVal = (siblingInfo.val as number) + 1;
                      break;
                  }
                  if (siblingInfo.level < newLevel) {
                      // Found parent, this is the first child
                      break;
                  }
              }
          }
          
          // Construct new marker
          let newMarker = '';
          if (newType === 'numeric') newMarker = `${newVal}. `;
          else if (newType === 'alpha') newMarker = `${newVal}. `;
          else if (newType === 'roman') newMarker = `${toRoman(newVal as number)}. `;

          const indentStr = ' '.repeat(newLevel * 2);
          const contentAfter = currentLine.substring(listInfo.prefix.length);
          const newLineStr = `${indentStr}${newMarker}${contentAfter}`;
          
          const newValue = value.substring(0, currentLineStart) + newLineStr + value.substring(currentLineEnd);
          handleInputChange(setContent, newValue);
          requestAnimationFrame(() => {
              target.selectionStart = target.selectionEnd = currentLineStart + indentStr.length + newMarker.length;
          });

      } else if (listInfo && listInfo.type === 'unordered') {
          // Unordered list indentation (simple)
          if (!e.shiftKey) {
              const newLine = '  ' + currentLine;
              const newValue = value.substring(0, currentLineStart) + newLine + value.substring(currentLineEnd);
              handleInputChange(setContent, newValue);
              requestAnimationFrame(() => { target.selectionStart = target.selectionEnd = selectionStart + 2; });
          } else {
             if (currentLine.startsWith('  ')) {
                 const newLine = currentLine.substring(2);
                 const newValue = value.substring(0, currentLineStart) + newLine + value.substring(currentLineEnd);
                 handleInputChange(setContent, newValue);
                 requestAnimationFrame(() => { target.selectionStart = target.selectionEnd = Math.max(currentLineStart, selectionStart - 2); });
             }
          }
      } else {
          // Normal Tab
          if (!e.shiftKey) {
              const insertion = '  ';
              const newValue = value.substring(0, selectionStart) + insertion + value.substring(selectionEnd);
              handleInputChange(setContent, newValue);
              requestAnimationFrame(() => { target.selectionStart = target.selectionEnd = selectionStart + 2; });
          }
      }
      return;
    }

    // --- BACKSPACE Key ---
    if (e.key === 'Backspace') {
       // If cursor is right after the list prefix (e.g. "  a. |")
       if (listInfo && selectionStart === currentLineStart + listInfo.prefix.length && selectionStart === selectionEnd) {
           e.preventDefault();
           
           if (listInfo.level > 0) {
               // Outdent logic (Shift+Tab simulation)
               const eventMock = { key: 'Tab', shiftKey: true, preventDefault: () => {} } as any;
               handleKeyDown(eventMock);
           } else {
               // Remove list marker (Level 0) -> Convert to plain text
               const newLine = currentLine.substring(listInfo.prefix.length);
               const newValue = value.substring(0, currentLineStart) + newLine + value.substring(currentLineEnd);
               handleInputChange(setContent, newValue);
               requestAnimationFrame(() => { target.selectionStart = target.selectionEnd = currentLineStart; });
           }
       }
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

          {/* Body Content with Toolbar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>Body Content (Description)</label>
              {/* Markdown Toolbar */}
              <div style={{ display: 'flex', gap: '4px', background: '#222', borderRadius: '6px', padding: '4px', border: '1px solid #333' }}>
                  <ToolbarBtn icon={Bold} onClick={() => insertFormat('**', '**')} title="Bold" />
                  <ToolbarBtn icon={Italic} onClick={() => insertFormat('*', '*')} title="Italic" />
                  <ToolbarBtn icon={Underline} onClick={() => insertFormat('<u>', '</u>')} title="Underline" />
                  <div style={{ width: '1px', background: '#444', margin: '0 4px' }} />
                  <ToolbarBtn icon={List} onClick={() => insertLinePrefix('- ')} title="Bullet List" />
                  <ToolbarBtn icon={ListOrdered} onClick={() => insertLinePrefix('1. ')} title="Numbered List" />
                  <div style={{ width: '1px', background: '#444', margin: '0 4px' }} />
                  <ToolbarBtn icon={Quote} onClick={() => insertLinePrefix('> ')} title="Blockquote" />
                  <ToolbarBtn icon={Code} onClick={() => insertFormat('`', '`')} title="Inline Code" />
                  <ToolbarBtn icon={Terminal} onClick={() => insertFormat('\n```\n', '\n```\n')} title="Code Block" />
              </div>
            </div>
            <textarea 
              ref={textareaRef}
              value={content} 
              onChange={(e) => handleInputChange(setContent, e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter main description... (Enter = New Paragraph, Shift+Enter = Line Break)" 
              rows={8} 
              style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', outline: 'none', resize: 'vertical', lineHeight: '1.5', fontFamily: 'monospace' }} 
            />
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffaaaa', marginBottom: '8px', fontSize: '0.9rem' }}><AlertCircle size={14} /> Disclaimer / Note (Supports Markdown & Newlines)</label>
                <textarea 
                    value={disclaimer} 
                    onChange={(e) => handleInputChange(setDisclaimer, e.target.value)} 
                    placeholder="Important note or warning text. Supports markdown." 
                    rows={3}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid #444', borderRadius: '8px', color: '#ffaaaa', outline: 'none', resize: 'vertical', lineHeight: '1.5' }} 
                />
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
