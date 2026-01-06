
import React, { useState, useMemo, useEffect } from 'react';
import { SubSection, EditorBlock, GroupMember, Group } from '../types';
import { Trophy, Calendar, Image as ImageIcon, Link as LinkIcon, ArrowRight, Lightbulb, Utensils, Coffee, ChevronDown, ChevronRight, Copy, Crown, Users, MapPin, AlertCircle, Edit2 } from 'lucide-react';
import { trackEvent } from '../utils/firebase';

// --- Constants ---
const LINE_HEIGHT = 1.75;
const MARKER_WIDTH = 30;
const ITEM_GAP = 10;
const INDENT_STEP = MARKER_WIDTH + ITEM_GAP;
const BLOCK_SPACING = '14px';
const LIST_ITEM_SPACING = '6px';

// --- Badge Style Logic (Original for General Tables) ---
const getBadgeStyle = (text: string) => {
  if (!text) return { bg: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid #444' };
  const t = text.trim();
  
  if (t.includes('대표') || t.includes('CEO')) return { bg: 'rgba(234, 179, 8, 0.2)', color: '#fde047', border: '1px solid rgba(161, 98, 7, 0.5)' }; 
  if (t.includes('이사')) return { bg: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', border: '1px solid rgba(126, 34, 206, 0.5)' }; 
  if (t.includes('책임')) return { bg: 'rgba(249, 115, 22, 0.2)', color: '#fdba74', border: '1px solid rgba(194, 12, 12, 0.5)' }; 
  if (t.includes('선임')) return { bg: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(29, 78, 216, 0.5)' }; 
  if (t.includes('사원')) return { bg: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(4, 120, 87, 0.5)' }; 
  
  let hash = 0;
  for (let i = 0; i < t.length; i++) { hash = t.charCodeAt(i) + ((hash << 5) - hash); }

  const h = Math.abs(hash) % 360;
  const s = 75;
  const l = 75;

  return {
    color: `hsl(${h}, ${s}%, ${l}%)`,
    bg: `hsla(${h}, ${s}%, ${l}%, 0.15)`,
    border: `1px solid hsla(${h}, ${s}%, ${l}%, 0.35)`
  };
};

const handleContentOutboundClick = (name: string, url: string) => {
  trackEvent('click_outbound', { link_name: name, link_url: url, location: 'content' });
};

const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const { currentTarget, clientX, clientY } = e;
  const { left, top } = currentTarget.getBoundingClientRect();
  currentTarget.style.setProperty('--mouse-x', `${clientX - left}px`);
  currentTarget.style.setProperty('--mouse-y', `${clientY - top}px`);
};

// --- Helper Components ---
const StepBlock: React.FC<{ number: string, children: React.ReactNode, marginBottom?: string, marginLeft?: number }> = ({ number, children, marginBottom = LIST_ITEM_SPACING, marginLeft = 0 }) => (
  <div style={{ display: 'flex', gap: `${ITEM_GAP}px`, marginBottom: marginBottom, marginLeft: `${marginLeft}px`, alignItems: 'flex-start' }}>
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

const AccordionItem: React.FC<{ title: string, children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: isOpen ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontWeight: 600 }}><span>{title}</span>{isOpen ? <ChevronDown size={18} color="#888" /> : <ChevronRight size={18} color="#888" />}</button>
      {isOpen && <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>{children}</div>}
    </div>
  );
};

const LinkCardBlock: React.FC<{ text: string, url: string }> = ({ text, url }) => (
  <a href={url} target="_blank" rel="noreferrer" onClick={() => handleContentOutboundClick(text, url)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '20px 24px', margin: `28px 0`, textDecoration: 'none', cursor: 'pointer', transition: 'border 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#E70012'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LinkIcon size={20} color="#fff" /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{text}</span><span className="font-mono" style={{ color: '#666', fontSize: '0.8rem' }}>{new URL(url).hostname}</span></div>
    </div>
    <ArrowRight size={18} color="#E70012" />
  </a>
);

const CodeBlock: React.FC<{ text: string }> = ({ text }) => (
  <div className="font-mono" style={{ background: '#090909', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '16px', fontSize: '0.85rem', color: '#E0E0E0', margin: `28px 0`, overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
    {text}
  </div>
);

const InfoBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ 
    background: 'rgba(231,0,18,0.04)', 
    borderLeft: '3px solid #E70012', 
    padding: '16px 20px', 
    borderRadius: '4px', 
    marginTop: '28px', 
    marginBottom: '28px', 
    fontSize: '0.95rem', 
    color: '#ccc', 
    display: 'flex', 
    gap: '14px', 
    alignItems: 'flex-start',
    lineHeight: '1.6'
  }}>
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
        if (linkMatch) {
            return <a key={i} href={linkMatch[2]} target="_blank" rel="noreferrer" onClick={() => handleContentOutboundClick(linkMatch[1], linkMatch[2])} style={{ color: '#E70012', fontWeight: 600, borderBottom: '1px solid rgba(231,0,18,0.3)' }}>{linkMatch[1]}</a>;
        }
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
    if (header.includes('이메일')) return <a href={`mailto:${cell}`} className="font-mono" style={{ color: '#aaa', fontSize: '0.85rem', textDecoration: 'none' }}>{cell}</a>;
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
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
                    {displayHeaders.map((h, k) => {
                       let width = h.includes('이름') ? '25%' : (h.includes('직급') ? '15%' : 'auto');
                       return (
                         <th key={k} style={{ 
                           textAlign: 'left', padding: '14px 12px', color: 'rgba(255,255,255,0.7)', fontSize: '11px', 
                           whiteSpace: 'nowrap', width, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600,
                           borderBottom: '1px solid rgba(255,255,255,0.05)'
                         }}>{h}</th>
                       );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {groupRows.map((rowCells, rIdx) => <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{rowCells.filter((_, cIdx) => cIdx !== groupColumnIndex).map((cell, cIdx) => <td key={cIdx} style={{ padding: '14px 12px', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>{renderCell(cell, displayHeaders[cIdx])}</td>)}</tr>)}
                </tbody>
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
        <thead>
          <tr style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
            {headers.map((h, i) => (
              <th key={i} style={{ 
                padding: '14px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.7)', 
                borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap', fontSize: '11px', 
                textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, i) => <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{row.split('|').map(c => c.trim()).filter(c => c !== '').map((cell, j) => <td key={j} style={{ padding: '14px 12px', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>{renderCell(cell, headers[j] || '')}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
};

interface ArchiveData {
  [year: number]: {
    [month: number]: {
      title: string;
      winner?: string;
      imageUrl?: string;
      description?: string;
      groups?: Group[];
    };
  };
}

interface ContestArchiveCardProps {
  data: SubSection;
  adminControls?: React.ReactNode;
  id?: string;
  onUpdateSubsection?: (updated: SubSection) => void;
}

const hasContent = (data: any) => {
  return !!(data && (data.title || data.imageUrl || data.winner || data.groups?.length > 0 || (data.description && data.description.trim().length > 0)));
};

const getLatestDate = (archive: ArchiveData) => {
  const years = Object.keys(archive).map(Number).sort((a, b) => b - a);
  for (const year of years) {
    const months = Object.keys(archive[year]).map(Number).sort((a, b) => b - a);
    for (const month of months) {
      if (hasContent(archive[year][month])) {
        return { year, month };
      }
    }
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
};

interface MarkdownOptions {
  fontSize?: string;
  color?: string;
  margin?: string;
}

const renderMarkdownContent = (content: string | string[], options: MarkdownOptions = {}) => {
  const lines = (Array.isArray(content) ? content : [content])
    .flatMap(c => typeof c === 'string' ? c.split('\n') : []);
    
  const elements: React.ReactNode[] = [];
  let i = 0;

  const listRegex = /^(\s*(\d+|[a-zA-Z]|[ivxIVX]+)\.\s+)/;
  const bulletRegex = /^(\s*(\-|•|\*)\s+)/;
  const hrRegex = /^\s*-{3,}\s*$/;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (rawLine === '' || line === '') {
        elements.push(<div key={`gap-${i}`} style={{ height: '0.8em' }} />);
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
      while (i < lines.length && !lines[i].trim().startsWith('```')) { codeLines.push(lines[i]); i++; }
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
       if (imgMatch) { elements.push(<div key={i} style={{ margin: `28px 0` }}><img src={imgMatch[2]} alt={imgMatch[1]} referrerPolicy="no-referrer" style={{ width: '100%', borderRadius: '12px', border: '1px solid #333' }} /></div>); i++; continue; }
    }
    if (line.startsWith('[') && line.endsWith(')') && !line.includes('!') && line.match(/^\[(.*?)\]\((.*?)\)$/)) {
       const linkMatch = line.match(/^\[(.*?)\]\((.*?)\)$/);
       if (linkMatch) { elements.push(<LinkCardBlock key={i} text={linkMatch[1]} url={linkMatch[2]} />); i++; continue; }
    }
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
    if (line.startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) { quoteLines.push(lines[i].trim().replace(/^>\s?/, '')); i++; }
        elements.push(<InfoBlock key={`quote-${i}`}>{renderMarkdownContent(quoteLines.join('\n'), { fontSize: '0.95rem', color: '#bbb', margin: '0' })}</InfoBlock>);
        continue;
    }
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
      case 'heading':
        return <div key={block.id} style={{ fontSize: '1.2rem', fontWeight: 600, color: '#e0e0e0', marginTop: idx === 0 ? '0' : '32px', marginBottom: '16px', lineHeight: 1.3 }}>{parseInlineMarkdown(block.value)}</div>;
      case 'paragraph':
        return <div key={block.id}>{renderMarkdownContent(block.value)}</div>;
      case 'list':
        return <div key={block.id}>{renderMarkdownContent(block.value, { margin: '0' })}</div>;
      case 'quote':
        return <InfoBlock key={block.id}>{renderMarkdownContent(block.value, { fontSize: '0.95rem', color: '#bbb', margin: '0' })}</InfoBlock>;
      case 'code':
        return <CodeBlock key={block.id} text={block.value} />;
      case 'table':
        return <TableBlock key={block.id} text={block.value} />;
      case 'divider':
        return <hr key={block.id} style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #333' }} />;
      case 'media':
        return (
          <div key={block.id} style={{ margin: `28px 0` }}>
            <img src={block.value} alt="Visual Content" referrerPolicy="no-referrer" style={{ width: '100%', height: 'auto', borderRadius: '8px', border: '1px solid #333' }} />
          </div>
        );
      case 'link':
        return <LinkCardBlock key={block.id} text={block.value2 || 'Link'} url={block.value} />;
      case 'disclaimer':
        return <InfoBlock key={block.id}>{renderMarkdownContent(block.value, { fontSize: '0.9rem', color: '#888', margin: '0' })}</InfoBlock>;
      default:
        return null;
    }
  });
};

export const ContestArchiveCard: React.FC<ContestArchiveCardProps> = ({ data, adminControls, id, onUpdateSubsection }) => {
  const isContest = data.slug === 'aicontest';
  const isDining = data.slug === 'frum-dining';
  const isCoffee = data.slug === 'coffee-chat';
  const isCompact = isDining || isCoffee;

  const archiveData = useMemo(() => {
    if (data.codeBlock) {
        try {
            const parsed = JSON.parse(data.codeBlock);
            if (typeof parsed === 'object') return parsed as ArchiveData;
        } catch (e) {
        }
    }
    return {};
  }, [data.codeBlock]);

  const latest = useMemo(() => getLatestDate(archiveData), [archiveData]);
  const [selectedYear, setSelectedYear] = useState<number>(latest.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(latest.month);
  
  // State for Dining Reservation
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [reserveDate, setReserveDate] = useState('');
  const [reservePlace, setReservePlace] = useState('');

  useEffect(() => {
    const yearData = archiveData[selectedYear];
    if (yearData) {
      const monthsWithContent = Object.keys(yearData)
        .map(Number)
        .filter(m => hasContent(yearData[m]))
        .sort((a, b) => b - a);
      if (monthsWithContent.length > 0) {
        setSelectedMonth(monthsWithContent[0]);
      }
    }
  }, [selectedYear, archiveData]);

  const currentData = archiveData[selectedYear]?.[selectedMonth];
  const HeaderIcon = isDining ? Utensils : (isCoffee ? Coffee : Trophy);
  const years = [2025, 2026, 2027];
  const activeYearIndex = years.indexOf(selectedYear);

  // Dining conflict detection
  const reservationConflicts = useMemo(() => {
    if (!isDining || !currentData?.groups) return new Set<string>();
    const dateMap: Record<string, string[]> = {};
    currentData.groups.forEach(g => {
      if (g.reservation?.date) {
        if (!dateMap[g.reservation.date]) dateMap[g.reservation.date] = [];
        dateMap[g.reservation.date].push(g.name);
      }
    });
    return new Set(Object.keys(dateMap).filter(d => dateMap[d].length > 1));
  }, [isDining, currentData]);

  const handleUpdateReservation = (groupId: string) => {
    if (!onUpdateSubsection || !currentData?.groups) return;
    
    const updatedGroups = currentData.groups.map(g => {
      if (g.id === groupId) {
        return { ...g, reservation: { date: reserveDate, restaurant: reservePlace } };
      }
      return g;
    });

    const newArchiveData = {
      ...archiveData,
      [selectedYear]: {
        ...archiveData[selectedYear],
        [selectedMonth]: { ...currentData, groups: updatedGroups }
      }
    };

    onUpdateSubsection({
      ...data,
      codeBlock: JSON.stringify(newArchiveData)
    });
    setEditingGroupId(null);
  };

  return (
    <div id={id} onMouseMove={handleMouseMove} className="bento-card full-width stagger-item" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '32px 32px 24px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', background: 'rgba(231,0,18,0.1)', borderRadius: '10px' }}>
                    <HeaderIcon color="#E70012" size={22} strokeWidth={2.5} />
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2, letterSpacing: '-0.03em' }}>{data.title}</h3>
            </div>
            {adminControls && (
                <div style={{ marginLeft: '16px' }}>{adminControls}</div>
            )}
        </div>
        <div style={{ color: '#ccc', lineHeight: '1.6', fontSize: '1rem' }}>
          {data.blocks && data.blocks.length > 0 ? (
            renderBlocks(data.blocks)
          ) : (
            data.items && data.items.length > 0 ? renderMarkdownContent(data.items) : renderMarkdownContent(data.content)
          )}
        </div>
      </div>

      <div style={{ background: '#0a0a0a' }}>
        <div style={{ padding: '20px 32px 0 32px' }}>
            <div style={{ 
                position: 'relative',
                display: 'flex', 
                background: 'rgba(255,255,255,0.03)', 
                padding: '4px', 
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)',
                isolation: 'isolate'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    height: 'calc(100% - 8px)',
                    width: `calc((100% - 8px) / ${years.length})`,
                    transform: `translateX(${activeYearIndex * 100}%)`,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    zIndex: -1
                }} />

                {years.map(year => (
                    <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: 'none',
                        color: selectedYear === year ? '#fff' : '#666',
                        fontSize: '0.9rem',
                        fontWeight: selectedYear === year ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                        zIndex: 2,
                        fontFamily: 'inherit'
                    }}
                    >
                    {year} Season
                    </button>
                ))}
            </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(6, 1fr)', 
          gap: '12px', 
          padding: '20px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.08)' 
        }}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
             const d = archiveData[selectedYear]?.[month];
             const hasData = hasContent(d);
             if (!hasData) return null;
             const isSelected = selectedMonth === month;
             return (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                style={{
                  position: 'relative',
                  padding: '12px 8px',
                  borderRadius: '10px',
                  border: isSelected ? '1px solid #E70012' : '1px solid rgba(255,255,255,0.05)',
                  background: isSelected ? 'rgba(231,0,18,0.1)' : 'rgba(255,255,255,0.02)',
                  color: isSelected ? '#fff' : '#888',
                  fontSize: '0.9rem',
                  fontWeight: isSelected ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  overflow: 'hidden',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {isSelected && (
                    <div style={{
                        position: 'absolute', top: '6px', right: '6px', width: '4px', height: '4px',
                        borderRadius: '50%', background: '#E70012', boxShadow: '0 0 8px #E70012'
                    }} />
                )}
                {month}월
              </button>
             );
          })}
        </div>
      </div>

      <div style={{ padding: '32px', minHeight: '300px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#666', fontSize: '0.9rem', fontWeight: 600 }}>
          <Calendar size={16} />
          <span className="font-mono">{selectedYear}년 {selectedMonth}월</span>
        </div>

        {currentData && hasContent(currentData) ? (
          <div className="animate-fade">
            {currentData.imageUrl && (
                <div style={{ 
                  width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '12px', overflow: 'hidden', 
                  border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px', position: 'relative'
                }}>
                  <img src={currentData.imageUrl} alt={currentData.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {isContest && (
                    <div className="font-mono" style={{ 
                        position: 'absolute', top: '16px', right: '16px', background: '#E70012', color: '#fff', 
                        padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                        <Trophy size={14} fill="white" /> 1st Place
                    </div>
                  )}
                </div>
            )}
            <h4 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: isCompact ? '12px' : '24px', color: '#fff', letterSpacing: '-0.02em' }}>{currentData.title}</h4>
            
            {currentData.groups && currentData.groups.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: isCompact ? '20px' : '24px', marginTop: isCompact ? '16px' : '32px' }}>
                    {currentData.groups.map((group, gIdx) => {
                        const leaders = group.members.filter(m => m.isLeader);
                        const members = group.members.filter(m => !m.isLeader);
                        const isConflicted = group.reservation?.date && reservationConflicts.has(group.reservation.date);
                        const isEditing = editingGroupId === group.id;

                        if (isCompact) {
                          return (
                            <div key={group.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                {/* Flattened Header */}
                                <div style={{ padding: '20px 20px 12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>{group.name}</span>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                      {leaders.map((leader, i) => {
                                        return (
                                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Crown size={12} color="#E70012" />
                                            <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.8rem' }}>{leader.name}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                </div>

                                <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {/* Borderless Text Flow Layout for Members (Only Names) */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', rowGap: '8px', columnGap: '16px' }}>
                                        {members.map((member, i) => {
                                          return (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                              <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.8rem' }}>{member.name}</span>
                                            </div>
                                          );
                                        })}
                                    </div>

                                    {isDining && (
                                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                                        {isEditing ? (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                              <input type="date" value={reserveDate} onChange={e => setReserveDate(e.target.value)} style={{ flex: 1, padding: '6px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '0.75rem' }} />
                                              <input type="text" value={reservePlace} onChange={e => setReservePlace(e.target.value)} placeholder="식당명" style={{ flex: 1.5, padding: '6px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '0.75rem' }} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                              <button onClick={() => handleUpdateReservation(group.id)} style={{ flex: 1, padding: '6px', background: '#E70012', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}>저장</button>
                                              <button onClick={() => setEditingGroupId(null)} style={{ flex: 1, padding: '6px', background: '#333', color: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>취소</button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: group.reservation ? 'rgba(255,255,255,0.5)' : '#333' }}>
                                                <span className="font-mono" style={{ fontSize: '0.7rem', fontWeight: 500 }}>
                                                  {group.reservation ? `${group.reservation.date} @ ${group.reservation.restaurant}` : "미등록 일정"}
                                                </span>
                                              </div>
                                              {isConflicted && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.6rem', marginTop: '2px', fontWeight: 600 }}>
                                                  <AlertCircle size={10} /> 일정 중복
                                                </div>
                                              )}
                                            </div>
                                            {adminControls && (
                                              <button 
                                                onClick={() => { setEditingGroupId(group.id); setReserveDate(group.reservation?.date || ''); setReservePlace(group.reservation?.restaurant || ''); }} 
                                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 8px', borderRadius: '4px', color: '#555', fontSize: '0.7rem', cursor: 'pointer' }}
                                              >
                                                <Edit2 size={12} />
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                </div>
                            </div>
                          );
                        }

                        return (
                            <div key={group.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ background: 'rgba(231,0,18,0.05)', padding: '16px 20px', borderBottom: '1px solid rgba(231,0,18,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>{group.name}</span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {leaders.map((_, i) => <Crown key={i} size={14} color="#E70012" />)}
                                    </div>
                                </div>
                                
                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                                    {leaders.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', rowGap: '8px' }}>
                                            {leaders.map((leader, i) => {
                                                return (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Crown size={14} color="#E70012" />
                                                        <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{leader.name}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {members.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', rowGap: '10px', columnGap: '20px' }}>
                                            {members.map((member, i) => {
                                                return (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>{member.name}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Dining Reservation UI (Non-Compact fallback) */}
                                    {isDining && (
                                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginTop: 'auto' }}>
                                        {isEditing ? (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <input type="date" value={reserveDate} onChange={e => setReserveDate(e.target.value)} style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }} />
                                            <input type="text" value={reservePlace} onChange={e => setReservePlace(e.target.value)} placeholder="방문 예정 식당" style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }} />
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                              <button onClick={() => handleUpdateReservation(group.id)} style={{ flex: 1, padding: '8px', background: '#E70012', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>저장</button>
                                              <button onClick={() => setEditingGroupId(null)} style={{ flex: 1, padding: '8px', background: '#333', color: '#ccc', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>취소</button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: group.reservation ? '#fff' : '#555' }}>
                                              <MapPin size={16} color={group.reservation ? '#E70012' : '#333'} />
                                              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{group.reservation ? `${group.reservation.date} @ ${group.reservation.restaurant}` : "미등록 일정"}</span>
                                            </div>
                                            {isConflicted && (
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.7rem', marginTop: '4px' }}>
                                                <AlertCircle size={12} /> 타 조와 일정이 겹칩니다 (비상카드 확인)
                                              </div>
                                            )}
                                            {adminControls && (
                                              <button 
                                                onClick={() => { setEditingGroupId(group.id); setReserveDate(group.reservation?.date || ''); setReservePlace(group.reservation?.restaurant || ''); }} 
                                                style={{ marginTop: '8px', alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '6px', color: '#888', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                                              >일정 업데이트</button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{ color: '#ccc', lineHeight: '1.75', fontSize: '1rem', marginTop: '20px' }}>
                    {renderMarkdownContent(currentData.description || '')}
                </div>
            )}
          </div>
        ) : (
          <div style={{ 
            height: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
            color: '#444', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)'
          }}>
            <HeaderIcon size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
            <p style={{ fontSize: '1rem', fontWeight: 500 }}>등록된 콘텐츠가 없습니다.</p>
            <p style={{ fontSize: '0.85rem' }}>편집 버튼을 눌러 콘텐츠를 추가해주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};
