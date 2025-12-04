
import React, { useState, useEffect } from 'react';
import { SectionData, ContentType, SubSection } from '../types';
import { HANDBOOK_CONTENT } from '../constants';
import { Edit3, Plus, Trash2, ArrowUp, ArrowDown, Link as LinkIcon, ArrowRight, Lightbulb, ChevronDown, ChevronRight, Check, Copy } from 'lucide-react';
import { FaqSearch } from './FaqSearch';
import { EditModal } from './EditModal';

// ----------------------------------------------------------------------
// 1. 스타일 & 유틸리티 (뱃지 색상 등)
// ----------------------------------------------------------------------
const BADGE_PALETTE = [
  { bg: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(185, 28, 28, 0.5)' },
  { bg: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(29, 78, 216, 0.5)' },
  { bg: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(4, 120, 87, 0.5)' },
  { bg: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', border: '1px solid rgba(126, 34, 206, 0.5)' },
  { bg: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', border: '1px solid rgba(180, 83, 9, 0.5)' },
];

const getBadgeStyle = (text: string) => {
  if (!text) return BADGE_PALETTE[0];
  const t = text.trim();
  
  // 직급별 고정 색상 매핑
  if (t.includes('대표') || t.includes('CEO')) return { bg: 'rgba(234, 179, 8, 0.2)', color: '#fde047', border: '1px solid rgba(161, 98, 7, 0.5)' }; // Yellow
  if (t.includes('이사')) return { bg: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', border: '1px solid rgba(126, 34, 206, 0.5)' }; // Purple
  if (t.includes('책임')) return { bg: 'rgba(249, 115, 22, 0.2)', color: '#fdba74', border: '1px solid rgba(194, 65, 12, 0.5)' }; // Orange
  if (t.includes('선임')) return { bg: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(29, 78, 216, 0.5)' }; // Blue
  if (t.includes('사원')) return { bg: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(4, 120, 87, 0.5)' }; // Green
  
  // 그 외 랜덤 해시
  let hash = 0;
  for (let i = 0; i < t.length; i++) hash = ((hash << 5) - hash) + t.charCodeAt(i);
  return BADGE_PALETTE[Math.abs(hash) % BADGE_PALETTE.length];
};

// ----------------------------------------------------------------------
// 2. 하위 컴포넌트들 (리스트, 카드, 아코디언)
// ----------------------------------------------------------------------

// 숫자 리스트 (빨간 동그라미)
const StepBlock: React.FC<{ number: string, children: React.ReactNode, marginBottom?: string }> = ({ number, children, marginBottom = '24px' }) => (
  <div style={{ display: 'flex', gap: '16px', marginBottom: marginBottom, alignItems: 'flex-start' }}>
    <div style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(231,0,18,0.1)', border: '1px solid rgba(231,0,18,0.5)', color: '#E70012', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', marginTop: '2px' }}>{number}</div>
    <div style={{ flex: 1, lineHeight: 1.6, color: '#EAEAEA' }}>{children}</div>
  </div>
);

// 아웃링크 카드 (박스 형태)
const LinkCardBlock: React.FC<{ text: string, url: string }> = ({ text, url }) => (
  <a href={url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '20px 24px', margin: '20px 0', textDecoration: 'none', cursor: 'pointer', transition: 'border 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#E70012'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LinkIcon size={20} color="#fff" /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{text}</span><span style={{ color: '#666', fontSize: '0.8rem' }}>{new URL(url).hostname}</span></div>
    </div>
    <ArrowRight size={18} color="#E70012" />
  </a>
);

// 아코디언 (표 그룹핑용)
const AccordionItem: React.FC<{ title: string, children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: isOpen ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontWeight: 600 }}><span>{title}</span>{isOpen ? <ChevronDown size={18} color="#888" /> : <ChevronRight size={18} color="#888" />}</button>
      {isOpen && <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>{children}</div>}
    </div>
  );
};

// 코드 블럭
const CodeBlock: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ background: '#050505', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#E0E0E0', margin: '16px 0', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
    {text}
  </div>
);

// 강조 박스 (InfoBlock) - disclaimer 전용
const InfoBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    background: 'linear-gradient(90deg, rgba(231,0,18,0.05) 0%, rgba(20,20,20,0.5) 100%)',
    borderLeft: '2px solid #E70012',
    padding: '16px',
    borderRadius: '0 8px 8px 0',
    marginTop: '20px',
    marginBottom: '20px',
    fontSize: '0.9rem',
    color: '#ddd',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    whiteSpace: 'pre-wrap' // 줄바꿈 지원
  }}>
    <Lightbulb size={18} color="#E70012" style={{ flexShrink: 0, marginTop: '2px' }} />
    <div style={{ lineHeight: 1.6, flex: 1 }}>{children}</div>
  </div>
);

// ----------------------------------------------------------------------
// 3. 마크다운 파싱 로직
// ----------------------------------------------------------------------

const parseInlineMarkdown = (text: string) => {
  // 1. 이미지 파싱: ![alt](url) -> <img> (정규식 수정됨)
  // 문장 중간에 있거나 단독으로 있어도 처리
  const imgMatch = text.match(/!\[(.*?)\]\((.*?)\)/);
  if (imgMatch) {
    return <img src={imgMatch[2]} alt={imgMatch[1]} referrerPolicy="no-referrer" style={{ width: '100%', height: 'auto', borderRadius: '8px', margin: '16px 0', border: '1px solid #333' }} />;
  }

  // 2. 링크, 볼드체, 코드 파싱
  const parts = text.split(/(\[.*?\]\(.*?\)|`.*?`|\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) return <a key={i} href={linkMatch[2]} target="_blank" rel="noreferrer" style={{ color: '#E70012', fontWeight: 600, borderBottom: '1px solid rgba(231,0,18,0.3)' }}>{linkMatch[1]}</a>;
        const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
        if (boldMatch) return <strong key={i} style={{ color: '#fff' }}>{boldMatch[1]}</strong>;
        const codeMatch = part.match(/^`(.*?)`$/);
        if (codeMatch) return <code key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>{codeMatch[1]}</code>;
        return part;
      })}
    </>
  );
};

