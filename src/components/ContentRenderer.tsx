
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

// --- Layout Constants (Fine-tuned for Slack-like readability) ---
const LINE_HEIGHT = 1.75; 
const MARKER_WIDTH = 30; // Fixed width for all list markers
const ITEM_GAP = 10; // Gap between marker and text
const INDENT_STEP = MARKER_WIDTH + ITEM_GAP; // 40px: Level 1 marker aligns with Level 0 text
const BLOCK_SPACING = '14px'; // Tight paragraph margin for labeling groups
const LIST_ITEM_SPACING = '6px'; // Vertical space between list items

const ARCHIVE_SLUGS = ['aicontest', 'frum-dining', 'coffee-chat'];

const getBadgeStyle = (text: string) => {
  if (!text) return { bg: 'rgba(255,255,255,0.05)', color: '#ccc', border: '1px solid #444' };
  const t = text.trim();
  if (t.includes('대표') || t.includes('CEO')) return { bg: 'rgba(234, 179, 8, 0.15)', color: '#fde047', border: '1px solid rgba(161, 98, 7, 0.4)' }; 
  if (t.includes('이사')) return { bg: 'rgba(168, 85, 247, 0.15)', color: '#e9d5ff', border: '1px solid rgba(126, 34, 206, 0.4)' }; 
  if (t.includes('책임')) return { bg: 'rgba(249, 115, 22, 0.15)', color: '#fdba74', border: '1px solid rgba(194, 65, 12, 0.4)' }; 
  if (t.includes('선임')) return { bg: 'rgba(59, 130, 246, 0.15)', color: '#bfdbfe', border: '1px solid rgba(29, 78, 216, 0.4)' }; 
  if (t.includes('사원')) return { bg: 'rgba(16, 185, 129, 0.15)', color: '#a7f3d0', border: '1px solid rgba(4, 120, 87, 0.4)' }; 
  let hash = 0;
  for (let i = 0; i < t.length; i++) { hash = t.charCodeAt(i) + ((hash << 5) - hash); }
  const h = Math.abs(hash) % 360;
  const s = 60; const l = 80;
  return { color: `hsl(${h}, ${s}%, ${l}%)`, bg: `hsla(${h}, ${s}%, ${l}%, 0.1)`, border: `1px solid hsla(${h}, ${s}%, ${l}%, 0.2)` };
};

const handleContentOutboundClick = (name: string, url: string) => {
  trackEvent('click_outbound', { link_name: name, link_url: url, location: 'content' });
};

const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
  const { currentTarget, clientX, clientY } = e;
  const { left, top } = currentTarget.getBoundingClientRect();
  currentTarget.style.setProperty('--mouse-x', `${clientX - left}px`);
  currentTarget.style.setProperty('--mouse-y', `${clientY - top}px`);
};

// --- List Block Helpers ---

