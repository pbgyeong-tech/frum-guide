
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SectionData, ContentType, SubSection, ContentSnapshot } from '../types';
import { HANDBOOK_CONTENT } from '../constants';
import { Edit3, Plus, Trash2, ArrowUp, ArrowDown, Link as LinkIcon, ArrowRight, Lightbulb, ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { FaqSearch } from './FaqSearch';
import { EditModal } from './EditModal';
import { ConfirmModal } from './ConfirmModal';
import { ContestArchiveCard } from './ContestArchiveCard';
import { trackAnchorView, trackEvent } from '../utils/firebase';
import { addEditLog } from '../utils/db';

// --- Badge Style Logic ---
const getBadgeStyle = (text: string) => {
  if (!text) return { bg: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid #444' };
  const t = text.trim();
  
  if (t.includes('대표') || t.includes('CEO')) return { bg: 'rgba(234, 179, 8, 0.1)', color: '#fde047', border: '1px solid rgba(161, 98, 7, 0.5)' }; 
  if (t.includes('이사')) return { bg: 'rgba(168, 85, 247, 0.1)', color: '#d8b4fe', border: '1px solid rgba(126, 34, 206, 0.5)' }; 
  if (t.includes('책임')) return { bg: 'rgba(249, 115, 22, 0.1)', color: '#fdba74', border: '1px solid rgba(194, 65, 12, 0.5)' }; 
  if (t.includes('선임')) return { bg: 'rgba(59, 130, 246, 0.1)', color: '#93c5fd', border: '1px solid rgba(29, 78, 216, 0.5)' }; 
  if (t.includes('사원')) return { bg: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7', border: '1px solid rgba(4, 120, 87, 0.5)' }; 
  
  let hash = 0;
  for (let i = 0; i < t.length; i++) { hash = t.charCodeAt(i) + ((hash << 5) - hash); }

  const h = Math.abs(hash) % 360;
  const s = 75;
  const l = 75;

  return {
    color: `hsl(${h}, ${s}%, ${l}%)`,
    bg: `hsla(${h}, ${s}%, ${l}%, 0.1)`,
    border: `1px solid hsla(${h}, ${s}%, ${l}%, 0.3)`
  };
};

const handleContentOutboundClick = (name: string, url: string) => {
  trackEvent('click_outbound', { link_name: name, link_url: url, location: 'content' });
};

// --- Spotlight Helper ---
const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
  const { currentTarget, clientX, clientY } = e;
  const { left, top } = currentTarget.getBoundingClientRect();
  currentTarget.style.setProperty('--mouse-x', `${clientX - left}px`);
  currentTarget.style.setProperty('--mouse-y', `${clientY - top}px`);
};

// --- Sub Components ---
// 4. Use Monospace font for numbers
const StepBlock: React.FC<{ number: string, children: React.ReactNode, marginBottom?: string }> = ({ number, children, marginBottom = '24px' }) => (
  <div style={{ display: 'flex', gap: '16px', marginBottom: marginBottom, alignItems: 'flex-start' }}>
    <div className="font-mono" style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(231,0,18,0.1)', border: '1px solid rgba(231,0,18,0.5)', color: '#E70012', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', marginTop: '2px' }}>{number}</div>
    <div style={{ flex: 1, lineHeight: 1.6, color: '#EAEAEA' }}>{children}</div>
  </div>
);

const LinkCardBlock: React.FC<{ text: string, url: string }> = ({ text, url }) => (
  <a href={url} target="_blank" rel="noreferrer" onClick={() => handleContentOutboundClick(text, url)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '20px 24px', margin: '20px 0', textDecoration: 'none', cursor: 'pointer', transition: 'border 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#E70012'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LinkIcon size={20} color="#fff" /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{text}</span><span className="font-mono" style={{ color: '#666', fontSize: '0.8rem' }}>{new URL(url).hostname}</span></div>
    </div>
    <ArrowRight size={18} color="#E70012" />
  </a>
);

const AccordionItem: React.FC<{ title: string, children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: isOpen ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontWeight: 600 }}><span>{title}</span>{isOpen ? <ChevronDown size={18} color="#888" /> : <ChevronRight size={18} color="#888" />}</button>
      {isOpen && <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>{children}</div>}
    </div>
  );
};

