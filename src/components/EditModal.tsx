
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Hash, Plus, Trash2, 
  ChevronUp, ChevronDown, Heading3, AlignLeft, 
  List, Quote, Terminal, Image as ImageIcon, 
  Link as LinkIcon, AlertTriangle, 
  Table as TableIcon, Minus, Calendar, Trophy, Layers,
  PlusCircle, MinusCircle, Users, Crown, Check, Grid
} from 'lucide-react';
import { SubSection, ArchiveData, ArchiveEntry, EditorBlock, BlockType, ContentType, SectionData, GroupMember, Group } from '../types';
import { generateUUID } from '../utils/db';
import { HANDBOOK_CONTENT } from '../constants';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SubSection) => void;
  initialData?: SubSection;
  onDirty?: (dirty: boolean) => void;
}

const ARCHIVE_SLUGS = ['aicontest', 'frum-dining', 'coffee-chat'];

const BLOCK_TYPES: { type: BlockType; label: string; icon: any }[] = [
  { type: 'paragraph', label: '본문(MD)', icon: AlignLeft },
  { type: 'heading', label: '소제목', icon: Heading3 },
  { type: 'list', label: '목록', icon: List },
  { type: 'quote', label: '인용구', icon: Quote },
  { type: 'code', label: '코드', icon: Terminal },
  { type: 'table', label: '표', icon: TableIcon },
  { type: 'divider', label: '구분선', icon: Minus },
  { type: 'media', label: '이미지', icon: ImageIcon },
  { type: 'link', label: '링크', icon: LinkIcon },
  { type: 'disclaimer', label: '주의사항', icon: AlertTriangle },
];

const ROMAN_LIST = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];

const extractEmployees = (): { name: string; role: string }[] => {
  const companySection = HANDBOOK_CONTENT.find(s => s.id === ContentType.COMPANY);
  if (!companySection) return [];
  
  const memberSub = companySection.subSections.find(sub => sub.title.includes('구성원'));
  if (!memberSub || typeof memberSub.content !== 'string') return [];

  const lines = memberSub.content.split('\n');
  const employees: { name: string; role: string }[] = [];

  lines.forEach(line => {
    if (line.includes('|') && !line.includes('사업부') && !line.includes('---')) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
      if (cells.length >= 3) {
        employees.push({ name: cells[1], role: cells[2] });
      }
    }
  });

  return employees.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
};

