import React, { useState } from 'react';
import { SectionData, ContentType, SubSection } from '../types';
import { useData } from '../context/DataContext';
import { 
  Copy, Check, ArrowRight, Mail, ExternalLink, Lightbulb, Link as LinkIcon, 
  ChevronDown, ChevronRight, Edit2, Save, Plus, Trash2, RotateCcw, Link,
  Building2, Briefcase, Wifi, Coffee, Clock, Monitor, Key, HelpCircle 
} from 'lucide-react';
import { FaqSearch } from './FaqSearch';

interface ContentRendererProps {
  data: SectionData;
  onNavigate: (id: ContentType) => void;
}

const isEditable = (id: ContentType) => {
  return [
    ContentType.IT_SETUP,
    ContentType.WELFARE,
    ContentType.COMMUTE,
    ContentType.TOOLS,
    ContentType.OFFICE_GUIDE,
    ContentType.FAQ
  ].includes(id);
};

// --- [Helper Components] ---

const CodeBlock: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const safeText = typeof text === 'string' ? text : String(text);

  const handleCopy = () => {
    navigator.clipboard.writeText(safeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="code-block" style={{ background: '#0a0a0a', border: '1px solid #222' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '8px' }}>
        <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Snippet</span>
        <button onClick={handleCopy} style={{ color: copied ? '#E70012' : '#555', background: 'none', border: 'none', cursor: 'pointer' }}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <pre style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>{safeText}</pre>
    </div>
  );
};

const AccordionItem: React.FC<{ title: string, children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: isOpen ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}>
        <span>{title}</span>
        {isOpen ? <ChevronDown size={18} color="#888" /> : <ChevronRight size={18} color="#888" />}
      </button>
      {isOpen && <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>{children}</div>}
    </div>
  );
};

const parseInlineMarkdown = (text: string, keyPrefix: string) => {
  if (!text) return null;
  const safeText = typeof text === 'string' ? text : JSON.stringify(text);

  const imgMatch = safeText.match(/^!\[(.*?)\]\((.*?)\)$/);
  if (imgMatch) {
    return <img key={keyPrefix} src={imgMatch[2]} alt={imgMatch[1]} style={{ width: '100%', height: 'auto', borderRadius: '8px', margin: '16px 0', border: '1px solid #333' }} />;
  }

  const parts = safeText.split(/(\[.*?\]\(.*?\)|`.*?`|\*\*.*?\*\*)/g);
  return (
    <span key={keyPrefix}>
      {parts.map((part, i) => {
        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          return (
            <a key={i} href={linkMatch[2]} target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.4)', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#E70012'; e.currentTarget.style.borderColor = '#E70012'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}>
              {linkMatch[1]} <ExternalLink size={10} style={{ display: 'inline', marginLeft: '1px' }} />
            </a>
          );
        }
        const codeMatch = part.match(/^`(.*?)`$/);
        if (codeMatch) return <code key={i} style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85em', color: '#E0E0E0', border: '1px solid rgba(255,255,255,0.1)' }}>{codeMatch[1]}</code>;
        const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
        if (boldMatch) return <strong key={i} style={{ color: '#fff', fontWeight: 700 }}>{boldMatch[1]}</strong>;
        return part;
      })}
    </span>
  );
};

const parseFormattedText = (text: string, keyPrefix: string) => {
  if (!text) return null;
  const safeText = typeof text === 'string' ? text : String(text);

  if (safeText.includes('\n')) {
    return (
      <span key={keyPrefix} style={{ display: 'block' }}>
        {safeText.split('\n').map((line, i) => {
          const isHeader = i === 0 && line.trim().startsWith('**');
          return (
            <span key={`${keyPrefix}-${i}`} style={{ display: 'block', marginBottom: isHeader ? '6px' : '4px', marginTop: isHeader && i > 0 ? '12px' : '0', color: isHeader ? '#fff' : '#b0b0b0', fontSize: isHeader ? '1.05rem' : '0.95rem', lineHeight: isHeader ? '1.4' : '1.6', fontWeight: isHeader ? 600 : 400 }}>
              {parseInlineMarkdown(line, `${keyPrefix}-${i}`)}
            </span>
          )
        })}
      </span>
    );
  }
  return parseInlineMarkdown(safeText, keyPrefix);
};

