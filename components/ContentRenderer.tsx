
import React, { useState } from 'react';
import { SectionData, ContentType, SubSection } from '../types';
import { HANDBOOK_CONTENT } from '../constants';
import { Copy, Check, ArrowRight, Mail, ExternalLink, Lightbulb, Link as LinkIcon, ChevronDown, ChevronRight, Edit3, Plus, Trash2 } from 'lucide-react';
import { FaqSearch } from './FaqSearch';
import { EditModal } from './EditModal';

interface ContentRendererProps {
  data: SectionData;
  allContent: SectionData[];
  onNavigate: (id: ContentType) => void;
  onUpdateContent: (subSections: SubSection[]) => void;
}

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
  const rows = text.trim().split('\n').filter(row => row.trim() !== '');
  const rawHeaders = rows[0].split('|').filter(c => c.trim() !== '').map(c => c.trim());
  
  // Detect separator line (e.g. |---|---|)
  const isSeparator = (row: string) => row.includes('---');
  const dataRows = rows.slice(1).filter(r => !isSeparator(r));

  // Check if this table should be grouped (Look for "사업부" column)
  const groupColumnIndex = rawHeaders.findIndex(h => h === '사업부');
  const isGroupedTable = groupColumnIndex !== -1;

  const getBadgeStyle = (role: string) => {
    // Executive / Leadership
    if (role.includes('대표')) return { bg: 'rgba(241, 196, 15, 0.15)', color: '#F4D03F', border: '1px solid rgba(241, 196, 15, 0.3)' }; // Gold
    if (role.includes('이사')) return { bg: 'rgba(155, 89, 182, 0.15)', color: '#D2B4DE', border: '1px solid rgba(155, 89, 182, 0.3)' }; // Purple
    
    // Senior Management
    if (role.includes('수석')) return { bg: 'rgba(26, 188, 156, 0.15)', color: '#76D7C4', border: '1px solid rgba(26, 188, 156, 0.3)' }; // Teal/Cyan
    if (role.includes('책임')) return { bg: 'rgba(231,0,18,0.15)', color: '#FF8A8A', border: '1px solid rgba(231,0,18,0.3)' }; // Reddish
    
    // Staff
    if (role.includes('선임')) return { bg: 'rgba(52, 152, 219, 0.15)', color: '#85C1E9', border: '1px solid rgba(52, 152, 219, 0.3)' }; // Blueish
    if (role.includes('사원')) return { bg: 'rgba(46, 204, 113, 0.15)', color: '#82E0AA', border: '1px solid rgba(46, 204, 113, 0.3)' }; // Greenish
    
    // Default
    return { bg: 'rgba(255,255,255,0.1)', color: '#ddd', border: '1px solid rgba(255,255,255,0.1)' };
  };

  const renderCellContent = (cell: string, header: string, rowIndex: number, colIndex: number) => {
    // Badge Logic for Job Titles
    if (header.includes('직급')) {
      const style = getBadgeStyle(cell);
      return (
        <span style={{
          backgroundColor: style.bg,
          color: style.color,
          border: style.border,
          padding: '4px 12px',
          borderRadius: '999px',
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
    // Badge Logic for Tool Types
    else if (header.includes('Type')) {
      let badgeColor = { bg: 'rgba(255,255,255,0.1)', text: '#ccc', border: 'transparent' };
      if (cell === 'UX') badgeColor = { bg: 'rgba(231,0,18,0.2)', text: '#ff6666', border: '1px solid rgba(231,0,18,0.4)' };
      else if (cell === 'Zip') badgeColor = { bg: 'rgba(52, 152, 219, 0.2)', text: '#85C1E9', border: '1px solid rgba(52, 152, 219, 0.4)' };
      else if (cell === '소통') badgeColor = { bg: 'rgba(155, 89, 182, 0.2)', text: '#D2B4DE', border: '1px solid rgba(155, 89, 182, 0.4)' };
      else if (cell === '비용관리') badgeColor = { bg: 'rgba(46, 204, 113, 0.2)', text: '#82E0AA', border: '1px solid rgba(46, 204, 113, 0.4)' };

      return (
        <span style={{
          backgroundColor: badgeColor.bg,
          color: badgeColor.text,
          border: badgeColor.border,
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          display: 'inline-block',
          whiteSpace: 'nowrap'
        }}>
          {cell}
        </span>
      );
    }
    // Link Logic for Emails
    else if (header.includes('이메일')) {
      return (
        <a href={`mailto:${cell}`} style={{ 
          color: '#aaa', 
          textDecoration: 'none', 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'color 0.2s',
          fontSize: '0.9rem'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}
        >
          <Mail size={14} strokeWidth={1.5} />
          {cell}
        </a>
      );
    } 
    // Link Logic for Download
    else if (header.includes('Download') || cell.includes('[Download]')) {
       return parseInlineMarkdown(cell, `dl-${rowIndex}-${colIndex}`);
    }
    // Formatting for Name (Bold)
    else if (header.includes('이름') || header.includes('Name')) {
       return <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{cell}</span>;
    }

    return cell;
  };

  // --- RENDER MODE: GROUPED ACCORDION ---
  if (isGroupedTable) {
    // 1. Group data by the grouping column
    const groupedData: Record<string, string[][]> = {};
    
    dataRows.forEach(row => {
      const cells = row.split('|').filter(c => c.trim() !== '').map(c => c.trim());
      const groupKey = cells[groupColumnIndex];
      if (!groupedData[groupKey]) {
        groupedData[groupKey] = [];
      }
      groupedData[groupKey].push(cells);
    });

    // Filter out the grouping column from display headers
    const displayHeaders = rawHeaders.filter((_, idx) => idx !== groupColumnIndex);

    return (
      <div style={{ margin: '24px 0' }}>
        {Object.entries(groupedData).map(([groupName, groupRows], gIdx) => (
          <AccordionItem key={gIdx} title={groupName} defaultOpen={gIdx === 0}>
             <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                    {displayHeaders.map((h, i) => (
                      <th key={i} style={{ 
                        textAlign: 'left', 
                        padding: '12px 20px', 
                        borderBottom: '1px solid rgba(255,255,255,0.05)', 
                        color: '#666', 
                        fontSize: '11px', 
                        textTransform: 'uppercase'
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupRows.map((rowCells, rIdx) => {
                    // Filter out the grouping column cell
                    const displayCells = rowCells.filter((_, idx) => idx !== groupColumnIndex);
                    
                    return (
                      <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        {displayCells.map((cell, cIdx) => (
                          <td key={cIdx} style={{ padding: '16px 20px', color: '#ccc', verticalAlign: 'middle' }}>
                            {renderCellContent(cell, displayHeaders[cIdx], rIdx, cIdx)}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
             </table>
          </AccordionItem>
        ))}
      </div>
    );
  }

  // --- RENDER MODE: STANDARD TABLE ---
  return (
    <div style={{ 
      overflowX: 'auto', 
      margin: '24px 0', 
      border: '1px solid rgba(255,255,255,0.08)', 
      borderRadius: '12px',
      background: 'rgba(20,20,20,0.4)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '500px' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
            {rawHeaders.map((h, i) => (
              <th key={i} style={{ 
                textAlign: 'left', 
                padding: '16px 20px', 
                borderBottom: '1px solid rgba(255,255,255,0.1)', 
                color: '#888', 
                fontWeight: 600,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, i) => {
            const cells = row.split('|').filter(c => c.trim() !== '').map(c => c.trim());
            return (
              <tr key={i} style={{ borderBottom: i === dataRows.length -1 ? 'none' : '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} 
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                {cells.map((cell, j) => {
                   return (
                     <td key={j} style={{ padding: '16px 20px', color: '#ccc', verticalAlign: 'middle' }}>
                       {renderCellContent(cell, rawHeaders[j], i, j)}
                     </td>
                   );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const StepBlock: React.FC<{ number: string, children: React.ReactNode }> = ({ number, children }) => (
  <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'flex-start' }}>
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

// Helper to parse bold, code, links inline
const parseInlineMarkdown = (text: string, keyPrefix: string) => {
  // 1. Check for Full Line Image: ![alt](url)
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

  // 2. Parse Links, Bold, and Inline Code within text
  const parts = text.split(/(\[.*?\]\(.*?\)|`.*?`|\*\*.*?\*\*)/g);

  return (
    <span key={keyPrefix}>
      {parts.map((part, i) => {
        // Link: [text](url)
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          return (
            <a 
              key={i} 
              href={linkMatch[2]} 
              target="_blank" 
              rel="noreferrer" 
              style={{ 
                color: '#fff', 
                textDecoration: 'none', 
                fontWeight: 600,
                borderBottom: '1px solid rgba(255,255,255,0.4)',
                paddingBottom: '0px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#E70012'; e.currentTarget.style.borderColor = '#E70012'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
            >
              {linkMatch[1]} <ExternalLink size={10} style={{ display: 'inline', marginLeft: '1px' }} />
            </a>
          );
        }

        // Inline Code: `text`
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

        // Bold: **text**
        const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
        if (boldMatch) {
          return <strong key={i} style={{ color: '#fff', fontWeight: 700 }}>{boldMatch[1]}</strong>;
        }

        return part;
      })}
    </span>
  );
};

// Main Markdown Parser that handles blocks
const parseFormattedText = (text: string, keyPrefix: string) => {
  if (!text) return null;
  
  // If text contains newlines, split into blocks to create hierarchy
  if (text.includes('\n')) {
    const lines = text.split('\n');
    return (
      <span key={keyPrefix} style={{ display: 'block' }}>
        {lines.map((line, i) => {
          // If first line is bolded (starts with **), treat as a Sub-Header
          const isHeader = i === 0 && line.trim().startsWith('**');
          return (
            <span key={`${keyPrefix}-${i}`} style={{ 
              display: 'block', 
              marginBottom: isHeader ? '6px' : '4px',
              marginTop: isHeader && i > 0 ? '12px' : '0', // Spacing if multiple blocks
              color: isHeader ? '#fff' : '#b0b0b0',
              fontSize: isHeader ? '1.05rem' : '0.95rem',
              lineHeight: isHeader ? '1.4' : '1.6',
              fontWeight: isHeader ? 600 : 400
            }}>
              {parseInlineMarkdown(line, `${keyPrefix}-${i}`)}
            </span>
          )
        })}
      </span>
    );
  }
  return parseInlineMarkdown(text, keyPrefix);
};

export const ContentRenderer: React.FC<ContentRendererProps> = ({ data, allContent, onNavigate, onUpdateContent }) => {
  const Icon = data.icon;
  const hasHeroMedia = !!(data.heroImage || data.heroVideo);
  const isWelcome = data.id === ContentType.WELCOME;
  const isCompany = data.id === ContentType.COMPANY;
  // Complex layout check (removed deleted types)
  const isComplexLayout = [ContentType.IT_SETUP, ContentType.WELFARE, ContentType.COMMUTE, ContentType.COMPANY, ContentType.TOOLS, ContentType.OFFICE_GUIDE, ContentType.FAQ].includes(data.id);
  
  // Editing Logic
  // Allowed for everything except Welcome and Company
  const canEdit = !isWelcome && !isCompany;
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setEditingItemIndex(index);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItemIndex(null);
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); // Stop event bubbling
    e.preventDefault();  // Prevent default action
    
    if (window.confirm('선택한 콘텐츠 블록을 삭제하시겠습니까? (복구할 수 없습니다)')) {
      const newSubSections = [...data.subSections];
      newSubSections.splice(index, 1);
      onUpdateContent(newSubSections);
    }
  };

  const handleSaveModal = (newData: SubSection) => {
    const newSubSections = [...data.subSections];
    if (editingItemIndex !== null) {
      newSubSections[editingItemIndex] = newData;
    } else {
      newSubSections.push(newData);
    }
    onUpdateContent(newSubSections);
  };

  // Quick Link Logic
  const quickLinkSections = HANDBOOK_CONTENT.filter(s => s.id !== ContentType.WELCOME && s.id !== ContentType.FAQ);

  // --- RENDER MODE: FAQ SEARCH ---
  if (data.id === ContentType.FAQ) {
    return (
      <div key={data.id} className="animate-enter">
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
        
        {/* Search Component */}
        <div className="animate-fade delay-4">
          <FaqSearch onNavigate={onNavigate} content={allContent} />
        </div>

        {/* Edit Mode for FAQ: Show List of Q&A to Edit */}
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
            
            <div className="grid-layout">
              {data.subSections.map((sub, index) => (
                <div key={index} className="bento-card" style={{ position: 'relative', border: '1px solid #E70012' }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px', 
                    display: 'flex', 
                    gap: '8px', 
                    zIndex: 100, // High z-index for FAQ items too
                    pointerEvents: 'auto'
                  }}>
                    <button type="button" onClick={(e) => handleEdit(e, index)} style={{ padding: '6px', background: '#333', borderRadius: '4px', color: '#fff', border: '1px solid #555', cursor: 'pointer' }}><Edit3 size={14}/></button>
                    <button type="button" onClick={(e) => handleDelete(e, index)} style={{ padding: '6px', background: '#333', borderRadius: '4px', color: '#ff5555', border: '1px solid #555', cursor: 'pointer' }}><Trash2 size={14}/></button>
                  </div>
                  <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '12px' }}>{sub.title}</h3>
                  <div className="card-content" style={{ fontSize: '0.9rem', color: '#999', maxHeight: '60px', overflow: 'hidden' }}>
                    {Array.isArray(sub.content) ? sub.content.join(' ') : sub.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <EditModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
          initialData={editingItemIndex !== null ? data.subSections[editingItemIndex] : undefined}
        />
      </div>
    );
  }

  return (
    <div key={data.id} className="animate-enter">
      {/* Header */}
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

            {/* Edit Toggle Button */}
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
                   marginBottom: '16px', 
                   textShadow: '0 10px 40px rgba(0,0,0,0.8)',
                   fontSize: 'clamp(3rem, 5vw, 5rem)' 
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

        {/* Decorative large icon in background - Subtle Watermark - Only if NO hero media */}
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
              <div className="grid-layout">
                {quickLinkSections.map((section, index) => {
                  const SectionIcon = section.icon;
                  // Determine navigation target
                  const targetId = (section.children && section.children.length > 0) 
                    ? section.children[0].id 
                    : section.id;

                  return (
                    <button 
                      key={section.id} 
                      onClick={() => onNavigate(targetId)}
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
        <div className="grid-layout">
          {data.subSections.map((sub, index) => {
             // Logic for grid sizing
             const textLength = Array.isArray(sub.content) ? sub.content.join('').length : sub.content.length;
             const hasTable = typeof sub.content === 'string' && sub.content.trim().startsWith('|');
             const hasCode = !!sub.codeBlock;
             const hasImage = !!sub.imagePlaceholder;
             
             // Complex layouts often benefit from full width for readability
             const isFullWidth = isComplexLayout || hasTable || hasCode || hasImage || textLength > 300;

             return (
               <article 
                key={index} 
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
                     zIndex: 100, // Increased z-index
                     pointerEvents: 'auto' // Explicitly enable pointer events
                   }}>
                     <button 
                        type="button"
                        onClick={(e) => handleEdit(e, index)}
                        style={{ padding: '8px', background: '#333', borderRadius: '4px', color: '#fff', border: '1px solid #555', cursor: 'pointer' }}
                        title="Edit"
                     >
                       <Edit3 size={16}/>
                     </button>
                     <button 
                        type="button"
                        onClick={(e) => handleDelete(e, index)}
                        style={{ padding: '8px', background: '#333', borderRadius: '4px', color: '#ff5555', border: '1px solid #555', cursor: 'pointer' }}
                        title="Delete"
                     >
                       <Trash2 size={16}/>
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
                   {Array.isArray(sub.content) ? (
                     <ul style={{ listStyle: 'none', padding: 0 }}>
                       {sub.content.map((item, i) => {
                         // Logic to determine List Item Type
                         
                         // 1. Check for Code Block (Wrapped in ```)
                         if (item.trim().startsWith('```') && item.trim().endsWith('```')) {
                            const codeText = item.replace(/^```/, '').replace(/```$/, '').trim();
                            return <CodeBlock key={i} text={codeText} />;
                         }

                         // 2. Info / Warning Box (starts with 👉)
                         if (item.trim().startsWith('👉')) {
                            const cleanText = item.replace(/^👉\s*/, '');
                            return <InfoBlock key={i}>{parseFormattedText(cleanText, `info-${i}`)}</InfoBlock>;
                         }

                         // 3. Link Card (standalone link [Text](url))
                         const linkOnlyMatch = item.trim().match(/^\[(.*?)\]\((.*?)\)$/);
                         if (linkOnlyMatch) {
                           return <LinkCardBlock key={i} text={linkOnlyMatch[1]} url={linkOnlyMatch[2]} />;
                         }

                         // 4. Step Process (Starts with ① or 1. or 01.)
                         const stepMatch = item.match(/^(\*\*)?([①-⑮]|\d+\.)\s*(.*)/s);
                         if (stepMatch) {
                           const rawNum = stepMatch[2];
                           const number = rawNum.replace('.', ''); 
                           let contentPart = stepMatch[3];
                           if (stepMatch[1] === '**') {
                             contentPart = '**' + contentPart;
                           }

                           return (
                             <StepBlock key={i} number={number}>
                               {parseFormattedText(contentPart, `step-${i}`)}
                             </StepBlock>
                           );
                         }

                         // 5. Default List Item
                         return (
                           <li key={i} className="list-item" style={{ alignItems: 'flex-start' }}>
                             {!isComplexLayout && item.trim().startsWith('-') ? (
                               <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                   <span className="dot" style={{ marginTop: '10px' }}></span>
                                   <div style={{ flex: 1 }}>
                                      {parseFormattedText(item.replace(/^-/, '').trim(), `text-${i}`)}
                                   </div>
                               </div>
                             ) : (
                               <div style={{ paddingLeft: '0', width: '100%' }}>
                                  {item.trim().startsWith('-') ? (
                                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                      <span style={{ color: '#444', flexShrink: 0, marginTop: '2px' }}>•</span>
                                      <div style={{ flex: 1 }}>{parseFormattedText(item.replace(/^-/, '').trim(), `text-${i}`)}</div>
                                    </div>
                                  ) : (
                                    parseFormattedText(item, `text-${i}`)
                                  )}
                               </div>
                             )}
                           </li>
                         );
                       })}
                     </ul>
                   ) : sub.content.trim().startsWith('|') ? (
                     <TableBlock text={sub.content} />
                   ) : (
                     <p>{parseFormattedText(sub.content, 'single')}</p>
                   )}
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
               </article>
             );
          })}
          
          {/* Add New Block Button */}
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
      )}

      <EditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingItemIndex !== null ? data.subSections[editingItemIndex] : undefined}
      />
    </div>
  );
};
