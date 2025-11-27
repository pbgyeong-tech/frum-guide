
import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronRight, ChevronDown, ArrowUpRight } from 'lucide-react';
import { HANDBOOK_CONTENT } from '../constants';
import { SectionData, SubSection, ContentType } from '../types';

interface FaqSearchProps {
  onNavigate: (id: ContentType) => void;
}

interface SearchResultItem {
  sectionId: ContentType;
  sectionTitle: string;
  title: string; // SubSection title (Question or Topic)
  content: string | string[];
  keywords: string[];
  score: number;
}

// Korean particle removal for natural language processing
const removeKoreanParticles = (text: string) => {
  // Removes common particles: 은,는,이,가,을,를,에,게,서,의,도,만,로,으로,하고,한
  return text.replace(/[은는이가을를에게서의도만]|(로)|(으로)|(하고)|(한)/g, "");
};

const normalize = (text: string) => {
  return text.toLowerCase().replace(/[\s\p{P}]/gu, "");
};

export const FaqSearch: React.FC<FaqSearchProps> = ({ onNavigate }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // 1. Build Search Index (Flattening the Handbook Content)
  const searchIndex = useMemo(() => {
    const index: SearchResultItem[] = [];

    const traverse = (sections: SectionData[]) => {
      sections.forEach(section => {
        // If section has subsections, add them
        if (section.subSections && section.subSections.length > 0) {
          section.subSections.forEach(sub => {
            index.push({
              sectionId: section.id,
              sectionTitle: section.title,
              title: sub.title,
              content: sub.content,
              keywords: sub.keywords || [],
              score: 0
            });
          });
        }
        // Recurse if it has children (e.g., Work Intro -> UX Part)
        if (section.children) {
          traverse(section.children);
        }
      });
    };

    traverse(HANDBOOK_CONTENT);
    return index;
  }, []);

  // 2. Search Algorithm
  useEffect(() => {
    if (!query.trim()) {
      setResults([]); // Show nothing if empty query
      return;
    }

    // Tokenize Query
    const rawTokens = query.toLowerCase().split(/\s+/);
    const tokens = rawTokens.map(t => ({
      origin: t,
      refined: removeKoreanParticles(t)
    })).filter(t => t.origin.length > 0);

    // Score Items
    const scoredItems = searchIndex.map(item => {
      let score = 0;
      const normTitle = normalize(item.title);
      const contentStr = Array.isArray(item.content) ? item.content.join(" ") : item.content;
      const normContent = normalize(contentStr);
      
      // A. Exact Phrase Match (Highest Priority)
      if (item.title.toLowerCase().includes(query.toLowerCase())) score += 50;
      if (contentStr.toLowerCase().includes(query.toLowerCase())) score += 20;

      // B. Token & Keyword Matching
      tokens.forEach(token => {
        if (token.refined.length < 1) return;

        // Title Match (High)
        if (normTitle.includes(token.origin) || normTitle.includes(token.refined)) {
          score += 15;
        }

        // Keyword Match (Very High - semantic understanding)
        const keywordMatch = item.keywords.some(k => {
            const normK = normalize(k);
            return normK.includes(token.origin) || normK.includes(token.refined);
        });
        if (keywordMatch) score += 25;

        // Content Match (Medium)
        if (normContent.includes(token.origin) || normContent.includes(token.refined)) {
          score += 5;
        }
        
        // Section Title Match (Context)
        if (normalize(item.sectionTitle).includes(token.origin)) {
            score += 5;
        }
      });

      return { ...item, score };
    });

    // Sort & Filter
    const filtered = scoredItems
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Limit results

    setResults(filtered);
    setOpenIndex(filtered.length > 0 ? 0 : null); 
  }, [query, searchIndex]);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Search Input */}
      <div style={{ 
        position: 'relative', 
        marginBottom: '40px' 
      }}>
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
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 0', 
            color: '#666',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Search size={40} strokeWidth={1} style={{ opacity: 0.3 }} />
            <p>검색 결과가 없습니다.<br/>다른 키워드로 검색해 보세요.</p>
          </div>
        ) : (
          results.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
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
                  onClick={() => toggleItem(index)}
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
                    fontSize: '1.05rem'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {/* Source Badge */}
                    <span style={{ 
                        fontSize: '0.8rem', 
                        color: '#666', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        <span style={{ width: '6px', height: '6px', background: '#E70012', borderRadius: '50%' }}></span>
                        {item.sectionTitle}
                    </span>
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
                    <div style={{ whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
                        {Array.isArray(item.content) ? item.content.join('\n') : item.content}
                    </div>
                    
                    {/* Navigate Button */}
                    <button 
                        onClick={() => onNavigate(item.sectionId)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#E70012',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            padding: '8px 16px',
                            background: 'rgba(231,0,18,0.1)',
                            borderRadius: '8px',
                            marginLeft: 'auto',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(231,0,18,0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(231,0,18,0.1)'}
                    >
                        해당 메뉴로 이동하기 <ArrowUpRight size={16} />
                    </button>
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