const TableBlock: React.FC<{ text: string }> = ({ text }) => {
  const safeText = typeof text === 'string' ? text : '';
  const rows = safeText.trim().split('\n').filter(row => row.trim() !== '');
  if (rows.length === 0) return null;

  const rawHeaders = rows[0].split('|').filter(c => c.trim() !== '').map(c => c.trim());
  const isSeparator = (row: string) => row.includes('---');
  const dataRows = rows.slice(1).filter(r => !isSeparator(r));
  const groupColumnIndex = rawHeaders.findIndex(h => h === '사업부');
  
  const getBadgeStyle = (role: string) => {
    if (role.includes('대표')) return { bg: 'rgba(241, 196, 15, 0.15)', color: '#F4D03F', border: '1px solid rgba(241, 196, 15, 0.3)' };
    if (role.includes('이사')) return { bg: 'rgba(155, 89, 182, 0.15)', color: '#D2B4DE', border: '1px solid rgba(155, 89, 182, 0.3)' };
    if (role.includes('수석')) return { bg: 'rgba(26, 188, 156, 0.15)', color: '#76D7C4', border: '1px solid rgba(26, 188, 156, 0.3)' };
    if (role.includes('책임')) return { bg: 'rgba(231,0,18,0.15)', color: '#FF8A8A', border: '1px solid rgba(231,0,18,0.3)' };
    if (role.includes('선임')) return { bg: 'rgba(52, 152, 219, 0.15)', color: '#85C1E9', border: '1px solid rgba(52, 152, 219, 0.3)' };
    if (role.includes('사원')) return { bg: 'rgba(46, 204, 113, 0.15)', color: '#82E0AA', border: '1px solid rgba(46, 204, 113, 0.3)' };
    return { bg: 'rgba(255,255,255,0.1)', color: '#ddd', border: '1px solid rgba(255,255,255,0.1)' };
  };

  const renderCell = (cell: string, header: string, rIdx: number, cIdx: number) => {
    if (header.includes('직급')) {
      const style = getBadgeStyle(cell);
      return <span style={{ backgroundColor: style.bg, color: style.color, border: style.border, padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 600 }}>{cell}</span>;
    } 
    if (header.includes('이메일')) return <a href={`mailto:${cell}`} style={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={14} />{cell}</a>;
    if (header.includes('Download')) return parseInlineMarkdown(cell, `dl-${rIdx}-${cIdx}`);
    if (header.includes('이름')) return <span style={{ fontWeight: 600, color: '#fff' }}>{cell}</span>;
    return cell;
  };

  if (groupColumnIndex !== -1) {
    const groupedData: Record<string, string[][]> = {};
    dataRows.forEach(row => {
      const cells = row.split('|').filter(c => c.trim() !== '').map(c => c.trim());
      const key = cells[groupColumnIndex];
      if (!groupedData[key]) groupedData[key] = [];
      groupedData[key].push(cells);
    });
    const displayHeaders = rawHeaders.filter((_, idx) => idx !== groupColumnIndex);

    return (
      <div style={{ margin: '24px 0' }}>
        {Object.entries(groupedData).map(([groupName, groupRows], gIdx) => (
          <AccordionItem key={gIdx} title={groupName} defaultOpen={gIdx === 0}>
             <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                    {displayHeaders.map((h, i) => <th key={i} style={{ textAlign: 'left', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#666', fontSize: '11px' }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {groupRows.map((rowCells, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      {rowCells.filter((_, idx) => idx !== groupColumnIndex).map((cell, cIdx) => (
                        <td key={cIdx} style={{ padding: '16px 20px', color: '#ccc' }}>{renderCell(cell, displayHeaders[cIdx], rIdx, cIdx)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
             </table>
          </AccordionItem>
        ))}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', margin: '24px 0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', background: 'rgba(20,20,20,0.4)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '500px' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
            {rawHeaders.map((h, i) => <th key={i} style={{ textAlign: 'left', padding: '16px 20px', color: '#888', fontSize: '12px' }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, i) => {
            const cells = row.split('|').filter(c => c.trim() !== '').map(c => c.trim());
            return (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {cells.map((cell, j) => <td key={j} style={{ padding: '16px 20px', color: '#ccc' }}>{renderCell(cell, rawHeaders[j], i, j)}</td>)}
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
    <div style={{ flexShrink: 0, width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(231,0,18,0.1)', border: '1px solid rgba(231,0,18,0.4)', color: '#E70012', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', fontFamily: "'JetBrains Mono', monospace" }}>{number}</div>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

const InfoBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ background: 'linear-gradient(90deg, rgba(231,0,18,0.05) 0%, rgba(20,20,20,0.5) 100%)', borderLeft: '2px solid #E70012', padding: '20px', borderRadius: '0 8px 8px 0', margin: '20px 0', fontSize: '0.95rem', color: '#ddd', display: 'flex', gap: '12px' }}>
    <Lightbulb size={16} color="#E70012" style={{ marginTop: '2px' }} />
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

const LinkCardBlock: React.FC<{ text: string, url: string }> = ({ text, url }) => (
  <a href={url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '20px 24px', margin: '20px 0', textDecoration: 'none', transition: 'all 0.3s' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LinkIcon size={20} color="#fff" /></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{text}</span><span style={{ color: '#666', fontSize: '0.8rem' }}>{new URL(url).hostname}</span></div>
    </div>
    <ArrowRight size={18} color="#E70012" />
  </a>
);

// --- [Main Component] ---

export const ContentRenderer: React.FC<ContentRendererProps> = ({ data, onNavigate }) => {
  const { updateSubSection, addSubSection, deleteSubSection, resetData } = useData();
  const [isEditMode, setIsEditMode] = useState(false);

  if (!data) return null;

  // 메인(WELCOME) 화면 전용 레이아웃
  if (data.id === ContentType.WELCOME) {
    // 바로가기 버튼 데이터
    const quickLinks = [
      { id: ContentType.COMPANY, label: '회사 & 조직', icon: Building2 },
      { id: ContentType.WORK_WAY, label: '일하는 방식', icon: Briefcase },
      { id: ContentType.IT_SETUP, label: '업무 시작 세팅', icon: Wifi },
      { id: ContentType.WELFARE, label: '복지 소개', icon: Coffee },
      { id: ContentType.COMMUTE, label: '업무 및 휴게시간', icon: Clock },
      { id: ContentType.TOOLS, label: '업무를 도와주는 툴', icon: Monitor },
      { id: ContentType.ETC, label: '기타', icon: Key },
      { id: ContentType.FAQ, label: 'FAQ', icon: HelpCircle },
    ];

    return (
      <div className="animate-enter">
        {/* 1. Hero Image (기존 유지) */}
        <div style={{ marginBottom: '60px', position: 'relative' }}>
           {data.heroVideo ? (
             <div className="hero-image-container">
               <video src={data.heroVideo} className="hero-img-anim" autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               <div className="hero-overlay-gradient"></div>
               <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', zIndex: 20 }}>
                 <h1 className="hero-title" style={{ fontSize: 'clamp(3rem, 5vw, 5rem)' }}>{data.title}</h1>
               </div>
             </div>
           ) : (
             <header>
               <h1 className="hero-title">{data.title}</h1>
             </header>
           )}
        </div>

        {/* 2. Onboarding Strategy Text (박스 제거 및 가운데 정렬) */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 80px auto', padding: '0 20px' }}>
          <h2 style={{ color: '#E70012', fontSize: '1.5rem', marginBottom: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <span style={{ width: '4px', height: '20px', background: '#E70012', display: 'inline-block' }}></span>
            Onboarding Strategy
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#ddd', wordBreak: 'keep-all' }}>
            Frum의 여정에 합류하신 것을 환영합니다. 본 가이드는 새로운 구성원이<br className="hidden-on-mobile" /> 
            조직의 문화·업무 방식·협업 구조를 빠르게 이해하도록 돕는 Roadmap입니다.
          </p>
        </div>

        {/* 3. Quick Link Buttons (8개 그리드) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
          gap: '16px',
          marginBottom: '100px'
        }}>
          {quickLinks.map((link) => (
            <button 
              key={link.id}
              onClick={() => onNavigate(link.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '24px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(231,0,18,0.1)';
                e.currentTarget.style.borderColor = '#E70012';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'rgba(255,255,255,0.05)', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <link.icon size={24} color="#E70012" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700 }}>{link.label}</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>바로가기 <ArrowRight size={12} style={{ display: 'inline', marginLeft: '2px' }}/></span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- 일반 페이지 렌더링 (기존 로직 유지) ---

  const Icon = data.icon; 
  const hasHeroMedia = !!(data.heroImage || data.heroVideo);
  const canEdit = isEditable(data.id);

  const handleContentChange = (index: number, field: keyof SubSection, value: any) => {
    if (!data.subSections) return; 
    const newSub = { ...data.subSections[index], [field]: value };
    updateSubSection(data.id, index, newSub);
  };

  if (data.id === ContentType.SEARCH) {
    return (
      <div key={data.id} className="animate-enter">
        <header style={{ marginBottom: '60px' }}>
          <h1 className="hero-title">{data.title}</h1>
          <p className="hero-desc">{data.description}</p>
        </header>
        <FaqSearch onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div key={data.id} className="animate-enter">
      <header style={{ marginBottom: '80px', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {!hasHeroMedia && (
            <>
              <h1 className="hero-title animate-fade delay-2">{data.title}</h1>
              {data.description && <p className="hero-desc animate-fade delay-3">{data.description}</p>}
            </>
          )}

          {hasHeroMedia && (
            <div className="animate-fade delay-3" style={{ marginTop: '24px', position: 'relative' }}>
               <div className="hero-image-container">
                 {data.heroVideo ? (
                   <video src={data.heroVideo} className="hero-img-anim" autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                   <img src={data.heroImage} alt="Hero" className="hero-img-anim" />
                 )}
                 <div className="hero-overlay-gradient"></div>
                 <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', zIndex: 20 }}>
                   <h1 className="hero-title" style={{ fontSize: 'clamp(3rem, 5vw, 5rem)' }}>{data.title}</h1>
                   <p className="hero-desc" style={{ color: '#EAEAEA', borderLeft: 'none' }}>{data.description}</p>
                 </div>
               </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: hasHeroMedia ? '0' : '20px', zIndex: 50 }}>
          {canEdit && (
            <button onClick={() => setIsEditMode(!isEditMode)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', background: isEditMode ? '#E70012' : '#222', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600 }}>
              {isEditMode ? <><Save size={16} /> 완료</> : <><Edit2 size={16} /> 편집</>}
            </button>
          )}
          {data.id === ContentType.GUIDE_EDIT && (
             <button onClick={resetData} style={{ padding: '10px', background: '#333', borderRadius: '8px', color: '#fff' }} title="초기화">
               <RotateCcw size={16} />
             </button>
           )}
        </div>

        {!hasHeroMedia && Icon && (
          <div style={{ position: 'absolute', right: '-50px', top: '-60px', opacity: '0.02', pointerEvents: 'none', transform: 'rotate(-10deg)', filter: 'blur(2px)' }} className="hidden-on-mobile">
            <Icon size={500} color="white" strokeWidth={0.5} />
          </div>
        )}
      </header>

      <div className="grid-layout" style={{ gridTemplateColumns: isEditMode ? '1fr' : undefined }}>
        {data.subSections?.map((sub, index) => {
           // 🚨 [핵심 수정] content가 문자열이 아닐 경우, 강제로 문자열로 변환 (에러 방지)
           let safeContent = sub.content || "";
           if (typeof safeContent !== 'string' && !Array.isArray(safeContent)) {
               safeContent = JSON.stringify(safeContent); 
           }

           const isTable = typeof safeContent === 'string' && safeContent.trim().startsWith('|');
           const contentLines = Array.isArray(safeContent) ? safeContent : (isTable ? [] : safeContent.split('\n'));

           return (
             <article 
               key={index} 
               className="bento-card full-width" 
               style={{ 
                 border: isEditMode ? '1px solid #E70012' : undefined, 
                 animationDelay: `${0.1 * index}s` 
               }}
             >
               {isEditMode ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label style={{ fontSize: '12px', color: '#666' }}>제목</label>
                      <button onClick={() => deleteSubSection(data.id, index)} style={{ color: '#ff4444' }}><Trash2 size={16} /></button>
                    </div>
                    <input 
                      value={sub.title}
                      onChange={(e) => handleContentChange(index, 'title', e.target.value)}
                      style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '4px', width: '100%' }}
                    />
                    <label style={{ fontSize: '12px', color: '#666' }}>내용</label>
                    <textarea
                      value={Array.isArray(sub.content) ? sub.content.join('\n') : (typeof sub.content === 'string' ? sub.content : '')}
                      onChange={(e) => handleContentChange(index, 'content', e.target.value)}
                      rows={8}
                      style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '4px', width: '100%', fontFamily: 'monospace', lineHeight: '1.5' }}
                    />

                    {/* 이미지 URL 입력 영역 */}
                    <div style={{ border: '1px dashed #444', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ccc', marginBottom: '8px' }}>
                        <Link size={14} /> 이미지 URL (링크를 붙여넣으세요)
                      </label>
                      <input 
                        type="text"
                        placeholder="https://example.com/image.png"
                        value={sub.imagePlaceholder || ''}
                        onChange={(e) => handleContentChange(index, 'imagePlaceholder', e.target.value)}
                        style={{ width: '100%', background: '#000', border: '1px solid #333', color: '#fff', padding: '8px', borderRadius: '4px', fontSize: '0.9rem' }}
                      />
                      {sub.imagePlaceholder && (
                        <div style={{ marginTop: '12px' }}>
                          <img 
                            src={sub.imagePlaceholder} 
                            alt="미리보기" 
                            style={{ maxWidth: '100%', borderRadius: '4px', maxHeight: '200px', objectFit: 'contain', border: '1px solid #333' }}
                            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300?text=Invalid+Image+URL'; }} 
                          />
                        </div>
                      )}
                    </div>

                    <input 
                      value={sub.codeBlock || ''}
                      onChange={(e) => handleContentChange(index, 'codeBlock', e.target.value)}
                      placeholder="코드블록/추가정보 (선택)"
                      style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '4px', width: '100%' }}
                    />
                  </div>
               ) : (
                 <>
                   <h3 className="card-title" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', width: '100%', display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <span className="card-marker"></span>
                     {sub.title}
                   </h3>
                   {sub.imagePlaceholder && (
                     <div style={{ margin: '24px 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid #222' }}>
                       <img src={sub.imagePlaceholder} alt="" style={{ width: '100%', display: 'block', opacity: 0.8 }} />
                     </div>
                   )}
                   <div className="card-content">
                     {isTable ? (
                        <TableBlock text={safeContent as string} />
                     ) : (
                       <ul style={{ listStyle: 'none', padding: 0 }}>
                         {contentLines.map((item, i) => {
                           if (typeof item !== 'string') return null;

                           if (item.trim().startsWith('```')) return <CodeBlock key={i} text={item.replace(/```/g, '').trim()} />;
                           if (item.trim().startsWith('👉')) return <InfoBlock key={i}>{parseFormattedText(item.replace(/^👉\s*/, ''), `info-${i}`)}</InfoBlock>;
                           if (item.trim().match(/^\[(.*?)\]\((.*?)\)$/)) {
                             const match = item.match(/^\[(.*?)\]\((.*?)\)$/);
                             return match ? <LinkCardBlock key={i} text={match[1]} url={match[2]} /> : null;
                           }
                           
                           const stepMatch = item.match(/^(\*\*)?([①-⑮]|\d+\.)\s*(.*)/s);
                           if (stepMatch) {
                             const rawNum = stepMatch[2].replace('.', ''); 
                             let contentPart = stepMatch[3];
                             if (stepMatch[1] === '**') contentPart = '**' + contentPart;
                             return <StepBlock key={i} number={rawNum}>{parseFormattedText(contentPart, `step-${i}`)}</StepBlock>;
                           }
                           
                           return (
                             <li key={i} className="list-item" style={{ alignItems: 'flex-start' }}>
                               {item.trim().startsWith('-') ? (
                                 <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                     <span className="dot" style={{ marginTop: '10px' }}></span>
                                     <div style={{ flex: 1 }}>{parseFormattedText(item.replace(/^-/, '').trim(), `text-${i}`)}</div>
                                 </div>
                               ) : (
                                 parseFormattedText(item, `text-${i}`)
                               )}
                             </li>
                           );
                         })}
                       </ul>
                     )}
                   </div>
                   {sub.codeBlock && <CodeBlock text={sub.codeBlock} />}
                   {sub.link && <a href={sub.link} target="_blank" rel="noreferrer" className="link-button">이동하기 <ArrowRight size={14} style={{ marginLeft: '4px' }} /></a>}
                 </>
               )}
             </article>
           );
        })}
        
        {canEdit && isEditMode && (
          <button onClick={() => addSubSection(data.id)} style={{ gridColumn: '1 / -1', padding: '20px', border: '2px dashed #333', borderRadius: '12px', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
            <Plus size={20} /> 항목 추가하기
          </button>
        )}
      </div>
    </div>
  );
};