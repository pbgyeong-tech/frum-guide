
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

interface HistoryState {
  text: string;
  selectionStart: number;
  selectionEnd: number;
  timestamp: number;
  type: 'input' | 'action';
}

const safeJsonParse = (str: string | undefined) => {
  if (!str) return {};
  try { return JSON.parse(str); } catch (e) { return {}; }
};

const ARCHIVE_SLUGS = ['aicontest', 'frum-dining', 'coffee-chat'];

const ROMAN_VALS = [10, 9, 5, 4, 1];
const ROMAN_KEYS = ["x", "ix", "v", "iv", "i"];
const toRoman = (n: number) => {
    let res = ""; let num = n;
    for(let i=0; i<ROMAN_VALS.length; i++) { while(num >= ROMAN_VALS[i]) { res += ROMAN_KEYS[i]; num -= ROMAN_VALS[i]; } }
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
    const level = Math.floor(indent / 2);
    const unMatch = line.match(/^(\s*)([-*•])\s/);
    if (unMatch) return { type: 'unordered', val: unMatch[2], level, prefix: unMatch[0] };
    const numMatch = line.match(/^(\s*)(\d+)\.\s/);
    const alphaMatch = line.match(/^(\s*)([a-z])\.\s/);
    const romanMatch = line.match(/^(\s*)([ivx]+)\.\s/);
    if (numMatch) return { type: 'numeric', val: parseInt(numMatch[2], 10), level, prefix: numMatch[0] };
    if (romanMatch) {
       const str = romanMatch[2];
       if (level >= 2 || str.length > 1 || str === 'i') return { type: 'roman', val: fromRoman(str), level, prefix: romanMatch[0] };
    }
    if (alphaMatch) return { type: 'alpha', val: alphaMatch[2], level, prefix: alphaMatch[0] };
    return null;
};

const ToolbarBtn = ({ icon: Icon, onClick, title }: { icon: any, onClick: () => void, title: string }) => (
  <button onClick={onClick} title={title} type="button" style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.background = 'transparent'; }}><Icon size={16} /></button>
);

