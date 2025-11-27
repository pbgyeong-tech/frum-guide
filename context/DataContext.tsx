import React, { createContext, useState, useContext, useEffect } from 'react';
import { HANDBOOK_CONTENT } from '../constants';
import { SectionData, ContentType, SubSection } from '../types';
import { db } from '../firebase'; 
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';

interface DataContextType {
  data: SectionData[];
  isLoading: boolean;
  updateSubSection: (sectionId: ContentType, subIndex: number, newSub: SubSection) => Promise<void>;
  addSubSection: (sectionId: ContentType) => Promise<void>;
  deleteSubSection: (sectionId: ContentType, subIndex: number) => Promise<void>;
  resetData: () => Promise<void>;
  uploadInitialData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<SectionData[]>(HANDBOOK_CONTENT); 
  const [isLoading, setIsLoading] = useState(true);

  // 1. 앱이 켜지면 Firebase에서 최신 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "guides"));
        
        if (querySnapshot.empty) {
          console.log("DB가 비어있습니다. 초기 데이터를 사용합니다.");
          setIsLoading(false);
          return;
        }

        const dbDataMap = new Map();
        querySnapshot.forEach((doc) => {
          dbDataMap.set(doc.id, doc.data());
        });

        // 로컬 데이터와 DB 데이터 병합 (아이콘 보호)
        const mergedData = HANDBOOK_CONTENT.map(section => {
          const remoteSection = dbDataMap.get(section.id);
          if (remoteSection) {
            const { icon, ...restRemote } = remoteSection; 
            return {
              ...section,
              ...restRemote
            } as SectionData;
          }
          return section;
        });

        setData(mergedData);
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // [최초 1회용] 초기 데이터 업로드
  const uploadInitialData = async () => {
    if (!confirm("현재 로컬 데이터를 DB에 덮어씌우시겠습니까?")) return;
    setIsLoading(true);
    try {
      for (const section of HANDBOOK_CONTENT) {
        await setDoc(doc(db, "guides", section.id), {
          id: section.id,
          title: section.title,
          description: section.description || "",
          subSections: section.subSections || [],
          lastUpdated: new Date().toISOString()
        });
      }
      alert("초기 데이터 업로드 완료! 새로고침합니다.");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("업로드 실패");
    } finally {
      setIsLoading(false);
    }
  };

  // 공통 업데이트 로직
  const handleUpdate = async (newData: SectionData[], targetId: ContentType) => {
    setData(newData);
    const targetSection = newData.find(s => s.id === targetId);
    if (!targetSection) return;

    try {
      const docRef = doc(db, "guides", targetId);
      await setDoc(docRef, {
        subSections: targetSection.subSections,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error("DB 저장 실패:", e);
      alert("저장 실패 (인터넷 연결 확인)");
    }
  };

  const updateDataRecursive = (
    sections: SectionData[], 
    targetId: ContentType, 
    updater: (section: SectionData) => SectionData
  ): SectionData[] => {
    return sections.map(section => {
      if (section.id === targetId) return updater(section);
      if (section.children) {
        return { ...section, children: updateDataRecursive(section.children, targetId, updater) };
      }
      return section;
    });
  };

  const updateSubSection = async (sectionId: ContentType, subIndex: number, newSub: SubSection) => {
    const newData = updateDataRecursive(data, sectionId, (section) => {
      const newSubs = [...section.subSections];
      newSubs[subIndex] = newSub;
      return { ...section, subSections: newSubs };
    });
    await handleUpdate(newData, sectionId);
  };

  const addSubSection = async (sectionId: ContentType) => {
    const newItem: SubSection = {
      title: "새로운 항목",
      content: "내용을 입력해주세요.",
      keywords: []
    };
    const newData = updateDataRecursive(data, sectionId, (section) => ({
      ...section,
      subSections: [...section.subSections, newItem]
    }));
    await handleUpdate(newData, sectionId);
  };

  const deleteSubSection = async (sectionId: ContentType, subIndex: number) => {
    if(!confirm("정말 삭제하시겠습니까?")) return;
    const newData = updateDataRecursive(data, sectionId, (section) => {
      const newSubs = section.subSections.filter((_, i) => i !== subIndex);
      return { ...section, subSections: newSubs };
    });
    await handleUpdate(newData, sectionId);
  };

  const resetData = async () => {
    alert("DB 모드에서는 전체 초기화 기능이 제한됩니다.");
  };

  return (
    <DataContext.Provider value={{ 
      data, 
      isLoading,
      updateSubSection, 
      addSubSection, 
      deleteSubSection, 
      resetData,
      uploadInitialData 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};