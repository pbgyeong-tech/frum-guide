
import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';
import { SectionData, ContentType } from '../types';
import { useLocation } from 'react-router-dom';

interface FaqSearchProps {
  onNavigate: (id: ContentType) => void;
  content: SectionData[];
  limitToSectionId?: ContentType;
}

interface SearchResultItem {
  sectionId: ContentType;
  sectionTitle: string;
  title: string; 
  content: string | string[];
  keywords: string[];
  score: number;
  slug?: string;
  uuid?: string;
}

const removeKoreanParticles = (text: string) => {
  if (!text) return "";
  return text.replace(/[은는이가을를에게서의도만]|(로)|(으로)|(하고)|(한)/g, "");
};

const normalize = (text: string) => {
  return (text || "").toLowerCase().replace(/[\s\p{P}]/gu, "");
};

export const FaqSearch: React.FC<FaqSearchProps> = ({ content, limitToSectionId }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const location = useLocation();

  // 1. Build Search Index
  const searchIndex = useMemo(() => {
    const index: SearchResultItem[] = [];

    const traverse = (sections: SectionData[]) => {
      if (!Array.isArray(sections)) return;

      sections.forEach(section => {
        // Enforce strict section filtering if limitToSectionId is provided
        if (limitToSectionId && section.id !== limitToSectionId) {
            return; 
        }

        if (Array.isArray(section.subSections)) {
          section.subSections.forEach(sub => {
            if (!sub) return;
            index.push({
              sectionId: section.id,
              sectionTitle: section.title || "",
              title: sub.title || "",
              content: sub.content || "",
              keywords: Array.isArray(sub.keywords) ? sub.keywords : [],
              score: 0,
              slug: sub.slug,
              uuid: sub.uuid
            });
          });
        }
        
        if (section.children && Array.isArray(section.children)) {
          traverse(section.children);
        }
      });
    };

    traverse(content);
    return index;
  }, [content, limitToSectionId]);

  // 2. Search & Filter
  useEffect(() => {
    if (!query.trim()) {
      // Show all items if query is empty (filtered by section via props)
      setResults(searchIndex);
      return;
    }

    const rawTokens = query.toLowerCase().split(/\s+/);
    const tokens = rawTokens.map(t => ({
      origin: t,
      refined: removeKoreanParticles(t)
    })).filter(t => t.origin.length > 0);

    const scoredItems = searchIndex.map(item => {
      let score = 0;
      const safeTitle = item.title || "";
      const normTitle = normalize(safeTitle);
      const contentStr = Array.isArray(item.content) ? item.content.join(" ") : (item.content || "");
      const normContent = normalize(contentStr as string);
      const lowerQuery = query.toLowerCase();

      if (safeTitle.toLowerCase().includes(lowerQuery)) score += 50;
      if ((contentStr as string).toLowerCase().includes(lowerQuery)) score += 20;

      tokens.forEach(token => {
        if (token.refined.length < 1) return;
        if (normTitle.includes(token.origin) || normTitle.includes(token.refined)) score += 15;
        const keywordMatch = item.keywords.some(k => {
            const normK = normalize(k);
            return normK.includes(token.origin) || normK.includes(token.refined);
        });
        if (keywordMatch) score += 25;
        if (normContent.includes(token.origin) || normContent.includes(token.refined)) score += 5;
      });

      return { ...item, score };
    });

    const filtered = scoredItems
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    setResults(filtered);
    setOpenIndex(filtered.length > 0 ? 0 : null); 
  }, [query, searchIndex]);

  // 3. Handle URL Hash (Auto Open)
  useEffect(() => {
    if (location.hash && results.length > 0) {
      const targetId = location.hash.replace('#', ''); 
      const idx = results.findIndex(r => r.slug === targetId || r.uuid === targetId);
      
      if (idx !== -1) {
        setOpenIndex(idx);
        const element = document.getElementById(`faq-item-${idx}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [location.hash, results]); 

  const toggleItem = (index: number, item: SearchResultItem) => {
    const isOpen = openIndex === index;
    setOpenIndex(isOpen ? null : index);
    
    if (!isOpen && (item.slug || item.uuid)) {
        const id = item.slug || item.uuid;
        const currentPath = location.pathname;
        window.history.replaceState(null, '', `#${currentPath}#${id}`);
    }
  };

  return (
    <div className="faq-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '40px' }}>
        <div style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: query ? '#E70012' : '#666',
          transition: 'color 0.3s'
        }}>
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="무엇이든 물어보세요 (예: 와이파이, 휴가, 스펜딧)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '20px 20px 20px 56px',
            fontSize: '1.1rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            color: '#fff',
            outline: 'none',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#E70012';
            e.target.style.background = 'rgba(255,255,255,0.08)';
            e.target.style.boxShadow = '0 8px 30px rgba(231,0,18,0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255,255,255,0.1)';
            e.target.style.background = 'rgba(255,255,255,0.05)';
            e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
          }}
        />
      </div>

      {/* Results List */}
      <div className="faq-list">
        {query.trim() && results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#666', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Search size={40} strokeWidth={1} style={{ opacity: 0.3 }} />
            <p>검색 결과가 없습니다.<br/>다른 키워드로 검색해 보세요.</p>
          </div>
        ) : (
          results.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div 
                key={index} 
                id={`faq-item-${index}`}
                style={{ 
                  marginBottom: '16px',
                  borderRadius: '12px',
                  background: isOpen ? 'rgba(255,255,255,0.03)' : 'transparent',
                  border: isOpen ? '1px solid rgba(231,0,18,0.3)' : '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => toggleItem(index, item)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '24px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: isOpen ? '#fff' : '#ccc',
                    fontWeight: isOpen ? 700 : 500,
                    fontSize: '1.05rem',
                    background: 'none',
                    border: 'none'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.title}
                    </span>
                  </div>
                  {isOpen ? <ChevronDown size={20} color="#E70012" /> : <ChevronRight size={20} color="#666" />}
                </button>
                
                {isOpen && (
                  <div style={{ 
                    padding: '0 24px 24px 24px', 
                    color: '#bbb', 
                    lineHeight: '1.6',
                    fontSize: '1rem',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    marginTop: '-8px',
                    paddingTop: '20px'
                  }}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                        {Array.isArray(item.content) ? item.content.join('\n') : item.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
