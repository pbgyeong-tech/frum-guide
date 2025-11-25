
import React, { useState } from 'react';
import { SectionData, ContentType } from '../types';
import { HANDBOOK_CONTENT } from '../constants';
import { Copy, Check, ArrowRight, Mail, ExternalLink, Lightbulb, Link as LinkIcon } from 'lucide-react';

interface ContentRendererProps {
  data: SectionData;
  onNavigate: (id: ContentType) => void;
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

const TableBlock: React.FC<{ text: string }> = ({ text }) => {
  const rows = text.trim().split('\n').filter(row => row.trim() !== '');
  const headers = rows[0].split('|').filter(c => c.trim() !== '').map(c => c.trim());
  
  // Detect separator line (e.g. |---|---|)
  const isSeparator = (row: string) => row.includes('---');
  const dataRows = rows.slice(1).filter(r => !isSeparator(r));

  const getBadgeStyle = (role: string) => {
    if (role.includes('책임')) return { bg: 'rgba(231,0,18,0.15)', color: '#FF8A8A', border: '1px solid rgba(231,0,18,0.3)' }; // Reddish
    if (role.includes('선임')) return { bg: 'rgba(52, 152, 219, 0.15)', color: '#85C1E9', border: '1px solid rgba(52, 152, 219, 0.3)' }; // Blueish
    if (role.includes('사원')) return { bg: 'rgba(46, 204, 113, 0.15)', color: '#82E0AA', border: '1px solid rgba(46, 204, 113, 0.3)' }; // Greenish
    return { bg: 'rgba(255,255,255,0.1)', color: '#ddd', border: '1px solid rgba(255,255,255,0.1)' };
  };

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
            {headers.map((h, i) => (
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
                   const header = headers[j] || '';
                   let content: React.ReactNode = parseFormattedText(cell, `table-${i}-${j}`);

                   // Badge Logic for Job Titles
                   if (header.includes('직급')) {
                     const style = getBadgeStyle(cell);
                     content = (
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
                     // Matching colors roughly to the image description/standard
                     if (cell === 'UX') badgeColor = { bg: 'rgba(231,0,18,0.2)', text: '#ff6666', border: '1px solid rgba(231,0,18,0.4)' }; // Reddish
                     else if (cell === 'Zip') badgeColor = { bg: 'rgba(52, 152, 219, 0.2)', text: '#85C1E9', border: '1px solid rgba(52, 152, 219, 0.4)' }; // Blueish
                     else if (cell === '소통') badgeColor = { bg: 'rgba(155, 89, 182, 0.2)', text: '#D2B4DE', border: '1px solid rgba(155, 89, 182, 0.4)' }; // Purple
                     else if (cell === '비용관리') badgeColor = { bg: 'rgba(46, 204, 113, 0.2)', text: '#82E0AA', border: '1px solid rgba(46, 204, 113, 0.4)' }; // Green

                     content = (
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
                     content = (
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
                   // Formatting for Name (Bold)
                   else if (header.includes('이름') || header.includes('Name')) {
                      content = <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{cell}</span>;
                   }

                   return (
                     <td key={j} style={{ padding: '16px 20px', color: '#ccc', verticalAlign: 'middle' }}>
                       {content}
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

export const ContentRenderer: React.FC<ContentRendererProps> = ({ data, onNavigate }) => {
  const Icon = data.icon;
  const hasHeroMedia = !!(data.heroImage || data.heroVideo);
  const isWelcome = data.id === ContentType.WELCOME;
  const isComplexLayout = [ContentType.IT_SETUP, ContentType.WELFARE, ContentType.COMMUTE, ContentType.COMPANY, ContentType.TOOLS, ContentType.OFFICE_GUIDE].includes(data.id);
  
  return (
    <div key={data.id} className="animate-enter">
      {/* Header */}
      <header style={{ marginBottom: '80px', position: 'relative' }}>
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
                {HANDBOOK_CONTENT.filter(s => s.id !== ContentType.WELCOME).map((section, index) => {
                  const SectionIcon = section.icon;
                  return (
                    <button 
                      key={section.id} 
                      onClick={() => onNavigate(section.id)}
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
                style={{ animationDelay: `${0.1 * index}s` }}
              >
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
                         
                         // 1. Info / Warning Box (starts with 👉)
                         if (item.trim().startsWith('👉')) {
                            const cleanText = item.replace(/^👉\s*/, '');
                            return <InfoBlock key={i}>{parseFormattedText(cleanText, `info-${i}`)}</InfoBlock>;
                         }

                         // 2. Link Card (standalone link [Text](url))
                         const linkOnlyMatch = item.trim().match(/^\[(.*?)\]\((.*?)\)$/);
                         if (linkOnlyMatch) {
                           return <LinkCardBlock key={i} text={linkOnlyMatch[1]} url={linkOnlyMatch[2]} />;
                         }

                         // 3. Step Process (Starts with ① or 1. or 01.)
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

                         // 4. Default List Item
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
        </div>
      )}
    </div>
  );
};
