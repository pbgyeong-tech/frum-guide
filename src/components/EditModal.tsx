
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Save, AlertCircle, Hash, Plus, Trash2, 
  ChevronUp, ChevronDown, Heading3, AlignLeft, 
  List, Quote, Terminal, Image as ImageIcon, 
  Link as LinkIcon, AlertTriangle, GripVertical,
  Table as TableIcon, PlusCircle, MinusCircle,
  Minus
} from 'lucide-react';
import { SubSection } from '../types';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SubSection) => void;
  initialData?: SubSection;
  onDirty?: (dirty: boolean) => void;
}

type BlockType = 'heading' | 'paragraph' | 'list' | 'quote' | 'code' | 'media' | 'link' | 'disclaimer' | 'table' | 'divider';

interface EditorBlock {
  id: string;
  type: BlockType;
  value: string;
  value2?: string; 
}

const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper for alpha-numeric incrementing
const getNextAlpha = (char: string) => {
  const code = char.toLowerCase().charCodeAt(0);
  return (code >= 97 && code < 122) ? String.fromCharCode(code + 1) : 'a';
};

// Helper for roman numeral incrementing
const getNextRoman = (roman: string) => {
  const sequence = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
  const idx = sequence.indexOf(roman.toLowerCase());
  return (idx !== -1 && idx < sequence.length - 1) ? sequence[idx + 1] : 'i';
};

const parseTableMd = (md: string): string[][] => {
  const lines = md.trim().split('\n').filter(l => l.includes('|') && !l.includes('---'));
  if (lines.length === 0) return [['', ''], ['', '']];
  return lines.map(line => 
    line.split('|')
      .map(cell => cell.trim())
      .filter((_, i, arr) => (i > 0 && i < arr.length - 1) || arr.length === 1)
  );
};

const stringifyTableMd = (grid: string[][]): string => {
  if (grid.length === 0) return '';
  const header = `| ${grid[0].join(' | ')} |`;
  const divider = `| ${grid[0].map(() => '---').join(' | ')} |`;
  const body = grid.slice(1).map(row => `| ${row.join(' | ')} |`).join('\n');
  return `${header}\n${divider}\n${body}`;
};