const StepBlock: React.FC<{ number: string, children: React.ReactNode, marginBottom?: string, marginLeft?: number }> = ({ number, children, marginBottom = LIST_ITEM_SPACING, marginLeft = 0 }) => (
  <div style={{ display: 'flex', gap: `${ITEM_GAP}px`, marginBottom, marginLeft: `${marginLeft}px`, alignItems: 'flex-start' }}>
    <div style={{ flexShrink: 0, width: `${MARKER_WIDTH}px`, display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
      <div className="font-mono" style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(231,0,18,0.1)', border: '1px solid rgba(231,0,18,0.5)', color: '#E70012', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px' }}>{number}</div>
    </div>
    <div style={{ flex: 1, lineHeight: LINE_HEIGHT, color: '#b0b0b0' }}>{children}</div>
  </div>
);

const AlphaBlock: React.FC<{ marker: string, children: React.ReactNode, marginLeft: number, marginBottom?: string }> = ({ marker, children, marginLeft, marginBottom = LIST_ITEM_SPACING }) => (
    <div style={{ display: 'flex', gap: `${ITEM_GAP}px`, marginBottom, marginLeft: `${marginLeft}px`, alignItems: 'baseline' }}>
        <span className="font-mono" style={{ color: '#888', fontWeight: 500, width: `${MARKER_WIDTH}px`, textAlign: 'right', flexShrink: 0, fontSize: '0.95rem' }}>{marker}.</span>
        <div style={{ flex: 1, lineHeight: LINE_HEIGHT, color: '#a0a0a0' }}>{children}</div>
    </div>
);

const RomanBlock: React.FC<{ marker: string, children: React.ReactNode, marginLeft: number, marginBottom?: string }> = ({ marker, children, marginLeft, marginBottom = LIST_ITEM_SPACING }) => (
    <div style={{ display: 'flex', gap: `${ITEM_GAP}px`, marginBottom, marginLeft: `${marginLeft}px`, alignItems: 'baseline' }}>
        <span className="font-mono" style={{ color: '#666', fontStyle: 'italic', width: `${MARKER_WIDTH}px`, textAlign: 'right', flexShrink: 0, fontSize: '0.9rem' }}>{marker}.</span>
        <div style={{ flex: 1, lineHeight: LINE_HEIGHT, color: '#a0a0a0' }}>{children}</div>
    </div>
);

const LinkCardBlock: React.FC<{ text: string, url: string }> = ({ text, url }) => (
  <a href={url} target="_blank" rel="noreferrer" onClick={() => handleContentOutboundClick(text, url)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px 20px', margin: `28px 0`, textDecoration: 'none', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#E70012'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LinkIcon size={18} color="#fff" /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}><span style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{text}</span><span className="font-mono" style={{ color: '#777', fontSize: '0.75rem' }}>{new URL(url).hostname}</span></div>
    </div>
    <ArrowRight size={16} color="#E70012" />
  </a>
);

const AccordionItem: React.FC<{ title: string, children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: isOpen ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontWeight: 600 }}><span>{title}</span>{isOpen ? <ChevronDown size={18} color="#888" /> : <ChevronRight size={18} color="#888" />}</button>
      {isOpen && <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>{children}</div>}
    </div>
  );
};

const CodeBlock: React.FC<{ text: string }> = ({ text }) => (
  <div className="font-mono" style={{ background: '#090909', border: '1px solid #222', borderRadius: '6px', padding: '16px', fontSize: '0.85rem', color: '#ccc', margin: `28px 0`, overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
    {text}
  </div>
);

const InfoBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ background: 'rgba(231,0,18,0.04)', borderLeft: '3px solid #E70012', padding: '16px 20px', borderRadius: '4px', marginTop: '28px', marginBottom: '28px', fontSize: '0.95rem', color: '#ccc', display: 'flex', gap: '14px', alignItems: 'flex-start', lineHeight: '1.6' }}>
    <Lightbulb size={18} color="#E70012" style={{ flexShrink: 0, marginTop: '2px' }} />
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

