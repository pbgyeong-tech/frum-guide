import React, { createContext, useState, useContext, useEffect } from 'react';
import { HANDBOOK_CONTENT } from '../constants';
import { SectionData, ContentType, SubSection } from '../types';

interface DataContextType {
  data: SectionData[];
  updateSubSection: (sectionId: ContentType, subIndex: number, newSub: SubSection) => void;
  addSubSection: (sectionId: ContentType) => void;
  deleteSubSection: (sectionId: ContentType, subIndex: number) => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// 편집 가능한 메뉴 목록
const EDITABLE_SECTIONS = [
  ContentType.IT_SETUP,
  ContentType.WELFARE,
  ContentType.COMMUTE,
  ContentType.TOOLS,
  ContentType.OFFICE_GUIDE,
  ContentType.FAQ
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 초기 데이터를 로컬 스토리지(브라우저 저장소)에서 가져오거나 기본값 사용
  const [data, setData] = useState<SectionData[]>(() => {
    try {
      const saved = localStorage.getItem('frum_guide_data');
      return saved ? JSON.parse(saved) : HANDBOOK_CONTENT;
    } catch (e) {
      return HANDBOOK_CONTENT;
    }
  });

  // 데이터가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('frum_guide_data', JSON.stringify(data));
  }, [data]);

  // 재귀적으로 섹션을 찾아 수정하는 함수
  const updateDataRecursive = (
    sections: SectionData[], 
    targetId: ContentType, 
    updater: (section: SectionData) => SectionData
  ): SectionData[] => {
    return sections.map(section => {
      if (section.id === targetId) {
        return updater(section);
      }
      if (section.children) {
        return {
          ...section,
          children: updateDataRecursive(section.children, targetId, updater)
        };
      }
      return section;
    });
  };

  // 내용 수정
  const updateSubSection = (sectionId: ContentType, subIndex: number, newSub: SubSection) => {
    if (!EDITABLE_SECTIONS.includes(sectionId)) return;
    
    setData(prev => updateDataRecursive(prev, sectionId, (section) => {
      const newSubs = [...section.subSections];
      newSubs[subIndex] = newSub;
      return { ...section, subSections: newSubs };
    }));
  };

  // 항목 추가
  const addSubSection = (sectionId: ContentType) => {
    if (!EDITABLE_SECTIONS.includes(sectionId)) return;

    const newItem: SubSection = {
      title: "새로운 항목",
      content: "내용을 입력해주세요.",
      keywords: []
    };

    setData(prev => updateDataRecursive(prev, sectionId, (section) => ({
      ...section,
      subSections: [...section.subSections, newItem]
    })));
  };

  // 항목 삭제
  const deleteSubSection = (sectionId: ContentType, subIndex: number) => {
    if (!EDITABLE_SECTIONS.includes(sectionId)) return;

    setData(prev => updateDataRecursive(prev, sectionId, (section) => {
      const newSubs = section.subSections.filter((_, i) => i !== subIndex);
      return { ...section, subSections: newSubs };
    }));
  };

  // 초기화
  const resetData = () => {
    if(confirm('모든 변경사항이 초기화됩니다. 계속하시겠습니까?')) {
      setData(HANDBOOK_CONTENT);
      localStorage.removeItem('frum_guide_data');
    }
  };

  return (
    <DataContext.Provider value={{ data, updateSubSection, addSubSection, deleteSubSection, resetData }}>
      {children}
    </DataContext.Provider>
  );
};

// 👇 이 부분이 빠져서 에러가 났던 겁니다!
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};