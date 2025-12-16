
import React, { useState } from 'react';
import { SubSection } from '../types';
import { Trophy, Calendar, Image as ImageIcon } from 'lucide-react';

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

// 임시 데이터 (실제 데이터는 DB에서 가져오거나 이곳을 수정하여 관리)
const ARCHIVE_MOCK_DATA: ArchiveData = {
  2025: {
    1: {
      title: "Cyberpunk Office Life",
      winner: "Creative Sol. Team",
      description: "미래지향적인 오피스 환경을 사이버펑크 스타일로 재해석한 작품입니다.",
      imageUrl: "https://cdn.midjourney.com/u/27b81851-afbf-4e59-84eb-0a18c999df64/47b39e7f0ae783f5f387bdea4888f0b9750b5e1fa6f9dd08dbeb458f2c24d451.png" 
    }
  },
  2026: {}
};

interface ContestArchiveCardProps {
  data: SubSection;
  adminControls?: React.ReactNode;
  id?: string;
}

export const ContestArchiveCard: React.FC<ContestArchiveCardProps> = ({ data, adminControls, id }) => {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  const currentData = ARCHIVE_MOCK_DATA[selectedYear]?.[selectedMonth];

  return (
    <div id={id} className="bento-card full-width" style={{ padding: 0, overflow: 'hidden' }}>
      {/* 1. Header Section */}
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
        <p style={{ color: '#ccc', lineHeight: '1.6', fontSize: '1rem', margin: 0 }}>
          {Array.isArray(data.content) ? data.content[0] : data.content}
        </p>
      </div>

      {/* 2. Controls Section (Year Tabs & Month Grid) */}
      <div style={{ background: 'rgba(255,255,255,0.02)' }}>
        {/* Year Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {[2025, 2026].map(year => (
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
             const hasData = !!ARCHIVE_MOCK_DATA[selectedYear]?.[month];
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

        {currentData ? (
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