export const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, initialData, onDirty }) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [blocks, setBlocks] = useState<EditorBlock[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setSlug(initialData.slug || '');
        
        const newBlocks: EditorBlock[] = [];
        const lines = Array.isArray(initialData.content) ? initialData.content : (initialData.content || '').split('\n');
        
        let i = 0;
        while (i < lines.length) {
          const line = lines[i];
          const trimmed = line.trim();

          if (trimmed.startsWith('### ')) {
            newBlocks.push({ id: generateId(), type: 'heading', value: trimmed.replace('### ', '') });
          } else if (trimmed.startsWith('> ')) {
            newBlocks.push({ id: generateId(), type: 'quote', value: trimmed.replace(/^>\s?/, '') });
          } else if (/^-{3,}$/.test(trimmed)) {
            newBlocks.push({ id: generateId(), type: 'divider', value: '---' });
          } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || /^\d+\.\s/.test(trimmed)) {
            let listItems = [line];
            let j = i + 1;
            while (j < lines.length && (/^\s*([-•]|\d+\.)\s/.test(lines[j]) || lines[j].trim() === '')) {
              listItems.push(lines[j]);
              j++;
            }
            newBlocks.push({ id: generateId(), type: 'list', value: listItems.join('\n') });
            i = j - 1;
          } else if (trimmed.startsWith('|')) {
            const tableLines = [];
            while (i < lines.length && lines[i].trim().startsWith('|')) {
              tableLines.push(lines[i]);
              i++;
            }
            newBlocks.push({ id: generateId(), type: 'table', value: tableLines.join('\n') });
            continue;
          } else if (trimmed.startsWith('```')) {
            const codeLines = []; i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
              codeLines.push(lines[i]);
              i++;
            }
            newBlocks.push({ id: generateId(), type: 'code', value: codeLines.join('\n') });
          } else if (trimmed !== '') {
            newBlocks.push({ id: generateId(), type: 'paragraph', value: trimmed });
          }
          i++;
        }

        if (initialData.imagePlaceholder) newBlocks.push({ id: generateId(), type: 'media', value: initialData.imagePlaceholder });
        if (initialData.link) newBlocks.push({ id: generateId(), type: 'link', value: initialData.link, value2: '관련 링크' });
        if (initialData.disclaimer) newBlocks.push({ id: generateId(), type: 'disclaimer', value: initialData.disclaimer });

        setBlocks(newBlocks.length > 0 ? newBlocks : [{ id: generateId(), type: 'paragraph', value: '' }]);
      } else {
        setTitle('');
        setSlug('');
        setBlocks([{ id: generateId(), type: 'paragraph', value: '' }]);
      }
      setLoaded(true);
      onDirty?.(false);
    } else {
      setLoaded(false);
    }
  }, [isOpen, initialData]);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    if (loaded && onDirty) onDirty(true);
  };

  const addBlock = (type: BlockType) => {
    let value = '';
    if (type === 'table') value = stringifyTableMd([['구분', '내용'], ['', '']]);
    if (type === 'divider') value = '---';
    
    const newBlock: EditorBlock = { id: generateId(), type, value };
    if (type === 'link') newBlock.value2 = '';
    
    setBlocks([...blocks, newBlock]);
    if (onDirty) onDirty(true);
  };

  const updateBlock = (id: string, value: string, value2?: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, value, value2 } : b));
    if (onDirty) onDirty(true);
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) return;
    setBlocks(blocks.filter(b => b.id !== id));
    if (onDirty) onDirty(true);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
    if (onDirty) onDirty(true);
  };

  const handleSmartTyping = (e: React.KeyboardEvent<HTMLTextAreaElement>, blockId: string) => {
    const textarea = e.currentTarget;
    const { selectionStart, value } = textarea;
    const lines = value.split('\n');
    const contentBeforeCursor = value.substring(0, selectionStart);
    const currentLineIndex = contentBeforeCursor.split('\n').length - 1;
    const currentLine = lines[currentLineIndex];

    const numMatch = currentLine.match(/^(\s*)(\d+)\.\s(.*)/);
    const alphaMatch = currentLine.match(/^(\s*)([a-z])\.\s(.*)/);
    const romanMatch = currentLine.match(/^(\s*)([ivx]+)\.\s(.*)/);
    const bulletMatch = currentLine.match(/^(\s*)([-•*])\s(.*)/);

    // 1. Enter Key: List continuation or Exit
    if (e.key === 'Enter') {
      const match = numMatch || alphaMatch || romanMatch || bulletMatch;
      if (match) {
        const [full, indent, marker, content] = match;
        
        // Exit behavior: if current item is empty, delete marker and exit list
        if (!content.trim()) {
          e.preventDefault();
          lines[currentLineIndex] = '';
          const newValue = lines.join('\n');
          updateBlock(blockId, newValue);
          setTimeout(() => {
            const beforeLines = lines.slice(0, currentLineIndex);
            const newPos = beforeLines.join('\n').length + (beforeLines.length > 0 ? 1 : 0);
            textarea.setSelectionRange(newPos, newPos);
          }, 0);
          return;
        }

        // Continuation: generate ONLY the next item
        e.preventDefault();
        let nextMarker = '';
        if (numMatch) nextMarker = `${indent}${parseInt(marker) + 1}. `;
        else if (alphaMatch) nextMarker = `${indent}${getNextAlpha(marker)}. `;
        else if (romanMatch) nextMarker = `${indent}${getNextRoman(marker)}. `;
        else if (bulletMatch) nextMarker = `${indent}${marker} `;

        const before = value.substring(0, selectionStart);
        const after = value.substring(selectionStart);
        const newValue = before + '\n' + nextMarker + after;
        
        updateBlock(blockId, newValue);
        setTimeout(() => {
          const newPos = before.length + 1 + nextMarker.length;
          textarea.setSelectionRange(newPos, newPos);
        }, 0);
      }
    }

    // 2. Tab Key: Multi-level progressive nesting (1. -> a. -> i.)
    if (e.key === 'Tab') {
      const match = numMatch || alphaMatch || romanMatch || bulletMatch;
      if (match) {
        e.preventDefault();
        const [full, indent, marker, content] = match;
        let newLine = currentLine;
        const indentStep = "  ";

        if (e.shiftKey) { // Dedent
          if (indent.length >= indentStep.length) {
            const newIndent = indent.substring(indentStep.length);
            // Reverse cycling: Roman -> Alpha -> Numeric
            if (romanMatch) newLine = `${newIndent}a. ${content}`;
            else if (alphaMatch) newLine = `${newIndent}1. ${content}`;
            else if (numMatch) newLine = `${newIndent}1. ${content}`; // Stay numeric at top
            else newLine = `${newIndent}${marker} ${content}`;
          }
        } else { // Indent
          const newIndent = indent + indentStep;
          // Forward cycling: Numeric -> Alpha -> Roman
          if (numMatch) newLine = `${newIndent}a. ${content}`;
          else if (alphaMatch) newLine = `${newIndent}i. ${content}`;
          else if (romanMatch) newLine = `${newIndent}i. ${content}`; // Stay roman at deep level
          else newLine = `${newIndent}${marker} ${content}`;
        }

        lines[currentLineIndex] = newLine;
        const newValue = lines.join('\n');
        updateBlock(blockId, newValue);

        // Keep block as 'list' if it has markers
        const isList = /^(\s*)([-•*]|\d+\.|[a-z]\.|[ivx]+\.)\s/.test(newLine);
        if (isList) {
          setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, type: 'list' } : b));
        }

        setTimeout(() => {
          const beforeLines = lines.slice(0, currentLineIndex);
          const newPos = beforeLines.join('\n').length + (beforeLines.length > 0 ? 1 : 0) + newLine.length;
          textarea.setSelectionRange(newPos, newPos);
        }, 0);
      }
    }
  };

  const handleTextareaChange = (blockId: string, newValue: string) => {
    const lines = newValue.split('\n');
    const firstLine = lines[0].trim();
    // Support more markers for auto-conversion
    const isList = /^([-•*]|\d+\.|[a-z]\.|[ivx]+\.)\s/.test(firstLine);
    
    setBlocks(prev => prev.map(b => {
      if (b.id === blockId) {
        const newType = (b.type === 'paragraph' && isList) ? 'list' : b.type;
        return { ...b, value: newValue, type: newType };
      }
      return b;
    }));
    if (onDirty) onDirty(true);
  };

  const handleSave = () => {
    const contentLines: string[] = [];
    let imagePlaceholder = '';
    let link = '';
    let disclaimer = '';

    blocks.forEach(block => {
      if (!block.value.trim() && block.type !== 'media' && block.type !== 'divider') return;

      switch (block.type) {
        case 'heading': contentLines.push(`### ${block.value}`); break;
        case 'paragraph': contentLines.push(block.value); break;
        case 'list': contentLines.push(block.value); break;
        case 'quote': contentLines.push(`> ${block.value}`); break;
        case 'code': contentLines.push('```\n' + block.value + '\n```'); break;
        case 'table': contentLines.push(block.value); break;
        case 'divider': contentLines.push('---'); break;
        case 'media': imagePlaceholder = block.value; break;
        case 'link': link = block.value; break;
        case 'disclaimer': disclaimer = block.value; break;
      }
    });

    onSave({
      uuid: initialData?.uuid || generateId(),
      slug: slug.trim() || undefined,
      title,
      content: contentLines,
      imagePlaceholder: imagePlaceholder.trim() || undefined,
      link: link.trim() || undefined,
      disclaimer: disclaimer.trim() || undefined,
      keywords: title.split(' ')
    });
    
    onDirty?.(false);
    onClose();
  };

  const updateTableCell = (blockId: string, rowIndex: number, colIndex: number, newValue: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    const grid = parseTableMd(block.value);
    grid[rowIndex][colIndex] = newValue;
    updateBlock(blockId, stringifyTableMd(grid));
  };

  const addTableRow = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    const grid = parseTableMd(block.value);
    grid.push(new Array(grid[0].length).fill(''));
    updateBlock(blockId, stringifyTableMd(grid));
  };

  const removeTableRow = (blockId: string, rowIndex: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || rowIndex === 0) return;
    const grid = parseTableMd(block.value);
    if (grid.length <= 2) return;
    grid.splice(rowIndex, 1);
    updateBlock(blockId, stringifyTableMd(grid));
  };

  const addTableCol = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    const grid = parseTableMd(block.value);
    grid.forEach(row => row.push(''));
    updateBlock(blockId, stringifyTableMd(grid));
  };

  const removeTableCol = (blockId: string, colIndex: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    const grid = parseTableMd(block.value);
    if (grid[0].length <= 1) return;
    grid.forEach(row => row.splice(colIndex, 1));
    updateBlock(blockId, stringifyTableMd(grid));
  };

  if (!isOpen) return null;
  const isValid = title.trim().length > 0 && slug.trim().length > 0;

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={() => { onDirty?.(false); onClose(); }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }} />
      <div className="animate-enter" style={{ position: 'relative', background: '#121212', border: '1px solid #333', borderRadius: '16px', width: '100%', maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>{initialData ? '콘텐츠 블록 수정' : '새 콘텐츠 블록 추가'}</h3>
          <button onClick={() => { onDirty?.(false); onClose(); }} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        {/* Scrollable Content Area */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Metadata Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#888', marginBottom: '4px', fontSize: '0.85rem' }}>제목</label>
              <input type="text" value={title} onChange={(e) => handleInputChange(setTitle, e.target.value)} onBlur={() => { if (!slug.trim() && title.trim()) handleInputChange(setSlug, title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); }} placeholder="섹션 제목 입력" style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E70012', marginBottom: '4px', fontSize: '0.85rem' }}><Hash size={14} /> URL 슬러그 (영문/숫자)</label>
              <input type="text" value={slug} onChange={(e) => handleInputChange(setSlug, e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="e.g. it-setup" style={{ width: '100%', padding: '12px', background: 'rgba(231,0,18,0.05)', border: '1px solid #E70012', borderRadius: '8px', color: '#fff', outline: 'none', fontFamily: 'monospace' }} />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #222' }} />

          {/* Block Editor Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {blocks.map((block, index) => (
              <div key={block.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px' }}>
                  <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} style={{ color: index === 0 ? '#222' : '#555', background: 'none', border: 'none', cursor: index === 0 ? 'default' : 'pointer' }}><ChevronUp size={16}/></button>
                  <button onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1} style={{ color: index === blocks.length - 1 ? '#222' : '#555', background: 'none', border: 'none', cursor: index === blocks.length - 1 ? 'default' : 'pointer' }}><ChevronDown size={16}/></button>
                </div>

                <div style={{ flex: 1, background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '16px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      {block.type === 'heading' && <><Heading3 size={14}/> 소제목</>}
                      {block.type === 'paragraph' && <><AlignLeft size={14}/> 본문 내용</>}
                      {block.type === 'list' && <><List size={14}/> 글머리 목록</>}
                      {block.type === 'quote' && <><Quote size={14}/> 인용구</>}
                      {block.type === 'code' && <><Terminal size={14}/> 코드 박스</>}
                      {block.type === 'table' && <><TableIcon size={14}/> 표 (데이터 그리드)</>}
                      {block.type === 'divider' && <><Minus size={14}/> 구분선</>}
                      {block.type === 'media' && <><ImageIcon size={14} color="#E70012"/> 이미지 URL</>}
                      {block.type === 'link' && <><LinkIcon size={14} color="#E70012"/> 외부 링크</>}
                      {block.type === 'disclaimer' && <><AlertTriangle size={14} color="#ffaa00"/> 주의사항</>}
                    </div>
                    <button onClick={() => removeBlock(block.id)} style={{ color: '#444', background: 'none', border: 'none', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = '#ff5555'} onMouseLeave={e => e.currentTarget.style.color = '#444'}><Trash2 size={16}/></button>
                  </div>

                  {/* Dynamic Inputs based on Block Type */}
                  {block.type === 'heading' && (
                    <input type="text" value={block.value} onChange={e => updateBlock(block.id, e.target.value)} placeholder="소제목 내용을 입력하세요..." style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #333', color: '#fff', fontSize: '1.1rem', fontWeight: 700, outline: 'none', padding: '4px 0' }} />
                  )}
                  {block.type === 'table' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ overflowX: 'auto', maxWidth: '100%', paddingBottom: '8px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                          <thead>
                            <tr>
                              {parseTableMd(block.value)[0].map((cell, colIdx) => (
                                <th key={colIdx} style={{ padding: '4px' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <input type="text" value={cell} onChange={e => updateTableCell(block.id, 0, colIdx, e.target.value)} placeholder="헤더" style={{ width: '100%', background: '#222', border: '1px solid #444', color: '#fff', padding: '6px', fontSize: '0.8rem', borderRadius: '4px', textAlign: 'center' }} />
                                    <button onClick={() => removeTableCol(block.id, colIdx)} style={{ color: '#555', fontSize: '0.6rem', background: 'none', border: 'none', cursor: 'pointer' }}>삭제</button>
                                  </div>
                                </th>
                              ))}
                              <th style={{ width: '40px' }}><button onClick={() => addTableCol(block.id)} style={{ color: '#E70012', background: 'none', border: 'none', cursor: 'pointer' }}><PlusCircle size={16}/></button></th>
                            </tr>
                          </thead>
                          <tbody>
                            {parseTableMd(block.value).slice(1).map((row, rowIdx) => (
                              <tr key={rowIdx}>
                                {row.map((cell, colIdx) => (
                                  <td key={colIdx} style={{ padding: '4px' }}>
                                    <input type="text" value={cell} onChange={e => updateTableCell(block.id, rowIdx + 1, colIdx, e.target.value)} style={{ width: '100%', background: 'transparent', border: '1px solid #222', color: '#ccc', padding: '6px', fontSize: '0.85rem', borderRadius: '4px' }} />
                                  </td>
                                ))}
                                <td><button onClick={() => removeTableRow(block.id, rowIdx + 1)} style={{ color: '#444', background: 'none', border: 'none', cursor: 'pointer' }}><MinusCircle size={14}/></button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <button onClick={() => addTableRow(block.id)} style={{ alignSelf: 'flex-start', color: '#888', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>+ 행 추가</button>
                    </div>
                  )}
                  {block.type === 'divider' && (
                    <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, height: '1px', background: '#333' }} />
                      <span style={{ fontSize: '0.7rem', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>구분선</span>
                      <div style={{ flex: 1, height: '1px', background: '#333' }} />
                    </div>
                  )}
                  {(block.type === 'paragraph' || block.type === 'code' || block.type === 'quote' || block.type === 'list' || block.type === 'disclaimer') && (
                    <textarea 
                      value={block.value} 
                      onChange={e => handleTextareaChange(block.id, e.target.value)}
                      onKeyDown={e => handleSmartTyping(e, block.id)}
                      rows={block.type === 'paragraph' ? 3 : 2} 
                      placeholder={block.type === 'code' ? '코드를 입력하세요...' : block.type === 'list' ? '1. 첫 번째 항목\n2. 두 번째 항목' : '내용을 입력하세요...'} 
                      style={{ 
                        width: '100%', 
                        background: block.type === 'disclaimer' ? 'rgba(255,100,100,0.05)' : 'transparent', 
                        border: block.type === 'disclaimer' ? '1px dashed rgba(255,100,100,0.2)' : 'none', 
                        color: block.type === 'disclaimer' ? '#ffaaaa' : '#ccc', 
                        fontSize: '0.95rem', 
                        outline: 'none', 
                        resize: 'vertical', 
                        fontFamily: block.type === 'code' ? 'monospace' : 'inherit',
                        padding: block.type === 'disclaimer' ? '12px' : '0',
                        borderRadius: block.type === 'disclaimer' ? '8px' : '0'
                      }} 
                    />
                  )}
                  {block.type === 'media' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input type="text" value={block.value} onChange={e => updateBlock(block.id, e.target.value)} placeholder="이미지 또는 비디오 URL 입력" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', borderRadius: '6px', color: '#fff', padding: '8px 12px', fontSize: '0.85rem', outline: 'none' }} />
                      {block.value && <img src={block.value} style={{ maxWidth: '100px', borderRadius: '4px', opacity: 0.5 }} alt="Preview" onError={e => e.currentTarget.style.display = 'none'} />}
                    </div>
                  )}
                  {block.type === 'link' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input type="text" value={block.value2} onChange={e => updateBlock(block.id, block.value, e.target.value)} placeholder="링크 제목 (예: 가이드 문서)" style={{ padding: '8px 12px', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                      <input type="text" value={block.value} onChange={e => updateBlock(block.id, e.target.value, block.value2)} placeholder="URL 주소 (https://...)" style={{ padding: '8px 12px', background: '#111', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Block Toolset */}
          <div style={{ border: '2px dashed #222', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '16px' }}>추가하고 싶은 요소를 선택하세요</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
              <AddBlockBtn icon={Heading3} label="소제목" onClick={() => addBlock('heading')} />
              <AddBlockBtn icon={AlignLeft} label="본문" onClick={() => addBlock('paragraph')} />
              <AddBlockBtn icon={List} label="목록" onClick={() => addBlock('list')} />
              <AddBlockBtn icon={Quote} label="인용" onClick={() => addBlock('quote')} />
              <AddBlockBtn icon={Terminal} label="코드" onClick={() => addBlock('code')} />
              <AddBlockBtn icon={TableIcon} label="표" onClick={() => addBlock('table')} />
              <AddBlockBtn icon={Minus} label="구분선" onClick={() => addBlock('divider')} />
              <div style={{ width: '1px', height: '24px', background: '#333', margin: '0 8px' }} />
              <AddBlockBtn icon={ImageIcon} label="이미지" onClick={() => addBlock('media')} color="#E70012" />
              <AddBlockBtn icon={LinkIcon} label="링크" onClick={() => addBlock('link')} color="#E70012" />
              <AddBlockBtn icon={AlertTriangle} label="주의사항" onClick={() => addBlock('disclaimer')} color="#ffaa00" />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#0a0a0a', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
          <button onClick={() => { onDirty?.(false); onClose(); }} style={{ padding: '10px 20px', borderRadius: '8px', color: '#ccc', background: 'none', border: 'none', cursor: 'pointer' }}>취소</button>
          <button onClick={handleSave} disabled={!isValid} style={{ padding: '10px 24px', borderRadius: '8px', background: isValid ? '#E70012' : '#333', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: isValid ? 'pointer' : 'not-allowed', boxShadow: isValid ? '0 4px 15px rgba(231,0,18,0.3)' : 'none' }}><Save size={18} /> 저장하기</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const AddBlockBtn = ({ icon: Icon, label, onClick, color = '#aaa' }: { icon: any, label: string, onClick: () => void, color?: string }) => (
  <button onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '10px', minWidth: '70px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = color; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}>
    <Icon size={18} color={color} />
    <span style={{ fontSize: '0.7rem', color: '#888' }}>{label}</span>
  </button>
);