const CodeBlock: React.FC<{ text: string }> = ({ text }) => (
  // 4. Monospace font for code
  <div className="font-mono" style={{ background: '#050505', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '16px', fontSize: '0.85rem', color: '#E0E0E0', margin: '16px 0', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
    {text}
  </div>
);

const InfoBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ background: 'linear-gradient(90deg, rgba(231,0,18,0.05) 0%, rgba(20,20,20,0.5) 100%)', borderLeft: '2px solid #E70012', padding: '16px', borderRadius: '0 8px 8px 0', marginTop: '20px', marginBottom: '20px', fontSize: '0.9rem', color: '#ddd', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
    <Lightbulb size={18} color="#E70012" style={{ flexShrink: 0, marginTop: '4px' }} />
    <div style={{ lineHeight: 1.6, flex: 1 }}>{children}</div>
  </div>
);

const parseInlineMarkdown = (text: string) => {
  const imgMatch = text.match(/!\[(.*?)\]\((.*?)\)/);
  if (imgMatch) return <img src={imgMatch[2]} alt={imgMatch[1]} referrerPolicy="no-referrer" style={{ width: '100%', height: 'auto', borderRadius: '8px', margin: '16px 0', border: '1px solid #333' }} />;
  
  const parts = text.split(/(\[.*?\]\(.*?\)|`.*?`|\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
            return <a key={i} href={linkMatch[2]} target="_blank" rel="noreferrer" onClick={() => handleContentOutboundClick(linkMatch[1], linkMatch[2])} style={{ color: '#E70012', fontWeight: 600, borderBottom: '1px solid rgba(231,0,18,0.3)' }}>{linkMatch[1]}</a>;
        }
        const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
        if (boldMatch) return <strong key={i} style={{ color: '#fff' }}>{boldMatch[1]}</strong>;
        const codeMatch = part.match(/^`(.*?)`$/);
        if (codeMatch) return <code key={i} className="font-mono" style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }}>{codeMatch[1]}</code>;
        return part;
      })}
    </>
  );
};

