
import React, { useState, useMemo, useEffect } from 'react';
import { SubSection } from '../types';
import { Trophy, Calendar, Image as ImageIcon, Link as LinkIcon, ArrowRight, Lightbulb, Utensils, Coffee, ChevronDown, ChevronRight } from 'lucide-react';
import { trackEvent } from '../utils/firebase';

// --- Badge Style Logic ---
// Expanded Palette to 19 (Prime number) to minimize collisions
const BADGE_PALETTE = [
  { bg: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(185, 28, 28, 0.5)' }, // Red
  { bg: 'rgba(249, 115, 22, 0.2)', color: '#fdba74', border: '1px solid rgba(194, 65, 12, 0.5)' }, // Orange
  { bg: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', border: '1px solid rgba(180, 83, 9, 0.5)' }, // Amber
  { bg: 'rgba(250, 204, 21, 0.2)', color: '#fef08a', border: '1px solid rgba(234, 179, 8, 0.5)' }, // Yellow
  { bg: 'rgba(132, 204, 22, 0.2)', color: '#bef264', border: '1px solid rgba(63, 98, 18, 0.5)' }, // Lime
  { bg: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(4, 120, 87, 0.5)' }, // Emerald
  { bg: 'rgba(20, 184, 166, 0.2)', color: '#5eead4', border: '1px solid rgba(15, 118, 110, 0.5)' }, // Teal
  { bg: 'rgba(6, 182, 212, 0.2)', color: '#67e8f9', border: '1px solid rgba(21, 94, 117, 0.5)' }, // Cyan
  { bg: 'rgba(14, 165, 233, 0.2)', color: '#7dd3fc', border: '1px solid rgba(3, 105, 161, 0.5)' }, // Sky
  { bg: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(29, 78, 216, 0.5)' }, // Blue
  { bg: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(67, 56, 202, 0.5)' }, // Indigo
  { bg: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', border: '1px solid rgba(109, 40, 217, 0.5)' }, // Violet
  { bg: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', border: '1px solid rgba(126, 34, 206, 0.5)' }, // Purple
  { bg: 'rgba(217, 70, 239, 0.2)', color: '#f0abfc', border: '1px solid rgba(162, 28, 175, 0.5)' }, // Fuchsia
  { bg: 'rgba(236, 72, 153, 0.2)', color: '#f9a8d4', border: '1px solid rgba(190, 24, 93, 0.5)' }, // Pink
  { bg: 'rgba(244, 63, 94, 0.2)', color: '#fda4af', border: '1px solid rgba(190, 18, 60, 0.5)' }, // Rose
  { bg: 'rgba(100, 116, 139, 0.2)', color: '#cbd5e1', border: '1px solid rgba(71, 85, 105, 0.5)' }, // Slate
  { bg: 'rgba(113, 113, 122, 0.2)', color: '#d4d4d8', border: '1px solid rgba(82, 82, 91, 0.5)' }, // Zinc
  { bg: 'rgba(120, 113, 108, 0.2)', color: '#d6d3d1', border: '1px solid rgba(87, 83, 78, 0.5)' }, // Stone
];

const getBadgeStyle = (text: string) => {
  if (!text) return BADGE_PALETTE[0];
  const t = text.trim();
  
  // Specific role overrides
  if (t.includes('대표') || t.includes('CEO')) return { bg: 'rgba(234, 179, 8, 0.2)', color: '#fde047', border: '1px solid rgba(161, 98, 7, 0.5)' }; 
  if (t.includes('이사')) return { bg: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', border: '1px solid rgba(126, 34, 206, 0.5)' }; 
  if (t.includes('책임')) return { bg: 'rgba(249, 115, 22, 0.2)', color: '#fdba74', border: '1px solid rgba(194, 65, 12, 0.5)' }; 
  if (t.includes('선임')) return { bg: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(29, 78, 216, 0.5)' }; 
  if (t.includes('사원')) return { bg: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(4, 120, 87, 0.5)' }; 
  
  // Improved Hash Function (djb2 variant) for better distribution
  let hash = 5381;
  for (let i = 0; i < t.length; i++) {
    // hash * 33 ^ charCode
    hash = (hash * 33) ^ t.charCodeAt(i);
  }
  
  // Ensure positive index
  return BADGE_PALETTE[(hash >>> 0) % BADGE_PALETTE.length];
};

// --- Markdown Helpers ---
const handleContentOutboundClick = (name: string, url: string) => {
  trackEvent('click_outbound', { link_name: name, link_url: url, location: 'content' });
};

const LinkCardBlock: React.FC<{ text: string, url: string }> = ({ text, url }) => (
  <a href={url} target="_blank" rel="noreferrer" onClick={() => handleContentOutboundClick(text, url)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '20px 24px', margin: '20px 0', textDecoration: 'none', cursor: 'pointer', transition: 'border 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#E70012'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LinkIcon size={20} color="#fff" /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{text}</span><span style={{ color: '#666', fontSize: '0.8rem' }}>{new URL(url).hostname}</span></div>
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
  <div style={{ background: '#050505', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#E0E0E0', margin: '16px 0', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
    {text}
  </div>
);

const InfoBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ background: 'linear-gradient(90deg, rgba(231,0,18,0.05) 0%, rgba(20,20,20,0.5) 100%)', borderLeft: '2px solid #E70012', padding: '16px', borderRadius: '0 8px 8px 0', marginTop: '20px', marginBottom: '20px', fontSize: '0.9rem', color: '#ddd', display: 'flex', gap: '12px', alignItems: 'flex-start', whiteSpace: 'pre-wrap' }}>
    <Lightbulb size={18} color="#E70012" style={{ flexShrink: 0, marginTop: '2px' }} />
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
        if (codeMatch) return <code key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>{codeMatch[1]}</code>;
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
      return <span style={{ backgroundColor: style.bg, color: style.color, border: style.border, padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{cell}</span>;
    }
    if (header.includes('이메일')) return <a href={`mailto:${cell}`} style={{ color: '#aaa' }}>{cell}</a>;
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
  const lines = Array.isArray(content) ? content : content.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Code Block
    if (trimmedLine.startsWith('```')) {
      const codeLines = []; i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) { codeLines.push(lines[i]); i++; }
      elements.push(<CodeBlock key={`code-${i}`} text={codeLines.join('\n')} />);
      i++; continue;
    }

    // Table Block
    if (trimmedLine.startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { tableLines.push(lines[i]); i++; }
      elements.push(<TableBlock key={`table-${i}`} text={tableLines.join('\n')} />);
      continue;
    }
    
    // Images
    if (line.includes('![') && line.includes(')')) {
       const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
       if (imgMatch) {
         if (trimmedLine.startsWith('![') && trimmedLine.endsWith(')')) {
            elements.push(<div key={i} style={{ margin: '24px 0' }}><img src={imgMatch[2]} alt={imgMatch[1]} referrerPolicy="no-referrer" style={{ width: '100%', borderRadius: '8px', border: '1px solid #222' }} /></div>);
         } else {
            elements.push(<p key={i} style={{ marginBottom: '8px', color: '#ccc' }}>{parseInlineMarkdown(line)}</p>);
         }
         i++; continue;
       }
    }
    
    // Link Cards
    if (trimmedLine.startsWith('[') && trimmedLine.endsWith(')') && !trimmedLine.includes('!')) {
       const linkMatch = trimmedLine.match(/^\[(.*?)\]\((.*?)\)$/);
       if (linkMatch) { elements.push(<LinkCardBlock key={i} text={linkMatch[1]} url={linkMatch[2]} />); i++; continue; }
    }
    
    // Lists (Ordered & Unordered)
    const isOrdered = /^\d+\./.test(trimmedLine);
    const isUnordered = /^(\-|•|\*)\s/.test(trimmedLine); 
    if (isOrdered || isUnordered) {
        const text = trimmedLine.replace(/^(\d+\.|(\-|•|\*))\s?/, '');
        elements.push(<div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px', paddingLeft: '12px' }}><span style={{ color: '#555', lineHeight: 1.5, fontSize: '0.95rem', alignSelf: 'flex-start', paddingTop: '0' }}>•</span><span style={{ color: '#b0b0b0', lineHeight: 1.5, fontSize: '0.95rem' }}>{parseInlineMarkdown(text)}</span></div>);
        i++; continue;
    }
    
    // Horizontal Rule
    if (/^-{3,}$/.test(trimmedLine)) { elements.push(<hr key={i} style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #333' }} />); i++; continue; }
    
    // Blockquote
    if (trimmedLine.startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) { quoteLines.push(lines[i].trim().replace(/^>\s?/, '')); i++; }
        elements.push(<InfoBlock key={`quote-${i}`}>{quoteLines.map((qLine, qIdx) => <div key={qIdx} style={{ marginBottom: qIdx < quoteLines.length - 1 ? '4px' : '0' }}>{parseInlineMarkdown(qLine)}</div>)}</InfoBlock>);
        continue;
    }
    
    // Standard Paragraph
    if (trimmedLine === '') {
        elements.push(<div key={i} style={{ height: '12px' }} />);
    } else {
        elements.push(<p key={i} style={{ marginBottom: '16px', color: '#ccc', lineHeight: 1.7, fontSize: '1rem', whiteSpace: 'pre-wrap' }}>{parseInlineMarkdown(line)}</p>);
    }
    i++;
  }
  return elements;
};

// --- Main Component ---

interface ArchiveData {
  [year: number]: {
    [month: number]: {
      title: string;
      winner?: string; // Optional for non-contest cards
      imageUrl?: string;
      description?: string;
    };
  };
}

// Fallback Mock Data
const ARCHIVE_MOCK_DATA: ArchiveData = {
  2025: {
    1: {
      title: "Sample Entry",
      winner: "Winner Name",
      description: "Description here...",
    }
  }
};

interface ContestArchiveCardProps {
  data: SubSection;
  adminControls?: React.ReactNode;
  id?: string;
}

// Helper: Check if data entry has content
const hasContent = (data: any) => {
  return !!(data && (data.title || data.imageUrl || data.winner || (data.description && data.description.trim().length > 0)));
};

// Helper: Determine latest year/month that actually has content
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

  // Fallback to current date if absolutely no data found
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
};

export const ContestArchiveCard: React.FC<ContestArchiveCardProps> = ({ data, adminControls, id }) => {
  // Determine if this is a contest (affects badges and fields)
  const isContest = data.slug === 'aicontest';
  const isDining = data.slug === 'frum-dining';
  const isCoffee = data.slug === 'coffee-chat';

  // 1. Parse Data Memoized
  const archiveData = useMemo(() => {
    if (data.codeBlock) {
        try {
            const parsed = JSON.parse(data.codeBlock);
            if (typeof parsed === 'object') return parsed as ArchiveData;
        } catch (e) {
            // ignore
        }
    }
    return {};
  }, [data.codeBlock]);

  // 2. Initialize State with Latest Date
  const latest = useMemo(() => getLatestDate(archiveData), [archiveData]);
  
  const [selectedYear, setSelectedYear] = useState<number>(latest.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(latest.month);

  // Sync state when data actually changes
  useEffect(() => {
    setSelectedYear(latest.year);
    setSelectedMonth(latest.month);
  }, [latest]);

  const currentData = archiveData[selectedYear]?.[selectedMonth];

  // Determine Icon based on slug
  const HeaderIcon = isDining ? Utensils : (isCoffee ? Coffee : Trophy);

  return (
    <div id={id} className="bento-card full-width" style={{ padding: 0, overflow: 'hidden' }}>
      {/* 1. Header Section */}
      <div style={{ padding: '32px 32px 20px 32px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(231,0,18,0.1)', borderRadius: '8px' }}>
                    <HeaderIcon color="#E70012" size={20} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: 0 }}>{data.title}</h3>
            </div>
            {adminControls && (
                <div style={{ marginLeft: '16px' }}>{adminControls}</div>
            )}
        </div>
        
        {/* Render Header Description */}
        <div style={{ color: '#ccc', lineHeight: '1.6', fontSize: '1rem', marginTop: '16px' }}>
          {renderMarkdownContent(data.content)}
        </div>
      </div>

      {/* 2. Controls Section */}
      <div style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {[2025, 2026, 2027].map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              style={{
                flex: 1,
                padding: '16px',
                background: selectedYear === year ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: 'none',
                borderBottom: selectedYear === year ? '2px solid #E70012' : '2px solid transparent',
                color: selectedYear === year ? '#fff' : '#666',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {year} Season
            </button>
          ))}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(6, 1fr)', 
          gap: '8px', 
          padding: '16px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.1)' 
        }}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
             const data = archiveData[selectedYear]?.[month];
             // Hide month buttons if they have no content
             const hasData = hasContent(data);
             if (!hasData) return null;

             const isSelected = selectedMonth === month;
             
             return (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: isSelected ? '1px solid #E70012' : '1px solid rgba(255,255,255,0.1)',
                  background: isSelected ? '#E70012' : 'rgba(255,255,255,0.05)',
                  color: isSelected ? '#fff' : '#ccc',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {month}월
              </button>
             );
          })}
        </div>
      </div>

      {/* 3. Content Display Section */}
      <div style={{ padding: '32px', minHeight: '300px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#666', fontSize: '0.9rem', fontWeight: 600 }}>
          <Calendar size={16} />
          <span>{selectedYear}년 {selectedMonth}월</span>
        </div>

        {currentData && hasContent(currentData) ? (
          <div className="animate-fade">
            {currentData.imageUrl ? (
                <div style={{ 
                  width: '100%', 
                  aspectRatio: '16/9', 
                  background: '#000', 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  marginBottom: '24px',
                  position: 'relative'
                }}>
                  <img src={currentData.imageUrl} alt={currentData.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {isContest && (
                    <div style={{ 
                        position: 'absolute', 
                        top: '16px', 
                        right: '16px', 
                        background: '#E70012', 
                        color: '#fff', 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem', 
                        fontWeight: 700,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                    }}>
                        1st Place
                    </div>
                  )}
                </div>
            ) : null}

            <h4 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>{currentData.title}</h4>
            
            {/* Show Winner Row only for Contests */}
            {isContest && currentData.winner && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#888' }}>Winner:</span>
                    <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{currentData.winner}</span>
                </div>
            )}
            
            {/* Description with Markdown */}
            <div style={{ color: '#ccc', lineHeight: '1.7', fontSize: '1rem', marginTop: '16px' }}>
              {renderMarkdownContent(currentData.description || '')}
            </div>
          </div>
        ) : (
          <div style={{ 
            height: '200px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#444', 
            border: '2px dashed rgba(255,255,255,0.05)', 
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.01)'
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
