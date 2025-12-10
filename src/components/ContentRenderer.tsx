import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SectionData, ContentType, SubSection } from '../types';
import { HANDBOOK_CONTENT } from '../constants';
import { Edit3, Plus, Trash2, ArrowUp, ArrowDown, Link as LinkIcon, ArrowRight, Lightbulb, ChevronDown, ChevronRight, Copy, User as UserIcon, Clock, Check, X } from 'lucide-react';
import { FaqSearch } from './FaqSearch';
import { EditModal } from './EditModal';
import { ConfirmModal } from './ConfirmModal';
import { trackAnchorView, trackEvent } from '../utils/firebase';
import { addEditLog } from '../utils/db';
import firebase from 'firebase/compat/app';

// --- Badge Style Logic ---
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
  if (t.includes('대표') || t.includes('CEO')) return { bg: 'rgba(234, 179, 8, 0.2)', color: '#fde047', border: '1px solid rgba(161, 98, 7, 0.5)' }; 
  if (t.includes('이사')) return { bg: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', border: '1px solid rgba(126, 34, 206, 0.5)' }; 
  if (t.includes('책임')) return { bg: 'rgba(249, 115, 22, 0.2)', color: '#fdba74', border: '1px solid rgba(194, 65, 12, 0.5)' }; 
  if (t.includes('선임')) return { bg: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(29, 78, 216, 0.5)' }; 
  if (t.includes('사원')) return { bg: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', border: '1px solid rgba(4, 120, 87, 0.5)' }; 
  
  let hash = 0;
  for (let i = 0; i < t.length; i++) hash = ((hash << 5) - hash) + t.charCodeAt(i);
  return BADGE_PALETTE[Math.abs(hash) % BADGE_PALETTE.length];
};

const handleContentOutboundClick = (name: string, url: string) => {
  trackEvent('click_outbound', { link_name: name, link_url: url, location: 'content' });
};

// --- Sub Components ---
const StepBlock: React.FC<{ number: string, children: React.ReactNode, marginBottom?: string }> = ({ number, children, marginBottom = '24px' }) => (
  <div style={{ display: 'flex', gap: '16px', marginBottom: marginBottom, alignItems: 'flex-start' }}>
    <div style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(231,0,18,0.1)', border: '1px solid rgba(231,0,18,0.5)', color: '#E70012', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px', marginTop: '2px' }}>{number}</div>
    <div style={{ flex: 1, color: '#ddd', lineHeight: '1.6' }}>{children}</div>
  </div>
);

// --- Props Interface ---
interface ContentRendererProps {
  data: SectionData;
  allContent: SectionData[];
  onNavigate: (id: ContentType) => void;
  onUpdateContent: (id: ContentType, newSubSections: SubSection[]) => void;
  setIsDirty: (dirty: boolean) => void;
  isAdmin: boolean;
  user: firebase.User | null;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({
  data,
  allContent,
  onNavigate,
  onUpdateContent,
  setIsDirty,
  isAdmin,
  user
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<SubSection | undefined>(undefined);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(null);

  const navigate = useNavigate();

  // Reset Edit Mode when changing sections
  useEffect(() => {
    setIsEditMode(false);
  }, [data.id]);

  // Edit Handlers
  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (!data.subSections) return;
    const newSubSections = [...data.subSections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newSubSections.length) {
      [newSubSections[index], newSubSections[targetIndex]] = [newSubSections[targetIndex], newSubSections[index]];
      onUpdateContent(data.id, newSubSections);
      setIsDirty(true);
    }
  };

  const handleEditClick = (item: SubSection) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(undefined);
    setIsEditModalOpen(true);
  };

  const handleSave = async (newData: SubSection) => {
    let newSubSections = [...(data.subSections || [])];
    const isNew = !editingItem;
    
    // Log Data Preparation
    const logData = {
      timestamp: Date.now(),
      userEmail: user?.email || 'unknown',
      sectionId: data.id,
      subSectionTitle: newData.title,
      action: isNew ? 'create' : 'update' as 'create' | 'update',
      details: {
        before: editingItem ? {
          slug: editingItem.slug || '',
          title: editingItem.title,
          body_content: Array.isArray(editingItem.content) ? editingItem.content.join('\n') : editingItem.content,
          media: editingItem.imagePlaceholder || '',
          external_link: editingItem.link || '',
          disclaimer_note: editingItem.disclaimer || ''
        } : undefined,
        after: {
          slug: newData.slug || '',
          title: newData.title,
          body_content: Array.isArray(newData.content) ? newData.content.join('\n') : newData.content,
          media: newData.imagePlaceholder || '',
          external_link: newData.link || '',
          disclaimer_note: newData.disclaimer || ''
        }
      }
    };

    if (isNew) {
      newSubSections.push(newData);
    } else {
      const index = newSubSections.findIndex(s => s.uuid === editingItem!.uuid || s.title === editingItem!.title);
      if (index !== -1) {
        newSubSections[index] = newData;
      }
    }
    
    onUpdateContent(data.id, newSubSections);
    setIsDirty(true);
    
    // Save Log
    await addEditLog(logData);
  };

  const handleDeleteClick = (index: number) => {
    setDeleteTargetIndex(index);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetIndex === null) return;
    const targetItem = data.subSections[deleteTargetIndex];
    const newSubSections = data.subSections.filter((_, i) => i !== deleteTargetIndex);
    
    onUpdateContent(data.id, newSubSections);
    setIsDirty(true);

    // Save Log
    await addEditLog({
      timestamp: Date.now(),
      userEmail: user?.email || 'unknown',
      sectionId: data.id,
      subSectionTitle: targetItem.title,
      action: 'delete',
      details: {
        before: {
          slug: targetItem.slug || '',
          title: targetItem.title,
          body_content: Array.isArray(targetItem.content) ? targetItem.content.join('\n') : targetItem.content,
          media: targetItem.imagePlaceholder || '',
          external_link: targetItem.link || '',
          disclaimer_note: targetItem.disclaimer || ''
        }
      }
    });

    setDeleteTargetIndex(null);
  };

  return (
    <div className="content-renderer">
      {/* Hero Section */}
      <div className="page-header">
        <div>
           <div className="hero-title">{data.title}</div>
           <div className="hero-desc">{data.description}</div>
        </div>
        {/* Toggle Edit Mode Button */}
        {isAdmin && (
          <div style={{ display: 'flex', gap: '10px' }}>
            {isEditMode && (
              <button 
                onClick={handleAddNew}
                style={{
                  padding: '12px 20px',
                  borderRadius: '30px',
                  background: 'rgba(231,0,18,0.1)',
                  border: '1px solid #E70012',
                  color: '#E70012',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                <Plus size={18} /> Add Block
              </button>
            )}
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: isEditMode ? '#E70012' : '#222',
                border: isEditMode ? 'none' : '1px solid #444',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title={isEditMode ? "Finish Editing" : "Edit Content"}
            >
              {isEditMode ? <Check size={24} /> : <Edit3 size={20} />}
            </button>
          </div>
        )}
      </div>

      {data.heroVideo ? (
        <div className="hero-image-container" style={{ marginBottom: '60px' }}>
            <div className="hero-overlay-gradient" />
            <div className="brand-slash-container">
              <div className="brand-slash-line" />
            </div>
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="hero-img-anim"
            >
              <source src={data.heroVideo} type="video/mp4" />
            </video>
        </div>
      ) : data.heroImage && (
        <div className="hero-image-container" style={{ marginBottom: '60px' }}>
            <div className="hero-overlay-gradient" />
            <div className="brand-slash-container">
               <div className="brand-slash-line" />
            </div>
            <img src={data.heroImage} alt="Hero" className="hero-img-anim" />
        </div>
      )}

      {/* FAQ Search - Only for FAQ page */}
      {data.id === ContentType.FAQ && (
        <div style={{ marginBottom: '40px' }}>
            {/* 
                수정 사항: 전체 콘텐츠(allContent)가 아닌 현재 섹션 데이터([data])만 전달하여
                FAQ 내에서만 검색되도록 범위 제한
            */}
            <FaqSearch onNavigate={onNavigate} content={[data]} />
        </div>
      )}

      {/* 
          Grid Layout (Content Cards)
          수정 사항: FAQ 페이지인 경우, 편집 모드(isEditMode)일 때만 Grid를 렌더링함.
          일반 보기 모드에서는 FaqSearch 컴포넌트가 아코디언 리스트를 보여주므로 중복 방지.
      */}
      {(data.id !== ContentType.FAQ || isEditMode) && (
        <div className="grid-layout">
          {data.subSections?.map((sub, idx) => (
            <div 
              key={sub.uuid || idx} 
              id={sub.slug} 
              className={`bento-card ${isEditMode ? 'editing' : ''}`}
              style={{
                position: 'relative',
                border: isEditMode ? '1px dashed #444' : undefined,
                cursor: isEditMode ? 'move' : 'default'
              }}
            >
              {isEditMode && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  display: 'flex',
                  gap: '8px',
                  zIndex: 10
                }}>
                  <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} style={{ padding: '6px', background: '#222', border: '1px solid #444', borderRadius: '4px', color: '#fff', cursor: 'pointer', opacity: idx === 0 ? 0.3 : 1 }}>
                    <ArrowUp size={14} />
                  </button>
                  <button onClick={() => handleMove(idx, 'down')} disabled={idx === (data.subSections?.length || 0) - 1} style={{ padding: '6px', background: '#222', border: '1px solid #444', borderRadius: '4px', color: '#fff', cursor: 'pointer', opacity: idx === (data.subSections?.length || 0) - 1 ? 0.3 : 1 }}>
                    <ArrowDown size={14} />
                  </button>
                  <button onClick={() => handleEditClick(sub)} style={{ padding: '6px', background: '#222', border: '1px solid #444', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDeleteClick(idx)} style={{ padding: '6px', background: 'rgba(231,0,18,0.2)', border: '1px solid #E70012', borderRadius: '4px', color: '#E70012', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              {/* Card Content */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', lineHeight: '1.4' }}>{sub.title}</h3>
                  {sub.link && (
                    <a 
                      href={sub.link} 
                      target="_blank" 
                      rel="noreferrer" 
                      onClick={() => handleContentOutboundClick(sub.title, sub.link!)}
                      style={{ color: '#E70012', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}
                    >
                       Link <ArrowRight size={14} />
                    </a>
                  )}
                </div>

                {/* Badges / Keywords */}
                {sub.keywords && sub.keywords.length > 0 && (
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {sub.keywords.slice(0, 4).map((k, i) => {
                          const style = getBadgeStyle(k);
                          return (
                            <span key={i} style={{ 
                                fontSize: '0.75rem', 
                                padding: '4px 8px', 
                                borderRadius: '4px',
                                background: style.bg,
                                color: style.color,
                                border: style.border,
                                fontWeight: 500
                            }}>
                                {k}
                            </span>
                          );
                      })}
                   </div>
                )}
              </div>

              {/* Main Text Content */}
              <div style={{ color: '#ccc', fontSize: '1rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
                {Array.isArray(sub.content) ? (
                   sub.content.map((line, i) => {
                     // Table rendering
                     if (line.trim().startsWith('|')) {
                        const rows = line.trim().split('\n');
                        return (
                          <div key={i} style={{ overflowX: 'auto', margin: '12px 0', border: '1px solid #333', borderRadius: '8px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                               <tbody>
                                 {rows.map((r, ri) => (
                                   <tr key={ri} style={{ background: ri === 0 ? '#222' : 'transparent', borderBottom: '1px solid #333' }}>
                                      {r.split('|').filter(c => c.trim()).map((cell, ci) => (
                                        <td key={ci} style={{ padding: '8px 12px', color: ri === 0 ? '#fff' : '#ccc', fontWeight: ri === 0 ? 700 : 400 }}>{cell.trim()}</td>
                                      ))}
                                   </tr>
                                 ))}
                               </tbody>
                            </table>
                          </div>
                        );
                     }
                     // Steps
                     if (/^\d+\./.test(line)) {
                        const num = line.match(/^\d+/)![0];
                        const text = line.replace(/^\d+\.\s*/, '');
                        return <StepBlock key={i} number={num}>{text}</StepBlock>;
                     }
                     // Bullets
                     if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                        return (
                          <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', paddingLeft: '8px' }}>
                             <span style={{ color: '#E70012', fontWeight: 'bold' }}>•</span>
                             <span>{line.replace(/^[-•]\s*/, '')}</span>
                          </div>
                        );
                     }
                     // Links in markdown format [text](url)
                     const linkMatch = line.match(/\[(.*?)\]\((.*?)\)/);
                     if (linkMatch) {
                        const [full, text, url] = linkMatch;
                        const parts = line.split(full);
                        return (
                           <div key={i} style={{ marginBottom: '8px' }}>
                              {parts[0]}
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noreferrer" 
                                style={{ color: '#E70012', textDecoration: 'underline', fontWeight: 600 }}
                                onClick={() => handleContentOutboundClick(text, url)}
                              >
                                {text}
                              </a>
                              {parts[1]}
                           </div>
                        );
                     }
                     return <div key={i} style={{ marginBottom: '8px' }}>{line}</div>;
                   })
                ) : (
                  <div>{sub.content}</div>
                )}
              </div>
              
              {/* Media */}
              {sub.imagePlaceholder && (
                <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '16px', border: '1px solid #333' }}>
                   <img src={sub.imagePlaceholder} alt="Content" style={{ width: '100%', height: 'auto', display: 'block' }} loading="lazy" />
                </div>
              )}

              {/* Code Block / Account Info */}
              {sub.codeBlock && (
                <div style={{ marginTop: '16px', background: '#111', padding: '16px', borderRadius: '8px', border: '1px solid #333', fontFamily: 'monospace', fontSize: '0.9rem', color: '#0f0', position: 'relative' }}>
                   <div style={{ whiteSpace: 'pre-wrap' }}>{sub.codeBlock}</div>
                   <button 
                     onClick={() => navigator.clipboard.writeText(sub.codeBlock!)}
                     style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer', color: '#fff' }}
                     title="Copy"
                   >
                     <Copy size={14} />
                   </button>
                </div>
              )}

              {/* Disclaimer */}
              {sub.disclaimer && (
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(231,0,18,0.05)', border: '1px solid rgba(231,0,18,0.2)', borderRadius: '8px', fontSize: '0.9rem', color: '#ffaaaa', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                   <Lightbulb size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                   <div style={{ whiteSpace: 'pre-wrap' }}>{sub.disclaimer}</div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <EditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
        onDirty={setIsDirty}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
};
