import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";

// 👉 콘텐츠 기본값
import { HANDBOOK_CONTENT } from "../constants";

// 👉 타입 정의 (types.ts 에서 가져오기)
import { SectionData, SubSection, ContentType } from "../types";

interface DataContextType {
  data: SectionData[];
  isLoading: boolean;
  updateSubSection: (
    sectionId: ContentType,
    subIndex: number,
    newSub: SubSection
  ) => Promise<void>;
  addSubSection: (sectionId: ContentType, newSub: SubSection) => Promise<void>;
  deleteSubSection: (sectionId: ContentType, subIndex: number) => Promise<void>;
  resetData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

// -----------------------------------------------------
// 🔥 Firestore에서 쓸 문서 ID → 무조건 string 으로 변환
// -----------------------------------------------------
function getSectionDocRef(sectionId: ContentType) {
  return doc(db, "guides", String(sectionId));
}

// -----------------------------------------------------
// 🔥 data 배열에서 특정 section만 수정하는 헬퍼
// -----------------------------------------------------
function updateDataRecursive(
  allData: SectionData[],
  targetId: ContentType,
  modifyFn: (section: SectionData) => SectionData
): SectionData[] {
  return allData.map((sec) => (sec.id === targetId ? modifyFn(sec) : sec));
}

// -----------------------------------------------------
// 🔥 Provider
// -----------------------------------------------------
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<SectionData[]>(HANDBOOK_CONTENT);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ---------------------------------------------------
  // 🔥 Firestore → HANDBOOK_CONTENT 와 merge
  // ---------------------------------------------------
  const fetchData = async () => {
    try {
      const snapshot = await getDocs(collection(db, "guides"));

      if (snapshot.empty) {
        setIsLoading(false);
        return;
      }

      const dbDataMap = new Map<string, any>();
      snapshot.forEach((docSnap) => {
        dbDataMap.set(docSnap.id, docSnap.data());
      });

      const merged = HANDBOOK_CONTENT.map((section) => {
        const remote = dbDataMap.get(String(section.id)); // ⭐ 여기 중요
        if (remote) {
          const { icon, ...restRemote } = remote; // icon 은 로컬 기준 유지
          return {
            ...section,
            ...restRemote,
          } as SectionData;
        }
        return section;
      });

      setData(merged);
    } catch (err) {
      console.error("Firestore fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------------------------------------------------
  // 🔥 로컬 상태 + Firestore 동시에 업데이트
  // ---------------------------------------------------
  const handleUpdate = async (
    newData: SectionData[],
    sectionId: ContentType
  ) => {
    setData(newData);

    const target = newData.find((s) => s.id === sectionId);
    if (!target) return;

    try {
      await setDoc(
        getSectionDocRef(sectionId),
        {
          subSections: target.subSections,
          title: target.title,
          description: target.description ?? "",
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.error("DB 저장 실패:", e);
    }
  };

  // ---------------------------------------------------
  // 🔥 SubSection 수정
  // ---------------------------------------------------
  const updateSubSection = async (
    sectionId: ContentType,
    subIndex: number,
    newSub: SubSection
  ) => {
    const newData = updateDataRecursive(data, sectionId, (section) => {
      const newSubs = [...section.subSections];
      newSubs[subIndex] = newSub;
      return { ...section, subSections: newSubs };
    });
    await handleUpdate(newData, sectionId);
  };

  // ---------------------------------------------------
  // 🔥 SubSection 추가
  // ---------------------------------------------------
  const addSubSection = async (
    sectionId: ContentType,
    newSub: SubSection
  ) => {
    const newData = updateDataRecursive(data, sectionId, (section) => ({
      ...section,
      subSections: [...section.subSections, newSub],
    }));
    await handleUpdate(newData, sectionId);
  };

  // ---------------------------------------------------
  // 🔥 SubSection 삭제
  // ---------------------------------------------------
  const deleteSubSection = async (
    sectionId: ContentType,
    subIndex: number
  ) => {
    const newData = updateDataRecursive(data, sectionId, (section) => {
      const newSubs = section.subSections.filter((_, i) => i !== subIndex);
      return { ...section, subSections: newSubs };
    });
    await handleUpdate(newData, sectionId);
  };

  // ---------------------------------------------------
  // 🔥 전체 리셋 (기본 템플릿을 Firestore 에 다시 업로드)
  // ---------------------------------------------------
  const resetData = async () => {
    try {
      for (const section of HANDBOOK_CONTENT) {
        await setDoc(
          getSectionDocRef(section.id),
          {
            id: section.id,
            title: section.title,
            description: section.description || "",
            subSections: section.subSections || [],
            lastUpdated: new Date().toISOString(),
          },
          { merge: true }
        );
      }
      await fetchData();
    } catch (e) {
      console.error("초기화 실패:", e);
    }
  };

  return (
    <DataContext.Provider
      value={{
        data,
        isLoading,
        updateSubSection,
        addSubSection,
        deleteSubSection,
        resetData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};