export const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, initialData, onDirty }) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [link, setLink] = useState('');
  const [disclaimer, setDisclaimer] = useState('');
  const [isArchiveMode, setIsArchiveMode] = useState(false);
  const [contestData, setContestData] = useState<any>({});
  const [cYear, setCYear] = useState(2025);
  const [cMonth, setCMonth] = useState(new Date().getMonth() + 1);
  const [cTitle, setCTitle] = useState('');
  const [cWinner, setCWinner] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cImage, setCImage] = useState('');
  const [loaded, setLoaded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<HistoryState[]>([]);
  const historyIndexRef = useRef<number>(-1);

  useEffect(() => {
    if (isOpen) {
      let initialContent = '';
      if (initialData) {
        setTitle(initialData.title);
        setSlug(initialData.slug || '');
        const isArchive = ARCHIVE_SLUGS.includes(initialData.slug || '');
        setIsArchiveMode(isArchive);
        let contentArr = Array.isArray(initialData.content) ? [...initialData.content] : [initialData.content];
        if (initialData.disclaimer) setDisclaimer(initialData.disclaimer);
        else {
          const disclaimerIdx = contentArr.findIndex(c => c.trim().startsWith('👉'));
          if (disclaimerIdx !== -1) { setDisclaimer(contentArr[disclaimerIdx].replace(/^👉\s*/, '')); contentArr.splice(disclaimerIdx, 1); }
          else setDisclaimer('');
        }
        initialContent = contentArr.join('\n');
        setContent(initialContent);
        setMediaUrl(initialData.imagePlaceholder || '');
        setLink(initialData.link || '');
        if (isArchive) {
           const parsedData = safeJsonParse(initialData.codeBlock);
           setContestData(parsedData); setCYear(2025); setCMonth(new Date().getMonth() + 1);
           const currentEntry = parsedData[2025]?.[new Date().getMonth() + 1] || {};
           setCTitle(currentEntry.title || ''); setCWinner(currentEntry.winner || ''); setCDesc(currentEntry.description || ''); setCImage(currentEntry.imageUrl || '');
        }
      } else { setTitle(''); setSlug(''); setContent(''); setMediaUrl(''); setLink(''); setDisclaimer(''); setIsArchiveMode(false); setContestData({}); }
      historyRef.current = [{ text: initialContent, selectionStart: 0, selectionEnd: 0, timestamp: Date.now(), type: 'action' }];
      historyIndexRef.current = 0; setLoaded(true); onDirty?.(false);
    } else setLoaded(false);
  }, [isOpen, initialData]);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => { setter(value); if (loaded && onDirty) onDirty(true); };

  const updateBody = (newText: string, newCursorStart: number, newCursorEnd: number, type: 'input' | 'action') => {
    handleInputChange(setContent, newText);
    const now = Date.now();
    const currentIndex = historyIndexRef.current;
    const currentEntry = historyRef.current[currentIndex];
    const isSequentialInput = type === 'input' && currentEntry?.type === 'input' && (now - currentEntry.timestamp) < 1000;
    if (isSequentialInput) historyRef.current[currentIndex] = { text: newText, selectionStart: newCursorStart, selectionEnd: newCursorEnd, timestamp: now, type };
    else {
      if (currentIndex < historyRef.current.length - 1) historyRef.current = historyRef.current.slice(0, currentIndex + 1);
      historyRef.current.push({ text: newText, selectionStart: newCursorStart, selectionEnd: newCursorEnd, timestamp: now, type });
      historyIndexRef.current++;
    }
    requestAnimationFrame(() => { if (textareaRef.current) { textareaRef.current.setSelectionRange(newCursorStart, newCursorEnd); textareaRef.current.focus(); } });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); if (historyIndexRef.current > 0) { historyIndexRef.current--; const prev = historyRef.current[historyIndexRef.current]; handleInputChange(setContent, prev.text); requestAnimationFrame(() => { if (textareaRef.current) textareaRef.current.setSelectionRange(prev.selectionStart, prev.selectionEnd); }); } return; }
    if ((e.metaKey || e.ctrlKey) && (e.shiftKey && e.key === 'Z' || e.key === 'y')) { e.preventDefault(); if (historyIndexRef.current < historyRef.current.length - 1) { historyIndexRef.current++; const next = historyRef.current[historyIndexRef.current]; handleInputChange(setContent, next.text); requestAnimationFrame(() => { if (textareaRef.current) textareaRef.current.setSelectionRange(next.selectionStart, next.selectionEnd); }); } return; }
    if (e.nativeEvent.isComposing) return;
    const { selectionStart, selectionEnd, value } = e.currentTarget;
    const currentLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const currentLineEnd = value.indexOf('\n', selectionStart) === -1 ? value.length : value.indexOf('\n', selectionStart);
    const currentLine = value.substring(currentLineStart, currentLineEnd);
    const listInfo = getLineListInfo(currentLine);

    if (e.key === 'Enter' && !e.shiftKey && listInfo) {
      e.preventDefault();
      if (!currentLine.substring(listInfo.prefix.length).trim()) { updateBody(value.substring(0, currentLineStart) + value.substring(currentLineEnd), currentLineStart, currentLineStart, 'action'); return; }
      let nextMarker = listInfo.type === 'numeric' ? `${(listInfo.val as number) + 1}. ` : (listInfo.type === 'alpha' ? `${nextChar(listInfo.val as string)}. ` : (listInfo.type === 'roman' ? `${toRoman((listInfo.val as number) + 1)}. ` : `${listInfo.val} `));
      const insertion = `\n${'  '.repeat(listInfo.level)}${nextMarker}`;
      updateBody(value.substring(0, selectionStart) + insertion + value.substring(selectionEnd), selectionStart + insertion.length, selectionStart + insertion.length, 'action');
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      if (listInfo) {
          let newLevel = e.shiftKey ? Math.max(0, listInfo.level - 1) : listInfo.level + 1;
          let newType = newLevel === 0 ? 'numeric' : (newLevel === 1 ? 'alpha' : 'roman');
          let newVal: any = 1; if(newType === 'alpha') newVal = 'a';
          let newMarker = newType === 'numeric' ? `${newVal}. ` : (newType === 'alpha' ? `${newVal}. ` : `${toRoman(newVal)}. `);
          if(listInfo.type === 'unordered') newMarker = `${listInfo.val} `;
          const newLineStr = `${'  '.repeat(newLevel)}${newMarker}${currentLine.substring(listInfo.prefix.length)}`;
          updateBody(value.substring(0, currentLineStart) + newLineStr + value.substring(currentLineEnd), currentLineStart + newLineStr.length, currentLineStart + newLineStr.length, 'action');
      } else if (!e.shiftKey) updateBody(value.substring(0, selectionStart) + '  ' + value.substring(selectionEnd), selectionStart + 2, selectionStart + 2, 'input');
      return;
    }
  };

  const handleSave = () => {
    // DO NOT filter empty lines to preserve user intentional gaps
    const contentArray = content.split('\n');
    const uuid = initialData?.uuid || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2));
    let finalCodeBlock = initialData?.codeBlock;
    if (isArchiveMode) {
        const newData = { ...contestData }; if (!newData[cYear]) newData[cYear] = {};
        newData[cYear][cMonth] = { title: cTitle, winner: cWinner, description: cDesc, imageUrl: cImage };
        finalCodeBlock = JSON.stringify(newData);
    }
    onSave({ uuid, slug: slug.trim() || undefined, title, content: contentArray, imagePlaceholder: mediaUrl.trim() || undefined, link: link.trim() || undefined, disclaimer: disclaimer.trim() || undefined, codeBlock: finalCodeBlock, keywords: title.split(' ') });
    onDirty?.(false); onClose();
  };

  const updateContestEntry = (field: string, value: string) => {
    if (field === 'title') setCTitle(value); if (field === 'winner') setCWinner(value); if (field === 'desc') setCDesc(value); if (field === 'image') setCImage(value);
    setContestData((prev: any) => { const newYearData = { ...(prev[cYear] || {}) }; newYearData[cMonth] = { ...(newYearData[cMonth] || {}), [field === 'desc' ? 'description' : (field === 'image' ? 'imageUrl' : field)]: value }; return { ...prev, [cYear]: newYearData }; });
    if (loaded && onDirty) onDirty(true);
  };

  if (!isOpen) return null;
  const isValid = title.trim().length > 0 && slug.trim().length > 0;

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={() => { onDirty?.(false); onClose(); }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }} />
      <div className="animate-enter" style={{ position: 'relative', background: '#121212', border: '1px solid #333', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>{initialData ? 'Edit Content Block' : 'Add Content Block'}</h3><button onClick={() => { onDirty?.(false); onClose(); }} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button></div>
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#888', marginBottom: '4px', fontSize: '0.9rem' }}>Title</label>
            <p style={{ color: '#555', fontSize: '0.75rem', marginBottom: '8px' }}>This title is displayed as the section heading.</p>
            <input type="text" value={title} onChange={(e) => handleInputChange(setTitle, e.target.value)} onBlur={() => { if (!slug.trim() && title.trim()) handleInputChange(setSlug, title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); }} placeholder="Enter section title" style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E70012', marginBottom: '4px', fontSize: '0.9rem', fontWeight: 600 }}><Hash size={14} /> URL ID (Slug) *</label>
            <p style={{ color: '#555', fontSize: '0.75rem', marginBottom: '8px' }}>Used as the unique URL anchor. Must be lowercase and URL-safe.</p>
            <input type="text" value={slug} onChange={(e) => { const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''); handleInputChange(setSlug, val); setIsArchiveMode(ARCHIVE_SLUGS.includes(val)); }} placeholder="e.g. wifi-setup (lowercase, numbers, hyphen only)" style={{ width: '100%', padding: '12px', background: 'rgba(231,0,18,0.05)', border: '1px solid #E70012', borderRadius: '8px', color: '#fff', outline: 'none', fontFamily: 'monospace' }} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ color: '#888', fontSize: '0.9rem' }}>Body Content</label>
              <div style={{ display: 'flex', gap: '4px', background: '#222', borderRadius: '6px', padding: '4px', border: '1px solid #333' }}>
                <ToolbarBtn icon={Bold} onClick={() => { if(!textareaRef.current) return; const {selectionStart, selectionEnd} = textareaRef.current; updateBody(content.substring(0, selectionStart) + '**' + content.substring(selectionStart, selectionEnd) + '**' + content.substring(selectionEnd), selectionStart + 2, selectionEnd + 2, 'action'); }} title="Bold" />
                <ToolbarBtn icon={Code} onClick={() => { if(!textareaRef.current) return; const {selectionStart, selectionEnd} = textareaRef.current; updateBody(content.substring(0, selectionStart) + '`' + content.substring(selectionStart, selectionEnd) + '`' + content.substring(selectionEnd), selectionStart + 1, selectionEnd + 1, 'action'); }} title="Code" />
              </div>
            </div>
            <p style={{ color: '#555', fontSize: '0.75rem', marginBottom: '8px' }}>Markdown supported. Enter = New paragraph, Shift+Enter = Line break.</p>
            <textarea 
              ref={textareaRef} 
              value={content} 
              onChange={(e) => updateBody(e.target.value, e.target.selectionStart, e.target.selectionEnd, 'input')} 
              onKeyDown={handleKeyDown} 
              rows={8} 
              placeholder="Enter main description..."
              style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'monospace' }} 
            />
          </div>
          {isArchiveMode && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(231,0,18,0.3)', borderRadius: '12px', padding: '20px' }}>
                  <h4 style={{ color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Trophy size={16} color="#E70012"/> Archive Entry Management</h4>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}><select value={cYear} onChange={(e) => { const y = Number(e.target.value); setCYear(y); const entry = contestData[y]?.[cMonth] || {}; setCTitle(entry.title || ''); setCWinner(entry.winner || ''); setCDesc(entry.description || ''); setCImage(entry.imageUrl || ''); }} style={{ background: '#000', color: '#fff', border: '1px solid #333', padding: '8px', borderRadius: '6px' }}>{[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}년</option>)}</select><select value={cMonth} onChange={(e) => { const m = Number(e.target.value); setCMonth(m); const entry = contestData[cYear]?.[m] || {}; setCTitle(entry.title || ''); setCWinner(entry.winner || ''); setCDesc(entry.description || ''); setCImage(entry.imageUrl || ''); }} style={{ background: '#000', color: '#fff', border: '1px solid #333', padding: '8px', borderRadius: '6px' }}>{Array.from({length:12},(_,i)=>i+1).map(m => <option key={m} value={m}>{m}월</option>)}</select></div>
                  <div style={{ display: 'grid', gap: '12px' }}><input type="text" placeholder="Title" value={cTitle} onChange={(e) => updateContestEntry('title', e.target.value)} style={{ padding: '10px', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} />{slug === 'aicontest' && <input type="text" placeholder="Winner" value={cWinner} onChange={(e) => updateContestEntry('winner', e.target.value)} style={{ padding: '10px', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} />}<input type="text" placeholder="Image URL" value={cImage} onChange={(e) => updateContestEntry('image', e.target.value)} style={{ padding: '10px', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} /><textarea placeholder="Description" rows={4} value={cDesc} onChange={(e) => updateContestEntry('desc', e.target.value)} style={{ padding: '10px', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} /></div>
              </div>
          )}
          {!isArchiveMode && (<>
            <div>
              <label style={{ display: 'block', color: '#888', marginBottom: '4px' }}>Media URL</label>
              <p style={{ color: '#555', fontSize: '0.75rem', marginBottom: '8px' }}>Optional. Supports image or video URLs.</p>
              <input type="text" value={mediaUrl} onChange={(e) => handleInputChange(setMediaUrl, e.target.value)} placeholder="https://example.com/image.jpg" style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#888', marginBottom: '4px' }}>External Link</label>
              <p style={{ color: '#555', fontSize: '0.75rem', marginBottom: '8px' }}>Optional. Users will be redirected to this link when clicked.</p>
              <input type="text" value={link} onChange={(e) => handleInputChange(setLink, e.target.value)} placeholder="https://example.com" style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffaaaa', marginBottom: '4px' }}><AlertCircle size={14} /> Disclaimer</label>
              <p style={{ color: '#555', fontSize: '0.75rem', marginBottom: '8px' }}>Displayed as a highlighted info box. Supports markdown and new lines.</p>
              <textarea value={disclaimer} onChange={(e) => handleInputChange(setDisclaimer, e.target.value)} rows={2} placeholder="Important note or warning text." style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid #444', borderRadius: '8px', color: '#ffaaaa' }} />
            </div>
          </>)}
        </div>
        <div style={{ padding: '20px 24px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}><button onClick={() => { onDirty?.(false); onClose(); }} style={{ padding: '10px 20px', borderRadius: '8px', color: '#ccc', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button><button onClick={handleSave} disabled={!isValid} style={{ padding: '10px 24px', borderRadius: '8px', background: isValid ? '#E70012' : '#333', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: isValid ? 'pointer' : 'not-allowed' }}><Save size={18} /> Save Content</button></div>
      </div>
    </div>,
    document.body
  );
};
