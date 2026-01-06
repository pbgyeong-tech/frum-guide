
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SectionData, ContentType, SubSection, ContentSnapshot, EditorBlock } from '../types';
import { HANDBOOK_CONTENT } from '../constants';
import { Edit3, Plus, Trash2, ArrowUp, ArrowDown, Link as LinkIcon, ArrowRight, Lightbulb, ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { FaqSearch } from './FaqSearch';
import { EditModal } from './EditModal';
import { ConfirmModal } from './ConfirmModal';
import { ContestArchiveCard } from './ContestArchiveCard';
import { trackAnchorView, trackEvent } from '../utils/firebase';
import { addEditLog, generateUUID } from '../utils/db';

// --- Layout Constants ---
const LINE_HEIGHT = 1.75; 
const MARKER_WIDTH = 30; 
const ITEM_GAP = 10; 
const INDENT_STEP = MARKER_WIDTH + ITEM_GAP; 
const BLOCK_SPACING = '14px'; 
const LIST_ITEM_SPACING = '6px'; 

const ARCHIVE_SLUGS = ['aicontest', 'frum-dining', 'coffee-chat'];

interface MarkdownOptions {
  fontSize?: string;
  color?: string;
  margin?: string;
}

const getBadgeStyle = (text: string) => {
  if (!text) return { bg: 'rgba(255,255,255,0.05)', color: '#ccc', border: '1px solid #444' };
  const t = text.trim();
  if (t.includes('대표') || t.includes('CEO')) return { bg: 'rgba(234, 179, 8, 0.15)', color: '#fde047', border: '1px solid rgba(161, 98, 7, 0.4)' }; 
  if (t.includes('이사')) return { bg: 'rgba(168, 85, 247, 0.15)', color: '#e9d5ff', border: '1px solid rgba(126, 34, 206, 0.4)' }; 
  if (t.includes('책임')) return { bg: 'rgba(249, 115, 22, 0.15)', color: '#fdba74', border: '1px solid rgba(194, 12, 12, 0.4)' }; 
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

const renderMarkdownContent = (content: string | string[], options: MarkdownOptions = {}) => {
  const lines = (Array.isArray(content) ? content : [content]).flatMap(c => typeof c === 'string' ? c.split('\n') : []);
  const elements: React.ReactNode[] = [];
  let i = 0;
  const listRegex = /^(\s*(\d+|[a-zA-Z]|[ivxIVX]+)\.\s+)/;
  const bulletRegex = /^(\s*(\-|•|\*)\s+)/;
  const hrRegex = /^\s*-{3,}\s*$/;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (rawLine === '' || line === '') { elements.push(<div key={`gap-${i}`} style={{ height: '0.8em' }} />); i++; continue; }
    const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headerMatch) { const level = headerMatch[1].length; const text = headerMatch[2]; elements.push(<div key={`header-${i}`} style={{ fontSize: level === 1 ? '2.5rem' : (level === 2 ? '1.8rem' : '1.3rem'), fontWeight: 800, color: '#fff', marginTop: i === 0 ? '0' : '32px', marginBottom: '16px', lineHeight: 1.2 }}>{parseInlineMarkdown(text)}</div>); i++; continue; }
    if (line.startsWith('```')) { const codeLines = []; i++; while (i < lines.length && !lines[i].trim().startsWith('```')) { codeLines.push(lines[i]); i++; } elements.push(<CodeBlock key={`code-${i}`} text={codeLines.join('\n')} />); i++; continue; }
    if (line.startsWith('|')) { const tableLines = []; while (i < lines.length && lines[i].trim().startsWith('|')) { tableLines.push(lines[i]); i++; } elements.push(<TableBlock key={`table-${i}`} text={tableLines.join('\n')} />); continue; }
    const isUnordered = bulletRegex.test(rawLine);
    const isOrdered = listRegex.test(rawLine);
    if (isOrdered || isUnordered) {
        const indentMatch = rawLine.match(/^(\s*)/);
        const level = Math.floor((indentMatch ? indentMatch[1].length : 0) / 2);
        const matchRoman = line.match(/^([ivxIVX]+)\.\s+(.*)/);
        const matchAlpha = line.match(/^([a-zA-Z])\.\s+(.*)/);
        const matchNum = line.match(/^(\d+)\.\s+(.*)/);
        const matchUn = line.match(/^(\-|•|\*)\s+(.*)/);
        let renderedItem = null;
        if (isUnordered && matchUn) renderedItem = <div style={{ display: 'flex', alignItems: 'flex-start', gap: `${ITEM_GAP}px`, marginBottom: LIST_ITEM_SPACING, marginLeft: `${level * INDENT_STEP}px` }}><span style={{ color: '#666', fontSize: '1.2rem', width: `${MARKER_WIDTH}px`, textAlign: 'center', flexShrink: 0, marginTop: '-4px' }}>•</span><span style={{ color: '#b0b0b0', fontSize: '1rem', flex: 1 }}>{parseInlineMarkdown(matchUn[2])}</span></div>;
        else if (matchNum) renderedItem = <StepBlock number={matchNum[1]} marginLeft={level * INDENT_STEP}>{parseInlineMarkdown(matchNum[2])}</StepBlock>;
        else if (matchRoman && level >= 1) renderedItem = <RomanBlock marker={matchRoman[1]} marginLeft={level * INDENT_STEP}>{parseInlineMarkdown(matchRoman[2])}</RomanBlock>;
        else if (matchAlpha) renderedItem = <AlphaBlock marker={matchAlpha[1]} marginLeft={level * INDENT_STEP}>{parseInlineMarkdown(matchAlpha[2])}</AlphaBlock>;
        else renderedItem = <p style={{ marginLeft: `${level * INDENT_STEP}px`, color: '#a0a0a0' }}>{parseInlineMarkdown(line)}</p>;
        elements.push(<div key={i}>{renderedItem}</div>);
        i++; continue;
    }
    if (hrRegex.test(line)) { elements.push(<hr key={i} style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #333' }} />); i++; continue; }
    if (line.startsWith('>')) { const quoteLines: string[] = []; while (i < lines.length && lines[i].trim().startsWith('>')) { quoteLines.push(lines[i].trim().replace(/^>\s?/, '')); i++; } elements.push(<InfoBlock key={`quote-${i}`}>{renderMarkdownContent(quoteLines.join('\n'), { fontSize: '0.95rem', color: '#bbb', margin: '0' })}</InfoBlock>); continue; }
    const paragraphLines: string[] = [line];
    let j = i + 1;
    while (j < lines.length) {
         const nextRawLine = lines[j];
         const nextLine = nextRawLine.trim();
         if (nextLine === '' || /^(#{1,6})\s/.test(nextLine) || nextLine.startsWith('```') || nextLine.startsWith('|') || nextLine.match(/!\[(.*?)\]\((.*?)\)/) || nextLine.match(/^\[(.*?)\]\((.*?)\)$/) || listRegex.test(nextRawLine) || bulletRegex.test(nextRawLine) || hrRegex.test(nextLine) || nextLine.startsWith('>')) break;
         paragraphLines.push(nextLine);
         j++;
    }
    elements.push(<p key={i} style={{ marginBottom: BLOCK_SPACING, color: options.color || '#a0a0a0', lineHeight: LINE_HEIGHT, fontSize: options.fontSize || '1.05rem' }}>{paragraphLines.map((l, idx) => <React.Fragment key={idx}>{parseInlineMarkdown(l)}{idx < paragraphLines.length - 1 && <br />}</React.Fragment>)}</p>);
    i = j;
  }
  return elements;
};

const renderBlocks = (blocks: EditorBlock[]) => {
  return blocks.map((block, idx) => {
    switch (block.type) {
      case 'heading': return <div key={block.id} style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: idx === 0 ? '0' : '32px', marginBottom: '16px', lineHeight: 1.2 }}>{parseInlineMarkdown(block.value)}</div>;
      case 'paragraph': return <div key={block.id}>{renderMarkdownContent(block.value)}</div>;
      case 'list': return <div key={block.id}>{renderMarkdownContent(block.value, { margin: '0' })}</div>;
      case 'quote': return <InfoBlock key={block.id}>{renderMarkdownContent(block.value, { fontSize: '0.95rem', color: '#bbb', margin: '0' })}</InfoBlock>;
      case 'code': return <CodeBlock key={block.id} text={block.value} />;
      case 'table': return <TableBlock key={block.id} text={block.value} />;
      case 'divider': return <hr key={block.id} style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #333' }} />;
      case 'media': return <div key={block.id} style={{ margin: `28px 0` }}><img src={block.value} alt="Visual" style={{ width: '100%', height: 'auto', borderRadius: '12px', border: '1px solid #333' }} /></div>;
      case 'link': return <LinkCardBlock key={block.id} text={block.value2 || 'Link'} url={block.value} />;
      case 'disclaimer': return <InfoBlock key={block.id}>{renderMarkdownContent(block.value, { fontSize: '0.9rem', color: '#888', margin: '0' })}</InfoBlock>;
      default: return null;
    }
  });
};

export const ContentRenderer: React.FC<any> = ({ data, allContent, onNavigate, onUpdateContent, setIsDirty, isAdmin, user }) => {
  const [editingSub, setEditingSub] = useState<SubSection | undefined>(undefined);
  const [deleteSub, setDeleteSub] = useState<SubSection | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState<string>('');
  
  const isWelcome = data.id === ContentType.WELCOME;
  const isFaq = data.id === ContentType.FAQ;
  const quickLinkSections = HANDBOOK_CONTENT.filter(s => s.id !== ContentType.WELCOME && s.id !== ContentType.FAQ);

  useEffect(() => {
    const handleScroll = () => {
      const anchors = data.subSections.map((sub: any) => sub.slug || sub.title.toLowerCase().replace(/\s/g, '-'));
      const mainContent = document.querySelector('.main-content');
      if (!mainContent) return;
      for (const anchor of anchors) {
        const el = document.getElementById(anchor);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            if (activeAnchor !== anchor) { setActiveAnchor(anchor); trackAnchorView(data.id, anchor); }
            break;
          }
        }
      }
    };
    const mainContent = document.querySelector('.main-content');
    mainContent?.addEventListener('scroll', handleScroll);
    return () => mainContent?.removeEventListener('scroll', handleScroll);
  }, [data.subSections, activeAnchor, data.id]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth' }); setActiveAnchor(id); }
  };

  const handleAddNew = () => { setEditingSub(undefined); setIsModalOpen(true); };
  const handleEdit = (sub: SubSection) => { setEditingSub(sub); setIsModalOpen(true); };
  const handleDeleteConfirm = () => {
    if (!deleteSub) return;
    const newSubSections = data.subSections.filter((s: any) => s.uuid !== deleteSub.uuid);
    onUpdateContent(data.id, newSubSections);
    setDeleteSub(undefined);
  };
  const handleSave = (updatedSub: SubSection) => {
    let newSubSections: SubSection[];
    const isUpdate = editingSub !== undefined;
    if (isUpdate) newSubSections = data.subSections.map((s: any) => s.uuid === updatedSub.uuid ? updatedSub : s);
    else newSubSections = [...data.subSections, updatedSub];
    onUpdateContent(data.id, newSubSections);
  };
  const handleReorder = (index: number, direction: 'up' | 'down') => {
    const newSubSections = [...data.subSections];
    const target = index + (direction === 'up' ? -1 : 1);
    if (target < 0 || target >= newSubSections.length) return;
    [newSubSections[index], newSubSections[target]] = [newSubSections[target], newSubSections[index]];
    onUpdateContent(data.id, newSubSections);
  };

  if (isWelcome) return (
    <div className="animate-fade">
      <div className="hero-full-width-container">
        <div className="hero-overlay-gradient" />
        <div className="brand-slash-container">
          <div className="brand-slash-line" />
        </div>
        <div className="hero-bottom-gradient" />
        <video autoPlay loop muted playsInline className="hero-full-width-media">
          <source src={data.heroVideo} type="video/mp4" />
        </video>
        <div className="hero-text-container">
          <h1 className="hero-title">{data.title}</h1>
        </div>
      </div>
      <div className="content-wrapper with-hero">
        <div className="grid-layout">
          {quickLinkSections.map((section: any, idx: number) => {
            const Icon = section.icon;
            return (
              <button key={section.id} onClick={() => onNavigate(section.id)} onMouseMove={handleMouseMove} className={`bento-card stagger-item delay-${Math.min(idx, 2)}`} style={{ textAlign: 'left', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <Icon size={24} color="#E70012" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{section.title}</h3>
                </div>
                <p style={{ fontSize: '0.95rem', color: '#999', lineHeight: '1.5' }}>{section.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade">
      <div className="content-wrapper">
        <header className="page-header stagger-item">
          <div style={{ flex: 1 }}>
              <h1 className="hero-title">{data.title}</h1>
              <h2 className="hero-desc">{data.description}</h2>
          </div>
          {/* Edit toggle button removed, editing is now always active for admins */}
        </header>

        {!isFaq && data.subSections.length > 1 && (
          <div className="toc-wrapper stagger-item delay-1">
            <div className="toc-sticky-bar">
              {data.subSections.map((sub: any, i: number) => {
                const anchorId = sub.slug || sub.title.toLowerCase().replace(/\s/g, '-');
                const isActive = activeAnchor === anchorId;
                return (
                  <button key={i} onClick={() => scrollToSection(anchorId)} style={{ padding: '8px 16px', borderRadius: '20px', background: isActive ? 'rgba(231,0,18,0.1)' : 'rgba(255,255,255,0.05)', border: '1px solid', borderColor: isActive ? '#E70012' : 'rgba(255,255,255,0.1)', color: isActive ? '#fff' : '#888', fontSize: '0.85rem', fontWeight: isActive ? 700 : 500, cursor: 'pointer', transition: 'all 0.2s' }}>
                    {sub.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isFaq ? <FaqSearch onNavigate={onNavigate} content={allContent} /> : (
          <div className="grid-layout">
            {data.subSections.map((sub: any, index: number) => {
              const anchorId = sub.slug || sub.title.toLowerCase().replace(/\s/g, '-');
              const isArchive = sub.slug && ARCHIVE_SLUGS.includes(sub.slug);
              
              const adminControls = isAdmin && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleReorder(index, 'up')} disabled={index === 0} style={{ color: index === 0 ? '#222' : '#444', background: 'none', border: 'none', cursor: 'pointer' }}><ArrowUp size={16}/></button>
                  <button onClick={() => handleReorder(index, 'down')} disabled={index === data.subSections.length - 1} style={{ color: index === data.subSections.length - 1 ? '#222' : '#444', background: 'none', border: 'none', cursor: 'pointer' }}><ArrowDown size={16}/></button>
                  <button onClick={() => handleEdit(sub)} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}><Edit3 size={18} /></button>
                  <button onClick={() => setDeleteSub(sub)} style={{ color: '#E70012', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                </div>
              );

              if (isArchive) return (
                <ContestArchiveCard key={sub.uuid || index} id={anchorId} data={sub} onUpdateSubsection={(updated: any) => { const newSubs = data.subSections.map((s: any) => s.uuid === updated.uuid ? updated : s); onUpdateContent(data.id, newSubs); }} adminControls={adminControls} />
              );
              return (
                <section key={sub.uuid || index} id={anchorId} onMouseMove={handleMouseMove} className={`bento-card full-width stagger-item`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>{sub.title}</h3>
                    {adminControls}
                  </div>
                  <div style={{ color: '#ccc', lineHeight: '1.75' }}>
                    {sub.blocks && sub.blocks.length > 0 ? renderBlocks(sub.blocks) : renderMarkdownContent(sub.content)}
                  </div>
                </section>
              );
            })}
            
            {isAdmin && (
              <button onClick={handleAddNew} className="bento-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', borderStyle: 'dashed', borderColor: '#333', background: 'transparent', cursor: 'pointer', color: '#666', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={24} />
                </div>
                <span style={{ fontWeight: 600 }}>Add Content Block</span>
              </button>
            )}
          </div>
        )}
      </div>
      <EditModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setIsDirty(false); }} onSave={handleSave} initialData={editingSub} onDirty={setIsDirty} />
      <ConfirmModal isOpen={!!deleteSub} onClose={() => setDeleteSub(undefined)} onConfirm={handleDeleteConfirm} />
    </div>
  );
};