const TableBlock: React.FC<{ text: string }> = ({ text }) => {
  const rows = text.trim().split('\n').filter(r => r.trim() !== '');
  const headerRow = rows[0];
  const headers = headerRow.split('|').map(c => c.trim()).filter(c => c);
  const bodyRows = rows.slice(1).filter(r => !/^[\s\|\-:]+$/.test(r));
  
  const groupColumnIndex = headers.findIndex(h => h.includes('사업부'));
  
  const renderCell = (cell: string, header: string) => {
    if (header.includes('직급') || header.toLowerCase().includes('type') || header.includes('한도금액') || header.includes('조장')) {
      const style = getBadgeStyle(cell);
      // 4. Monospace for badges
      return <span className="font-mono" style={{ backgroundColor: style.bg, color: style.color, border: style.border, padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{cell}</span>;
    }
    if (header.includes('이메일')) return <a href={`mailto:${cell}`} className="font-mono" style={{ color: '#aaa', fontSize: '0.85rem' }}>{cell}</a>;
    return parseInlineMarkdown(cell);
  };

  if (groupColumnIndex !== -1) {
    const grouped: Record<string, string[][]> = {};
    bodyRows.forEach(row => {
      const cells = row.split('|').map(c => c.trim()).filter(c => c !== '');
      if(cells.length <= groupColumnIndex) return;
      const groupKey = cells[groupColumnIndex];
      if (!grouped[groupKey]) grouped[groupKey] = [];
      grouped[groupKey].push(cells);
    });
    const displayHeaders = headers.filter((_, i) => i !== groupColumnIndex);
    return (
      <div style={{ margin: '24px 0' }}>
        {Object.entries(grouped).map(([groupName, groupRows], i) => (
          <AccordionItem key={i} title={groupName} defaultOpen={i === 0}>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead><tr style={{ background: 'rgba(0,0,0,0.3)' }}>{displayHeaders.map((h, k) => <th key={k} style={{ textAlign: 'left', padding: '12px', color: '#888', fontSize: '11px', whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {groupRows.map((rowCells, rIdx) => {
                    const displayCells = rowCells.filter((_, cIdx) => cIdx !== groupColumnIndex);
                    return <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{displayCells.map((cell, cIdx) => <td key={cIdx} style={{ padding: '12px', color: '#ccc', whiteSpace: 'nowrap' }}>{renderCell(cell, displayHeaders[cIdx])}</td>)}</tr>;
                  })}
                </tbody>
              </table>
            </div>
          </AccordionItem>
        ))}
      </div>
    );
  }
  
  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', margin: '20px 0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead><tr style={{ background: 'rgba(255,255,255,0.05)' }}>{headers.map((h, i) => <th key={i} style={{ padding: '12px', textAlign: 'left', color: '#888', borderBottom: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
        <tbody>
          {bodyRows.map((row, i) => {
            const cells = row.split('|').map(c => c.trim()).filter(c => c !== '');
            while (cells.length < headers.length) cells.push('');
            return <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{cells.map((cell, j) => <td key={j} style={{ padding: '12px', color: '#ccc', whiteSpace: 'nowrap' }}>{renderCell(cell, headers[j] || '')}</td>)}</tr>;
          })}
        </tbody>
      </table>
    </div>
  );
};

const renderMarkdownContent = (content: string | string[]) => {
  const lines = Array.isArray(content) ? content : content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith('```')) {
      const codeLines = []; i++;
      while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++; }
      elements.push(<CodeBlock key={`code-${i}`} text={codeLines.join('\n')} />);
      i++; continue;
    }
    if (line.startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { tableLines.push(lines[i]); i++; }
      elements.push(<TableBlock key={`table-${i}`} text={tableLines.join('\n')} />);
      continue;
    }
    if (line.includes('![') && line.includes(')')) {
       const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
       if (imgMatch) {
         if (line.startsWith('![') && line.endsWith(')')) {
            elements.push(<div key={i} style={{ margin: '24px 0' }}><img src={imgMatch[2]} alt={imgMatch[1]} referrerPolicy="no-referrer" style={{ width: '100%', borderRadius: '8px', border: '1px solid #222' }} /></div>);
         } else {
            elements.push(<p key={i} style={{ marginBottom: '12px', color: '#ccc' }}>{parseInlineMarkdown(line)}</p>);
         }
         i++; continue;
       }
    }
    if (line.startsWith('[') && line.endsWith(')') && !line.includes('!')) {
       const linkMatch = line.match(/^\[(.*?)\]\((.*?)\)$/);
       if (linkMatch) { elements.push(<LinkCardBlock key={i} text={linkMatch[1]} url={linkMatch[2]} />); i++; continue; }
    }
    const isOrdered = /^\d+\./.test(line);
    const isUnordered = /^(\-|•|\*)\s/.test(line);
    if (isOrdered || isUnordered) {
        const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
        const nextIsUnordered = /^(\-|•|\*)\s/.test(nextLine);
        let marginBottom = '24px';
        if (isOrdered && nextIsUnordered) marginBottom = '8px';
        if (isUnordered && nextIsUnordered) marginBottom = '4px';
        if (isOrdered) {
             const match = line.match(/^(\d+)\.\s+(.*)/);
             if (match) elements.push(<StepBlock key={i} number={match[1]} marginBottom={marginBottom}>{parseInlineMarkdown(match[2])}</StepBlock>);
        } else {
            const text = line.replace(/^(\-|•|\*)\s*/, '');
            elements.push(<div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: marginBottom, paddingLeft: '52px' }}><span style={{ color: '#555', lineHeight: 1.5, fontSize: '0.95rem', alignSelf: 'flex-start', paddingTop: '0' }}>•</span><span style={{ color: '#b0b0b0', lineHeight: 1.5, fontSize: '0.95rem' }}>{parseInlineMarkdown(text)}</span></div>);
        }
        i++; continue;
    }
    if (/^-{3,}$/.test(line)) { elements.push(<hr key={i} style={{ margin: '60px 0', border: 'none', borderTop: '1px solid #333' }} />); i++; continue; }
    if (line.startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) { quoteLines.push(lines[i].trim().replace(/^>\s?/, '')); i++; }
        elements.push(<InfoBlock key={`quote-${i}`}>{quoteLines.map((qLine, qIdx) => <div key={qIdx} style={{ marginBottom: qIdx < quoteLines.length - 1 ? '4px' : '0' }}>{parseInlineMarkdown(qLine)}</div>)}</InfoBlock>);
        continue;
    }
    if (line !== '') { elements.push(<p key={i} style={{ marginBottom: '12px', color: '#ccc', lineHeight: 1.7, fontSize: '1rem' }}>{parseInlineMarkdown(line)}</p>); }
    i++;
  }
  return elements;
};

// ----------------------------------------------------------------------
// 4. Main Component Renderer
// ----------------------------------------------------------------------
export const ContentRenderer: React.FC<any> = ({ data, isAdmin, onUpdateContent, onNavigate, allContent, setIsDirty, user }) => {
  const isWelcome = data.id === ContentType.WELCOME;
  const isFAQ = data.id === ContentType.FAQ;
  const isComplexLayout = [ContentType.IT_SETUP, ContentType.WELFARE, ContentType.CULTURE, ContentType.COMMUTE, ContentType.COMPANY, ContentType.TOOLS, ContentType.OFFICE_GUIDE, ContentType.FAQ, ContentType.EXPENSE].includes(data.id);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const activeSectionIdRef = useRef<string>('');
  
  const navigate = useNavigate();
  const location = useLocation();

  const quickLinkSections = HANDBOOK_CONTENT.filter(s => s.id !== ContentType.WELCOME && s.id !== ContentType.FAQ);
  const safeSubSections = Array.isArray(data.subSections) ? data.subSections : [];

  useEffect(() => { setIsEditMode(false); }, [data.id]);
  
  const handleEdit = (uuid: string) => { 
      if (!uuid) return;
      setEditingItemId(uuid); 
      setIsModalOpen(true); 
  };
  const handleAddNew = () => { setEditingItemId(null); setIsModalOpen(true); };
  
  const handleDeleteTrigger = (uuid: string) => { 
      if (!uuid) return;
      setDeleteTargetId(uuid); 
      setDeleteModalOpen(true); 
  };

  const handleSaveModal = (newData: SubSection) => {
    const currentList = Array.isArray(data.subSections) ? data.subSections : [];
    let newSubSections = [...currentList];
    const newUuid = newData.uuid || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2));
    
    if (user && user.email) {
        newData.lastEditedBy = user.email;
        newData.lastEditedAt = Date.now();
        const snapshot = {
            slug: newData.slug || '',
            title: newData.title,
            body_content: Array.isArray(newData.content) ? newData.content.join('\n') : newData.content,
            media: newData.imagePlaceholder || '',
            external_link: newData.link || '',
            disclaimer_note: newData.disclaimer || ''
        };
        addEditLog({ 
            timestamp: Date.now(), 
            userEmail: user.email, 
            sectionId: data.id, 
            subSectionTitle: newData.title, 
            action: editingItemId ? 'update' : 'create', 
            details: { after: snapshot } 
        });
    }

    if (editingItemId) {
      const index = newSubSections.findIndex(sub => sub.uuid === editingItemId);
      if (index !== -1) newSubSections[index] = { ...newData, uuid: editingItemId };
    } else {
      newSubSections.push({ ...newData, uuid: newUuid });
    }
    onUpdateContent(newSubSections);
  };

  const executeDelete = async () => {
    if (!deleteTargetId) return;
    const targetItem = safeSubSections.find(s => s.uuid === deleteTargetId);
    if (user && user.email && targetItem) {
        const snapshot = {
           slug: targetItem.slug || '',
           title: targetItem.title,
           body_content: Array.isArray(targetItem.content) ? targetItem.content.join('\n') : targetItem.content,
           media: targetItem.imagePlaceholder || '',
           external_link: targetItem.link || '',
           disclaimer_note: targetItem.disclaimer || ''
        };
        addEditLog({ 
            timestamp: Date.now(), 
            userEmail: user.email, 
            sectionId: data.id, 
            subSectionTitle: targetItem.title, 
            action: 'delete', 
            details: { after: snapshot } 
        });
    }
    const newSubSections = safeSubSections.filter(s => s.uuid && s.uuid !== deleteTargetId);
    onUpdateContent(newSubSections);
    setDeleteTargetId(null);
    setDeleteModalOpen(false);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSubSections = [...safeSubSections];
    if (index >= newSubSections.length) return;
    [newSubSections[index - 1], newSubSections[index]] = [newSubSections[index], newSubSections[index - 1]];
    onUpdateContent(newSubSections);
  };

  const handleMoveDown = (index: number) => {
    if (index === safeSubSections.length - 1) return;
    const newSubSections = [...safeSubSections];
    if (index >= newSubSections.length - 1) return;
    [newSubSections[index + 1], newSubSections[index]] = [newSubSections[index], newSubSections[index + 1]];
    onUpdateContent(newSubSections);
  };

  const executeScroll = (id: string) => {
    const element = document.getElementById(id);
    const container = document.querySelector('.main-content');
    if (element && container) {
      const headerOffset = 80;
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const relativeTop = elementRect.top - containerRect.top;
      const targetScrollTop = container.scrollTop + relativeTop - headerOffset;
      container.scrollTo({ top: targetScrollTop, behavior: "smooth" });
    } else if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setActiveSectionId(id);
      activeSectionIdRef.current = id;
      trackAnchorView(data.id, id);
      setTimeout(() => executeScroll(id), 100);
    }
  }, [location.hash, data.id]);

  useEffect(() => {
    const container = document.querySelector('.main-content');
    if (!container) return;
    let timeoutId: any = null;
    const handleScroll = () => {
      const headerOffset = 150;
      let newActiveId = '';
      safeSubSections.forEach((sub, idx) => {
          const id = sub.slug || sub.uuid || `section-${idx}`;
          const element = document.getElementById(id);
          if (element) {
              const rect = element.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();
              const relativeTop = rect.top - containerRect.top;
              if (relativeTop < headerOffset) {
                  newActiveId = id;
              }
          }
      });
      if (newActiveId && newActiveId !== activeSectionIdRef.current) {
        setActiveSectionId(newActiveId);
        activeSectionIdRef.current = newActiveId;
        const currentPath = location.pathname;
        const currentSearch = location.search;
        const newHash = `#${currentPath}${currentSearch}#${newActiveId}`;
        if (window.location.hash !== newHash) {
           window.history.replaceState(null, '', newHash);
        }
      }
    };
    const throttledScroll = () => {
        if(!timeoutId) {
            timeoutId = setTimeout(() => {
                handleScroll();
                timeoutId = null;
            }, 100);
        }
    }
    container.addEventListener('scroll', throttledScroll);
    return () => {
      container.removeEventListener('scroll', throttledScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [safeSubSections, data.id, location]);

  const handleTocClick = (id: string) => {
    setActiveSectionId(id);
    activeSectionIdRef.current = id;
    trackEvent('click_toc', { anchor_id: id, section: data.title });
    navigate(`#${id}`);
    executeScroll(id);
  };

  if (isFAQ && !isEditMode) {
    return (
      <div className="animate-enter">
        <header className="page-header" style={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
             <h1 className="hero-title" style={{ marginBottom: 0 }}>{data.title}</h1>
             <p className="hero-desc" style={{ marginLeft: '4px' }}>{data.description}</p>
          </div>
          {isAdmin && (
            <button 
              onClick={() => { trackEvent('click_edit', { page_name: data.title }); setIsEditMode(true); }} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #E70012', background: 'transparent', color: '#E70012', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              <Edit3 size={16} /> Edit Page
            </button>
          )}
        </header>
        <FaqSearch onNavigate={onNavigate} content={allContent} />
      </div>
    );
  }

  if (isWelcome) {
      return (
        <div className="animate-enter">
            <div className="hero-image-container" style={{ marginTop: '20px' }}>
                {data.heroVideo ? <video src={data.heroVideo} className="hero-img-anim" autoPlay loop muted playsInline /> : <img src={data.heroImage} className="hero-img-anim" alt="Hero" />}
                <div className="hero-overlay-gradient"></div>
                <div className="brand-slash-container"><div className="brand-slash-line"></div></div>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 20, textAlign: 'center' }}><h1 className="hero-title" style={{ fontSize: 'clamp(3rem, 5vw, 5rem)' }}>{data.title}</h1></div>
            </div>
            {safeSubSections.length > 0 && (<div className="animate-fade delay-4" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 80px', padding: '0 20px' }}><h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: '#fff', fontWeight: 700 }}>{safeSubSections[0].title}</h2><p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#ccc', fontWeight: 400 }}>{safeSubSections[0].content}</p></div>)}
            <div className="grid-layout">
                {quickLinkSections.map((section, index) => {
                  const SectionIcon = section.icon;
                  return (
                    // 1. Apply bento-card spotlight via handleMouseMove
                    <button key={section.id} onClick={() => onNavigate(section.id)} onMouseMove={handleMouseMove} className="bento-card stagger-item" style={{ textAlign: 'left', cursor: 'pointer', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', animationDelay: `${index * 100}ms` }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}><SectionIcon size={24} color="#E70012" /><h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>{section.title}</h3></div><p style={{ fontSize: '0.95rem', color: '#999', lineHeight: '1.5', margin: 0 }}>{section.description}</p></button>
                  );
                })}
            </div>
        </div>
      );
  }

  return (
    <div className="animate-enter">
      <header className="page-header">
        <div><h1 className="hero-title">{data.title}</h1>{data.description && <p className="hero-desc">{data.description}</p>}</div>
        {isAdmin && (<button onClick={() => { trackEvent('click_edit', { page_name: data.title }); setIsEditMode(!isEditMode); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #E70012', background: isEditMode ? '#E70012' : 'transparent', color: isEditMode ? '#fff' : '#E70012', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0 }}><Edit3 size={16} />{isEditMode ? 'Done Editing' : 'Edit Page'}</button>)}
      </header>

      {!isWelcome && !isFAQ && safeSubSections.length > 0 && (
        <>
          <style>{`.toc-sticky-bar { position: sticky; top: 0; z-index: 40; background: rgba(9, 9, 9, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; gap: 8px; margin: -20px -40px 40px -40px; padding: 16px 40px; overflow-x: auto; white-space: nowrap; -ms-overflow-style: none; scrollbar-width: none; } .toc-sticky-bar::-webkit-scrollbar { display: none; } .toc-sticky-bar button { flex-shrink: 0; } @media (max-width: 768px) { .toc-sticky-bar { top: 70px; margin: -10px -20px 30px -20px; padding: 12px 20px; } }`}</style>
          <div className="toc-sticky-bar">
            {safeSubSections.map((sub, idx) => {
              const sectionId = sub.slug || sub.uuid || `section-${idx}`;
              const isActive = activeSectionId === sectionId;
              return (
              <button key={`toc-${idx}`} onClick={() => handleTocClick(sectionId)} style={{ padding: '8px 16px', borderRadius: '20px', ...(isActive ? { borderColor: '#E70012', color: '#fff', background: 'rgba(231,0,18,0.1)' } : { borderColor: 'rgba(255,255,255,0.1)', color: '#ccc', background: 'rgba(255,255,255,0.05)' }), borderWidth: '1px', borderStyle: 'solid', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500 }} onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.borderColor = '#E70012'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(231,0,18,0.1)'; } }} onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#ccc'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}>{sub.title}</button>
            );
            })}
          </div>
        </>
      )}

      <div className="grid-layout">
        {safeSubSections.map((sub, index) => {
          const sectionId = sub.slug || sub.uuid || `section-${index}`;
          const adminControls = isAdmin && isEditMode ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => handleMoveUp(index)} disabled={index === 0} title="Move Up" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: index === 0 ? 'transparent' : '#1a1a1a', border: index === 0 ? '1px solid transparent' : '1px solid #333', borderRadius: '6px', color: index === 0 ? '#444' : '#ccc', cursor: index === 0 ? 'default' : 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => index !== 0 && (e.currentTarget.style.borderColor = '#666')} onMouseLeave={(e) => index !== 0 && (e.currentTarget.style.borderColor = '#333')}><ArrowUp size={16} /></button>
                <button onClick={() => handleMoveDown(index)} disabled={index === safeSubSections.length - 1} title="Move Down" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: index === safeSubSections.length - 1 ? 'transparent' : '#1a1a1a', border: index === safeSubSections.length - 1 ? '1px solid transparent' : '1px solid #333', borderRadius: '6px', color: index === safeSubSections.length - 1 ? '#444' : '#ccc', cursor: index === safeSubSections.length - 1 ? 'default' : 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => index !== safeSubSections.length - 1 && (e.currentTarget.style.borderColor = '#666')} onMouseLeave={(e) => index !== safeSubSections.length - 1 && (e.currentTarget.style.borderColor = '#333')}><ArrowDown size={16} /></button>
                </div>
                <div style={{ width: '1px', height: '16px', background: '#333', margin: '0 12px' }}></div>
                <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleEdit(sub.uuid || '')} title="Edit" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#333'} onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}><Edit3 size={16} /></button>
                <button onClick={() => handleDeleteTrigger(sub.uuid || '')} title="Delete" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(231,0,18,0.1)', border: '1px solid rgba(231,0,18,0.3)', borderRadius: '6px', color: '#ff5555', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(231,0,18,0.2)'; e.currentTarget.style.borderColor = '#E70012'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(231,0,18,0.1)'; e.currentTarget.style.borderColor = 'rgba(231,0,18,0.3)'; }}><Trash2 size={16} /></button>
                </div>
            </div>
          ) : null;

          const isArchiveType = ['aicontest', 'frum-dining', 'coffee-chat'].includes(sub.slug || '');
          if (isArchiveType) {
             return <ContestArchiveCard key={sub.uuid || index} id={sectionId} data={sub} adminControls={adminControls} />;
          }

          const isFullWidth = isComplexLayout || (Array.isArray(sub.content) ? sub.content.length > 5 : sub.content.length > 300);
          
          return (
             // 1. Spotlight Effect (onMouseMove) & 5. Scroll Stagger (stagger-item, animation-delay)
             <div key={sub.uuid || index} id={sectionId} onMouseMove={handleMouseMove} className={`bento-card stagger-item ${isFullWidth ? 'full-width' : ''}`} style={{ animationDelay: `${index * 100}ms` }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '20px' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.4 }}>{sub.title}</h3>{isAdmin && isEditMode && sub.slug && (<span className="font-mono" style={{ fontSize: '0.75rem', color: '#666' }}>#{sub.slug}</span>)}</div>
                 {adminControls}
               </div>
               {sub.imagePlaceholder && (<div style={{ marginBottom: '20px' }}><img src={sub.imagePlaceholder} alt="Visual" style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} /></div>)}
               <div style={{ color: '#ccc', lineHeight: '1.6' }}>{renderMarkdownContent(sub.content)}</div>
               {sub.codeBlock && (<div style={{ position: 'relative', marginTop: '16px' }}><CodeBlock text={sub.codeBlock} /><button onClick={() => navigator.clipboard.writeText(sub.codeBlock!)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer', color: '#fff' }} title="Copy"><Copy size={14} /></button></div>)}
               {sub.link && (<a href={sub.link} target="_blank" rel="noreferrer" onClick={() => handleContentOutboundClick('Link', sub.link!)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', color: '#E70012', fontWeight: 600, textDecoration: 'none' }}><LinkIcon size={16} /> Link</a>)}
               {sub.disclaimer && (<InfoBlock>{renderMarkdownContent(sub.disclaimer)}</InfoBlock>)}
             </div>
          );
        })}
        {isAdmin && (<button onClick={handleAddNew} className="bento-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', borderStyle: 'dashed', borderColor: '#333', background: 'transparent', cursor: 'pointer', color: '#666', gap: '12px' }}><div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={24} /></div><span style={{ fontWeight: 600 }}>Add Content Block</span></button>)}
      </div>
      <EditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveModal} initialData={editingItemId ? safeSubSections.find(s => s.uuid === editingItemId) : undefined} onDirty={setIsDirty} />
      <ConfirmModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={executeDelete} />
    </div>
  );
};
