
import React, { useState, useEffect } from 'react';
import { SectionData, ContentType, SubSection, ContentSnapshot } from '../types';
import { HANDBOOK_CONTENT } from '../constants';
import { Copy, Check, ArrowRight, Mail, ExternalLink, Lightbulb, Link as LinkIcon, ChevronDown, ChevronRight, Edit3, Plus, Trash2, Clock, User as UserIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { FaqSearch } from './FaqSearch';
import { EditModal } from './EditModal';
import { ConfirmModal } from './ConfirmModal';
import { trackMenuClick } from '../utils/firebase';
import { addEditLog } from '../utils/db';
import { User } from 'firebase/auth';

interface ContentRendererProps {
  data: SectionData;
  allContent: SectionData[];
  onNavigate: (id: ContentType) => void;
  onUpdateContent: (subSections: SubSection[]) => void;
  setIsDirty?: (dirty: boolean) => void;
  isAdmin: boolean;
  user: User | null;
}

// [수정됨] 회색 계열을 제거하고 확실히 구분되는 색상만 남긴 팔레트 (해시 폴백용)
const BADGE_PALETTE = [
  { bg: 'rgba(239, 68, 68, 0.2)',  color: '#fca5a5', border: '1px solid rgba(185, 28, 28, 0.5)' },   // Red
  { bg: 'rgba(59, 130, 246, 0.2)',  color: '#93c5fd', border: '1px solid rgba(29, 78, 216, 0.5)' },   // Blue
  { bg: 'rgba(16, 185, 129, 0.2)',  color: '#6ee7b7', border: '1px solid rgba(4, 120, 87, 0.5)' },    // Green
  { bg: 'rgba(168, 85, 247, 0.2)',  color: '#d8b4fe', border: '1px solid rgba(126, 34, 206, 0.5)' },  // Purple
  { bg: 'rgba(245, 158, 11, 0.2)',  color: '#fcd34d', border: '1px solid rgba(180, 83, 9, 0.5)' },    // Amber
  { bg: 'rgba(236, 72, 153, 0.2)',  color: '#f9a8d4', border: '1px solid rgba(190, 24, 93, 0.5)' },   // Pink
  { bg: 'rgba(6, 182, 212, 0.2)',   color: '#67e8f9', border: '1px solid rgba(21, 94, 117, 0.5)' },   // Cyan
  { bg: 'rgba(132, 204, 22, 0.2)',  color: '#bef264', border: '1px solid rgba(63, 98, 18, 0.5)' },    // Lime
  { bg: 'rgba(99, 102, 241, 0.2)',  color: '#c7d2fe', border: '1px solid rgba(67, 56, 202, 0.5)' },   // Indigo
  { bg: 'rgba(20, 184, 166, 0.2)',  color: '#5eead4', border: '1px solid rgba(15, 118, 110, 0.5)' },  // Teal
  { bg: 'rgba(249, 115, 22, 0.2)',  color: '#fdba74', border: '1px solid rgba(194, 65, 12, 0.5)' },   // Orange
  { bg: 'rgba(217, 70, 239, 0.2)',  color: '#f0abfc', border: '1px solid rgba(162, 28, 175, 0.5)' },  // Fuchsia
  { bg: 'rgba(14, 165, 233, 0.2)',  color: '#7dd3fc', border: '1px solid rgba(3, 105, 161, 0.5)' },   // Sky
  { bg: 'rgba(234, 179, 8, 0.2)',   color: '#fde047', border: '1px solid rgba(161, 98, 7, 0.5)' },    // Yellow
  { bg: 'rgba(244, 63, 94, 0.2)',   color: '#fda4af', border: '1px solid rgba(190, 18, 60, 0.5)' },   // Rose
  { bg: 'rgba(139, 92, 246, 0.2)',  color: '#c4b5fd', border: '1px solid rgba(109, 40, 217, 0.5)' },  // Violet
];

// 직급별 고정 스타일 매핑
const EXPLICIT_STYLES: Record<string, { bg: string, color: string, border: string }> = {
  ceo: { bg: 'rgba(234, 179, 8, 0.2)', color: '#fde047', border: '1px solid rgba(161, 98, 7, 0.5)' }, // 대표: Yellow/Gold
  executive: { bg: 'rgba(147, 51, 234, 0.2)', color: '#d8b4fe', border: '1px solid rgba(126, 34, 206, 0.5)' }, // 이사: Purple (무게감)
  chief: { bg: 'rgba(225, 29, 72, 0.2)', color: '#fda4af', border: '1px solid rgba(159, 18, 57, 0.5)' }, // 수석: Rose (붉은 계열)
  lead: { bg: 'rgba(234, 88, 12, 0.2)', color: '#fdba74', border: '1px solid rgba(154, 52, 18, 0.5)' }, // 책임: Orange (이사/수석과 구분)
  senior: { bg: 'rgba(37, 99, 235, 0.2)', color: '#93c5fd', border: '1px solid rgba(30, 64, 175, 0.5)' }, // 선임: Blue (명확한 파랑)
  associate: { bg: 'rgba(5, 150, 105, 0.2)', color: '#6ee7b7', border: '1px solid rgba(6, 78, 59, 0.5)' }, // 사원: Emerald/Green (선임과 구분)
  intern: { bg: 'rgba(71, 85, 105, 0.2)', color: '#cbd5e1', border: '1px solid rgba(51, 65, 85, 0.5)' }, // 인턴: Slate/Gray
};

// 하이브리드 뱃지 스타일 계산 함수
const getBadgeStyle = (text: string) => {
  if (!text) return BADGE_PALETTE[0];
  
  const lowerText = text.trim().toLowerCase();

  // 1. 우선순위 규칙: 직급 키워드에 따른 고정 색상
  if (lowerText.includes('대표') || lowerText.includes('ceo')) return EXPLICIT_STYLES.ceo;
  if (lowerText.includes('이사') || lowerText.includes('임원') || lowerText.includes('director')) return EXPLICIT_STYLES.executive;
  if (lowerText.includes('수석') || lowerText.includes('principal') || lowerText.includes('chief')) return EXPLICIT_STYLES.chief;
  if (lowerText.includes('책임') || lowerText.includes('lead') || lowerText.includes('head')) return EXPLICIT_STYLES.lead;
  if (lowerText.includes('선임') || lowerText.includes('senior')) return EXPLICIT_STYLES.senior;
  if (lowerText.includes('사원') || lowerText.includes('associate') || lowerText.includes('junior')) return EXPLICIT_STYLES.associate;
  if (lowerText.includes('인턴') || lowerText.includes('intern')) return EXPLICIT_STYLES.intern;

  // 2. Fallback: 기존 DJB2 해시 알고리즘 (Type, 금액 등 기타 용도)
  const normalized = lowerText.replace(/\s+/g, '');
  let hash = 5381;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
    hash |= 0;
  }
  
  const index = Math.abs(hash) % BADGE_PALETTE.length;
  return BADGE_PALETTE[index];
};

