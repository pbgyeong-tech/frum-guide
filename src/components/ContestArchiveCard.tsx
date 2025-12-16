
import React, { useState } from 'react';
import { SubSection } from '../types';
import { Trophy, Calendar, Image as ImageIcon, Link as LinkIcon, ArrowRight, Lightbulb } from 'lucide-react';
import { trackEvent } from '../utils/firebase';

// --- Markdown Helpers Local Copy (to support full rendering in Contest Card) ---
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
        const text = line.replace(/^(\d+\.|(\-|•|\*))\s*/, '');
        elements.push(<div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px', paddingLeft: '20px' }}><span style={{ color: '#555', lineHeight: 1.5, fontSize: '0.95rem', alignSelf: 'flex-start', paddingTop: '0' }}>•</span><span style={{ color: '#b0b0b0', lineHeight: 1.5, fontSize: '0.95rem' }}>{parseInlineMarkdown(text)}</span></div>);
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
      winner: string;
      imageUrl?: string;
      description?: string;
    };
  };
}

// Fallback Mock Data if codeBlock is empty
const ARCHIVE_MOCK_DATA: ArchiveData = {
  2025: {
    1: {
      title: "Cyberpunk Office Life",
      winner: "Creative Sol. Team",
      description: "미래지향적인 오피스 환경을 사이버펑크 스타일로 재해석한 작품입니다.",
      imageUrl: "https://cdn.midjourney.com/u/27b81851-afbf-4e59-84eb-0a18c999df64/47b39e7f0ae783f5f387bdea4888f0b9750b5e1fa6f9dd08dbeb458f2c24d451.png" 
    }
  }
};

interface ContestArchiveCardProps {
  data: SubSection;
  adminControls?: React.ReactNode;
  id?: string;
}

export const ContestArchiveCard: React.FC<ContestArchiveCardProps> = ({ data, adminControls, id }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  // Use data from codeBlock (JSON) if available, otherwise mock
  let archiveData = ARCHIVE_MOCK_DATA;
  if (data.codeBlock) {
    try {
        const parsed = JSON.parse(data.codeBlock);
        // Basic check to see if it looks like archive data
        if (typeof parsed === 'object') {
            archiveData = parsed;
        }
    } catch (e) {
        // Fallback to mock if parse fails or it's not JSON
    }
  }

  const currentData = archiveData[selectedYear]?.[selectedMonth];

  return (
    <div id={id} className="bento-card full-width" style={{ padding: 0, overflow: 'hidden' }}>
      {/* 1. Header Section (Full Markdown Rendering) */}
      <div style={{ padding: '32px 32px 20px 32px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(231,0,18,0.1)', borderRadius: '8px' }}>
                    <Trophy color="#E70012" size={20} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: 0 }}>{data.title}</h3>
            </div>
            {/* Admin Controls Area */}
            {adminControls && (
                <div style={{ marginLeft: '16px' }}>
                    {adminControls}
                </div>
            )}
        </div>
        
        {/* Render Full Body Content Here */}
        <div style={{ color: '#ccc', lineHeight: '1.6', fontSize: '1rem', marginTop: '16px' }}>
          {renderMarkdownContent(data.content)}
        </div>
      </div>

      {/* 2. Controls Section (Year Tabs & Month Grid) */}
      <div style={{ background: 'rgba(255,255,255,0.02)' }}>
        {/* Year Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {[2024, 2025, 2026, 2027].map(year => (
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

        {/* Month Selector */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(6, 1fr)', 
          gap: '8px', 
          padding: '16px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.1)' 
        }}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
             const hasData = !!archiveData[selectedYear]?.[month];
             const isSelected = selectedMonth === month;
             
             return (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: isSelected ? '1px solid #E70012' : '1px solid rgba(255,255,255,0.1)',
                  background: isSelected ? '#E70012' : (hasData ? 'rgba(255,255,255,0.05)' : 'transparent'),
                  color: isSelected ? '#fff' : (hasData ? '#ccc' : '#444'),
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
          <span>{selectedYear}년 {selectedMonth}월 출품작</span>
        </div>

        {currentData && (currentData.title || currentData.imageUrl) ? (
          <div className="animate-fade">
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
              {currentData.imageUrl ? (
                <img src={currentData.imageUrl} alt={currentData.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#333' }}>
                  <ImageIcon size={48} />
                </div>
              )}
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
            </div>

            <h4 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>{currentData.title}</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.9rem', color: '#888' }}>Winner:</span>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{currentData.winner}</span>
            </div>
            <p style={{ color: '#ccc', lineHeight: '1.6' }}>{currentData.description}</p>
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
            <Trophy size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
            <p style={{ fontSize: '1rem', fontWeight: 500 }}>등록된 출품작이 없습니다.</p>
            <p style={{ fontSize: '0.85rem' }}>작업물을 서버 폴더에 업로드 해주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};