// 테이블 렌더러
const TableBlock: React.FC<{ text: string }> = ({ text }) => {
  const rows = text.trim().split('\n').filter(r => r.trim() !== '');
  const headerRow = rows[0];
  const headers = headerRow.split('|').map(c => c.trim()).filter(c => c);
  const bodyRows = rows.slice(1).filter(r => !/^[\s\|\-:]+$/.test(r));
  
  // "사업부" 컬럼이 있으면 아코디언으로 묶기
  const groupColumnIndex = headers.findIndex(h => h.includes('사업부'));
  
  const renderCell = (cell: string, header: string) => {
    // 뱃지 처리
    if (header.includes('직급') || header.toLowerCase().includes('type') || header.includes('한도금액')) {
      const style = getBadgeStyle(cell);
      return <span style={{ backgroundColor: style.bg, color: style.color, border: style.border, padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>{cell}</span>;
    }
    // 이메일 처리
    if (header.includes('이메일')) return <a href={`mailto:${cell}`} style={{ color: '#aaa' }}>{cell}</a>;
    return parseInlineMarkdown(cell);
  };

  // 아코디언 모드
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
            <div style={{ overflowX: 'auto' }}>
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
  
  // 일반 테이블 모드
  return (
    <div style={{ width: '100%', overflowX: 'auto', margin: '20px 0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead><tr style={{ background: 'rgba(255,255,255,0.05)' }}>{headers.map((h, i) => <th key={i} style={{ padding: '12px', textAlign: 'left', color: '#888', borderBottom: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
        <tbody>
          {bodyRows.map((row, i) => {
            const cells = row.split('|').map(c => c.trim()).filter(c => c !== '');
            while (cells.length < headers.length) cells.push('');
            return <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{cells.map((cell, j) => <td key={j} style={{ padding: '12px', color: '#ccc', whiteSpace: 'nowrap' }}>{renderCell(cell, headers[j] || '')}</td>)}</tr>;
          })}
        </tbody>
      </table>
    </div>
  );
};

// 메인 마크다운 렌더러
const renderMarkdownContent = (content: string | string[]) => {
  const lines = Array.isArray(content) ? content : content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    
    // 1. 코드 블록
    if (line.startsWith('```')) {
      const codeLines = []; i++;
      while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++; }
      elements.push(<CodeBlock key={`code-${i}`} text={codeLines.join('\n')} />);
      i++; continue;
    }

    // 2. 테이블
    if (line.startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { tableLines.push(lines[i]); i++; }
      elements.push(<TableBlock key={`table-${i}`} text={tableLines.join('\n')} />);
      continue;
    }

    // 3. 이미지 (단독 라인 및 포함 라인 처리)
    if (line.includes('![') && line.includes(')')) {
       // 이미지 파싱 시도
       const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
       if (imgMatch) {
         // 만약 라인 전체가 이미지면 div로 감싸고, 아니면 인라인으로 처리
         if (line.startsWith('![') && line.endsWith(')')) {
            elements.push(<div key={i} style={{ margin: '24px 0' }}><img src={imgMatch[2]} alt={imgMatch[1]} referrerPolicy="no-referrer" style={{ width: '100%', borderRadius: '8px', border: '1px solid #222' }} /></div>);
         } else {
            elements.push(<p key={i} style={{ marginBottom: '12px', color: '#ccc' }}>{parseInlineMarkdown(line)}</p>);
         }
         i++; continue;
       }
    }

    // 4. 아웃링크 카드 (단독)
    if (line.startsWith('[') && line.endsWith(')') && !line.includes('!')) {
       const linkMatch = line.match(/^\[(.*?)\]\((.*?)\)$/);
       if (linkMatch) { elements.push(<LinkCardBlock key={i} text={linkMatch[1]} url={linkMatch[2]} />); i++; continue; }
    }

    // 5. 리스트 & 그룹핑 (1. 숫자, - 점)
    const isOrdered = /^\d+\./.test(line);
    const isUnordered = /^(\-|•|\*)\s/.test(line);
    if (isOrdered || isUnordered) {
        const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
        const nextIsUnordered = /^(\-|•|\*)\s/.test(nextLine);
        let marginBottom = '24px';
        if (isOrdered && nextIsUnordered) marginBottom = '8px'; // 상위-하위 연결 시 좁게
        if (isUnordered && nextIsUnordered) marginBottom = '8px'; // 하위끼리 좁게

        if (isOrdered) {
             const match = line.match(/^(\d+)\.\s+(.*)/);
             if (match) elements.push(<StepBlock key={i} number={match[1]} marginBottom={marginBottom}>{parseInlineMarkdown(match[2])}</StepBlock>);
        } else {
            const text = line.replace(/^(\-|•|\*)\s*/, '');
            // 들여쓰기 52px 적용
            elements.push(<div key={i} style={{ display: 'flex', gap: '10px', marginBottom: marginBottom, paddingLeft: '52px' }}><span style={{ color: '#555', marginTop: '6px' }}>•</span><span style={{ color: '#b0b0b0', lineHeight: 1.6, fontSize: '0.95rem' }}>{parseInlineMarkdown(text)}</span></div>);
        }
        i++; continue;
    }

    // 6. 구분선
    if (/^-{3,}$/.test(line)) {
      elements.push(<hr key={i} style={{ margin: '60px 0', border: 'none', borderTop: '1px solid #333' }} />);
      i++; continue;
    }

    // 7. Blockquote (Markdown >) -> InfoBlock (Red Box)
    // Content 영역에서 >로 시작하는 문장만 붉은 박스로 변환합니다. (👉는 변환 안 함)
    if (line.startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) {
            // Remove '>' and space
            quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
            i++;
        }
        elements.push(
            <InfoBlock key={`quote-${i}`}>
                {quoteLines.map((qLine, qIdx) => (
                    <div key={qIdx} style={{ marginBottom: qIdx < quoteLines.length - 1 ? '4px' : '0' }}>
                        {parseInlineMarkdown(qLine)}
                    </div>
                ))}
            </InfoBlock>
        );
        continue;
    }

    // 8. 일반 텍스트 (👉 포함)
    if (line !== '') {
      elements.push(<p key={i} style={{ marginBottom: '12px', color: '#ccc', lineHeight: 1.7, fontSize: '1rem' }}>{parseInlineMarkdown(line)}</p>);
    }
    i++;
  }
  return elements;
};

// ----------------------------------------------------------------------
// 4. 메인 컴포넌트 렌더러
// ----------------------------------------------------------------------
export const ContentRenderer: React.FC<any> = ({ data, isAdmin, onUpdateContent, onNavigate, allContent, setIsDirty }) => {
  const isWelcome = data.id === ContentType.WELCOME;
  const isFAQ = data.id === ContentType.FAQ;
  const isComplexLayout = [ContentType.IT_SETUP, ContentType.WELFARE, ContentType.COMMUTE, ContentType.COMPANY, ContentType.TOOLS, ContentType.OFFICE_GUIDE, ContentType.FAQ, ContentType.EXPENSE].includes(data.id);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  const quickLinkSections = HANDBOOK_CONTENT.filter(s => s.id !== ContentType.WELCOME && s.id !== ContentType.FAQ);

  // [Defensive Coding] subSections가 배열이 아닌 경우 빈 배열로 대체
  const safeSubSections = Array.isArray(data.subSections) ? data.subSections : [];

  useEffect(() => { setIsEditMode(false); }, [data.id]);
  const handleEdit = (uuid: string) => { setEditingItemId(uuid); setIsModalOpen(true); };
  const handleAddNew = () => { setEditingItemId(null); setIsModalOpen(true); };
  
  const handleSaveModal = (newData: SubSection) => {
    // 1. 기존 데이터가 배열인지 확인하고, 아니면 빈 배열로 초기화 (안전장치)
    const currentList = Array.isArray(data.subSections) ? data.subSections : [];
    
    // 2. 복사본 생성
    let newSubSections = [...currentList];

    // 3. 수정 또는 추가
    if (editingItemId) {
      // 수정: ID가 일치하는 항목 교체 (UUID 유지)
      newSubSections = newSubSections.map(sub => 
        sub.uuid === editingItemId ? { ...newData, uuid: editingItemId } : sub
      );
    } else {
      // 추가: 배열 끝에 새 항목 추가 (새 UUID 생성)
      const newUuid = (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2);
      newSubSections.push({ ...newData, uuid: newUuid });
    }

    // 4. 상위 컴포넌트로 전달 (DB 저장)
    // IMPORTANT: Call signature must match (SubSection[]) as handled in MainLayout
    onUpdateContent(newSubSections);
  };

  const handleDelete = (uuid: string) => { 
    if(confirm("삭제하시겠습니까? 복구할 수 없습니다.")) {
      const newSubSections = safeSubSections.filter(s => s.uuid !== uuid);
      onUpdateContent(newSubSections);
    }
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

  // FAQ 뷰
  if (isFAQ) {
    return (
      <div className="animate-enter">
        <header className="page-header">
          <h1 className="hero-title">{data.title}</h1>
          <p className="hero-desc">{data.description}</p>
        </header>
        <FaqSearch onNavigate={onNavigate} content={allContent} />
      </div>
    );
  }

  // Welcome 뷰
  if (isWelcome) {
      return (
        <div className="animate-enter">
            <div className="hero-image-container" style={{ marginTop: '20px' }}>
                {data.heroVideo ? <video src={data.heroVideo} className="hero-img-anim" autoPlay loop muted playsInline /> : <img src={data.heroImage} className="hero-img-anim" alt="Hero" />}
                <div className="hero-overlay-gradient"></div>
                <div className="brand-slash-container"><div className="brand-slash-line"></div></div>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 20, textAlign: 'center' }}>
                    <h1 className="hero-title" style={{ fontSize: 'clamp(3rem, 5vw, 5rem)' }}>{data.title}</h1>
                </div>
            </div>
            {/* 안전하게 접근 */}
            {safeSubSections.length > 0 && (
             <div className="animate-fade delay-4" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 80px', padding: '0 20px' }}>
               <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: '#fff', fontWeight: 700 }}>{safeSubSections[0].title}</h2>
               <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#ccc', fontWeight: 400 }}>{safeSubSections[0].content}</p>
             </div>
            )}
            <div className="grid-layout">
                {quickLinkSections.map((section, index) => {
                  const SectionIcon = section.icon;
                  return (
                    <button key={section.id} onClick={() => onNavigate(section.id)} className="bento-card" style={{ textAlign: 'left', cursor: 'pointer', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}><SectionIcon size={24} color="#E70012" /><h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>{section.title}</h3></div>
                      <p style={{ fontSize: '0.95rem', color: '#999', lineHeight: '1.5', margin: 0 }}>{section.description}</p>
                    </button>
                  );
                })}
            </div>
        </div>
      );
  }

  // 일반 콘텐츠 뷰
  return (
    <div className="animate-enter">
      <header className="page-header">
        <div><h1 className="hero-title">{data.title}</h1>{data.description && <p className="hero-desc">{data.description}</p>}</div>
        {isAdmin && (
          <button 
            onClick={() => setIsEditMode(!isEditMode)} 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px', 
              borderRadius: '8px', 
              border: '1px solid #E70012',
              background: isEditMode ? '#E70012' : 'transparent',
              color: isEditMode ? '#fff' : '#E70012',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap', // 텍스트 줄바꿈 방지
              flexShrink: 0 // 찌그러짐 방지
            }}
          >
            <Edit3 size={16} />
            {isEditMode ? 'Done Editing' : 'Edit Page'}
          </button>
        )}
      </header>
      <div className="grid-layout">
        {/* 안전하게 safeSubSections.map 사용 */}
        {safeSubSections.map((sub, index) => {
          const isFullWidth = isComplexLayout || (Array.isArray(sub.content) ? sub.content.join('').length : sub.content.length) > 200 || sub.title.includes('전결');
          return (
            <article key={sub.uuid || index} className={`bento-card ${isFullWidth ? 'full-width' : ''}`} style={{ position: 'relative', border: isEditMode ? '1px dashed #E70012' : undefined }}>
              {isEditMode && (
                <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 4, zIndex: 10 }}>
                  {index > 0 && (
                    <button onClick={() => handleMoveUp(index)} style={{ background: '#333', padding: 6, borderRadius: 4, cursor: 'pointer', border: 'none' }}>
                      <ArrowUp size={14} color="white" />
                    </button>
                  )}
                  {index < safeSubSections.length - 1 && (
                    <button onClick={() => handleMoveDown(index)} style={{ background: '#333', padding: 6, borderRadius: 4, cursor: 'pointer', border: 'none' }}>
                      <ArrowDown size={14} color="white" />
                    </button>
                  )}
                  <button onClick={() => handleEdit(sub.uuid!)} style={{ background: '#333', padding: 6, borderRadius: 4, cursor: 'pointer', border: 'none' }}>
                    <Edit3 size={14} color="white" />
                  </button>
                  <button onClick={() => handleDelete(sub.uuid!)} style={{ background: '#333', padding: 6, borderRadius: 4, cursor: 'pointer', border: 'none' }}>
                    <Trash2 size={14} color="red" />
                  </button>
                </div>
              )}
              
              <h3 className="card-title" style={{ 
                borderBottom: '1px solid rgba(255,255,255,0.1)', 
                paddingBottom: '16px', 
                marginBottom: '24px', 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px' 
              }}>
                {!isComplexLayout && <span className="card-marker"></span>}
                {sub.title}
              </h3>

              {sub.imagePlaceholder && (
                <div style={{ marginBottom: '20px' }}>
                  <img 
                    src={sub.imagePlaceholder} 
                    alt={sub.title} 
                    referrerPolicy="no-referrer"
                    style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} 
                  />
                </div>
              )}
              <div className="card-content">{renderMarkdownContent(Array.isArray(sub.content) ? sub.content.join('\n') : sub.content)}</div>
              
              {/* Disclaimer (별도 필드용) - Parse Markdown to support bold/links inside disclaimer */}
              {sub.disclaimer && (
                <InfoBlock>
                  {sub.disclaimer.split('\n').map((line, i) => (
                    <div key={i}>{parseInlineMarkdown(line)}</div>
                  ))}
                </InfoBlock>
              )}
            </article>
          );
        })}
        {isEditMode && <button onClick={handleAddNew} style={{ border: '2px dashed #333', borderRadius: 12, padding: 40, color: '#666', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}><Plus size={32} /><span style={{ marginTop: 12 }}>Add Block</span></button>}
      </div>
      <EditModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveModal} 
        initialData={editingItemId ? safeSubSections.find(s => s.uuid === editingItemId) : undefined} 
        onDirty={setIsDirty} 
      />
    </div>
  );
};