const TableEditor: React.FC<{ value: string, onChange: (val: string) => void }> = ({ value, onChange }) => {
  const parseTable = useCallback((md: string) => {
    const lines = md.trim().split('\n').filter(l => l.trim() !== '' && !/^[\s\|\-:]+$/.test(l));
    if (lines.length === 0) return [['', ''], ['', '']];
    return lines.map(line => {
      const cells = line.split('|').map(c => c.trim());
      return cells.filter((_, i) => i > 0 && i < cells.length - 1);
    });
  }, []);

  const [grid, setGrid] = useState<string[][]>(parseTable(value));

  const serialize = (data: string[][]) => {
    if (data.length === 0) return '';
    const header = `| ${data[0].join(' | ')} |`;
    const separator = `| ${data[0].map(() => '---').join(' | ')} |`;
    const body = data.slice(1).map(r => `| ${r.join(' | ')} |`).join('\n');
    return `${header}\n${separator}\n${body}`;
  };

  const updateCell = (r: number, c: number, val: string) => {
    const newGrid = grid.map((row, ri) => ri === r ? row.map((cell, ci) => ci === c ? val : cell) : row);
    setGrid(newGrid);
    onChange(serialize(newGrid));
  };

  const addRow = () => {
    const newRow = new Array(grid[0]?.length || 1).fill('');
    const newGrid = [...grid, newRow];
    setGrid(newGrid);
    onChange(serialize(newGrid));
  };

  const removeRow = (idx: number) => {
    if (grid.length <= 1) return;
    const newGrid = grid.filter((_, i) => i !== idx);
    setGrid(newGrid);
    onChange(serialize(newGrid));
  };

  const addCol = () => {
    const newGrid = grid.map(r => [...r, '']);
    setGrid(newGrid);
    onChange(serialize(newGrid));
  };

  const removeCol = (idx: number) => {
    if (grid[0]?.length <= 1) return;
    const newGrid = grid.map(r => r.filter((_, i) => i !== idx));
    setGrid(newGrid);
    onChange(serialize(newGrid));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ overflowX: 'auto', background: '#0d0d0d', borderRadius: '8px', border: '1px solid #222' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '400px' }}>
          <thead>
            <tr style={{ background: '#1a1a1a' }}>
              <th style={{ width: '30px' }}></th>
              {grid[0]?.map((_, ci) => (
                <th key={ci} style={{ padding: '8px' }}>
                  <button onClick={() => removeCol(ci)} title="열 삭제" style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}><MinusCircle size={14}/></button>
                </th>
              ))}
              <th style={{ width: '40px' }}><button onClick={addCol} title="열 추가" style={{ color: '#E70012', background: 'none', border: 'none', cursor: 'pointer' }}><PlusCircle size={18}/></button></th>
            </tr>
          </thead>
          <tbody>
            {grid.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ textAlign: 'center' }}>
                  <button onClick={() => removeRow(ri)} title="행 삭제" style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}><MinusCircle size={14}/></button>
                </td>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: '4px' }}>
                    <input 
                      type="text" 
                      value={cell} 
                      onChange={e => updateCell(ri, ci, e.target.value)} 
                      style={{ 
                        width: '100%', 
                        background: ri === 0 ? 'rgba(231,0,18,0.05)' : 'transparent', 
                        border: 'none', 
                        color: ri === 0 ? '#fff' : '#ccc', 
                        padding: '8px', 
                        fontSize: '0.85rem',
                        fontWeight: ri === 0 ? 700 : 400,
                        outline: 'none'
                      }} 
                    />
                  </td>
                ))}
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={addRow} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#E70012', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
        <PlusCircle size={16} /> 행 추가하기
      </button>
    </div>
  );
};

