
import React, { useState, useMemo, useEffect } from 'react';
import { SubSection } from '../types';
import { Trophy, Calendar, Image as ImageIcon, Link as LinkIcon, ArrowRight, Lightbulb, Utensils, Coffee, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { trackEvent } from '../utils/firebase';

// --- Badge Style Logic ---
const getBadgeStyle = (text: string) => {
  if (!text) return { bg: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid #444' };
  const t = text.trim();
  
  if (t.includes('대표') || t.includes('CEO')) return { bg: 'rgba(234, 179, 8, 0.2)', color: '#fde047', border: '1px solid rgba(161, 98, 7, 0.5)' }; 
  if (t.includes('이사')) return { bg: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', border: '1px solid rgba(126, 34, 206, 0.5)' }; 
  if (t.includes('책임')) return { bg: 'rgba(249, 115, 22, 0.2)', color: '#fdba74', border: '1px solid rgba(194, 65, 12, 0.5)' }; 
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

// 1. Spotlight Helper
const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const { currentTarget, clientX, clientY } = e;
  const { left, top } = currentTarget.getBoundingClientRect();
  currentTarget.style.setProperty('--mouse-x', `${clientX - left}px`);
  currentTarget.style.setProperty('--mouse-y', `${clientY - top}px`);
};

// --- Helper Components ---

const StepBlock: React.FC<{ number: string, children: React.ReactNode, marginBottom?: string }> = ({ number, children, marginBottom = '24px' }) => (
  <div style={{ display: 'flex', gap: '16px', marginBottom: marginBottom, alignItems: 'flex-start' }}>
    <div className="font-mono" style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(231,0,18,0.1)', border: '1px solid rgba(231,0,18,0.5)', color: '#E70012', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', marginTop: '2px' }}>{number}</div>
    <div style={{ flex: 1, lineHeight: 1.6, color: '#EAEAEA' }}>{children}</div>
  </div>
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

const LinkCardBlock: React.FC<{ text: string, url: string }> = ({ text, url }) => (
  <a href={url} target="_blank" rel="noreferrer" onClick={() => handleContentOutboundClick(text, url)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '20px 24px', margin: '20px 0', textDecoration: 'none', cursor: 'pointer', transition: 'border 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#E70012'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LinkIcon size={20} color="#fff" /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{text}</span><span className="font-mono" style={{ color: '#666', fontSize: '0.8rem' }}>{new URL(url).hostname}</span></div>
    </div>
    <ArrowRight size={18} color="#E70012" />
  </a>
);

const CodeBlock: React.FC<{ text: string }> = ({ text }) => (
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
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.3)' }}>
                    {displayHeaders.map((h, k) => {
                       let width = 'auto';
                       if (h.includes('이름')) width = '25%';
                       else if (h.includes('직급')) width = '15%';
                       
                       return (
                         <th key={k} style={{ textAlign: 'left', padding: '12px', color: '#888', fontSize: '11px', whiteSpace: 'nowrap', width }}>
                           {h}
                         </th>
                       );
                    })}
                  </tr>
                </thead>
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
    const line = lines[i].trim();

    // Headers Support (#, ##, ###)
    const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2];
        const fontSize = level === 1 ? '1.35rem' : level === 2 ? '1.25rem' : '1.15rem';
        const color = level <= 2 ? '#fff' : '#e0e0e0';
        const marginTop = i === 0 ? '0' : (level === 1 ? '32px' : '24px');
        
        elements.push(
            <div key={`header-${i}`} style={{
                fontSize: level > 3 ? '1.05rem' : fontSize,
                fontWeight: 700,
                color: color,
                marginTop: marginTop,
                marginBottom: '12px',
                lineHeight: 1.4,
                letterSpacing: '-0.02em'
            }}>
                {parseInlineMarkdown(text)}
            </div>
        );
        i++;
        continue;
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

// --- Main Component ---

interface ArchiveData {
  [year: number]: {
    [month: number]: {
      title: string;
      winner?: string;
      imageUrl?: string;
      description?: string;
    };
  };
}

interface ContestArchiveCardProps {
  data: SubSection;
  adminControls?: React.ReactNode;
  id?: string;
}

const hasContent = (data: any) => {
  return !!(data && (data.title || data.imageUrl || data.winner || (data.description && data.description.trim().length > 0)));
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

export const ContestArchiveCard: React.FC<ContestArchiveCardProps> = ({ data, adminControls, id }) => {
  const isContest = data.slug === 'aicontest';
  const isDining = data.slug === 'frum-dining';
  const isCoffee = data.slug === 'coffee-chat';

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
  
  useEffect(() => {
    setSelectedYear(latest.year);
    setSelectedMonth(latest.month);
  }, [latest]);

  const currentData = archiveData[selectedYear]?.[selectedMonth];
  const HeaderIcon = isDining ? Utensils : (isCoffee ? Coffee : Trophy);

  // Years for tabs
  const years = [2025, 2026, 2027];
  const activeYearIndex = years.indexOf(selectedYear);

  return (
    // 1. Spotlight Effect
    <div id={id} onMouseMove={handleMouseMove} className="bento-card full-width stagger-item" style={{ padding: 0, overflow: 'hidden' }}>
      {/* 1. Header Section */}
      <div style={{ padding: '32px 32px 24px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', background: 'rgba(231,0,18,0.1)', borderRadius: '10px' }}>
                    <HeaderIcon color="#E70012" size={22} strokeWidth={2.5} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: 0 }}>{data.title}</h3>
            </div>
            {adminControls && (
                <div style={{ marginLeft: '16px' }}>{adminControls}</div>
            )}
        </div>
        <div style={{ color: '#ccc', lineHeight: '1.6', fontSize: '1rem' }}>
          {renderMarkdownContent(data.content)}
        </div>
        {data.disclaimer && (
            <InfoBlock>{renderMarkdownContent(data.disclaimer)}</InfoBlock>
        )}
      </div>

      {/* 2. Modern Tab Interface */}
      <div style={{ background: '#0a0a0a' }}>
        {/* 7. Tab Transition Animation (Year Selector) */}
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
                {/* Sliding Background */}
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
                    className={selectedYear === year ? 'font-mono' : 'font-mono'}
                    style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: '8px',
                        background: 'transparent', // Background handled by sliding div
                        border: 'none',
                        color: selectedYear === year ? '#fff' : '#666',
                        fontSize: '0.9rem',
                        fontWeight: selectedYear === year ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'color 0.2s',
                        zIndex: 2
                    }}
                    >
                    {year} Season
                    </button>
                ))}
            </div>
        </div>

        {/* Month Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(6, 1fr)', 
          gap: '12px', 
          padding: '20px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.08)' 
        }}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
             const data = archiveData[selectedYear]?.[month];
             const hasData = hasContent(data);
             if (!hasData) return null;
             const isSelected = selectedMonth === month;
             
             return (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className="font-mono"
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
                  overflow: 'hidden'
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

      {/* 3. Content Display Section */}
      <div style={{ padding: '32px', minHeight: '300px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: '#666', fontSize: '0.9rem', fontWeight: 600 }}>
          <Calendar size={16} />
          <span className="font-mono">{selectedYear}년 {selectedMonth}월</span>
        </div>

        {currentData && hasContent(currentData) ? (
          <div className="animate-fade">
            {currentData.imageUrl ? (
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
            ) : null}
            <h4 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '8px', color: '#fff', letterSpacing: '-0.02em' }}>{currentData.title}</h4>
            {isContest && currentData.winner && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                    <span style={{ fontSize: '0.95rem', color: '#888' }}>Winner</span>
                    <span style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 600, background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '6px' }}>{currentData.winner}</span>
                </div>
            )}
            <div style={{ color: '#ccc', lineHeight: '1.75', fontSize: '1rem', marginTop: '20px' }}>
              {renderMarkdownContent(currentData.description || '')}
            </div>
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