const CodeBlock: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block" style={{ background: '#0a0a0a', border: '1px solid #222' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '8px' }}>
        <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Snippet</span>
        <button onClick={handleCopy} style={{ color: copied ? '#E70012' : '#555', transition: 'color 0.2s', background: 'none', border: 'none', cursor: 'pointer' }}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <pre style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>{text}</pre>
    </div>
  );
};

// Accordion Component for Grouped Tables
const AccordionItem: React.FC<{ title: string, children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{ marginBottom: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: isOpen ? 'rgba(255,255,255,0.05)' : 'transparent',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: '1rem',
          fontWeight: 600,
          transition: 'background 0.2s'
        }}
      >
        <span>{title}</span>
        {isOpen ? <ChevronDown size={18} color="#888" /> : <ChevronRight size={18} color="#888" />}
      </button>
      
      {isOpen && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {children}
        </div>
      )}
    </div>
  );
};

const TableBlock: React.FC<{ text: string }> = ({ text }) => {
  const parseRow = (rowStr: string) => {
    const cells = rowStr.split('|');
    if (rowStr.trim().startsWith('|')) cells.shift();
    if (rowStr.trim().endsWith('|')) cells.pop();
    return cells.map(c => c.trim());
  };

  const rows = text.trim().split('\n').filter(row => row.trim() !== '');
  const isSeparator = (row: string) => /^[\s\|\-:]+$/.test(row);
  
  const headerRow = rows[0] || "";
  const headers = parseRow(headerRow);
  const bodyRows = rows.slice(1).filter(r => !isSeparator(r));

  const groupColumnIndex = headers.findIndex(h => h === '사업부');
  const isGroupedTable = groupColumnIndex !== -1;

  const renderCellContent = (cell: string, header: string, rowIndex: number, colIndex: number) => {
    const h = header.toLowerCase();
    
    // [수정됨] 직급, Type, 또는 한도금액 컬럼에 대해 뱃지 적용
    if (h.includes('직급') || h.includes('type') || h.includes('한도금액')) {
      const style = getBadgeStyle(cell);
      return (
        <span style={{
          backgroundColor: style.bg,
          color: style.color,
          border: style.border,
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          display: 'inline-block',
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap'
        }}>
          {cell}
        </span>
      );
    } 
    else if (h.includes('이메일')) {
      return (
        <a href={`mailto:${cell}`} style={{ color: '#aaa', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
          <Mail size={14} strokeWidth={1.5} />
          {cell}
        </a>
      );
    } 

    return parseInlineMarkdown(cell, `cell-${rowIndex}-${colIndex}`);
  };

  if (isGroupedTable) {
    const groupedData: Record<string, string[][]> = {};
    bodyRows.forEach(row => {
      const cells = parseRow(row);
      if (cells.length < groupColumnIndex + 1) return;
      const groupKey = cells[groupColumnIndex];
      if (!groupedData[groupKey]) groupedData[groupKey] = [];
      groupedData[groupKey].push(cells);
    });

    const displayHeaders = headers.filter((_, idx) => idx !== groupColumnIndex);

    return (
      <div style={{ margin: '24px 0' }}>
        {Object.entries(groupedData).map(([groupName, groupRows], gIdx) => (
          <AccordionItem key={gIdx} title={groupName} defaultOpen={gIdx === 0}>
             <div style={{ overflowX: 'auto', width: '100%' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      {displayHeaders.map((h, i) => (
                        <th key={i} style={{ textAlign: 'left', padding: '12px 20px', color: '#888', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {groupRows.map((rowCells, rIdx) => {
                      const displayCells = rowCells.filter((_, idx) => idx !== groupColumnIndex);
                      return (
                        <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: rIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                          {displayCells.map((cell, cIdx) => (
                            <td key={cIdx} style={{ padding: '16px 20px', color: '#ccc', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                              {renderCellContent(cell, displayHeaders[cIdx], rIdx, cIdx)}
                            </td>
                          ))}
                        </tr>
                      )
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
    <div style={{ 
      width: '100%', 
      overflowX: 'auto', 
      margin: '24px 0', 
      border: '1px solid rgba(255,255,255,0.1)', 
      borderRadius: '12px', 
      background: '#090909',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '500px' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            {headers.map((h, i) => (
              <th key={i} style={{ 
                textAlign: 'left', 
                padding: '16px 20px', 
                color: '#888', 
                fontWeight: 700,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap'
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, i) => {
            const cells = parseRow(row);
            while(cells.length < headers.length) cells.push('');
            
            return (
              <tr 
                key={i} 
                style={{ 
                  borderBottom: i === bodyRows.length -1 ? 'none' : '1px solid rgba(255,255,255,0.05)', 
                  background: i % 2 === 1 ? 'rgba(31, 41, 55, 0.4)' : 'transparent',
                  transition: 'background 0.2s'
                }} 
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 1 ? 'rgba(31, 41, 55, 0.4)' : 'transparent'}
              >
                {cells.map((cell, j) => (
                   <td key={j} style={{ padding: '16px 20px', color: '#ccc', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                     {renderCellContent(cell, headers[j] || '', i, j)}
                   </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const StepBlock: React.FC<{ number: string, children: React.ReactNode, style?: React.CSSProperties }> = ({ number, children, style }) => (
  <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'flex-start', ...style }}>
    <div style={{
      flexShrink: 0,
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: 'rgba(231,0,18,0.1)',
      border: '1px solid rgba(231,0,18,0.4)',
      color: '#E70012',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: '14px',
      fontFamily: "'JetBrains Mono', monospace",
      marginTop: '2px',
      boxShadow: '0 0 10px rgba(231,0,18,0.1)'
    }}>
      {number}
    </div>
    <div style={{ flex: 1, paddingTop: '0px' }}>
      {children}
    </div>
  </div>
);

const InfoBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    background: 'linear-gradient(90deg, rgba(231,0,18,0.05) 0%, rgba(20,20,20,0.5) 100%)',
    borderLeft: '2px solid #E70012',
    padding: '20px',
    borderRadius: '0 8px 8px 0',
    margin: '20px 0',
    fontSize: '0.95rem',
    color: '#ddd',
    display: 'flex',
    gap: '12px'
  }}>
    <div style={{ marginTop: '2px' }}><Lightbulb size={16} color="#E70012" /></div>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

const LinkCardBlock: React.FC<{ text: string, url: string }> = ({ text, url }) => (
  <a href={url} target="_blank" rel="noreferrer" style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '20px 24px',
    margin: '20px 0',
    textDecoration: 'none',
    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
    cursor: 'pointer'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = '#E70012';
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.5)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = '#333';
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <LinkIcon size={20} color="#fff" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{text}</span>
        <span style={{ color: '#666', fontSize: '0.8rem' }}>{new URL(url).hostname}</span>
      </div>
    </div>
    <ArrowRight size={18} color="#E70012" />
  </a>
);

const parseInlineMarkdown = (text: string, keyPrefix: string) => {
  const imgMatch = text.match(/^!\[(.*?)\]\((.*?)\)$/);
  if (imgMatch) {
    return (
      <img 
        key={keyPrefix}
        src={imgMatch[2]} 
        alt={imgMatch[1]} 
        style={{ width: '100%', height: 'auto', borderRadius: '8px', margin: '16px 0', border: '1px solid #333' }} 
      />
    );
  }

  const parts = text.split(/(\[.*?\]\(.*?\)|`.*?`|\*\*.*?\*\*)/g);

  return (
    <span key={keyPrefix}>
      {parts.map((part, i) => {
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          return (
            <a 
              key={i} 
              href={linkMatch[2]} 
              target="_blank" 
              rel="noreferrer" 
              style={{ 
                color: '#E70012', 
                textDecoration: 'none', 
                fontWeight: 600, 
                borderBottom: '1px solid rgba(231,0,18,0.3)',
                paddingBottom: '0px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderBottomColor = '#E70012'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = 'rgba(231,0,18,0.3)'; }}
            >
              {linkMatch[1]}
            </a>
          );
        }

        const codeMatch = part.match(/^`(.*?)`$/);
        if (codeMatch) {
          return (
            <code 
              key={i} 
              style={{ 
                background: 'rgba(255,255,255,0.08)', 
                padding: '2px 6px', 
                borderRadius: '4px', 
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.85em',
                color: '#E0E0E0',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              {codeMatch[1]}
            </code>
          );
        }

        const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
        if (boldMatch) {
          return <strong key={i} style={{ color: '#fff', fontWeight: 700 }}>{boldMatch[1]}</strong>;
        }

        return part;
      })}
    </span>
  );
};

const parseFormattedText = (text: string, keyPrefix: string) => {
  if (!text) return null;
  return parseInlineMarkdown(text, keyPrefix);
};

const renderMarkdownContent = (content: string | string[]) => {
  const lines = Array.isArray(content) ? content : content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimLine = line.trim();
    
    // 1. Code Blocks
    if (trimLine.startsWith('```')) {
      if (trimLine.length > 3 && trimLine.endsWith('```') && trimLine.slice(3, -3).indexOf('```') === -1) {
        elements.push(<CodeBlock key={`code-${i}`} text={trimLine.slice(3, -3)} />);
        i++;
        continue;
      }
      const codeContent = [];
      i++; 
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeContent.push(lines[i]);
        i++;
      }
      i++; 
      elements.push(<CodeBlock key={`code-block-${i}`} text={codeContent.join('\n')} />);
      continue;
    }

    // 2. Tables
    if (trimLine.startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(<TableBlock key={`table-${i}`} text={tableLines.join('\n')} />);
      continue;
    }

    // 3. Info Block
    if (trimLine.startsWith('👉')) {
      elements.push(
        <InfoBlock key={`info-${i}`}>
          {parseFormattedText(trimLine.replace(/^👉\s*/, ''), `info-txt-${i}`)}
        </InfoBlock>
      );
      i++;
      continue;
    }

    // 4. Headers
    if (trimLine.startsWith('#')) {
      const level = trimLine.match(/^#+/)?.[0].length || 1;
      const text = trimLine.replace(/^#+\s*/, '');
      const Component = level === 1 ? 'h2' : level === 2 ? 'h3' : 'h4'; 
      elements.push(
        <Component key={`header-${i}`} style={{ 
          color: '#fff', 
          marginTop: '28px', 
          marginBottom: '16px', 
          fontWeight: 700,
          lineHeight: 1.3,
          fontSize: level === 1 ? '1.5rem' : level === 2 ? '1.25rem' : '1.1rem' 
        }}>
          {parseFormattedText(text, `header-txt-${i}`)}
        </Component>
      );
      i++;
      continue;
    }

    // 5. Blockquote
    if (trimLine.startsWith('>')) {
       elements.push(
         <blockquote key={`quote-${i}`} style={{ 
            borderLeft: '3px solid #E70012', 
            paddingLeft: '16px', 
            margin: '16px 0', 
            color: '#999',
            fontStyle: 'italic'
         }}>
            {parseFormattedText(trimLine.replace(/^>\s*/, ''), `quote-txt-${i}`)}
         </blockquote>
       );
       i++;
       continue;
    }

    // 6. List Items
    const isUnordered = /^(\*|-|•)\s/.test(trimLine);
    const isOrdered = /^\d+\.\s/.test(trimLine);

    if (isUnordered || isOrdered) {
        let marginBottom = '24px'; 
        
        const nextLine = i + 1 < lines.length ? lines[i + 1] : null;
        const nextTrimLine = nextLine !== null ? nextLine.trim() : null;
        const isLastLine = i === lines.length - 1;
        
        const nextIsOrdered = nextTrimLine ? /^\d+\.\s/.test(nextTrimLine) : false;
        const nextIsUnordered = nextTrimLine ? /^(\*|-|•)\s/.test(nextTrimLine) : false;

        if (isOrdered) {
            if (nextIsUnordered) marginBottom = '8px';
        } else if (isUnordered) {
            if (nextIsUnordered) marginBottom = '8px';
            else if (nextIsOrdered || isLastLine) marginBottom = '40px';
        }

        if (isOrdered) {
             const match = trimLine.match(/^(\d+)\.\s*(.*)/);
             if (match) {
                 elements.push(
                     <StepBlock key={`step-${i}`} number={match[1]} style={{ marginBottom }}>
                         {parseFormattedText(match[2], `step-txt-${i}`)}
                     </StepBlock>
                 );
             }
        } else {
            elements.push(
                <div key={`list-${i}`} className="list-item" style={{ 
                    paddingLeft: '50px', 
                    marginTop: '2px',
                    marginBottom: marginBottom
                }}>
                  <div style={{ display: 'flex', gap: '10px', width: '100%', alignItems: 'flex-start' }}>
                    <span style={{ 
                        color: '#555', 
                        flexShrink: 0, 
                        marginTop: '10px', 
                        fontSize: '6px',
                        lineHeight: 1
                    }}>●</span>
                    <div style={{ flex: 1, color: '#b0b0b0', fontSize: '0.95rem', lineHeight: '1.6' }}>
                      {parseFormattedText(trimLine.replace(/^(\*|-|•)\s*/, ''), `list-txt-${i}`)}
                    </div>
                  </div>
                </div>
            );
        }
        i++;
        continue;
    }

    // 7. Link Cards
    const linkOnlyMatch = trimLine.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkOnlyMatch && trimLine === linkOnlyMatch[0]) {
        elements.push(<LinkCardBlock key={`link-card-${i}`} text={linkOnlyMatch[1]} url={linkOnlyMatch[2]} />);
        i++;
        continue;
    }

    // 8. Image
    const imgMatch = trimLine.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch && trimLine === imgMatch[0]) {
        elements.push(
          <div key={`img-${i}`} style={{ margin: '24px 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid #222' }}>
             <img src={imgMatch[2]} alt={imgMatch[1]} style={{ width: '100%', display: 'block' }} />
             {imgMatch[1] && <div style={{ padding: '8px', fontSize: '0.8rem', color: '#666', textAlign: 'center', background: '#050505' }}>{imgMatch[1]}</div>}
          </div>
        );
        i++;
        continue;
    }

    // 9. Horizontal Rule
    if (/^(\*{3,}|-{3,})$/.test(trimLine)) {
       elements.push(
         <hr key={`hr-${i}`} style={{ 
           margin: '40px 0', 
           border: 'none', 
           borderTop: '1px solid #212121' 
         }} />
       );
       i++;
       continue;
    }

    // 10. Paragraph
    if (trimLine === '') {
        elements.push(<div key={`br-${i}`} style={{ height: '12px' }}></div>);
    } else {
        elements.push(
            <p key={`p-${i}`} style={{ marginBottom: '12px', lineHeight: '1.7', color: '#ccc', fontSize: '1rem' }}>
                {parseFormattedText(line, `p-txt-${i}`)}
            </p>
        );
    }
    i++;
  }

  return elements;
};

const createSnapshot = (sub: SubSection): ContentSnapshot => {
  let contentArr = Array.isArray(sub.content) ? [...sub.content] : sub.content.split('\n');
  let disclaimer = '';
  
  const disclaimerIdx = contentArr.findIndex(c => c.trim().startsWith('👉'));
  if (disclaimerIdx !== -1) {
    disclaimer = contentArr[disclaimerIdx].replace(/^👉\s*/, '');
    contentArr.splice(disclaimerIdx, 1);
  }

  return {
    title: sub.title,
    body_content: contentArr.join('\n'),
    media: sub.imagePlaceholder || '',
    external_link: sub.link || '',
    disclaimer_note: disclaimer
  };
};

export const ContentRenderer: React.FC<ContentRendererProps> = ({ 
  data, 
  allContent, 
  onNavigate, 
  onUpdateContent,
  setIsDirty,
  isAdmin,
  user
}) => {
  const Icon = data.icon;
  const hasHeroMedia = !!(data.heroImage || data.heroVideo);
  const isWelcome = data.id === ContentType.WELCOME;
  const isComplexLayout = [ContentType.IT_SETUP, ContentType.WELFARE, ContentType.COMMUTE, ContentType.COMPANY, ContentType.EXPENSE, ContentType.TOOLS, ContentType.OFFICE_GUIDE, ContentType.FAQ].includes(data.id);
  
  const canEdit = !isWelcome && isAdmin;
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    setIsEditMode(false);
    setEditingItemId(null);
    setIsModalOpen(false);
  }, [data.id]);

  const handleEdit = (e: React.MouseEvent, id: string | undefined) => {
    e.stopPropagation();
    e.preventDefault();
    if (!id) return;
    setEditingItemId(id);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItemId(null);
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string | undefined) => {
    e.stopPropagation();
    e.preventDefault();
    if (!id) return;

    setDeleteTargetId(id);
    setDeleteModalOpen(true);
  };

  const handleMoveUp = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (index === 0) return;
    const newSubSections = [...data.subSections];
    [newSubSections[index - 1], newSubSections[index]] = [newSubSections[index], newSubSections[index - 1]];
    onUpdateContent(newSubSections);
  };

  const handleMoveDown = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (index === data.subSections.length - 1) return;
    const newSubSections = [...data.subSections];
    [newSubSections[index + 1], newSubSections[index]] = [newSubSections[index], newSubSections[index + 1]];
    onUpdateContent(newSubSections);
  };

  const executeDelete = async () => {
    if (!deleteTargetId) return;
    
    const targetItem = data.subSections.find(s => s.uuid === deleteTargetId);
    if (user && user.email && targetItem) {
      addEditLog({
        timestamp: Date.now(),
        userEmail: user.email,
        sectionId: data.id,
        subSectionTitle: targetItem.title,
        action: 'delete',
        details: {
          before: createSnapshot(targetItem),
          after: undefined
        }
      });
    }

    const newSubSections = data.subSections.filter(s => s.uuid !== deleteTargetId);
    
    try {
      await onUpdateContent(newSubSections);
    } catch (error) {
      console.error("Deletion failed:", error);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleteTargetId(null);
    }
  };

  const handleSaveModal = (newData: SubSection) => {
    const originalItem = editingItemId ? data.subSections.find(s => s.uuid === editingItemId) : undefined;

    if (user && user.email) {
      newData.lastEditedBy = user.email;
      newData.lastEditedAt = Date.now();
      
      addEditLog({
        timestamp: Date.now(),
        userEmail: user.email,
        sectionId: data.id,
        subSectionTitle: newData.title,
        action: editingItemId ? 'update' : 'create',
        details: {
          before: originalItem ? createSnapshot(originalItem) : undefined,
          after: createSnapshot(newData)
        }
      });
    }

    let newSubSections = [...data.subSections];
    if (editingItemId) {
      newSubSections = newSubSections.map(sub => sub.uuid === editingItemId ? newData : sub);
    } else {
      newSubSections.push(newData);
    }
    onUpdateContent(newSubSections);
  };

  // [Added] Spotlight Logic: Handle Mouse Move on Grid
  const handleGridMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const cards = e.currentTarget.getElementsByClassName('bento-card');
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
      (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
    }
  };

  // [Added] Inject Styles for Spotlight
  const SpotlightStyles = () => (
    <style>{`
      /* Background Glow */
      .bento-card::after {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(231, 0, 18, 0.08), transparent 40%);
        opacity: 0;
        transition: opacity 0.5s;
        pointer-events: none;
        z-index: 0;
      }
      .grid-layout:hover .bento-card::after {
        opacity: 1;
      }

      /* Border Glow - Gradient Mask Trick */
      .bento-card::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 12px; 
        padding: 1.5px; /* Border thickness */
        background: radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(231, 0, 18, 0.6), transparent 40%);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
        z-index: 10;
        opacity: 0;
        transition: opacity 0.5s;
      }
      .grid-layout:hover .bento-card::before {
        opacity: 1;
      }

      /* Ensure content is above background glow but managed properly */
      .bento-card > * {
        position: relative;
        z-index: 2;
      }
    `}</style>
  );

  const quickLinkSections = HANDBOOK_CONTENT.filter(s => s.id !== ContentType.WELCOME && s.id !== ContentType.FAQ);

  if (data.id === ContentType.FAQ) {
    return (
      <div key={data.id} className="animate-enter">
        <SpotlightStyles />
        <header style={{ marginBottom: '60px', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="hero-title animate-fade delay-2">
              {data.title}
            </h1>
            <p className="hero-desc animate-fade delay-3">
              {data.description}
            </p>
          </div>
          {canEdit && (
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
              style={{
                background: isEditMode ? '#E70012' : 'transparent',
                border: '1px solid #E70012',
                color: isEditMode ? '#fff' : '#E70012',
                padding: '8px 16px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s',
                marginTop: '10px'
              }}
            >
              <Edit3 size={16} />
              {isEditMode ? 'Done Editing' : 'Edit Page'}
            </button>
          )}
        </header>
        
        <div className="animate-fade delay-4">
          <FaqSearch onNavigate={onNavigate} content={allContent} />
        </div>

        {canEdit && isEditMode && (
          <div style={{ marginTop: '60px', borderTop: '1px solid #333', paddingTop: '40px' }} className="animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
               <h3 style={{ color: '#fff', fontSize: '1.2rem' }}>Manage FAQ Items</h3>
               <button 
                onClick={handleAddNew}
                style={{
                  background: '#1a1a1a',
                  border: '1px dashed #444',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
               >
                 <Plus size={16} /> Add Question
               </button>
            </div>
            
            <div className="grid-layout" onMouseMove={handleGridMouseMove}>
              {data.subSections.map((sub, index) => (
                <div key={sub.uuid || index} className="bento-card" style={{ position: 'relative', border: '1px solid #E70012' }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '12px', 
                    right: '12px', 
                    display: 'flex', 
                    gap: '8px', 
                    zIndex: 1000, 
                    pointerEvents: 'auto'
                  }}>
                    {index > 0 && (
                        <button 
                            type="button"
                            onClick={(e) => handleMoveUp(e, index)}
                            style={{ 
                              padding: '6px', 
                              background: '#333', 
                              borderRadius: '4px', 
                              color: '#fff', 
                              border: '1px solid #555', 
                              cursor: 'pointer',
                              pointerEvents: 'auto'
                            }}
                            title="Move Up"
                        >
                          <ArrowUp size={14} style={{ pointerEvents: 'none' }}/>
                        </button>
                    )}
                    {index < data.subSections.length - 1 && (
                        <button 
                            type="button"
                            onClick={(e) => handleMoveDown(e, index)}
                            style={{ 
                              padding: '6px', 
                              background: '#333', 
                              borderRadius: '4px', 
                              color: '#fff', 
                              border: '1px solid #555', 
                              cursor: 'pointer',
                              pointerEvents: 'auto'
                            }}
                            title="Move Down"
                        >
                          <ArrowDown size={14} style={{ pointerEvents: 'none' }}/>
                        </button>
                    )}
                    <div style={{ width: '4px' }}></div>
                    <button 
                      type="button" 
                      onClick={(e) => handleEdit(e, sub.uuid)} 
                      style={{ 
                        padding: '6px', 
                        background: '#333', 
                        borderRadius: '4px', 
                        color: '#fff', 
                        border: '1px solid #555', 
                        cursor: 'pointer',
                        pointerEvents: 'auto'
                      }}
                    >
                      <Edit3 size={14} style={{ pointerEvents: 'none' }}/>
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => handleDelete(e, sub.uuid)} 
                      style={{ 
                        padding: '6px', 
                        background: '#333', 
                        borderRadius: '4px', 
                        color: '#ff5555', 
                        border: '1px solid #555', 
                        cursor: 'pointer',
                        pointerEvents: 'auto'
                      }}
                    >
                      <Trash2 size={14} style={{ pointerEvents: 'none' }}/>
                    </button>
                  </div>
                  <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '12px' }}>{sub.title}</h3>
                  <div className="card-content" style={{ fontSize: '0.9rem', color: '#999', maxHeight: '60px', overflow: 'hidden' }}>
                    {Array.isArray(sub.content) ? sub.content.join(' ') : sub.content}
                  </div>
                  {isEditMode && sub.lastEditedBy && (
                     <div style={{ 
                        marginTop: '16px', 
                        paddingTop: '12px', 
                        borderTop: '1px solid #333',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '0.75rem',
                        color: '#666'
                     }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                           <UserIcon size={10} />
                           {sub.lastEditedBy.split('@')[0]}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                           <Clock size={10} />
                           {sub.lastEditedAt ? new Date(sub.lastEditedAt).toLocaleDateString() : ''}
                        </div>
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <EditModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
          initialData={editingItemId ? data.subSections.find(s => s.uuid === editingItemId) : undefined}
          onDirty={setIsDirty}
        />
        <ConfirmModal 
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={executeDelete}
        />
      </div>
    );
  }

  return (
    <div key={data.id} className="animate-enter">
      <SpotlightStyles />
      <header style={{ marginBottom: '80px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
                {!hasHeroMedia && (
                  <>
                    <h1 className="hero-title animate-fade delay-2">
                      {data.title}
                    </h1>
                    {data.description && (
                      <p className="hero-desc animate-fade delay-3">
                        {data.description}
                      </p>
                    )}
                  </>
                )}
            </div>
            {canEdit && (
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                style={{
                  background: isEditMode ? '#E70012' : 'transparent',
                  border: '1px solid #E70012',
                  color: isEditMode ? '#fff' : '#E70012',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  marginTop: '10px',
                  marginLeft: '20px',
                  zIndex: 30
                }}
              >
                <Edit3 size={16} />
                {isEditMode ? 'Done Editing' : 'Edit Page'}
              </button>
            )}
        </div>

        {hasHeroMedia && (
          <div className="animate-fade delay-3" style={{ marginTop: '24px', position: 'relative' }}>
             <div className="hero-image-container">
               {data.heroVideo ? (
                 <video
                   src={data.heroVideo}
                   className="hero-img-anim"
                   autoPlay
                   loop
                   muted
                   playsInline
                   style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                 />
               ) : (
                 <img 
                   src={data.heroImage} 
                   alt="FRUM Abstract Hero"
                   className="hero-img-anim"
                 />
               )}
               <div className="tech-scan-line"></div>
               <div className="brand-slash-container">
                  <div className="brand-slash-line"></div>
               </div>
               <div className="hero-overlay-gradient"></div>
               <div style={{
                 position: 'absolute',
                 inset: 0,
                 display: 'flex',
                 flexDirection: 'column',
                 justifyContent: 'center',
                 alignItems: 'center',
                 textAlign: 'center',
                 zIndex: 20,
                 padding: '0 40px'
               }}>
                 <h1 className="hero-title" style={{ 
                   marginBottom: '24px',
                   fontSize: 'clamp(3rem, 5vw, 5rem)', 
                   fontWeight: 500,
                   letterSpacing: '-0.03em',
                   color: '#FFFFFF',
                   textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                   display: 'inline-block',
                   zIndex: 20,
                   position: 'relative'
                 }}>
                   {data.title}
                 </h1>
                 {data.description && (
                   <p className="hero-desc" style={{ 
                     borderLeft: 'none', 
                     paddingLeft: 0, 
                     textAlign: 'center',
                     textShadow: '0 2px 20px rgba(0,0,0,1)',
                     maxWidth: '800px',
                     margin: '0 auto',
                     color: '#EAEAEA',
                     fontWeight: 500
                   }}>
                     {data.description}
                   </p>
                 )}
               </div>
             </div>
          </div>
        )}
        {!hasHeroMedia && (
          <div style={{ 
            position: 'absolute', 
            right: '-50px', 
            top: '-60px', 
            opacity: '0.02', 
            pointerEvents: 'none', 
            transform: 'rotate(-10deg)',
            filter: 'blur(2px)'
          }} className="hidden-on-mobile">
            <Icon size={500} color="white" strokeWidth={0.5} />
          </div>
        )}
        <style>{`@media (max-width: 768px) { .hidden-on-mobile { display: none; } }`}</style>
      </header>

      {isWelcome ? (
        <>
           {data.subSections.length > 0 && (
             <div className="animate-fade delay-4" style={{ 
               textAlign: 'center', 
               maxWidth: '800px', 
               margin: '0 auto 80px',
               padding: '0 20px'
             }}>
               <h2 style={{ 
                 fontSize: '1.5rem', 
                 marginBottom: '24px', 
                 color: '#fff',
                 fontWeight: 700,
                 letterSpacing: '0.05em'
               }}>
                 {data.subSections[0].title}
               </h2>
               <p style={{ 
                 fontSize: '1.2rem', 
                 lineHeight: '1.8', 
                 color: '#ccc',
                 fontWeight: 400 
               }}>
                 {data.subSections[0].content}
               </p>
             </div>
           )}
           <div className="animate-fade delay-5">
              <div className="grid-layout" onMouseMove={handleGridMouseMove}>
                {quickLinkSections.map((section, index) => {
                  const SectionIcon = section.icon;
                  const targetId = (section.children && section.children.length > 0) 
                    ? section.children[0].id 
                    : section.id;
                  return (
                    <button 
                      key={section.id} 
                      onClick={() => {
                        trackMenuClick(`QuickLink: ${section.title}`);
                        onNavigate(targetId);
                      }}
                      className="bento-card"
                      style={{ 
                        textAlign: 'left', 
                        cursor: 'pointer', 
                        width: '100%',
                        animationDelay: `${0.1 * index}s`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ 
                           display: 'flex', 
                           alignItems: 'center', 
                           justifyContent: 'center'
                        }}>
                          <SectionIcon size={24} color="var(--accent-color)" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                          {section.title}
                        </h3>
                      </div>
                      <p style={{ 
                        fontSize: '0.95rem', 
                        color: '#999', 
                        lineHeight: '1.5', 
                        margin: 0
                      }}>
                        {section.description}
                      </p>
                    </button>
                  );
                })}
              </div>
           </div>
        </>
      ) : (
        <>
        <div className="grid-layout" onMouseMove={handleGridMouseMove}>
          {data.subSections.map((sub, index) => {
             const textLength = Array.isArray(sub.content) ? sub.content.join('').length : sub.content.length;
             const hasCode = !!sub.codeBlock;
             const hasImage = !!sub.imagePlaceholder;
             const isFullWidth = isComplexLayout || hasCode || hasImage || textLength > 300;

             return (
               <article 
                key={sub.uuid || index} 
                className={`bento-card ${isFullWidth ? 'full-width' : ''}`}
                style={{ 
                    animationDelay: `${0.1 * index}s`,
                    border: isEditMode ? '1px dashed #E70012' : undefined,
                    position: 'relative'
                }}
              >
                 {isEditMode && (
                   <div style={{ 
                     position: 'absolute', 
                     top: '12px', 
                     right: '12px', 
                     display: 'flex', 
                     gap: '8px', 
                     zIndex: 1000, 
                     pointerEvents: 'auto' 
                   }}>
                     {index > 0 && (
                        <button 
                            type="button"
                            onClick={(e) => handleMoveUp(e, index)}
                            style={{ 
                              padding: '8px', 
                              background: '#333', 
                              borderRadius: '4px', 
                              color: '#fff', 
                              border: '1px solid #555', 
                              cursor: 'pointer',
                              pointerEvents: 'auto'
                            }}
                            title="Move Up"
                        >
                          <ArrowUp size={16} style={{ pointerEvents: 'none' }}/>
                        </button>
                     )}
                     {index < data.subSections.length - 1 && (
                        <button 
                            type="button"
                            onClick={(e) => handleMoveDown(e, index)}
                            style={{ 
                              padding: '8px', 
                              background: '#333', 
                              borderRadius: '4px', 
                              color: '#fff', 
                              border: '1px solid #555', 
                              cursor: 'pointer',
                              pointerEvents: 'auto'
                            }}
                            title="Move Down"
                        >
                          <ArrowDown size={16} style={{ pointerEvents: 'none' }}/>
                        </button>
                     )}
                     <div style={{ width: '4px' }}></div>
                     <button 
                        type="button"
                        onClick={(e) => handleEdit(e, sub.uuid)}
                        style={{ 
                          padding: '8px', 
                          background: '#333', 
                          borderRadius: '4px', 
                          color: '#fff', 
                          border: '1px solid #555', 
                          cursor: 'pointer',
                          pointerEvents: 'auto',
                          zIndex: 1001
                        }}
                        title="Edit"
                     >
                       <Edit3 size={16} style={{ pointerEvents: 'none' }}/>
                     </button>
                     <button 
                        type="button"
                        onClick={(e) => handleDelete(e, sub.uuid)}
                        style={{ 
                          padding: '8px', 
                          background: '#333', 
                          borderRadius: '4px', 
                          color: '#ff5555', 
                          border: '1px solid #555', 
                          cursor: 'pointer',
                          pointerEvents: 'auto',
                          zIndex: 1001
                        }}
                        title="Delete"
                     >
                       <Trash2 size={16} style={{ pointerEvents: 'none' }}/>
                     </button>
                   </div>
                 )}
                 <h3 className="card-title" style={{
                   borderBottom: '1px solid rgba(255,255,255,0.1)',
                   paddingBottom: '12px',
                   width: '100%',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '12px'
                 }}>
                   {!isComplexLayout && <span className="card-marker"></span>}
                   {sub.title}
                 </h3>
                 {sub.imagePlaceholder && (
                   <div style={{ margin: '24px 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid #222' }}>
                     <img src={sub.imagePlaceholder} alt="" style={{ width: '100%', display: 'block', opacity: 0.8 }} />
                   </div>
                 )}
                 <div className="card-content">
                    {renderMarkdownContent(sub.content)}
                 </div>
                 {sub.codeBlock && <CodeBlock text={sub.codeBlock} />}
                 {sub.link && (
                   <a 
                    href={sub.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="link-button"
                   >
                     Access Portal <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                   </a>
                 )}
                 {isEditMode && sub.lastEditedBy && (
                   <div style={{ 
                      marginTop: '24px', 
                      paddingTop: '16px', 
                      borderTop: '1px solid #222',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      fontSize: '0.8rem',
                      color: '#666',
                      fontFamily: 'monospace'
                   }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                         <UserIcon size={12} color="#888" />
                         <span style={{ color: '#888' }}>{sub.lastEditedBy}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                         <Clock size={12} color="#888" />
                         <span>{sub.lastEditedAt ? new Date(sub.lastEditedAt).toLocaleString() : '-'}</span>
                      </div>
                   </div>
                 )}
               </article>
             );
          })}
          
          {isEditMode && (
             <button
               onClick={handleAddNew}
               style={{
                 border: '2px dashed #333',
                 borderRadius: '12px',
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 justifyContent: 'center',
                 padding: '40px',
                 color: '#666',
                 cursor: 'pointer',
                 transition: 'all 0.2s',
                 background: 'transparent'
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.borderColor = '#E70012';
                 e.currentTarget.style.color = '#E70012';
                 e.currentTarget.style.background = 'rgba(231,0,18,0.05)';
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.borderColor = '#333';
                 e.currentTarget.style.color = '#666';
                 e.currentTarget.style.background = 'transparent';
               }}
             >
                <Plus size={32} />
                <span style={{ marginTop: '12px', fontWeight: 600 }}>Add New Content Block</span>
             </button>
          )}
        </div>
        </>
      )}
      <EditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingItemId ? data.subSections.find(s => s.uuid === editingItemId) : undefined}
        onDirty={setIsDirty}
      />
      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={executeDelete}
      />
    </div>
  );
};