export const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, initialData, onDirty }) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [blocks, setBlocks] = useState<EditorBlock[]>([]);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [archiveData, setArchiveData] = useState<ArchiveData>({});
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear());
  const [activeMonth, setActiveMonth] = useState<number>(new Date().getMonth() + 1);

  const employees = useMemo(() => extractEmployees(), []);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setSlug(initialData.slug || '');
        
        if (initialData.codeBlock && ARCHIVE_SLUGS.includes(initialData.slug || '')) {
          try {
            setArchiveData(JSON.parse(initialData.codeBlock));
          } catch (e) {
            setArchiveData({});
          }
        } else {
          setArchiveData({});
        }

        if (initialData.blocks && initialData.blocks.length > 0) {
          setBlocks(initialData.blocks);
        } else {
          const newBlocks: EditorBlock[] = [];
          const lines = Array.isArray(initialData.content) ? initialData.content : (initialData.content || '').split('\n');
          
          let i = 0;
          const hrRegex = /^\s*-{3,}\s*$/;
          const listRegex = /^(\s*([-•*]|\d+\.|[a-zA-Z]\.|[ivxIVX]+\.))\s+/;

          while (i < lines.length) {
            const rawLine = lines[i];
            const trimmed = rawLine.trim();

            if (trimmed.startsWith('### ')) {
              newBlocks.push({ id: generateUUID(), type: 'heading', value: trimmed.replace('### ', '') });
            } else if (trimmed.startsWith('> ')) {
              let quoteItems = [trimmed.replace(/^>\s?/, '')];
              let j = i + 1;
              while (j < lines.length && lines[j].trim().startsWith('> ')) {
                quoteItems.push(lines[j].trim().replace(/^>\s?/, ''));
                j++;
              }
              newBlocks.push({ id: generateUUID(), type: 'quote', value: quoteItems.join('\n') });
              i = j - 1;
            } else if (hrRegex.test(trimmed)) {
              newBlocks.push({ id: generateUUID(), type: 'divider', value: '---' });
            } else if (listRegex.test(rawLine)) {
              let listItems = [rawLine];
              let j = i + 1;
              while (j < lines.length) {
                const nextLine = lines[j];
                const nextTrimmed = nextLine.trim();
                if (nextTrimmed === '' || nextTrimmed.startsWith('### ') || nextTrimmed.startsWith('```') || nextTrimmed.startsWith('|') || nextTrimmed.startsWith('> ')) break;
                if (listRegex.test(nextLine) || /^\s+/.test(nextLine)) {
                    listItems.push(nextLine);
                    j++;
                } else {
                    break;
                }
              }
              newBlocks.push({ id: generateUUID(), type: 'list', value: listItems.join('\n') });
              i = j - 1;
            } else if (trimmed.startsWith('|')) {
              const tableLines = [];
              while (i < lines.length && lines[i].trim().startsWith('|')) {
                tableLines.push(lines[i]);
                i++;
              }
              newBlocks.push({ id: generateUUID(), type: 'table', value: tableLines.join('\n') });
              continue;
            } else if (trimmed.startsWith('```')) {
              const codeLines = []; i++;
              while (i < lines.length && !lines[i].trim().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
              }
              newBlocks.push({ id: generateUUID(), type: 'code', value: codeLines.join('\n') });
            } else if (trimmed.match(/^\[(.*?)\]\((.*?)\)$/)) {
              const linkMatch = trimmed.match(/^\[(.*?)\]\((.*?)\)$/);
              if (linkMatch) newBlocks.push({ id: generateUUID(), type: 'link', value: linkMatch[2], value2: linkMatch[1] });
            } else if (trimmed !== '') {
              let pLines = [trimmed];
              let j = i + 1;
              while (j < lines.length) {
                const nextRawLine = lines[j];
                const nextLine = nextRawLine.trim();
                if (nextLine === '' || nextLine.startsWith('### ') || nextLine.startsWith('>') || listRegex.test(nextRawLine) || nextLine.startsWith('|') || nextLine.startsWith('```') || hrRegex.test(nextLine)) break;
                pLines.push(nextLine);
                j++;
              }
              newBlocks.push({ id: generateUUID(), type: 'paragraph', value: pLines.join('\n') });
              i = j - 1;
            }
            i++;
          }

          if (initialData.imagePlaceholder) newBlocks.push({ id: generateUUID(), type: 'media', value: initialData.imagePlaceholder });
          if (initialData.disclaimer) newBlocks.push({ id: generateUUID(), type: 'disclaimer', value: initialData.disclaimer });

          setBlocks(newBlocks.length > 0 ? newBlocks : [{ id: generateUUID(), type: 'paragraph', value: '' }]);
        }
      } else {
        setTitle('');
        setSlug('');
        setBlocks([{ id: generateUUID(), type: 'paragraph', value: '' }]);
        setArchiveData({});
      }
      onDirty?.(false);
    } else {
      setShowTypeSelector(false);
    }
  }, [isOpen, initialData]);

  const isArchive = ARCHIVE_SLUGS.includes(slug);
  const isGroupBased = ['frum-dining', 'coffee-chat'].includes(slug);

  const updateArchiveEntry = (field: keyof ArchiveEntry, value: any) => {
    setArchiveData(prev => {
      const yearData = prev[activeYear] || {};
      const monthData = yearData[activeMonth] || { title: '' };
      return { ...prev, [activeYear]: { ...yearData, [activeMonth]: { ...monthData, [field]: value } } };
    });
    if (onDirty) onDirty(true);
  };

  const addGroup = () => {
    const entry = archiveData[activeYear]?.[activeMonth] || { title: '', groups: [] };
    const groups = entry.groups || [];
    const nextLabel = String.fromCharCode(65 + groups.length); // A, B, C...
    const newGroups = [...groups, { id: generateUUID(), name: `${nextLabel}조`, members: [] }];
    updateArchiveEntry('groups', newGroups);
  };

  const removeGroup = (groupId: string) => {
    const entry = archiveData[activeYear]?.[activeMonth];
    if (!entry || !entry.groups) return;
    const newGroups = entry.groups.filter(g => g.id !== groupId);
    updateArchiveEntry('groups', newGroups);
  };

  const updateGroupName = (groupId: string, name: string) => {
    const entry = archiveData[activeYear]?.[activeMonth];
    if (!entry || !entry.groups) return;
    const newGroups = entry.groups.map(g => g.id === groupId ? { ...g, name } : g);
    updateArchiveEntry('groups', newGroups);
  };

  const toggleGroupMember = (groupId: string, emp: { name: string; role: string }) => {
    const entry = archiveData[activeYear]?.[activeMonth];
    if (!entry || !entry.groups) return;
    
    const newGroups = entry.groups.map(g => {
      if (g.id !== groupId) return g;
      const isAlreadyMember = g.members.some(m => m.name === emp.name);
      return {
        ...g,
        members: isAlreadyMember 
          ? g.members.filter(m => m.name !== emp.name)
          : [...g.members, { name: emp.name, role: emp.role, isLeader: false }]
      };
    });
    updateArchiveEntry('groups', newGroups);
  };

  const toggleLeader = (groupId: string, name: string) => {
    const entry = archiveData[activeYear]?.[activeMonth];
    if (!entry || !entry.groups) return;
    
    const newGroups = entry.groups.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        members: g.members.map(m => m.name === name ? { ...m, isLeader: !m.isLeader } : m)
      };
    });
    updateArchiveEntry('groups', newGroups);
  };

  const addBlock = (type: BlockType) => {
    let defaultValue = '';
    if (type === 'table') defaultValue = '| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |';
    setBlocks([...blocks, { id: generateUUID(), type, value: defaultValue, value2: type === 'link' ? '' : undefined }]);
    setShowTypeSelector(false);
    if (onDirty) onDirty(true);
  };

  const getListInfo = (line: string) => {
    const numericMatch = line.match(/^(\s*)(\d+)\.\s(.*)$/);
    if (numericMatch) return { indent: numericMatch[1], marker: numericMatch[2], content: numericMatch[3], type: 'numeric' as const };
    const alphaMatch = line.match(/^(\s*)([a-z])\.\s(.*)$/);
    if (alphaMatch) return { indent: alphaMatch[1], marker: alphaMatch[2], content: alphaMatch[3], type: 'alpha' as const };
    const romanMatch = line.match(/^(\s*)(i|ii|iii|iv|v|vi|vii|viii|ix|x)\.\s(.*)$/);
    if (romanMatch) return { indent: romanMatch[1], marker: romanMatch[2], content: romanMatch[3], type: 'roman' as const };
    return null;
  };

  const getNextMarker = (marker: string, type: 'numeric' | 'alpha' | 'roman') => {
    if (type === 'numeric') return (parseInt(marker) + 1) + '.';
    if (type === 'alpha') return String.fromCharCode(marker.charCodeAt(0) + 1) + '.';
    if (type === 'roman') {
        const idx = ROMAN_LIST.indexOf(marker);
        return (idx !== -1 && idx < ROMAN_LIST.length - 1) ? ROMAN_LIST[idx + 1] + '.' : 'i.';
    }
    return "";
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, blockId: string) => {
    const textarea = e.currentTarget;
    const { selectionStart: start, selectionEnd: end, value } = textarea;
    if (e.key === 'Enter' && !e.shiftKey && start === end) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const currentLine = value.substring(lineStart, start);
      const listInfo = getListInfo(currentLine);
      if (listInfo) {
        e.preventDefault();
        if (listInfo.content.trim() === "") {
          const newValue = value.substring(0, lineStart) + "\n" + value.substring(start);
          setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, value: newValue } : b));
          setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = lineStart + 1; }, 0);
        } else {
          const nextMarker = getNextMarker(listInfo.marker, listInfo.type);
          const insertion = `\n${listInfo.indent}${nextMarker} `;
          const newValue = value.substring(0, start) + insertion + value.substring(start);
          setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, value: newValue } : b));
          setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start + insertion.length; }, 0);
        }
        if (onDirty) onDirty(true);
        return;
      }
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const currentLine = value.substring(lineStart, start);
      const listInfo = getListInfo(currentLine);
      const isShift = e.shiftKey;
      if (listInfo) {
        let newIndent = listInfo.indent;
        let newMarker = listInfo.marker;
        if (isShift) {
          if (newIndent.length >= 2) {
            newIndent = newIndent.substring(2);
            if (newIndent.length === 0) newMarker = "1.";
            else if (newIndent.length === 2) newMarker = "a.";
          } else return;
        } else {
          newIndent += "  ";
          if (newIndent.length === 2) newMarker = "a.";
          else if (newIndent.length === 4) newMarker = "i.";
        }
        const newValue = value.substring(0, lineStart) + newIndent + newMarker + " " + listInfo.content + value.substring(start + currentLine.length - listInfo.indent.length - listInfo.marker.length - 1);
        setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, value: newValue } : b));
        const newPos = lineStart + newIndent.length + newMarker.length + 1 + listInfo.content.length;
        setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = newPos; }, 0);
      } else {
        const insertion = isShift ? "" : "  ";
        const newValue = value.substring(0, start) + insertion + value.substring(end);
        setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, value: newValue } : b));
        setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start + insertion.length; }, 0);
      }
      if (onDirty) onDirty(true);
    }
  };

  const handleSave = () => {
    const contentLines: string[] = [];
    let imagePlaceholder = '';
    let linkUrl = '';
    let linkTitleText = '';
    let firstLinkFound = false;

    blocks.forEach(block => {
      switch (block.type) {
        case 'heading': contentLines.push(`### ${block.value}`); break;
        case 'paragraph': contentLines.push(block.value); break;
        case 'list': contentLines.push(block.value); break;
        case 'quote': contentLines.push(`> ${block.value.replace(/\n/g, '\n> ')}`); break;
        case 'code': contentLines.push('```\n' + block.value + '\n```'); break;
        case 'table': contentLines.push(block.value); break;
        case 'divider': contentLines.push('---'); break;
        case 'media': imagePlaceholder = block.value; break;
        case 'link': 
            contentLines.push(`[${block.value2 || 'Link'}](${block.value})`);
            if (!firstLinkFound) { linkUrl = block.value; linkTitleText = block.value2 || ''; firstLinkFound = true; }
            break;
        case 'disclaimer': break;
      }
    });

    onSave({
      uuid: initialData?.uuid || generateUUID(),
      slug: slug.trim() || undefined,
      title,
      content: contentLines,
      imagePlaceholder: imagePlaceholder.trim() || undefined,
      link: linkUrl.trim() || undefined,
      linkTitle: linkTitleText.trim() || undefined,
      codeBlock: isArchive ? JSON.stringify(archiveData) : initialData?.codeBlock,
      keywords: title.split(' '),
      blocks: blocks
    });
    onDirty?.(false);
    onClose();
  };

  if (!isOpen) return null;
  const isValid = title.trim().length > 0 && slug.trim().length > 0;
  const currentEntry = archiveData[activeYear]?.[activeMonth] || { title: '', winner: '', imageUrl: '', description: '', groups: [] };

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={() => { onDirty?.(false); onClose(); }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }} />
      <div className="animate-enter" style={{ position: 'relative', background: '#121212', border: '1px solid #333', borderRadius: '16px', width: '100%', maxWidth: '850px', maxHeight: '95vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>{initialData ? '콘텐츠 블록 수정' : '새 콘텐츠 블록 추가'}</h3>
          <button onClick={() => { onDirty?.(false); onClose(); }} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
        </div>
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#888', marginBottom: '4px', fontSize: '0.85rem' }}>제목</label>
              <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); if (onDirty) onDirty(true); }} placeholder="섹션 제목 입력" style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E70012', marginBottom: '4px', fontSize: '0.85rem' }}><Hash size={14} /> URL 슬러그</label>
              <input type="text" value={slug} onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); if (onDirty) onDirty(true); }} placeholder="e.g. it-setup" style={{ width: '100%', padding: '12px', background: 'rgba(231,0,18,0.05)', border: '1px solid #E70012', borderRadius: '8px', color: '#fff', outline: 'none', fontFamily: 'monospace' }} />
            </div>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid #222' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#E70012" />
                <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>콘텐츠 블록 구성</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {blocks.map((block, index) => {
                  const BlockIcon = BLOCK_TYPES.find(t => t.type === block.type)?.icon || AlignLeft;
                  return (
                    <div key={block.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px' }}>
                          <button onClick={() => { const b = [...blocks]; [b[index-1], b[index]] = [b[index], b[index-1]]; setBlocks(b); if(onDirty) onDirty(true); }} disabled={index === 0} style={{ color: index === 0 ? '#222' : '#555', background: 'none', border: 'none', cursor: 'pointer' }}><ChevronUp size={16}/></button>
                          <button onClick={() => { const b = [...blocks]; [b[index+1], b[index]] = [b[index], b[index+1]]; setBlocks(b); if(onDirty) onDirty(true); }} disabled={index === blocks.length - 1} style={{ color: index === blocks.length - 1 ? '#222' : '#555', background: 'none', border: 'none', cursor: 'pointer' }}><ChevronDown size={16}/></button>
                        </div>
                        <div style={{ flex: 1, background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E70012', fontSize: '0.75rem', fontWeight: 700 }}><BlockIcon size={14} />{block.type.toUpperCase()}</div>
                              <button onClick={() => { setBlocks(blocks.filter(b => b.id !== block.id)); if(onDirty) onDirty(true); }} style={{ color: '#444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16}/></button>
                          </div>
                          {block.type === 'table' ? (
                            <TableEditor value={block.value} onChange={val => { setBlocks(blocks.map(b => b.id === block.id ? {...b, value: val} : b)); if(onDirty) onDirty(true); }} />
                          ) : block.type === 'link' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input type="text" value={block.value2 || ''} onChange={e => { setBlocks(blocks.map(b => b.id === block.id ? {...b, value2: e.target.value} : b)); if(onDirty) onDirty(true); }} placeholder="링크 제목" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid #222', padding: '8px 12px', borderRadius: '6px', color: '#fff' }} />
                                <input type="text" value={block.value} onChange={e => { setBlocks(blocks.map(b => b.id === block.id ? {...b, value: e.target.value} : b)); if(onDirty) onDirty(true); }} placeholder="URL (https://...)" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid #222', padding: '8px 12px', borderRadius: '6px', color: '#aaa' }} />
                            </div>
                          ) : (
                            <textarea 
                              value={block.value} 
                              onChange={e => { setBlocks(blocks.map(b => b.id === block.id ? {...b, value: e.target.value} : b)); if(onDirty) onDirty(true); }} 
                              onKeyDown={e => handleEditorKeyDown(e, block.id)}
                              placeholder={`${block.type} 내용 입력...`} 
                              style={{ width: '100%', background: 'transparent', border: 'none', color: '#ccc', fontSize: '0.95rem', outline: 'none', resize: 'vertical', minHeight: '60px', lineHeight: '1.6' }} 
                            />
                          )}
                        </div>
                    </div>
                  );
                })}
            </div>
            <button onClick={() => setShowTypeSelector(!showTypeSelector)} style={{ width: '100%', padding: '16px', border: '1px dashed #333', borderRadius: '12px', background: 'transparent', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}><Plus size={20} /> 블록 추가하기</button>
            {showTypeSelector && (
              <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {BLOCK_TYPES.map(bt => (
                  <button key={bt.type} onClick={() => addBlock(bt.type)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px 8px', background: '#222', border: '1px solid #333', borderRadius: '8px', color: '#ccc', cursor: 'pointer' }}><bt.icon size={18} /><span style={{ fontSize: '0.7rem' }}>{bt.label}</span></button>
                ))}
              </div>
            )}
          </div>

          {isArchive && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <hr style={{ border: 'none', borderTop: '1px solid #222' }} />
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={18} color="#E70012" /><span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>아카이브 데이터 관리</span></div>
               <div style={{ background: '#111', padding: '24px', borderRadius: '12px', border: '1px solid #333' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {[2025, 2026, 2027].map(year => (
                      <button key={year} onClick={() => setActiveYear(year)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid', borderColor: activeYear === year ? '#E70012' : '#333', background: activeYear === year ? 'rgba(231,0,18,0.1)' : '#1a1a1a', color: '#fff', cursor: 'pointer' }}>{year}</button>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '20px' }}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <button key={month} onClick={() => setActiveMonth(month)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid', borderColor: activeMonth === month ? '#E70012' : '#222', background: activeMonth === month ? 'rgba(231,0,18,0.1)' : '#0d0d0d', color: '#fff', cursor: 'pointer' }}>{month}월</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input type="text" value={currentEntry.title} onChange={e => updateArchiveEntry('title', e.target.value)} placeholder="활동명 (예: 3월의 조 편성)" style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                    <input type="text" value={currentEntry.imageUrl || ''} onChange={e => updateArchiveEntry('imageUrl', e.target.value)} placeholder="이미지 URL" style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                    
                    {isGroupBased ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '0.85rem' }}><Users size={14} /> 조 편성 (Groups)</div>
                          <button onClick={addGroup} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', background: 'rgba(231,0,18,0.1)', border: '1px solid #E70012', color: '#fff', fontSize: '0.75rem', cursor: 'pointer' }}><Plus size={14} /> 조 추가</button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {(currentEntry.groups || []).map((group, gIdx) => (
                            <div key={group.id} style={{ background: '#090909', borderRadius: '12px', border: '1px solid #222', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input 
                                  type="text" 
                                  value={group.name} 
                                  onChange={e => updateGroupName(group.id, e.target.value)} 
                                  style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1rem', fontWeight: 700, outline: 'none', width: '80px' }}
                                />
                                <div style={{ flex: 1, height: '1px', background: '#222' }} />
                                <button onClick={() => removeGroup(group.id)} style={{ color: '#444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(75px, 1fr))', gap: '6px' }}>
                                {employees.map((emp, i) => {
                                  const member = group.members.find(m => m.name === emp.name);
                                  const isSelected = !!member;
                                  const isLeader = member?.isLeader;
                                  
                                  return (
                                    <button
                                      key={i}
                                      onClick={() => toggleGroupMember(group.id, emp)}
                                      title={emp.role}
                                      style={{
                                        position: 'relative', padding: '8px 4px', borderRadius: '6px', border: '1px solid', 
                                        borderColor: isSelected ? '#E70012' : '#333',
                                        background: isSelected ? 'rgba(231,0,18,0.1)' : 'transparent',
                                        color: isSelected ? '#fff' : '#666', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s'
                                      }}
                                    >
                                      {emp.name}
                                      {isSelected && (
                                        <div 
                                          onClick={(e) => { e.stopPropagation(); toggleLeader(group.id, emp.name); }} 
                                          style={{ position: 'absolute', top: '-6px', right: '-6px', background: isLeader ? '#E70012' : '#333', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                                        >
                                          <Crown size={10} color={isLeader ? '#fff' : '#666'} />
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                        {currentEntry.groups && currentEntry.groups.length > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#E70012' }}>* 이름을 선택하면 조원으로 추가되고, 오른쪽 위 왕관 아이콘을 누르면 조장이 됩니다. 조장은 중복 선택이 가능합니다.</div>
                        )}
                      </div>
                    ) : (
                      <textarea rows={4} value={currentEntry.description || ''} onChange={e => updateArchiveEntry('description', e.target.value)} placeholder="설명 (Markdown)" style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                    )}
                  </div>
               </div>
            </div>
          )}
        </div>
        <div style={{ padding: '20px 24px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={() => { onDirty?.(false); onClose(); }} style={{ padding: '10px 20px', color: '#ccc', background: 'none', border: 'none', cursor: 'pointer' }}>취소</button>
          <button onClick={handleSave} disabled={!isValid} style={{ padding: '10px 24px', borderRadius: '8px', background: isValid ? '#E70012' : '#333', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>저장하기</button>
        </div>
      </div>
    </div>,
    document.body
  );
};