const parseInlineMarkdown = (text: string) => {
  const imgMatch = text.match(/!\[(.*?)\]\((.*?)\)/);
  if (imgMatch) return <img src={imgMatch[2]} alt={imgMatch[1]} referrerPolicy="no-referrer" style={{ width: '100%', height: 'auto', borderRadius: '8px', margin: '24px 0', border: '1px solid #333' }} />;
  const parts = text.split(/(\[.*?\]\(.*?\)|`.*?`|\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) return <a key={i} href={linkMatch[2]} target="_blank" rel="noreferrer" onClick={() => handleContentOutboundClick(linkMatch[1], linkMatch[2])} style={{ color: '#E70012', fontWeight: 600, borderBottom: '1px solid rgba(231,0,18,0.3)', textDecoration: 'none' }}>{linkMatch[1]}</a>;
        const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
        if (boldMatch) return <strong key={i} style={{ color: '#fff', fontWeight: 600 }}>{boldMatch[1]}</strong>;
        const codeMatch = part.match(/^`(.*?)`$/);
        if (codeMatch) return <code key={i} className="font-mono" style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 5px', borderRadius: '4px', fontSize: '0.85em', color: '#e0e0e0' }}>{codeMatch[1]}</code>;
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
      return <span className="font-mono" style={{ backgroundColor: style.bg, color: style.color, border: style.border, padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>{cell}</span>;
    }
    if (header.includes('이메일')) return <a href={`mailto:${cell}`} className="font-mono" style={{ color: '#888', fontSize: '0.85rem', textDecoration: 'none' }}>{cell}</a>;
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
      <div style={{ margin: `28px 0` }}>
        {Object.entries(grouped).map(([groupName, groupRows], i) => (
          <AccordionItem key={i} title={groupName} defaultOpen={i === 0}>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', tableLayout: 'fixed' }}>
                <thead><tr style={{ background: 'rgba(255, 255, 255, 0.04)' }}>{displayHeaders.map((h, k) => <th key={k} style={{ textAlign: 'left', padding: '14px 12px', color: 'rgba(255,255,255,0.7)', fontSize: '11px', whiteSpace: 'nowrap', width: h.includes('이름') ? '25%' : (h.includes('직급') ? '15%' : 'auto'), textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>)}</tr></thead>
                <tbody>{groupRows.map((rowCells, rIdx) => <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{rowCells.filter((_, cIdx) => cIdx !== groupColumnIndex).map((cell, cIdx) => <td key={cIdx} style={{ padding: '14px 12px', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>{renderCell(cell, displayHeaders[cIdx])}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </AccordionItem>
        ))}
      </div>
    );
  }
  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', margin: `28px 0`, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead><tr style={{ background: 'rgba(255, 255, 255, 0.04)' }}>{headers.map((h, i) => <th key={i} style={{ padding: '14px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{h}</th>)}</tr></thead>
        <tbody>{bodyRows.map((row, i) => <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{row.split('|').map(c => c.trim()).filter(c => c !== '').map((cell, j) => <td key={j} style={{ padding: '14px 12px', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>{renderCell(cell, headers[j] || '')}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
};

interface MarkdownOptions {
  fontSize?: string;
  color?: string;
  margin?: string;
}

const renderMarkdownContent = (content: string | string[], options: MarkdownOptions = {}) => {
  const lines = Array.isArray(content) ? content : content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Preserve Empty Lines
    if (rawLine === '' || line === '') {
        elements.push(<div key={`gap-${i}`} style={{ height: '1.2em' }} />);
        i++; continue;
    }

    const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        elements.push(<div key={`header-${i}`} style={{ fontSize: level === 1 ? '2rem' : (level === 2 ? '1.5rem' : '1.2rem'), fontWeight: level <= 2 ? 700 : 600, color: level === 3 ? '#e0e0e0' : '#fff', marginTop: i === 0 ? '0' : '32px', marginBottom: '16px', lineHeight: 1.3 }}>{parseInlineMarkdown(text)}</div>);
        i++; continue;
    }
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
    if (line.startsWith('![') && line.endsWith(')') && line.match(/!\[(.*?)\]\((.*?)\)/)) {
       const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
       if (imgMatch) { elements.push(<div key={i} style={{ margin: `28px 0` }}><img src={imgMatch[2]} alt={imgMatch[1]} referrerPolicy="no-referrer" style={{ width: '100%', borderRadius: '12px', border: '1px solid #222' }} /></div>); i++; continue; }
    }
    if (line.startsWith('[') && line.endsWith(')') && !line.includes('!') && line.match(/^\[(.*?)\]\((.*?)\)$/)) {
       const linkMatch = line.match(/^\[(.*?)\]\((.*?)\)$/);
       if (linkMatch) { elements.push(<LinkCardBlock key={i} text={linkMatch[1]} url={linkMatch[2]} />); i++; continue; }
    }
    const isUnordered = /^(\-|•|\*)\s/.test(line);
    const isOrdered = /^(\d+|[a-z]|[ivx]+)\.\s/.test(line);
    if (isOrdered || isUnordered) {
        const indentMatch = rawLine.match(/^(\s*)/);
        const level = Math.floor((indentMatch ? indentMatch[1].length : 0) / 2);
        const matchRoman = line.match(/^([ivx]+)\.\s+(.*)/);
        const matchAlpha = line.match(/^([a-z])\.\s+(.*)/);
        const matchNum = line.match(/^(\d+)\.\s+(.*)/);
        const matchUn = line.match(/^(\-|•|\*)\s+(.*)/);
        let renderedItem = null;
        if (isUnordered && matchUn) renderedItem = <div style={{ display: 'flex', alignItems: 'flex-start', gap: `${ITEM_GAP}px`, marginBottom: LIST_ITEM_SPACING, marginLeft: `${level * INDENT_STEP}px` }}><span style={{ color: '#666', fontSize: '1.2rem', width: `${MARKER_WIDTH}px`, textAlign: 'center', flexShrink: 0, marginTop: '-4px' }}>•</span><span style={{ color: '#b0b0b0', fontSize: '1rem', flex: 1 }}>{parseInlineMarkdown(matchUn[2])}</span></div>;
        else if (matchNum) renderedItem = <StepBlock number={matchNum[1]} marginLeft={level * INDENT_STEP}>{parseInlineMarkdown(matchNum[2])}</StepBlock>;
        else if (matchRoman && level >= 2) renderedItem = <RomanBlock marker={matchRoman[1]} marginLeft={level * INDENT_STEP}>{parseInlineMarkdown(matchRoman[2])}</RomanBlock>;
        else if (matchAlpha) renderedItem = <AlphaBlock marker={matchAlpha[1]} marginLeft={level * INDENT_STEP}>{parseInlineMarkdown(matchAlpha[2])}</AlphaBlock>;
        elements.push(<div key={i}>{renderedItem}</div>);
        i++; continue;
    }
    if (/^-{3,}$/.test(line)) { elements.push(<hr key={i} style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #333' }} />); i++; continue; }
    if (line.startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) { quoteLines.push(lines[i].trim().replace(/^>\s?/, '')); i++; }
        elements.push(<InfoBlock key={`quote-${i}`}>{renderMarkdownContent(quoteLines.join('\n'), { fontSize: '0.95rem', color: '#bbb', margin: '0' })}</InfoBlock>);
        continue;
    }
    const paragraphLines: string[] = [line];
    let j = i + 1;
    while (j < lines.length) {
         const nextLine = lines[j].trim();
         if (nextLine === '' || /^(#{1,6})\s/.test(nextLine) || nextLine.startsWith('```') || nextLine.startsWith('|') || nextLine.match(/!\[(.*?)\]\((.*?)\)/) || nextLine.match(/^\[(.*?)\]\((.*?)\)$/) || /^(\d+|[a-z]|[ivx]+)\.\s/.test(nextLine) || /^(\-|•|\*)\s/.test(nextLine) || /^-{3,}$/.test(nextLine) || nextLine.startsWith('>')) break;
         paragraphLines.push(nextLine);
         j++;
    }
    elements.push(<p key={i} style={{ marginBottom: options.margin ?? BLOCK_SPACING, color: options.color || '#a0a0a0', lineHeight: LINE_HEIGHT, fontSize: options.fontSize || '1.05rem' }}>{paragraphLines.map((l, idx) => <React.Fragment key={idx}>{parseInlineMarkdown(l)}{idx < paragraphLines.length - 1 && <br />}</React.Fragment>)}</p>);
    i = j;
  }
  return elements;
};

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

  const isFrumUser = !!user?.email?.endsWith('@frum.co.kr');
  useEffect(() => {
    if (isFrumUser) setIsEditMode(true);
    else setIsEditMode(false);
  }, [user, data.id]);

  const handleEdit = (uuid: string) => { if (!uuid) return; setEditingItemId(uuid); setIsModalOpen(true); };
  const handleAddNew = () => { setEditingItemId(null); setIsModalOpen(true); };
  const handleDeleteTrigger = (uuid: string) => { if (!uuid) return; setDeleteTargetId(uuid); setDeleteModalOpen(true); };

  const handleSaveModal = (newData: SubSection) => {
    let newSubSections = [...safeSubSections];
    const newUuid = newData.uuid || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2));
    
    if (user && user.email) {
        newData.lastEditedBy = user.email;
        newData.lastEditedAt = Date.now();
        addEditLog({ timestamp: Date.now(), userEmail: user.email, sectionId: data.id, subSectionTitle: newData.title, action: editingItemId ? 'update' : 'create', details: { after: { slug: newData.slug || '', title: newData.title, body_content: Array.isArray(newData.content) ? newData.content.join('\n') : newData.content, media: newData.imagePlaceholder || '', external_link: newData.link || '', disclaimer_note: newData.disclaimer || '' } } });
    }

    if (editingItemId) {
      const index = newSubSections.findIndex(sub => sub.uuid === editingItemId);
      if (index !== -1) newSubSections[index] = { ...newData, uuid: editingItemId };
    } else {
      newSubSections.push({ ...newData, uuid: newUuid });
    }
    onUpdateContent(data.id, newSubSections);
  };

  const executeDelete = async () => {
    if (!deleteTargetId) return;
    const targetItem = safeSubSections.find(s => s.uuid === deleteTargetId);
    if (user && user.email && targetItem) {
        addEditLog({ timestamp: Date.now(), userEmail: user.email, sectionId: data.id, subSectionTitle: targetItem.title, action: 'delete', details: { after: { slug: targetItem.slug || '', title: targetItem.title, body_content: Array.isArray(targetItem.content) ? targetItem.content.join('\n') : targetItem.content, media: targetItem.imagePlaceholder || '', external_link: targetItem.link || '', disclaimer_note: targetItem.disclaimer || '' } } });
    }
    const newSubSections = safeSubSections.filter(s => s.uuid && s.uuid !== deleteTargetId);
    onUpdateContent(data.id, newSubSections);
    setDeleteTargetId(null);
    setDeleteModalOpen(false);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSubSections = [...safeSubSections];
    [newSubSections[index - 1], newSubSections[index]] = [newSubSections[index], newSubSections[index - 1]];
    onUpdateContent(data.id, newSubSections);
  };

  const handleMoveDown = (index: number) => {
    if (index === safeSubSections.length - 1) return;
    const newSubSections = [...safeSubSections];
    [newSubSections[index + 1], newSubSections[index]] = [newSubSections[index], newSubSections[index + 1]];
    onUpdateContent(data.id, newSubSections);
  };

  const executeScroll = (id: string) => {
    const element = document.getElementById(id);
    const container = document.querySelector('.main-content');
    if (element && container) {
      const headerOffset = 80;
      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const relativeTop = elementRect.top - containerRect.top;
      container.scrollTo({ top: container.scrollTop + relativeTop - headerOffset, behavior: "smooth" });
    } else if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setActiveSectionId(id); activeSectionIdRef.current = id;
      trackAnchorView(data.id, id);
      const attemptScroll = (retryCount: number) => {
        const element = document.getElementById(id);
        if (element) executeScroll(id);
        else if (data.id === ContentType.COMPANY && retryCount < 15) setTimeout(() => attemptScroll(retryCount + 1), 100);
      };
      setTimeout(() => attemptScroll(0), 100);
    }
  }, [location.hash, data.id]);

  useEffect(() => {
    const container = document.querySelector('.main-content');
    if (!container) return;
    let timeoutId: any = null;
    const handleScroll = () => {
      const headerOffset = 150; let newActiveId = '';
      safeSubSections.forEach((sub, idx) => {
          const id = sub.slug || sub.uuid || `section-${idx}`;
          const element = document.getElementById(id);
          if (element) {
              const rect = element.getBoundingClientRect(); const containerRect = container.getBoundingClientRect();
              if (rect.top - containerRect.top < headerOffset) newActiveId = id;
          }
      });
      if (newActiveId && newActiveId !== activeSectionIdRef.current) {
        setActiveSectionId(newActiveId); activeSectionIdRef.current = newActiveId;
        const newHash = `#${location.pathname}${location.search}#${newActiveId}`;
        if (window.location.hash !== newHash) window.history.replaceState(null, '', newHash);
      }
    };
    const throttledScroll = () => { if(!timeoutId) timeoutId = setTimeout(() => { handleScroll(); timeoutId = null; }, 100); }
    container.addEventListener('scroll', throttledScroll);
    return () => { container.removeEventListener('scroll', throttledScroll); if (timeoutId) clearTimeout(timeoutId); };
  }, [safeSubSections, data.id, location]);

  const handleTocClick = (id: string) => { setActiveSectionId(id); activeSectionIdRef.current = id; trackEvent('click_toc', { anchor_id: id, section: data.title }); navigate(`#${id}`); executeScroll(id); };

  if (isFAQ && !isEditMode) return <div className="content-wrapper animate-enter"><header className="page-header" style={{ alignItems: 'flex-start', justifyContent: 'space-between' }}><div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}><h1 className="hero-title" style={{ marginBottom: 0 }}>{data.title}</h1><p className="hero-desc" style={{ marginLeft: '4px' }}>{data.description}</p></div>{isAdmin && !isFrumUser && <button onClick={() => { trackEvent('click_edit', { page_name: data.title }); setIsEditMode(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #E70012', background: 'transparent', color: '#E70012', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0 }}><Edit3 size={16} /> Edit Page</button>}</header><FaqSearch onNavigate={onNavigate} content={allContent} /></div>;

  if (isWelcome) return <div className="animate-enter"><div className="hero-full-width-container">{data.heroVideo ? <video src={data.heroVideo} className="hero-full-width-media" autoPlay loop muted playsInline /> : <img src={data.heroImage} className="hero-full-width-media" alt="Hero" />}<div className="hero-overlay-gradient" style={{ opacity: 0.4 }}></div><div className="hero-bottom-gradient"></div><div className="brand-slash-container"><div className="brand-slash-line"></div></div><div className="hero-text-container"><h1 className="hero-title" style={{ fontSize: 'clamp(3.5rem, 6vw, 6rem)', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>{data.title}</h1></div></div><div className="content-wrapper with-hero">{safeSubSections.length > 0 && (<div className="animate-fade delay-4" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 80px', padding: '0 20px' }}><h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: '#fff', fontWeight: 700 }}>{safeSubSections[0].title}</h2><p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#ccc', fontWeight: 400 }}>{safeSubSections[0].content}</p></div>)}<div className="grid-layout">{quickLinkSections.map((section, index) => { const SectionIcon = section.icon; return <button key={section.id} onClick={() => onNavigate(section.id)} onMouseMove={handleMouseMove} className="bento-card stagger-item" style={{ textAlign: 'left', cursor: 'pointer', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', animationDelay: `${index * 100}ms` }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}><SectionIcon size={24} color="#E70012" /><h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>{section.title}</h3></div><p style={{ fontSize: '0.95rem', color: '#999', lineHeight: '1.5', margin: 0 }}>{section.description}</p></button>; })}</div></div></div>;

  return (
    <div className="content-wrapper animate-enter">
      <header className="page-header">
        <div><h1 className="hero-title">{data.title}</h1>{data.description && <p className="hero-desc">{data.description}</p>}</div>
        {isAdmin && !isFrumUser && (<button onClick={() => { trackEvent('click_edit', { page_name: data.title }); setIsEditMode(!isEditMode); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #E70012', background: isEditMode ? '#E70012' : 'transparent', color: isEditMode ? '#fff' : '#E70012', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0 }}><Edit3 size={16} />{isEditMode ? 'Done Editing' : 'Edit Page'}</button>)}
      </header>
      {!isWelcome && !isFAQ && safeSubSections.length > 0 && (
        <div className="toc-sticky-bar" style={{ position: 'sticky', top: '0', zIndex: 40, background: 'rgba(9, 9, 9, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '8px', margin: '-20px -40px 40px -40px', padding: '16px 40px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {safeSubSections.map((sub, idx) => {
            const sectionId = sub.slug || sub.uuid || `section-${idx}`;
            const isActive = activeSectionId === sectionId;
            return <button key={`toc-${idx}`} onClick={() => handleTocClick(sectionId)} style={{ padding: '8px 16px', borderRadius: '20px', borderColor: isActive ? '#E70012' : 'rgba(255,255,255,0.1)', color: isActive ? '#fff' : '#ccc', background: isActive ? 'rgba(231,0,18,0.1)' : 'rgba(255,255,255,0.05)', borderWidth: '1px', borderStyle: 'solid', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500 }}>{sub.title}</button>;
          })}
        </div>
      )}
      <div className="grid-layout">
        {safeSubSections.map((sub, index) => {
          const sectionId = sub.slug || sub.uuid || `section-${index}`;
          const isFullWidth = isComplexLayout || (Array.isArray(sub.content) ? sub.content.length > 5 : sub.content.length > 300);
          const isArchive = ARCHIVE_SLUGS.includes(sub.slug || '');

          const adminControls = isAdmin && isEditMode && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => handleMoveUp(index)} disabled={index === 0} title="Move Up" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: index === 0 ? 'transparent' : '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: index === 0 ? '#444' : '#ccc', cursor: index === 0 ? 'default' : 'pointer' }}><ArrowUp size={16} /></button>
                    <button onClick={() => handleMoveDown(index)} disabled={index === safeSubSections.length - 1} title="Move Down" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: index === safeSubSections.length - 1 ? 'transparent' : '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: index === safeSubSections.length - 1 ? '#444' : '#ccc', cursor: index === safeSubSections.length - 1 ? 'default' : 'pointer' }}><ArrowDown size={16} /></button>
                </div>
                <div style={{ width: '1px', height: '16px', background: '#333', margin: '0 12px' }}></div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEdit(sub.uuid || '')} title="Edit" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}><Edit3 size={16} /></button>
                    <button onClick={() => handleDeleteTrigger(sub.uuid || '')} title="Delete" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(231,0,18,0.1)', border: '1px solid rgba(231,0,18,0.3)', borderRadius: '6px', color: '#ff5555', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
            </div>
          );

          if (isArchive) {
            return (
              <ContestArchiveCard 
                key={sub.uuid || index}
                data={sub}
                id={sectionId}
                adminControls={adminControls}
              />
            );
          }

          return (
             <div key={sub.uuid || index} id={sectionId} onMouseMove={handleMouseMove} className={`bento-card stagger-item ${isFullWidth ? 'full-width' : ''}`} style={{ animationDelay: `${index * 100}ms` }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2, letterSpacing: '-0.03em' }}>{sub.title}</h3>{isAdmin && isEditMode && sub.slug && (<span className="font-mono" style={{ fontSize: '0.75rem', color: '#666' }}>#{sub.slug}</span>)}</div>
                 {adminControls}
               </div>
               {sub.imagePlaceholder && (<div style={{ marginBottom: '20px' }}><img src={sub.imagePlaceholder} alt="Visual" style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} /></div>)}
               <div style={{ color: '#ccc', lineHeight: '1.75' }}>{renderMarkdownContent(sub.content)}</div>
               {sub.codeBlock && (<div style={{ position: 'relative', marginTop: '16px' }}><CodeBlock text={sub.codeBlock} /><button onClick={() => navigator.clipboard.writeText(sub.codeBlock!)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer', color: '#fff' }} title="Copy"><Copy size={14} /></button></div>)}
               {sub.link && (<a href={sub.link} target="_blank" rel="noreferrer" onClick={() => handleContentOutboundClick('Link', sub.link!)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', color: '#E70012', fontWeight: 600, textDecoration: 'none' }}><LinkIcon size={16} /> Link</a>)}
               {sub.disclaimer && (<InfoBlock>{renderMarkdownContent(sub.disclaimer, { fontSize: '0.9rem', color: '#888', margin: '0' })}</InfoBlock>)}
             </div>
          );
        })}
        {isAdmin && isEditMode && (<button onClick={handleAddNew} className="bento-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', borderStyle: 'dashed', borderColor: '#333', background: 'transparent', cursor: 'pointer', color: '#666', gap: '12px' }}><div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={24} /></div><span style={{ fontWeight: 600 }}>Add Content Block</span></button>)}
      </div>
      <EditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveModal} initialData={editingItemId ? safeSubSections.find(s => s.uuid === editingItemId) : undefined} onDirty={setIsDirty} />
      <ConfirmModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={executeDelete} />
    </div>
  );
};
